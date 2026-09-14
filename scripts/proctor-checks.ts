/* Standalone harness for the proctoring logic. Bundled with esbuild, run in node. */

// --- minimal DOM stubs (the proctor only touches these lazily, at call time) ---
class FakeEventTarget {
  listeners: Record<string, Array<(e: unknown) => void>> = {};
  addEventListener(type: string, cb: (e: unknown) => void) {
    (this.listeners[type] ??= []).push(cb);
  }
  removeEventListener(type: string, cb: (e: unknown) => void) {
    this.listeners[type] = (this.listeners[type] ?? []).filter((f) => f !== cb);
  }
  fire(type: string, e: unknown = {}) {
    for (const cb of [...(this.listeners[type] ?? [])]) cb(e);
  }
  count(type: string) {
    return (this.listeners[type] ?? []).length;
  }
}

const store = new Map<string, string>();
const doc = new FakeEventTarget() as FakeEventTarget & Record<string, unknown>;
doc.fullscreenElement = {};
doc.visibilityState = "visible";
const win = new FakeEventTarget() as FakeEventTarget & Record<string, unknown>;
win.screen = { isExtended: false };
win.setInterval = (fn: () => void, ms: number) => setInterval(fn, ms) as unknown as number;
win.clearInterval = (id: number) => clearInterval(id as unknown as NodeJS.Timeout);
win.setTimeout = (fn: () => void, ms: number) => setTimeout(fn, ms) as unknown as number;
win.clearTimeout = (id: number) => clearTimeout(id as unknown as NodeJS.Timeout);
win.dispatchEvent = () => true;

const g = globalThis as Record<string, unknown>;
g.document = doc;
g.window = win;
g.CustomEvent = class {
  type: string;
  detail: unknown;
  constructor(type: string, init?: { detail?: unknown }) {
    this.type = type;
    this.detail = init?.detail;
  }
};
g.localStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
};

// Imports must come after the stubs are installed (esbuild keeps this order for CJS output).
import { analyseFaces, AttentionMonitor, type GazeBaseline } from "@/features/ai-interviews/proctor/gaze";
import {
  ProctorSession,
  disposeProctorSession,
  getOrCreateProctorSession,
  getProctorSession,
  scheduleDisposeProctorSession,
} from "@/features/ai-interviews/proctor/session";
import { describeViolation, readProctorVerdict, isHardViolation } from "@/features/ai-interviews/proctor/storage";
import { PROCTOR } from "@/features/ai-interviews/proctor/config";
import type { FaceLandmarkerResult, NormalizedLandmark } from "@mediapipe/tasks-vision";
import type { GazeSample, ProctorViolationCode } from "@/features/ai-interviews/proctor/types";

let passed = 0;
const failures: string[] = [];
function check(name: string, cond: boolean) {
  if (cond) passed++;
  else failures.push(name);
}
function eq<T>(name: string, actual: T, expected: T) {
  check(`${name} (got ${JSON.stringify(actual)}, want ${JSON.stringify(expected)})`, Object.is(actual, expected));
}

// --- fixtures ----------------------------------------------------------------------------------

// A calibrated baseline for a forward-facing fixture face. pitchRatio is NOT zero for a
// head facing straight ahead (the nose tip sits well below the eye line), which is exactly
// why enforcement is suppressed until calibration has happened.
const RAW = { yaw: 0, pitch: 0, eyeH: 0, eyeV: 0, yawRatio: 0, pitchRatio: 0, calibrated: false } as GazeBaseline;
const NEUTRAL = analyseFaces(result([makeFace()], [yawMatrix(0)]), 640 / 480, RAW, 0);
const BASE: GazeBaseline = {
  yaw: NEUTRAL.headYaw, pitch: NEUTRAL.headPitch,
  eyeH: NEUTRAL.eyeH, eyeV: NEUTRAL.eyeV,
  yawRatio: NEUTRAL.yawRatio, pitchRatio: NEUTRAL.pitchRatio,
  calibrated: true,
};

