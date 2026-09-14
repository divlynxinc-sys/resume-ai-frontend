import { PROCTOR } from "./config";
import type { HardViolationCode, ProctorVerdict, ProctorViolationCode } from "./types";

/**
 * A proctoring verdict is recorded client-side, keyed by interview id, so the
 * processing / report / history screens can show *why* the interview ended
 * instead of a report. The backend still finalises the session as usual (the
 * worker posts the transcript when the candidate drops from the room); this
 * record is what overrides that outcome in the UI.
 */
const PREFIX = "jobsynk.interviewProctor.";
const CHANGE_EVENT = "jobsynk:proctor-verdict";

export function proctorStorageKey(interviewId: string) {
  return `${PREFIX}${interviewId}`;
}

export function readProctorVerdict(interviewId: string | undefined): ProctorVerdict | null {
  if (!interviewId) return null;
  try {
    const raw = localStorage.getItem(proctorStorageKey(interviewId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ProctorVerdict> | null;
    if (parsed?.outcome !== "failed" || !parsed.failure?.code) return null;
    return { ...parsed, interviewId, warnings: parsed.warnings ?? [] } as ProctorVerdict;
  } catch {
    return null;
  }
}

/** Synchronous on purpose: it has to survive a `pagehide`. */
export function writeProctorVerdict(verdict: ProctorVerdict) {
  try {
    localStorage.setItem(proctorStorageKey(verdict.interviewId), JSON.stringify(verdict));
  } catch {
    /* storage blocked (private mode / quota) — the in-memory verdict still ends the interview */
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: verdict.interviewId }));
}

export function clearProctorVerdict(interviewId: string) {
  try {
    localStorage.removeItem(proctorStorageKey(interviewId));
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: interviewId }));
}

export function onProctorVerdictChange(cb: (interviewId: string) => void): () => void {
  const handler = (e: Event) => cb(String((e as CustomEvent<string>).detail));
  window.addEventListener(CHANGE_EVENT, handler);
  return () => window.removeEventListener(CHANGE_EVENT, handler);
}

const HARD_CODES: HardViolationCode[] = ["left_fullscreen", "tab_hidden", "extra_display", "camera_lost", "left_page"];
const HARD = new Set<ProctorViolationCode>(HARD_CODES);

export function isHardViolation(code: ProctorViolationCode): code is HardViolationCode {
  return HARD.has(code);
}

export interface ViolationCopy {
  /** Timeline label, e.g. "Looked away from the screen". */
  short: string;
  /** Headline on the failure screen. */
  title: string;
  /** Full explanation shown to the candidate. */
  reason: string;
  /** Imperative shown in the live warning banner. */
  warning: string;
}

const COPY: Record<ProctorViolationCode, ViolationCopy> = {
  looking_away: {
    short: "Looked away from the screen",
    title: "You looked away from the screen after a warning",
    reason: `You had already received a warning. Your eyes then left the screen for more than ${PROCTOR.awaySeconds} seconds again. Looking around during a proctored interview is treated as consulting outside help.`,
    warning: "Keep your eyes on the screen.",
  },
  no_face: {
    short: "Face not visible",
    title: "Your face left the camera view after a warning",
    reason: `You had already received a warning. The camera then could not see your face for more than ${PROCTOR.noFaceSeconds} seconds. You need to stay in front of the camera for the whole interview.`,
    warning: "We cannot see your face — stay in front of the camera.",
  },
  multiple_faces: {
    short: "Second person on camera",
    title: "Another person appeared on camera after a warning",
    reason:
      "You had already received a warning. A second face was then seen in the camera view. Only you may be in front of the camera during the interview.",
    warning: "Only you should be in front of the camera.",
  },
  left_fullscreen: {
    short: "Left fullscreen",
    title: "You left fullscreen mode",
    reason:
      "The interview must stay in fullscreen from start to finish. Leaving it — pressing Esc, switching tabs or windows, or resizing the browser — ends the interview immediately.",
    warning: "Stay in fullscreen.",
  },
  tab_hidden: {
    short: "Switched away from the interview",
    title: "You switched away from the interview window",
    reason:
      "The interview tab was hidden — another tab, window or app was brought to the front. Switching away during the interview ends it immediately.",
    warning: "Stay on this tab.",
  },
  extra_display: {
    short: "Additional display connected",
    title: "An additional display was connected",
    reason:
      "A second screen was detected while the interview was running. Interviews must be taken on a single display.",
    warning: "Disconnect the extra display.",
  },
  camera_lost: {
    short: "Camera turned off",
    title: "Your camera was turned off",
    reason:
      "The camera feed stopped during the interview — it was disabled, unplugged or its permission was revoked. Eye tracking needs the camera on for the whole session.",
    warning: "Turn your camera back on.",
  },
  left_page: {
    short: "Left the interview page",
    title: "You left the interview page",
    reason:
      "The page was reloaded, closed or navigated away from while the interview was running, which also leaves fullscreen. A proctored interview cannot be resumed.",
    warning: "Stay on this page.",
  },
};

export function describeViolation(code: ProctorViolationCode): ViolationCopy {
  return COPY[code];
}
