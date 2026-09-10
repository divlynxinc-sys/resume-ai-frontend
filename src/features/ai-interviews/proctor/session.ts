import { PROCTOR } from "./config";
import { watchFullscreenExit, watchPageLeave, watchTabHidden } from "./fullscreen";
import { AttentionMonitor, GazeTracker, loadFaceLandmarker } from "./gaze";
import { watchScreens } from "./screens";
import { isHardViolation, writeProctorVerdict } from "./storage";
import type {
  CameraCheckStatus,
  GazeSample,
  ProctorEvent,
  ProctorSessionEvent,
  ProctorVerdict,
  ProctorViolationCode,
} from "./types";

/** Frames of a single visible face before an uncalibrated session takes its own baseline. */
const AUTO_CALIBRATE_SAMPLES = 8;

export type ProctorCameraFailure = Extract<CameraCheckStatus, "denied" | "unavailable" | "model_failed">;

export class ProctorCameraError extends Error {
  status: ProctorCameraFailure;
  constructor(status: ProctorCameraFailure, message: string) {
    super(message);
    this.name = "ProctorCameraError";
    this.status = status;
  }
}

/**
 * One proctor per interview. Created on the Ready screen, where it only runs the
 * camera + gaze *checks*; `armLive()` on the Live screen switches it to
 * *enforcing* — hard guards (fullscreen, tab, displays, camera) fail at once,
 * while the attention policy warns once and fails on the second violation.
 *
 * The camera stream is analysed on-device and is never published to the LiveKit
 * room or uploaded anywhere.
 */
export class ProctorSession {
  readonly interviewId: string;
  stream: MediaStream | null = null;
  latest: GazeSample | null = null;
  warnings: ProctorEvent[] = [];
  verdict: ProctorVerdict | null = null;
  cameraStatus: CameraCheckStatus = "idle";
  cameraError = "";

  private video: HTMLVideoElement | null = null;
  private tracker: GazeTracker | null = null;
  private monitor: AttentionMonitor | null = null;
  private guards: Array<() => void> = [];
  private listeners = new Set<(e: ProctorSessionEvent) => void>();
  private startedAtMs: number | null = null;
  private disposed = false;
  /** Rolling window of recent samples — the calibration source. */
  private recent: GazeSample[] = [];

  constructor(interviewId: string) {
    this.interviewId = interviewId;
  }

  get isDisposed() {
    return this.disposed;
  }

  get armed() {
    return this.guards.length > 0;
  }

  subscribe(cb: (e: ProctorSessionEvent) => void): () => void {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private emit(e: ProctorSessionEvent) {
    for (const l of [...this.listeners]) l(e);
  }

  private setCamera(status: CameraCheckStatus, error = "") {
    this.cameraStatus = status;
    this.cameraError = error;
    this.emit({ type: "camera", status, error: error || undefined });
  }

  // --- Camera + gaze -----------------------------------------------------------------------

  async startCamera(): Promise<void> {
    if (this.disposed) throw new ProctorCameraError("unavailable", "This check has been closed. Reload the page and try again.");
    if (this.stream) return;
    this.setCamera("starting");

    if (!navigator.mediaDevices?.getUserMedia) {
      const message = "Camera access is not available in this browser.";
      this.setCamera("unavailable", message);
      throw new ProctorCameraError("unavailable", message);
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: PROCTOR.video, audio: false });
    } catch (e) {
      const denied = e instanceof DOMException && (e.name === "NotAllowedError" || e.name === "SecurityError");
      const status: ProctorCameraFailure = denied ? "denied" : "unavailable";
      const message = denied
        ? "Camera access was denied. Allow the camera in your browser's site settings, then try again."
        : "We could not start your camera. Check that it is connected and not in use by another app.";
      this.setCamera(status, message);
      throw new ProctorCameraError(status, message);
    }
    if (this.disposed) {
      stream.getTracks().forEach((t) => t.stop());
      return;
    }
    this.stream = stream;

