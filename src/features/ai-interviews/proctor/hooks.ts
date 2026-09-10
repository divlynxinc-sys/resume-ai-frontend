import { useCallback, useEffect, useRef, useState } from "react";
import { PROCTOR } from "./config";
import { screenCheckSupported, watchScreens } from "./screens";
import { getOrCreateProctorSession, playWarningChime, scheduleDisposeProctorSession, type ProctorSession } from "./session";
import { describeViolation, onProctorVerdictChange, readProctorVerdict } from "./storage";
import { primeSpeech, speak, stopSpeech } from "./voice";
import type { CameraCheckStatus, GazeSample, ProctorEvent, ProctorVerdict, ScreenCheckStatus } from "./types";

/** UI updates are throttled to this — the tracker itself runs at ~12 fps. */
const UI_TICK_MS = 150;

/**
 * Creates (or reuses) the proctor for an interview and disposes it on unmount —
 * unless `handOff()` was called, which is how /ready passes it to /live.
 */
export function useProctorSession(interviewId: string | undefined, enabled: boolean) {
  const [session, setSession] = useState<ProctorSession | null>(null);
  const handedOff = useRef(false);

  useEffect(() => {
    if (!enabled || !interviewId) {
      setSession(null);
      return;
    }
    handedOff.current = false;
    setSession(getOrCreateProctorSession(interviewId));
    // Deferred, so StrictMode's mount → cleanup → mount does not tear down the
    // camera the previous screen handed over. See scheduleDisposeProctorSession.
    return () => {
      if (!handedOff.current) scheduleDisposeProctorSession(interviewId);
    };
  }, [interviewId, enabled]);

  const handOff = useCallback(() => {
    handedOff.current = true;
  }, []);
  return { session, handOff };
}

export function useScreenCheck(enabled: boolean): ScreenCheckStatus {
  const [status, setStatus] = useState<ScreenCheckStatus>(() =>
    !enabled ? "single" : screenCheckSupported() ? "checking" : "unsupported",
  );
  useEffect(() => {
    if (!enabled) {
      setStatus("single");
      return;
    }
    if (!screenCheckSupported()) {
      setStatus("unsupported");
      return;
    }
    return watchScreens((extended) => setStatus(extended ? "extended" : "single"));
  }, [enabled]);
  return status;
}

export interface CameraCheck {
  status: CameraCheckStatus;
  error: string;
  sample: GazeSample | null;
  /** True once the candidate has looked at the screen steadily for `readyGateSeconds`. Sticky. */
  passed: boolean;
  start: () => Promise<void>;
}

export function useCameraCheck(session: ProctorSession | null): CameraCheck {
  const [status, setStatus] = useState<CameraCheckStatus>("idle");
  const [error, setError] = useState("");
  const [sample, setSample] = useState<GazeSample | null>(null);
  const [passed, setPassed] = useState(false);
  const passedRef = useRef(false);
  const onScreenSince = useRef<number | null>(null);
  const lastUiAt = useRef(0);

  useEffect(() => {
    setStatus(session?.cameraStatus ?? "idle");
    setError(session?.cameraError ?? "");
    setSample(session?.latest ?? null);
    setPassed(false);
    passedRef.current = false;
    onScreenSince.current = null;
    if (!session) return;
    return session.subscribe((e) => {
      if (e.type === "camera") {
        setStatus(e.status);
        setError(e.error ?? "");
        return;
      }
      if (e.type !== "sample") return;
      const s = e.sample;
      if (s.at - lastUiAt.current > UI_TICK_MS) {
        lastUiAt.current = s.at;
        setSample(s);
      }
      // Too dark counts as "not ready" as much as looking away does: a face detected
      // under auto-gain in a dark room yields iris landmarks too noisy to judge gaze.
      if (s.state !== "on_screen" || s.brightness < PROCTOR.minBrightness) {
        onScreenSince.current = null;
        return;
      }
      onScreenSince.current ??= s.at;
      if (!passedRef.current && s.at - onScreenSince.current >= PROCTOR.readyGateSeconds * 1000) {
        passedRef.current = true;
        session.calibrate();
        setPassed(true);
      }
    });
  }, [session]);

  const start = useCallback(async () => {
    if (!session) return;
    setError("");
    try {
      await session.startCamera();
    } catch (e) {
      setError(e instanceof Error ? e.message : "We could not start your camera.");
    }
  }, [session]);

  return { status, error, sample, passed, start };
}

