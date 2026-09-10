/**
 * Dev-only proctoring sandbox — `npm run dev` then open /proctor-sandbox.html.
 *
 * Exercises the real proctoring components and policy with **no backend, no
 * LiveKit, no paid plan and no interview**: turn the camera on, watch the live
 * gaze numbers, arm enforcement, and break each rule to see the warning and the
 * failure reason. Vite only builds `index.html`, so this entry never reaches a
 * production bundle and is not in the app's route table.
 *
 * Delete `proctor-sandbox.html` + `src/dev/` if you do not want it in the repo.
 */
import { useState } from "react";
import { AppButton } from "@/components/ui/AppButton";
import { cardClass } from "@/features/ai-interviews/components";
import { ProctorChecklist, ProctorFailedScreen, ProctorMonitor } from "@/features/ai-interviews/proctor/components";
import { PROCTOR } from "@/features/ai-interviews/proctor/config";
import { enterFullscreen, exitFullscreen, isFullscreen } from "@/features/ai-interviews/proctor/fullscreen";
import { useCameraCheck, useLiveProctor, useProctorSession, useScreenCheck } from "@/features/ai-interviews/proctor/hooks";
import { clearProctorVerdict } from "@/features/ai-interviews/proctor/storage";
import type { GazeSample, ProctorVerdict } from "@/features/ai-interviews/proctor/types";

const SANDBOX_ID = "sandbox";

function Row({ label, value, over }: { label: string; value: string; over?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1">
      <span className="text-xs text-[var(--app-fg-muted)]">{label}</span>
      <span className={`font-mono text-xs tabular-nums ${over ? "font-semibold text-rose-600" : "text-[var(--app-fg)]"}`}>{value}</span>
    </div>
  );
}

function Readout({ sample }: { sample: GazeSample | null }) {
  if (!sample) return <p className="text-xs text-[var(--app-fg-muted)]">No frames yet — turn the camera on.</p>;
  const n = (v: number, d = 2) => v.toFixed(d);
  return (
    <div className="divide-y divide-[var(--app-border)]">
      <Row label="state" value={sample.state} over={sample.state !== "on_screen"} />
      <Row label="faces" value={String(sample.faces)} over={sample.faces !== 1} />
      <Row label={`head yaw (limit ±${PROCTOR.maxHeadYawDeg}°)`} value={`${n(sample.headYaw, 1)}°`} over={Math.abs(sample.headYaw) > PROCTOR.maxHeadYawDeg} />
      <Row label={`head pitch (limit ±${PROCTOR.maxHeadPitchDeg}°)`} value={`${n(sample.headPitch, 1)}°`} over={Math.abs(sample.headPitch) > PROCTOR.maxHeadPitchDeg} />
      <Row label={`eye H (limit ±${PROCTOR.maxEyeOffsetH})`} value={n(sample.eyeH)} over={Math.abs(sample.eyeH) > PROCTOR.maxEyeOffsetH} />
      <Row label={`eye V (limit ±${PROCTOR.maxEyeOffsetV})`} value={n(sample.eyeV)} over={Math.abs(sample.eyeV) > PROCTOR.maxEyeOffsetV} />
      <Row label={`brightness (min ${PROCTOR.minBrightness})`} value={n(sample.brightness)} over={sample.brightness < PROCTOR.minBrightness} />
      <Row label={`yaw ratio (limit ±${PROCTOR.maxHeadYawRatio})`} value={n(sample.yawRatio, 3)} over={Math.abs(sample.yawRatio) > PROCTOR.maxHeadYawRatio} />
      <Row label={`pitch ratio (limit ±${PROCTOR.maxHeadPitchRatio})`} value={n(sample.pitchRatio, 3)} over={Math.abs(sample.pitchRatio) > PROCTOR.maxHeadPitchRatio} />
      <Row label="landmarks (478 = iris)" value={String(sample.landmarks)} over={sample.landmarks < 478} />
      <Row label="pose source" value={sample.poseSource} over={sample.poseSource === "none"} />
      <Row label="calibrated" value={String(sample.calibrated)} over={!sample.calibrated} />
    </div>
  );
}