    let landmarker;
    try {
      landmarker = await loadFaceLandmarker();
    } catch {
      this.stopCamera();
      const message = "The eye-tracking model could not be loaded. Check your connection and try again.";
      this.setCamera("model_failed", message);
      throw new ProctorCameraError("model_failed", message);
    }
    if (this.disposed || !this.stream) return;

    // The landmarker reads from a playing <video>; the visible previews bind the same stream separately.
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.setAttribute("aria-hidden", "true");
    video.style.cssText = "position:fixed;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;";
    video.srcObject = stream;
    document.body.appendChild(video);
    this.video = video;
    try {
      await video.play();
    } catch {
      /* muted autoplay is allowed; play() only rejects if the element was removed */
    }

    stream.getVideoTracks()[0]?.addEventListener("ended", this.onTrackEnded);
    this.tracker = new GazeTracker(video, landmarker, this.onSample);
    this.tracker.start();
    this.setCamera("tracking");
  }

  stopCamera() {
    this.tracker?.stop();
    this.tracker = null;
    this.stream?.getTracks().forEach((t) => {
      t.removeEventListener("ended", this.onTrackEnded);
      t.stop();
    });
    this.stream = null;
    if (this.video) {
      this.video.srcObject = null;
      this.video.remove();
      this.video = null;
    }
    this.recent = [];
  }

  private onTrackEnded = () => {
    if (this.armed) this.fail("camera_lost");
    else {
      this.stopCamera();
      this.setCamera("unavailable", "Your camera was turned off. Turn it back on to continue.");
    }
  };

  private onSample = (sample: GazeSample) => {
    this.latest = sample;
    this.recent.push(sample);
    if (this.recent.length > 40) this.recent.shift();
    // A session that reached /live without the ready gate (refresh, deep link) has no
    // resting pose. Take one from its first steady frames rather than enforcing against
    // a zero baseline, which reads as "looking away" for everybody.
    if (!this.calibrated && this.recent.filter((x) => x.faces === 1).length >= AUTO_CALIBRATE_SAMPLES) this.calibrate();
    this.monitor?.push(sample);
    this.emit({ type: "sample", sample });
  };

  get calibrated() {
    return this.tracker?.baseline.calibrated ?? false;
  }

  /**
   * Adopt the candidate's current pose and gaze as "looking at the screen".
   * Called once the ready gate passes, and automatically on the live screen for a
   * session that never went through it (refresh / deep link into /live).
   */
  calibrate() {
    if (!this.tracker) return;
    const on = this.recent.filter((s) => s.faces === 1);
    if (on.length < 3) return;
    const median = (xs: number[]) => {
      const s = [...xs].sort((a, b) => a - b);
      return s[Math.floor(s.length / 2)];
    };
    // Samples are deviations from the current baseline; add it back to get absolute values.
    const b = this.tracker.baseline;
    this.tracker.baseline = {
      yaw: median(on.map((s) => s.headYaw + b.yaw)),
      pitch: median(on.map((s) => s.headPitch + b.pitch)),
      eyeH: median(on.map((s) => s.eyeH + b.eyeH)),
      eyeV: median(on.map((s) => s.eyeV + b.eyeV)),
      yawRatio: median(on.map((s) => s.yawRatio + b.yawRatio)),
      pitchRatio: median(on.map((s) => s.pitchRatio + b.pitchRatio)),
      calibrated: true,
    };
  }

  // --- Enforcement ---------------------------------------------------------------------------

  /** Switch from checking to enforcing. Idempotent. */
  armLive(startedAt?: string) {
    if (this.disposed || this.armed || this.verdict) return;
    const parsed = startedAt ? Date.parse(startedAt) : NaN;
    this.startedAtMs = Number.isFinite(parsed) ? parsed : Date.now();
    this.monitor = new AttentionMonitor((code) => this.violation(code));
    this.guards = [
      watchFullscreenExit(() => this.fail("left_fullscreen")),
      // On unload, visibilitychange fires before pagehide; deferring lets pagehide record the more accurate reason.
      watchTabHidden(() => {
        window.setTimeout(() => this.fail("tab_hidden"), 0);
      }),
      watchScreens((extended) => {
        if (extended) this.fail("extra_display");
      }),
      watchPageLeave(() => this.fail("left_page")),
    ];
  }

  /** Stop enforcing without ending anything — used on a normal finish before leaving fullscreen. */
  disarm() {
    for (const off of this.guards) off();
    this.guards = [];
    this.monitor = null;
  }

  private event(code: ProctorViolationCode): ProctorEvent {
    return {
      code,
      at: new Date().toISOString(),
      elapsedSeconds: this.startedAtMs ? Math.max(0, Math.round((Date.now() - this.startedAtMs) / 1000)) : 0,
    };
  }

  private violation(code: ProctorViolationCode) {
    if (this.verdict || !this.armed) return;
    if (isHardViolation(code) || this.warnings.length >= PROCTOR.warningsBeforeFail) {
      this.fail(code);
      return;
    }
    const ev = this.event(code);
    this.warnings.push(ev);
    this.emit({ type: "warning", event: ev });
  }

  /** Ends the interview for `code`. Idempotent; safe to call from `pagehide` (everything here is synchronous). */
  fail(code: ProctorViolationCode) {
    if (this.verdict || !this.armed) return;
    const verdict: ProctorVerdict = {
      interviewId: this.interviewId,
      outcome: "failed",
      failure: this.event(code),
      warnings: [...this.warnings],
      recordedAt: new Date().toISOString(),
    };
    this.verdict = verdict;
    this.disarm();
    writeProctorVerdict(verdict);
    this.emit({ type: "failed", verdict });
    this.dispose();
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.disarm();
    this.stopCamera();
    this.listeners.clear();
  }
}