export interface LiveProctor {
  sample: GazeSample | null;
  warnings: ProctorEvent[];
  /** The warning currently on screen, cleared after `warningBannerMs`. */
  banner: ProctorEvent | null;
}

/** Arms enforcement for the live room and surfaces warnings; `onFail` fires once with the verdict. */
export function useLiveProctor(
  session: ProctorSession | null,
  startedAt: string | undefined,
  onFail: (verdict: ProctorVerdict) => void,
): LiveProctor {
  const [sample, setSample] = useState<GazeSample | null>(null);
  const [warnings, setWarnings] = useState<ProctorEvent[]>([]);
  const [banner, setBanner] = useState<ProctorEvent | null>(null);
  const onFailRef = useRef(onFail);
  const lastUiAt = useRef(0);

  useEffect(() => {
    onFailRef.current = onFail;
  }, [onFail]);

  useEffect(() => {
    if (!session) return;
    if (PROCTOR.speakWarnings) primeSpeech();
    session.armLive(startedAt);
    setWarnings([...session.warnings]);
    // The camera must be running for the whole interview. It normally arrives from
    // /ready already calibrated, but a refresh or a deep link into /live has none —
    // and a proctor with no camera silently watches nothing, which is worse than
    // failing loudly. Idempotent: a live stream makes this a no-op.
    if (!session.stream) {
      void session.startCamera().catch(() => {
        if (session.armed) session.fail("camera_lost");
      });
    }
    let bannerTimer: number | null = null;
    const off = session.subscribe((e) => {
      if (e.type === "sample") {
        if (e.sample.at - lastUiAt.current > UI_TICK_MS) {
          lastUiAt.current = e.sample.at;
          setSample(e.sample);
        }
        return;
      }
      if (e.type === "warning") {
        setWarnings((w) => [...w, e.event]);
        setBanner(e.event);
        // Chime only by default: a tone cannot be transcribed, speech can — see
        // PROCTOR.speakWarnings for why speaking it corrupted the transcript.
        playWarningChime();
        if (PROCTOR.speakWarnings) speak(`${describeViolation(e.event.code).warning} One more and your interview will end.`);
        if (bannerTimer) window.clearTimeout(bannerTimer);
        bannerTimer = window.setTimeout(() => setBanner(null), PROCTOR.warningBannerMs);
        return;
      }
      if (e.type === "failed") {
        if (PROCTOR.speakWarnings) speak(`Your interview has ended. ${describeViolation(e.verdict.failure.code).title}.`);
        onFailRef.current(e.verdict);
      }
    });
    return () => {
      off();
      session.disarm();
      stopSpeech();
      if (bannerTimer) window.clearTimeout(bannerTimer);
    };
  }, [session, startedAt]);

  return { sample, warnings, banner };
}

/** The persisted verdict for an interview, kept in sync when one is written in this tab. */
export function useProctorVerdict(interviewId: string | undefined): ProctorVerdict | null {
  const [verdict, setVerdict] = useState<ProctorVerdict | null>(() => readProctorVerdict(interviewId));
  useEffect(() => {
    setVerdict(readProctorVerdict(interviewId));
    return onProctorVerdictChange((id) => {
      if (id === interviewId) setVerdict(readProctorVerdict(interviewId));
    });
  }, [interviewId]);
  return verdict;
}