/** A synthetic 478-point face looking straight ahead; `irisShift` moves both irises horizontally. */
function makeFace(irisShift = 0, irisShiftV = 0): NormalizedLandmark[] {
  const pts: NormalizedLandmark[] = Array.from({ length: 478 }, () => ({ x: 0.5, y: 0.5, z: 0, visibility: 1 }));
  const set = (i: number, x: number, y: number) => (pts[i] = { x, y, z: 0, visibility: 1 });
  // Left eye: outer 33, inner 133, top 159, bottom 145, iris 468. Eye spans x .30-.40, centre .35.
  set(33, 0.3, 0.4);
  set(133, 0.4, 0.4);
  set(159, 0.35, 0.37);
  set(145, 0.35, 0.43);
  set(468, 0.35 + irisShift, 0.4 + irisShiftV);
  // Right eye: outer 263, inner 362, top 386, bottom 374, iris 473. Spans .60-.70, centre .65.
  set(263, 0.7, 0.4);
  set(362, 0.6, 0.4);
  set(386, 0.65, 0.37);
  set(374, 0.65, 0.43);
  set(473, 0.65 + irisShift, 0.4 + irisShiftV);
  // Pose landmarks: nose exactly between the outer eye corners, so yawRatio/pitchRatio start centred.
  set(1, 0.5, 0.55);   // nose tip
  set(168, 0.5, 0.35); // brow midpoint
  set(152, 0.5, 0.8);  // chin
  return pts;
}

/** Column-major 4x4 with a yaw rotation about Y, matching what headPose() reads. */
function yawMatrix(deg: number): number[] {
  const r = (deg * Math.PI) / 180;
  const m = new Array(16).fill(0);
  m[0] = Math.cos(r);
  m[2] = -Math.sin(r);
  m[5] = 1;
  m[8] = Math.sin(r);
  m[10] = Math.cos(r);
  m[15] = 1;
  return m;
}

function result(faces: NormalizedLandmark[][], matrices: number[][] = []): FaceLandmarkerResult {
  return {
    faceLandmarks: faces,
    faceBlendshapes: [],
    facialTransformationMatrixes: matrices.map((data) => ({ rows: 4, columns: 4, data })),
  };
}

// --- analyseFaces -------------------------------------------------------------------------------

const ASPECT = 640 / 480;

eq("no face -> no_face", analyseFaces(result([]), ASPECT, BASE, 0).state, "no_face");
eq("two faces -> multiple_faces", analyseFaces(result([makeFace(), makeFace()]), ASPECT, BASE, 0).state, "multiple_faces");
eq("centred gaze -> on_screen", analyseFaces(result([makeFace()], [yawMatrix(0)]), ASPECT, BASE, 0).state, "on_screen");

// Geometry of the fixture: half eye width = 0.05*aspect = 0.0667, so the reported
// ratio is (shift * aspect) / 0.0667 = shift * 20. Anatomy caps that ratio at ~0.33
// (the iris centre travels ~5mm inside a ~15mm half-eye), so every value below is a
// shift the eye can actually produce -- shift 0.045 (ratio 0.9) is NOT.
eq("eyes rolled well off-screen -> looking_away", analyseFaces(result([makeFace(0.0125)], [yawMatrix(0)]), ASPECT, BASE, 0).state, "looking_away");
eq("glance across the screen -> on_screen", analyseFaces(result([makeFace(0.004)], [yawMatrix(0)]), ASPECT, BASE, 0).state, "on_screen");
eq("eyes rolled down -> looking_away", analyseFaces(result([makeFace(0, 0.012)], [yawMatrix(0)]), ASPECT, BASE, 0).state, "looking_away");

// The shipped regression: a threshold at/above the anatomical ceiling made the eye
// test unreachable, so only no_face ever fired and rolling your eyes away was missed.
check(`maxEyeOffsetH (${PROCTOR.maxEyeOffsetH}) must sit below the ~0.33 anatomical ceiling`, PROCTOR.maxEyeOffsetH < 0.3);
check(`maxEyeOffsetV (${PROCTOR.maxEyeOffsetV}) must sit below the ~0.33 anatomical ceiling`, PROCTOR.maxEyeOffsetV < 0.3);
{
  // A reachable threshold is one a real eye can cross: assert the maximum plausible
  // deviation (ratio ~0.3, i.e. shift 0.015) actually registers as looking away.
  const maxDeviation = analyseFaces(result([makeFace(0.015)], [yawMatrix(0)]), ASPECT, BASE, 0);
  eq("maximum real eye deviation is detected", maxDeviation.state, "looking_away");
  check("...and stays within what an eye can physically do", Math.abs(maxDeviation.eyeH) <= 0.34);
}

