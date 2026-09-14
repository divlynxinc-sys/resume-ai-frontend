import type { FaceLandmarker, FaceLandmarkerResult, NormalizedLandmark } from "@mediapipe/tasks-vision";
import { PROCTOR } from "./config";
import type { AttentionState, GazeSample, SoftViolationCode } from "./types";

// --- Model loading ---------------------------------------------------------------------------

let landmarkerPromise: Promise<FaceLandmarker> | null = null;

/**
 * One landmarker per page. GPU (WebGL) first, CPU when the GPU delegate cannot
 * initialise. The tasks-vision runtime (~600 kB) is imported dynamically so it
 * is a chunk of its own — the interview list and setup screens never pay for it.
 */
export function loadFaceLandmarker(): Promise<FaceLandmarker> {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
      const fileset = await FilesetResolver.forVisionTasks(PROCTOR.wasmBaseUrl);
      const options = (delegate: "GPU" | "CPU") => ({
        baseOptions: { modelAssetPath: PROCTOR.faceModelUrl, delegate },
        runningMode: "VIDEO" as const,
        // Two so a second person in frame can be reported; the gaze maths only ever looks at the first.
        numFaces: 2,
        outputFacialTransformationMatrixes: true,
        outputFaceBlendshapes: false,
      });
      try {
        return await FaceLandmarker.createFromOptions(fileset, options("GPU"));
      } catch {
        return await FaceLandmarker.createFromOptions(fileset, options("CPU"));
      }
    })().catch((e: unknown) => {
      landmarkerPromise = null; // let the next attempt retry
      throw e;
    });
  }
  return landmarkerPromise;
}

/** Kicks off the ~4 MB download early (Ready screen mount) so the camera check does not wait on it. */
export function preloadFaceLandmarker() {
  void loadFaceLandmarker().catch(() => {
    /* surfaced by the camera check when it actually needs the model */
  });
}

// --- Per-frame analysis ----------------------------------------------------------------------

/** MediaPipe 478-point mesh indices. Iris centres (468/473) exist because face_landmarker includes the iris refinement. */
interface EyeIndices {
  outer: number;
  inner: number;
  top: number;
  bottom: number;
  iris: number;
}
const LEFT_EYE: EyeIndices = { outer: 33, inner: 133, top: 159, bottom: 145, iris: 468 };
const RIGHT_EYE: EyeIndices = { outer: 263, inner: 362, top: 386, bottom: 374, iris: 473 };

export interface GazeBaseline {
  yaw: number;
  pitch: number;
  eyeH: number;
  eyeV: number;
  yawRatio: number;
  pitchRatio: number;
  /**
   * False until the candidate's resting pose has been measured.
   *
   * 🔴 Load-bearing. Several of these signals are **not** zero for a head facing
   * straight ahead — `pitchRatio` in particular sits around 0.3, because the nose
   * tip is naturally well below the eye line. Compared against an all-zero
   * baseline that reads as "looking away" **immediately, for everyone**, which
   * would warn and then fail an honest candidate within seconds. Gaze violations
   * are therefore suppressed until this is true.
   */
  calibrated: boolean;
}
export const ZERO_BASELINE: GazeBaseline = { yaw: 0, pitch: 0, eyeH: 0, eyeV: 0, yawRatio: 0, pitchRatio: 0, calibrated: false };

/** Mesh points used for the matrix-free head-pose estimate. */
const NOSE_TIP = 1;
const BROW_MID = 168;
const CHIN = 152;

/**
 * Head turn straight from mesh geometry: where the nose sits between the two
 * outer eye corners (projected onto the eye axis, so it is roll-invariant), and
 * how far down the brow→chin line it sits. Both are ratios, ~0 facing forward.
 *
 * This exists because `facialTransformationMatrixes` is optional output — if the
 * model ever returns none, the matrix-based yaw is silently 0 forever and head
 * turns stop being detected at all. This one only needs landmarks.
 */
function landmarkPose(pts: NormalizedLandmark[], aspect: number) {
  const l = pts[LEFT_EYE.outer];
  const r = pts[RIGHT_EYE.outer];
  const nose = pts[NOSE_TIP];
  const brow = pts[BROW_MID];
  const chin = pts[CHIN];
  if (!l || !r || !nose) return { yawRatio: 0, pitchRatio: 0 };

  const ex = (r.x - l.x) * aspect;
  const ey = r.y - l.y;
  const span2 = ex * ex + ey * ey;
  if (span2 < 1e-8) return { yawRatio: 0, pitchRatio: 0 };
  const midX = ((l.x + r.x) / 2) * aspect;
  const midY = (l.y + r.y) / 2;
  // Projection of (nose - eyeMid) onto the unit eye axis, in units of the corner separation.
  const yawRatio = ((nose.x * aspect - midX) * ex + (nose.y - midY) * ey) / span2;

  let pitchRatio = 0;
  if (brow && chin) {
    const faceH = Math.hypot((chin.x - brow.x) * aspect, chin.y - brow.y);
    if (faceH > 1e-4) pitchRatio = (nose.y - midY) / faceH;
  }
  return { yawRatio, pitchRatio };
}

