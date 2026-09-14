/** Violations that earn a warning first (the second one fails the interview). */
export type SoftViolationCode = "looking_away" | "no_face" | "multiple_faces";
/** Violations that fail the interview immediately. */
export type HardViolationCode = "left_fullscreen" | "tab_hidden" | "extra_display" | "camera_lost" | "left_page";
export type ProctorViolationCode = SoftViolationCode | HardViolationCode;

export type AttentionState = "on_screen" | SoftViolationCode;

export interface GazeSample {
  state: AttentionState;
  faces: number;
  /** Degrees from the calibrated resting pose. */
  headYaw: number;
  headPitch: number;
  /** Iris offset from the eye centre as a fraction of half the eye width, signed, relative to calibration. */
  eyeH: number;
  eyeV: number;
  /** Landmark-geometry head turn (nose between the eye corners), relative to calibration. Matrix-independent. */
  yawRatio: number;
  pitchRatio: number;
  /** Diagnostics: how many landmarks the model returned (478 = iris refinement present) and where the pose came from. */
  landmarks: number;
  poseSource: "matrix" | "landmarks" | "none";
  /** Whether the resting pose has been measured yet. Gaze violations are suppressed until it has. */
  calibrated: boolean;
  /** Mean frame luma, 0–1. Below `PROCTOR.minBrightness` the room is too dark to start in. */
  brightness: number;
  /** `performance.now()` when the frame was analysed. */
  at: number;
}

export interface ProctorEvent {
  code: ProctorViolationCode;
  /** ISO timestamp. */
  at: string;
  /** Seconds since the interview started (0 when unknown). */
  elapsedSeconds: number;
}

/** What is persisted when the proctor ends an interview — the reason is shown to the candidate afterwards. */
export interface ProctorVerdict {
  interviewId: string;
  outcome: "failed";
  failure: ProctorEvent;
  warnings: ProctorEvent[];
  recordedAt: string;
}

export type ScreenCheckStatus = "checking" | "single" | "extended" | "unsupported";
export type CameraCheckStatus = "idle" | "starting" | "tracking" | "denied" | "unavailable" | "model_failed";

export type ProctorSessionEvent =
  | { type: "sample"; sample: GazeSample }
  | { type: "warning"; event: ProctorEvent }
  | { type: "failed"; verdict: ProctorVerdict }
  | { type: "camera"; status: CameraCheckStatus; error?: string };
