/**
 * Proctoring knobs for the live AI interview. Every threshold lives here so the
 * behaviour can be tuned without touching the detection code.
 *
 * Detection runs entirely in the browser: the camera is analysed on-device by
 * MediaPipe's face landmarker and the video never leaves the machine.
 */

/**
 * Must match the `@mediapipe/tasks-vision` version in package.json — the WASM
 * runtime is fetched from the CDN at this exact version so it matches the
 * bundled JS API.
 */
export const MEDIAPIPE_VISION_VERSION = "1.0.1";

/** Small frame: the landmarker downsamples anyway, and this keeps CPU away from the LiveKit audio path. */
const VIDEO_CONSTRAINTS: MediaTrackConstraints = {
  width: { ideal: 640 },
  height: { ideal: 480 },
  facingMode: "user",
  frameRate: { ideal: 24, max: 30 },
};

export const PROCTOR = {
  /** Master switch. `false` restores the un-proctored interview flow end to end. */
  enabled: true,
  /** Browsers that cannot report extra displays (Firefox, Safari) are refused rather than trusted. */
  requireScreenCheckSupport: true,
  /** `screen.isExtended` has no change event without a permission prompt, so it is polled. */
  screenPollMs: 1000,
  video: VIDEO_CONSTRAINTS,
  /** Minimum gap between analysed frames (ms). ~12 fps is plenty for gaze. */
  analyseIntervalMs: 80,
  /** Head turned further than this (degrees, relative to the calibrated resting pose) counts as looking away. */
  maxHeadYawDeg: 20,
  maxHeadPitchDeg: 16,
  /**
   * Iris offset from the eye centre, as a fraction of **half the eye width**,
   * relative to the calibrated resting gaze.
   *
   * ⚠️ Anatomy sets the ceiling here: the eye is ~30 mm corner to corner (half =
   * 15 mm) and the iris centre travels only ~5 mm at full deviation, so this
   * ratio **physically cannot exceed ≈0.33**. The first version used 0.34 — at or
   * beyond that maximum — which is why rolling your eyes right off the screen was
   * never detected and only `no_face` ever fired. Keep these well under 0.3.
   * ≈0.16 is roughly half of maximum deviation (~20°), past the edge of a normal
   * screen but short of a glance between two on-screen fields.
   */
  maxEyeOffsetH: 0.16,
  maxEyeOffsetV: 0.14,
  /**
   * Landmark-geometry fallback for head turn (nose offset between the eye corners,
   * normalised by their separation), used when the model returns no facial
   * transformation matrix — otherwise a broken matrix means yaw is silently always 0.
   */
  maxHeadYawRatio: 0.08,
  maxHeadPitchRatio: 0.07,
  /** A state has to persist this long before it counts — brief glances while thinking are normal. */
  awaySeconds: 2.5,
  noFaceSeconds: 4,
  multipleFacesSeconds: 2,
  /** After a violation, attention must be back on screen this long before the next one can count. */
  recoverSeconds: 1.5,
  /** Ready screen: steady on-screen attention required before the camera check passes (also the calibration window). */
  readyGateSeconds: 1.5,
  /**
   * Mean frame luma (0–1) the room must reach before an interview may start.
   * Webcams auto-gain hard, so a face can still be *detected* in a dark room while
   * the iris landmarks it produces are too noisy to judge gaze — which would then
   * fail the candidate unfairly mid-interview. Cheap to comply with: turn a light on.
   */
  minBrightness: 0.22,
  /** Warnings before the interview is failed. The product rule is exactly one warning. */
  warningsBeforeFail: 1,
  warningBannerMs: 6000,
  /**
   * Speak warnings aloud through `speechSynthesis`. **Off, and it should stay off
   * while the interview runs on open speakers.**
   *
   * It was on briefly and the failure mode was worse than the problem: the mic
   * picked the spoken warning up, the interviewer's STT transcribed it, and it
   * landed in the transcript as the *candidate's* answer — which Sam then replied
   * to. A proctoring cue must never contaminate the thing being assessed.
   *
   * The chime stays: a pure tone is an audible cue that no STT will turn into
   * words. The proper spoken version belongs to Sam (the interviewer already owns
   * the audio channel), which needs a backend → `interview_agent` signal — see
   * 05-frontend.md §Proctoring.
   */
  speakWarnings: false,
  /** Where the MediaPipe WASM runtime and face model load from. Override to self-host (e.g. `/proctor/wasm`). */
  wasmBaseUrl:
    (import.meta.env.VITE_PROCTOR_WASM_URL as string | undefined) ||
    `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VISION_VERSION}/wasm`,
  faceModelUrl:
    (import.meta.env.VITE_PROCTOR_FACE_MODEL_URL as string | undefined) ||
    "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
};