/**
 * Iris position relative to the eye centre, in units of half the eye width so it
 * is independent of distance from the camera. `aspect` puts x and y in the same
 * (pixel-proportional) units — landmarks are normalised to the frame size.
 */
function eyeOffset(pts: NormalizedLandmark[], eye: EyeIndices, aspect: number) {
  const outer = pts[eye.outer];
  const inner = pts[eye.inner];
  const top = pts[eye.top];
  const bottom = pts[eye.bottom];
  const iris = pts[eye.iris];
  if (!outer || !inner || !top || !bottom || !iris) return null;
  const halfWidth = Math.hypot((inner.x - outer.x) * aspect, inner.y - outer.y) / 2;
  if (halfWidth < 1e-4) return null;
  const cx = ((inner.x + outer.x) / 2) * aspect;
  const cy = (top.y + bottom.y) / 2;
  return { h: (iris.x * aspect - cx) / halfWidth, v: (iris.y - cy) / halfWidth };
}

/**
 * Head yaw/pitch from the facial transformation matrix. Yaw is read from the
 * flattened element 2 and pitch from element 9; both are sines of the angle for
 * a standard rotation composition. A transposed layout or a flipped canonical
 * axis only costs a sign or a cos() factor, and the session calibrates against
 * the candidate's own resting pose, so only the magnitude of a *change* matters.
 */
function headPose(m: number[] | undefined): { yaw: number; pitch: number } {
  if (!m || m.length < 16) return { yaw: 0, pitch: 0 };
  const deg = (v: number) => (Math.asin(Math.max(-1, Math.min(1, v))) * 180) / Math.PI;
  return { yaw: deg(-m[2]), pitch: deg(-m[9]) };
}

export function analyseFaces(
  result: FaceLandmarkerResult,
  aspect: number,
  base: GazeBaseline,
  at: number,
  brightness = 1,
): GazeSample {
  const faces = result.faceLandmarks?.length ?? 0;
  const empty = {
    faces, headYaw: 0, headPitch: 0, eyeH: 0, eyeV: 0, yawRatio: 0, pitchRatio: 0,
    landmarks: 0, poseSource: "none" as const, calibrated: base.calibrated, brightness, at,
  };
  if (faces === 0) return { ...empty, state: "no_face" };
  if (faces > 1) return { ...empty, state: "multiple_faces" };

  const pts = result.faceLandmarks[0];
  const matrix = result.facialTransformationMatrixes?.[0]?.data;
  const pose = headPose(matrix);
  const ratios = landmarkPose(pts, aspect);
  const l = eyeOffset(pts, LEFT_EYE, aspect);
  const r = eyeOffset(pts, RIGHT_EYE, aspect);
  const eyes = l && r ? { h: (l.h + r.h) / 2, v: (l.v + r.v) / 2 } : (l ?? r ?? { h: 0, v: 0 });

  const headYaw = pose.yaw - base.yaw;
  const headPitch = pose.pitch - base.pitch;
  const yawRatio = ratios.yawRatio - base.yawRatio;
  const pitchRatio = ratios.pitchRatio - base.pitchRatio;
  const eyeH = eyes.h - base.eyeH;
  const eyeV = eyes.v - base.eyeV;
  // Any one signal is enough. The two head signals are deliberately redundant so a
  // missing transformation matrix cannot silently disable head-turn detection.
  const away =
    Math.abs(headYaw) > PROCTOR.maxHeadYawDeg ||
    Math.abs(headPitch) > PROCTOR.maxHeadPitchDeg ||
    Math.abs(yawRatio) > PROCTOR.maxHeadYawRatio ||
    Math.abs(pitchRatio) > PROCTOR.maxHeadPitchRatio ||
    Math.abs(eyeH) > PROCTOR.maxEyeOffsetH ||
    Math.abs(eyeV) > PROCTOR.maxEyeOffsetV;
  return {
    state: away ? "looking_away" : "on_screen",
    faces, headYaw, headPitch, eyeH, eyeV, yawRatio, pitchRatio,
    landmarks: pts.length,
    poseSource: matrix && matrix.length >= 16 ? "matrix" : "landmarks",
    calibrated: base.calibrated,
    brightness, at,
  };
}

/**
 * Mean luma of the frame, sampled on a tiny canvas (32×24 ≈ 768 px) so it costs
 * nothing next to the landmarker. Rec. 601 weights, on every 2nd pixel.
 */