// Head turn must still be caught when the model returns NO transformation matrix,
// otherwise a missing matrix silently pins yaw at 0 forever.
{
  const noMatrix = analyseFaces(result([makeFace()], []), ASPECT, BASE, 0);
  eq("no matrix -> pose falls back to landmarks", noMatrix.poseSource, "landmarks");
  eq("centred face with no matrix is still on_screen", noMatrix.state, "on_screen");
  const turned = makeFace();
  turned[1] = { x: 0.56, y: 0.55, z: 0, visibility: 1 }; // nose swung toward one eye
  const turnedSample = analyseFaces(result([turned], []), ASPECT, BASE, 0);
  check(`landmark yawRatio moves with the head (got ${turnedSample.yawRatio.toFixed(3)})`, Math.abs(turnedSample.yawRatio) > PROCTOR.maxHeadYawRatio);
  eq("head turn is caught with no matrix at all", turnedSample.state, "looking_away");
}
eq("iris landmarks are reported for diagnosis", analyseFaces(result([makeFace()], [yawMatrix(0)]), ASPECT, BASE, 0).landmarks, 478);

const turned = analyseFaces(result([makeFace()], [yawMatrix(45)]), ASPECT, BASE, 0);
check(`head yaw 45deg is reported large (got ${turned.headYaw.toFixed(1)})`, Math.abs(turned.headYaw) > PROCTOR.maxHeadYawDeg);
eq("head turned -> looking_away", turned.state, "looking_away");
eq("head yaw 10deg -> on_screen", analyseFaces(result([makeFace()], [yawMatrix(10)]), ASPECT, BASE, 0).state, "on_screen");

// Calibration: a candidate whose resting pose is 20deg off is on_screen once that is the baseline.
const calibrated: GazeBaseline = { ...BASE, yaw: BASE.yaw + analyseFaces(result([makeFace()], [yawMatrix(20)]), ASPECT, BASE, 0).headYaw };
eq("calibrated resting pose -> on_screen", analyseFaces(result([makeFace()], [yawMatrix(20)]), ASPECT, calibrated, 0).state, "on_screen");

// The false-fail regression: with an all-zero (uncalibrated) baseline a forward-facing
// head reads as looking away, so an uncalibrated proctor would warn and then fail an
// honest candidate within seconds. The monitor must ignore gaze until calibration.
{
  const raw = analyseFaces(result([makeFace()], [yawMatrix(0)]), ASPECT, RAW, 0);
  check("a forward-facing head does NOT read as centred against a zero baseline", raw.state === "looking_away");
  eq("...and is flagged uncalibrated", raw.calibrated, false);
  const fired: string[] = [];
  const m = new AttentionMonitor((c) => fired.push(c));
  for (let t = 0; t <= 20000; t += 100) m.push({ ...raw, at: t });
  eq("an uncalibrated proctor never fires a gaze violation", fired.length, 0);
  // Missing/extra faces do not depend on the baseline, so they must still count.
  const blind: string[] = [];
  const m2 = new AttentionMonitor((c) => blind.push(c));
  for (let t = 0; t <= 6000; t += 100) m2.push({ ...raw, state: "no_face", faces: 0, calibrated: false, at: t });
  eq("...but no_face still counts while uncalibrated", blind[0], "no_face");
}

// Brightness rides along on every sample so the ready gate can refuse a dark room
// (a face IS still detected under webcam auto-gain, which is exactly the trap).
eq("brightness defaults to 1 when unmeasured", analyseFaces(result([makeFace()], [yawMatrix(0)]), ASPECT, BASE, 0).brightness, 1);
eq("brightness is passed through", analyseFaces(result([makeFace()], [yawMatrix(0)]), ASPECT, BASE, 0, 0.05).brightness, 0.05);
{
  const dark = analyseFaces(result([makeFace()], [yawMatrix(0)]), ASPECT, BASE, 0, 0.05);
  eq("a lit-looking face in a dark room is still on_screen...", dark.state, "on_screen");
  check("...but is below minBrightness, so the ready gate must refuse it", dark.brightness < PROCTOR.minBrightness);
}
eq("no-face frames still carry brightness", analyseFaces(result([]), ASPECT, BASE, 0, 0.4).brightness, 0.4);
check("minBrightness is a sane 0-1 threshold", PROCTOR.minBrightness > 0 && PROCTOR.minBrightness < 1);