// --- Registry (survives the /ready -> /live route change) ------------------------------------------

const registry = new Map<string, ProctorSession>();
const pendingDispose = new Map<string, number>();

export function getProctorSession(interviewId: string): ProctorSession | undefined {
  const s = registry.get(interviewId);
  return s && !s.isDisposed ? s : undefined;
}

export function getOrCreateProctorSession(interviewId: string): ProctorSession {
  cancelDispose(interviewId);
  const existing = getProctorSession(interviewId);
  if (existing) return existing;
  const s = new ProctorSession(interviewId);
  registry.set(interviewId, s);
  return s;
}

export function disposeProctorSession(interviewId: string) {
  cancelDispose(interviewId);
  const s = registry.get(interviewId);
  if (!s) return;
  s.dispose();
  registry.delete(interviewId);
}

/**
 * Disposal is deferred by a tick so a **remount cancels it**.
 *
 * React StrictMode runs every effect mount → cleanup → mount. With an immediate
 * dispose, arriving on the live screen tore down the very session `/ready` had
 * just handed over — stopping the camera — and then built a fresh one that had
 * never called `startCamera()`. The result was a black self-view and a proctor
 * that watched nothing for the whole interview. The same race exists on any
 * route transition that unmounts the old screen after mounting the new one.
 */
export function scheduleDisposeProctorSession(interviewId: string) {
  if (pendingDispose.has(interviewId)) return;
  pendingDispose.set(
    interviewId,
    window.setTimeout(() => {
      pendingDispose.delete(interviewId);
      disposeProctorSession(interviewId);
    }, 0),
  );
}

function cancelDispose(interviewId: string) {
  const id = pendingDispose.get(interviewId);
  if (id === undefined) return;
  window.clearTimeout(id);
  pendingDispose.delete(interviewId);
}

// --- Warning chime -------------------------------------------------------------------------------

let audioCtx: AudioContext | null = null;

/** Two short tones so a candidate who is *not* looking at the screen still notices the warning. */
export function playWarningChime() {
  try {
    audioCtx ??= new AudioContext();
    const ctx = audioCtx;
    if (ctx.state === "suspended") void ctx.resume();
    const t = ctx.currentTime;
    const tones: ReadonlyArray<readonly [number, number]> = [
      [880, 0],
      [660, 0.16],
    ];
    for (const [freq, offset] of tones) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t + offset);
      gain.gain.exponentialRampToValueAtTime(0.2, t + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + offset + 0.16);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t + offset);
      osc.stop(t + offset + 0.18);
    }
  } catch {
    /* no audio — the banner still shows */
  }
}