export function Sandbox() {
  const { session } = useProctorSession(SANDBOX_ID, true);
  const screen = useScreenCheck(true);
  const camera = useCameraCheck(session);
  const [armed, setArmed] = useState(false);
  const [verdict, setVerdict] = useState<ProctorVerdict | null>(null);

  // Passing null keeps enforcement off until you press Arm.
  const live = useLiveProctor(armed ? session : null, undefined, (v) => {
    setVerdict(v);
    setArmed(false);
    void exitFullscreen();
  });

  const arm = async () => {
    try {
      await enterFullscreen();
    } catch {
      /* fullscreen refused — arm anyway so the other rules stay testable */
    }
    setArmed(true);
  };

  const reset = () => {
    clearProctorVerdict(SANDBOX_ID);
    setVerdict(null);
    setArmed(false);
    window.location.reload();
  };

  if (verdict) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <ProctorFailedScreen verdict={verdict} roleTitle="Sandbox run" />
        <div className="mt-4 text-center">
          <AppButton variant="secondary" onClick={reset}>Reset sandbox</AppButton>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="border-b border-[var(--app-border)] pb-5">
        <p className="text-xs font-semibold uppercase tracking-[.16em] text-[var(--accent-text)]">Dev sandbox</p>
        <h1 className="mt-1 font-display text-3xl font-light">Interview proctoring</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--app-fg-muted)]">
          The real checks and the real policy, with no backend, no LiveKit and no interview. Turn the camera on, let the check pass, then press
          Arm and try to break a rule.
        </p>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <ProctorChecklist screen={screen} camera={camera} session={session} />

        <aside className="space-y-5">
          <section className={`${cardClass} p-5`}>
            <h2 className="text-sm font-semibold">Enforcement</h2>
            <p className="mt-1 text-xs leading-5 text-[var(--app-fg-muted)]">
              {armed
                ? `Armed. ${live.warnings.length}/${PROCTOR.warningsBeforeFail} warnings used — the next violation ends the run.`
                : camera.passed
                  ? "Checks passed. Arm to start enforcing (this goes fullscreen)."
                  : "Finish the camera check first."}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <AppButton size="sm" onClick={arm} disabled={armed || !camera.passed}>Arm</AppButton>
              <AppButton size="sm" variant="secondary" onClick={() => setArmed(false)} disabled={!armed}>Disarm</AppButton>
              <AppButton size="sm" variant="ghost" onClick={reset}>Reset</AppButton>
            </div>
            {armed && (
              <ul className="mt-4 space-y-1.5 text-xs leading-5 text-[var(--app-fg-muted)]">
                <li>Look away for {PROCTOR.awaySeconds}s → warning, then a second time → fail</li>
                <li>Cover the camera {PROCTOR.noFaceSeconds}s → no_face · a second face → multiple_faces</li>
                <li>Press Esc, switch tabs, or plug in a display → immediate fail</li>
              </ul>
            )}
          </section>

          <section className={`${cardClass} p-5`}>
            <h2 className="text-sm font-semibold">Live gaze readout</h2>
            <p className="mt-1 text-xs text-[var(--app-fg-muted)]">Values are relative to the calibrated baseline. Red = over the limit.</p>
            <div className="mt-3">
              <Readout sample={armed ? (live.sample ?? camera.sample) : camera.sample} />
            </div>
          </section>

          <section className={`${cardClass} p-5`}>
            <h2 className="text-sm font-semibold">Environment</h2>
            <div className="mt-2 divide-y divide-[var(--app-border)]">
              <Row label="display check" value={screen} over={screen === "extended" || screen === "unsupported"} />
              <Row label="camera" value={camera.status} over={camera.status === "denied" || camera.status === "unavailable"} />
              <Row label="fullscreen" value={String(isFullscreen())} />
              <Row label="warnings" value={`${live.warnings.length}/${PROCTOR.warningsBeforeFail}`} over={live.warnings.length > 0} />
            </div>
          </section>
        </aside>
      </div>

      {armed && session && <ProctorMonitor session={session} {...live} />}
    </main>
  );
}