// --- AttentionMonitor ---------------------------------------------------------------------------

function sample(state: GazeSample["state"], at: number): GazeSample {
  return {
    state, faces: state === "no_face" ? 0 : state === "multiple_faces" ? 2 : 1,
    headYaw: 0, headPitch: 0, eyeH: 0, eyeV: 0, yawRatio: 0, pitchRatio: 0,
    landmarks: 478, poseSource: "matrix", calibrated: true, brightness: 1, at,
  };
}

{
  const fired: string[] = [];
  const m = new AttentionMonitor((c) => fired.push(c));
  m.push(sample("on_screen", 0));
  // Looking away, but only briefly — thinking, not cheating.
  for (let t = 100; t <= 2000; t += 100) m.push(sample("looking_away", t));
  eq("brief glance does not fire", fired.length, 0);
  for (let t = 2100; t <= 3000; t += 100) m.push(sample("looking_away", t));
  eq("sustained look away fires once", fired.length, 1);
  // Still away: must not machine-gun more violations.
  for (let t = 3100; t <= 9000; t += 100) m.push(sample("looking_away", t));
  eq("no repeat while still away", fired.length, 1);
  // Back on screen long enough to re-arm, then away again.
  for (let t = 9100; t <= 11000; t += 100) m.push(sample("on_screen", t));
  for (let t = 11100; t <= 14000; t += 100) m.push(sample("looking_away", t));
  eq("second sustained look away fires again", fired.length, 2);
  eq("codes are looking_away", fired.join(","), "looking_away,looking_away");
}

{
  const fired: string[] = [];
  const m = new AttentionMonitor((c) => fired.push(c));
  for (let t = 0; t <= 3000; t += 100) m.push(sample("no_face", t));
  eq("no_face under 4s does not fire", fired.length, 0);
  for (let t = 3100; t <= 4500; t += 100) m.push(sample("no_face", t));
  eq("no_face past 4s fires", fired[0], "no_face");
}

{
  const fired: string[] = [];
  const m = new AttentionMonitor((c) => fired.push(c));
  for (let t = 0; t <= 2500; t += 100) m.push(sample("multiple_faces", t));
  eq("multiple_faces past 2s fires", fired[0], "multiple_faces");
}

// --- ProctorSession policy ------------------------------------------------------------------------

type Emitted = { type: string; code?: string };

function armedSession(id: string) {
  const s = new ProctorSession(id);
  const events: Emitted[] = [];
  s.subscribe((e) => {
    if (e.type === "warning") events.push({ type: "warning", code: e.event.code });
    else if (e.type === "failed") events.push({ type: "failed", code: e.verdict.failure.code });
  });
  s.armLive(new Date().toISOString());
  return { s, events };
}

/** Drives the private attention policy the way the tracker would. */
function feed(s: ProctorSession, state: GazeSample["state"], from: number, to: number) {
  for (let t = from; t <= to; t += 100) (s as unknown as { onSample: (x: GazeSample) => void }).onSample(sample(state, t));
}

{
  store.clear();
  const { s, events } = armedSession("iv-soft");
  check("armLive arms guards", s.armed);
  feed(s, "looking_away", 0, 3000);
  eq("first look away is a warning", events.map((e) => e.type).join(","), "warning");
  eq("warning recorded on session", s.warnings.length, 1);
  check("not failed after one warning", s.verdict === null);

  feed(s, "on_screen", 3100, 5000);
  feed(s, "looking_away", 5100, 8000);
  eq("second look away fails", events.map((e) => e.type).join(","), "warning,failed");
  check("verdict written", s.verdict !== null);
  eq("failure code", s.verdict?.failure.code, "looking_away");
  eq("verdict keeps the earlier warning", s.verdict?.warnings.length, 1);
  eq("verdict persisted", readProctorVerdict("iv-soft")?.failure.code, "looking_away");
  check("session disposed after failing", s.isDisposed);
  check("guards released after failing", !s.armed);
  eq("all document listeners removed", doc.count("fullscreenchange") + doc.count("visibilitychange"), 0);
}