export class BrightnessMeter {
  private canvas = document.createElement("canvas");
  private ctx: CanvasRenderingContext2D | null;

  constructor() {
    this.canvas.width = 32;
    this.canvas.height = 24;
    this.ctx = this.canvas.getContext("2d", { willReadFrequently: true });
  }

  measure(video: HTMLVideoElement): number {
    if (!this.ctx) return 1; // canvas unavailable — do not block on a check we cannot run
    try {
      this.ctx.drawImage(video, 0, 0, this.canvas.width, this.canvas.height);
      const { data } = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      let sum = 0;
      let n = 0;
      for (let i = 0; i < data.length; i += 8) {
        sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        n++;
      }
      return n ? sum / n / 255 : 1;
    } catch {
      return 1;
    }
  }
}

// --- Frame loop --------------------------------------------------------------------------------

type VideoWithFrameCallback = HTMLVideoElement & {
  requestVideoFrameCallback?: (cb: () => void) => number;
  cancelVideoFrameCallback?: (handle: number) => void;
};

/** Runs the landmarker on a playing `<video>` and emits one `GazeSample` per analysed frame. */
export class GazeTracker {
  baseline: GazeBaseline = ZERO_BASELINE;
  private video: VideoWithFrameCallback;
  private landmarker: FaceLandmarker;
  private onSample: (sample: GazeSample) => void;
  private handle: number | null = null;
  private usingVfc = false;
  private running = false;
  private lastAt = 0;
  private lastTs = 0;
  private brightness = new BrightnessMeter();

  constructor(video: HTMLVideoElement, landmarker: FaceLandmarker, onSample: (sample: GazeSample) => void) {
    this.video = video;
    this.landmarker = landmarker;
    this.onSample = onSample;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.usingVfc = typeof this.video.requestVideoFrameCallback === "function";
    const loop = () => {
      if (!this.running) return;
      const now = performance.now();
      if (now - this.lastAt >= PROCTOR.analyseIntervalMs && this.video.readyState >= 2 && this.video.videoWidth > 0) {
        this.lastAt = now;
        // MediaPipe requires strictly increasing timestamps.
        const ts = Math.max(now, this.lastTs + 1);
        this.lastTs = ts;
        try {
          const result = this.landmarker.detectForVideo(this.video, ts);
          const lit = this.brightness.measure(this.video);
          this.onSample(analyseFaces(result, this.video.videoWidth / this.video.videoHeight, this.baseline, now, lit));
        } catch {
          /* a dropped frame is fine — the next one is analysed */
        }
      }
      this.handle =
        this.usingVfc && this.video.requestVideoFrameCallback
          ? this.video.requestVideoFrameCallback(loop)
          : requestAnimationFrame(loop);
    };
    loop();
  }

  stop() {
    this.running = false;
    if (this.handle == null) return;
    if (this.usingVfc && this.video.cancelVideoFrameCallback) this.video.cancelVideoFrameCallback(this.handle);
    else cancelAnimationFrame(this.handle);
    this.handle = null;
  }
}

// --- Debounced policy ----------------------------------------------------------------------------

const HOLD_SECONDS: Record<SoftViolationCode, number> = {
  looking_away: PROCTOR.awaySeconds,
  no_face: PROCTOR.noFaceSeconds,
  multiple_faces: PROCTOR.multipleFacesSeconds,
};

/**
 * Turns the per-frame attention state into violations. A state must be held for
 * its `HOLD_SECONDS` to count, and after a violation the candidate has to be
 * back on screen for `recoverSeconds` before another can fire — so one long look
 * away is one violation, not a burst.
 */
export class AttentionMonitor {
  private onViolation: (code: SoftViolationCode) => void;
  private current: AttentionState = "on_screen";
  private since = 0;
  private armed = true;

  constructor(onViolation: (code: SoftViolationCode) => void) {
    this.onViolation = onViolation;
  }

  push(sample: GazeSample) {
    // Before calibration the gaze deltas are measured against a meaningless zero
    // baseline, so `looking_away` there says nothing about the candidate. Missing
    // and extra faces do not depend on the baseline, so those still count.
    const observed: AttentionState = sample.state === "looking_away" && !sample.calibrated ? "on_screen" : sample.state;
    sample = sample.state === observed ? sample : { ...sample, state: observed };
    if (sample.state !== this.current) {
      this.current = sample.state;
      this.since = sample.at;
    }
    const held = (sample.at - this.since) / 1000;
    if (this.current === "on_screen") {
      if (!this.armed && held >= PROCTOR.recoverSeconds) this.armed = true;
      return;
    }
    if (!this.armed) return;
    if (held >= HOLD_SECONDS[this.current]) {
      this.armed = false;
      this.onViolation(this.current);
    }
  }
}