{
  store.clear();
  // A mix of soft violations: any second one fails, not just a repeat of the same kind.
  const { s, events } = armedSession("iv-mixed");
  feed(s, "looking_away", 0, 3000);
  feed(s, "on_screen", 3100, 5000);
  feed(s, "no_face", 5100, 10000);
  eq("different second violation also fails", events.map((e) => `${e.type}:${e.code}`).join(","), "warning:looking_away,failed:no_face");
}

for (const code of ["left_fullscreen", "tab_hidden", "extra_display", "camera_lost", "left_page"] as ProctorViolationCode[]) {
  store.clear();
  const { s, events } = armedSession(`iv-${code}`);
  s.fail(code);
  eq(`${code} fails immediately with no warning`, events.map((e) => e.type).join(","), "failed");
  eq(`${code} recorded as the reason`, readProctorVerdict(`iv-${code}`)?.failure.code, code);
  check(`${code} is classed hard`, isHardViolation(code));
}

{
  store.clear();
  const { s, events } = armedSession("iv-idem");
  s.fail("left_fullscreen");
  s.fail("tab_hidden");
  s.fail("camera_lost");
  eq("fail is idempotent", events.length, 1);
  eq("first reason wins", readProctorVerdict("iv-idem")?.failure.code, "left_fullscreen");
}

{
  store.clear();
  const s = new ProctorSession("iv-unarmed");
  s.fail("left_fullscreen");
  check("an unarmed proctor cannot fail the interview", readProctorVerdict("iv-unarmed") === null);
}

{
  store.clear();
  const { s, events } = armedSession("iv-disarm");
  s.disarm();
  feed(s, "looking_away", 0, 9000);
  s.fail("left_fullscreen");
  eq("disarmed proctor reports nothing", events.length, 0);
  check("disarmed proctor writes no verdict", readProctorVerdict("iv-disarm") === null);
}

// --- copy ------------------------------------------------------------------------------------------

const ALL_CODES: ProctorViolationCode[] = [
  "looking_away", "no_face", "multiple_faces",
  "left_fullscreen", "tab_hidden", "extra_display", "camera_lost", "left_page",
];
for (const code of ALL_CODES) {
  const c = describeViolation(code);
  check(`${code} has a reason the candidate can read`, Boolean(c.short && c.title && c.reason.length > 40 && c.warning));
}
eq("exactly one warning before failing", PROCTOR.warningsBeforeFail, 1);

// --- registry lifetime (the StrictMode regression) --------------------------------------------------

/**
 * React StrictMode runs every effect mount -> cleanup -> mount. Disposing on that
 * cleanup killed the camera /ready had just handed to /live and left a fresh,
 * camera-less proctor watching nothing for the whole interview. Disposal must be
 * deferred so an immediate re-acquire cancels it.
 */
async function registryChecks() {
  const tick = () => new Promise((r) => setTimeout(r, 5));

  disposeProctorSession("iv-registry");
  const first = getOrCreateProctorSession("iv-registry");
  check("same id returns the same session", getOrCreateProctorSession("iv-registry") === first);

  // StrictMode: cleanup schedules disposal, the immediate remount must cancel it.
  scheduleDisposeProctorSession("iv-registry");
  const remounted = getOrCreateProctorSession("iv-registry");
  check("a remount keeps the handed-over session", remounted === first);
  check("...and does not dispose it", !first.isDisposed);
  await tick();
  check("the cancelled disposal never fires", !first.isDisposed);
  check("session survives in the registry", getProctorSession("iv-registry") === first);

  // A real unmount (nothing re-acquires) must still tear the camera down.
  scheduleDisposeProctorSession("iv-registry");
  await tick();
  check("a real unmount disposes the session", first.isDisposed);
  check("disposed sessions are not handed out", getProctorSession("iv-registry") === undefined);
  check("a later acquire builds a fresh session", getOrCreateProctorSession("iv-registry") !== first);
  disposeProctorSession("iv-registry");
}

// --- report ------------------------------------------------------------------------------------------

void registryChecks().then(() => {
  console.log(`\n${passed} checks passed`);
  if (failures.length) {
    console.log(`${failures.length} FAILED:`);
    for (const f of failures) console.log("  x " + f);
    process.exit(1);
  }
  console.log("all proctoring checks passed");
});
