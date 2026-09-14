import { useEffect, useRef } from "react";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Lightbulb,
  LoaderCircle,
  Maximize2,
  Monitor,
  ScanFace,
  ShieldAlert,
  ShieldCheck,
  TriangleAlert,
  Users,
  XCircle,
} from "lucide-react";
import { AppButton, AppButtonLink } from "@/components/ui/AppButton";
import { cardClass } from "../components";
import { formatTime } from "../utils";
import { PROCTOR } from "./config";
import type { CameraCheck, LiveProctor } from "./hooks";
import type { ProctorSession } from "./session";
import { describeViolation } from "./storage";
import type { AttentionState, ProctorVerdict, ScreenCheckStatus } from "./types";

/** Binds a `MediaStream` to a mirrored, muted `<video>`. */
export function CameraPreview({ stream, className = "" }: { stream: MediaStream | null; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.srcObject = stream;
    if (stream)
      void v.play().catch(() => {
        /* autoplay attribute handles it */
      });
    return () => {
      v.srcObject = null;
    };
  }, [stream]);
  return <video ref={ref} muted playsInline autoPlay className={`-scale-x-100 object-cover ${className}`} aria-label="Your camera" />;
}

// Static class strings so Tailwind's scanner sees them.
const ATTENTION: Record<AttentionState, { label: string; chip: string; Icon: typeof Eye }> = {
  on_screen: { label: "Eyes on screen", chip: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600", Icon: Eye },
  looking_away: { label: "Look at the screen", chip: "border-amber-500/40 bg-amber-500/12 text-amber-600", Icon: EyeOff },
  no_face: { label: "Face not visible", chip: "border-rose-500/40 bg-rose-500/10 text-rose-600", Icon: ScanFace },
  multiple_faces: { label: "More than one face", chip: "border-rose-500/40 bg-rose-500/10 text-rose-600", Icon: Users },
};

function AttentionChip({ state, compact = false }: { state: AttentionState; compact?: boolean }) {
  const a = ATTENTION[state];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${a.chip}`} aria-live="polite">
      <a.Icon className="size-3.5" aria-hidden />
      {compact ? <span className="sr-only">{a.label}</span> : a.label}
    </span>
  );
}

type RowState = "pending" | "busy" | "pass" | "fail" | "warn" | "info";

function RowIcon({ state }: { state: RowState }) {
  if (state === "pass") return <CheckCircle2 className="size-5 text-emerald-500" aria-hidden />;
  if (state === "fail") return <XCircle className="size-5 text-rose-500" aria-hidden />;
  if (state === "warn") return <TriangleAlert className="size-5 text-amber-500" aria-hidden />;
  if (state === "busy") return <LoaderCircle className="size-5 animate-spin text-[var(--accent)]" aria-hidden />;
  if (state === "pending") return <span className="block size-4 rounded-full border-2 border-[var(--app-border-strong)]" aria-hidden />;
  return null;
}

function CheckRow({ icon, title, state, children }: { icon: React.ReactNode; title: string; state: RowState; children: React.ReactNode }) {
  return (
    <li className="flex gap-4 py-4 first:pt-0 last:pb-0">
      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--app-surface-2)] text-[var(--app-fg-muted)]">{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-[var(--app-fg)]">{title}</h3>
          <RowIcon state={state} />
        </div>
        <div className="mt-1 text-sm leading-6 text-[var(--app-fg-muted)]">{children}</div>
      </div>
    </li>
  );
}

const SCREEN_COPY: Record<ScreenCheckStatus, { state: RowState; text: string }> = {
  checking: { state: "busy", text: "Checking your displays…" },
  single: { state: "pass", text: "One display detected." },
  extended: {
    state: "fail",
    text: "An additional display is connected. Disconnect it to continue — this re-checks automatically.",
  },
  unsupported: PROCTOR.requireScreenCheckSupport
    ? { state: "fail", text: "This browser cannot verify your displays. Use Google Chrome or Microsoft Edge on a desktop computer." }
    : { state: "warn", text: "Display check is not available in this browser." },
};

interface ProctorChecklistProps {
  screen: ScreenCheckStatus;
  camera: CameraCheck;
  session: ProctorSession | null;
}

/** The Ready-screen card: display check, camera + eye-tracking check, and the rules. */
export function ProctorChecklist({ screen, camera, session }: ProctorChecklistProps) {
  const screenCopy = SCREEN_COPY[screen];
  const cameraFailed = camera.status === "denied" || camera.status === "unavailable" || camera.status === "model_failed";
  const cameraState: RowState = camera.passed
    ? "pass"
    : cameraFailed
      ? "fail"
      : camera.status === "starting" || camera.status === "tracking"
        ? "busy"
        : "pending";
  const tooDark = !!camera.sample && camera.sample.brightness < PROCTOR.minBrightness;
  const gateHint = !camera.sample
    ? "Starting eye tracking…"
    : tooDark
      ? "Your room is too dark to track your eyes reliably — turn on a light or face a window, then hold still."
      : camera.sample.state === "on_screen"
        ? "Hold still and look straight at the screen…"
        : camera.sample.state === "no_face"
          ? "We cannot see your face — centre yourself in the frame."
          : camera.sample.state === "multiple_faces"
            ? "Only you should be in the frame."
            : "Look straight at the screen.";

  return (
    <section className={`${cardClass} p-6`} aria-labelledby="proctor-heading">
      <div className="flex items-center gap-3">
        <div className="grid size-11 place-items-center rounded-xl bg-[var(--accent-soft)]">
          <ShieldCheck className="size-5 text-[var(--accent-text)]" />
        </div>
        <div>
          <h2 id="proctor-heading" className="font-display text-xl font-light">
            Proctoring checks
          </h2>
          <p className="text-xs text-[var(--app-fg-muted)]">All of these must pass before the interview can start.</p>
        </div>
      </div>

      <ul className="mt-5 divide-y divide-[var(--app-border)]">
        <CheckRow icon={<Monitor className="size-5" />} title="Single display" state={screenCopy.state}>
          {screenCopy.text}
        </CheckRow>

        <CheckRow icon={<ScanFace className="size-5" />} title="Camera and eye tracking" state={cameraState}>
          {camera.status === "idle" && (
            <p>Needed to check that you stay in front of the screen. Video is analysed on this device only — it is never uploaded or recorded.</p>
          )}
          {camera.status === "starting" && <p>Starting your camera…</p>}
          {cameraFailed && <p className="text-rose-600">{camera.error || "We could not start your camera."}</p>}
          {camera.status === "tracking" && !camera.passed && <p className={tooDark ? "text-amber-600" : undefined}>{gateHint}</p>}
          {camera.passed && <p>Eye tracking is ready. Keep this position and this lighting during the interview.</p>}

          {session?.stream && (
            <div className="mt-3 flex flex-wrap items-end gap-3">
              <CameraPreview stream={session.stream} className="aspect-[4/3] w-56 rounded-xl bg-black" />
              <div className="flex flex-col gap-1.5">
                {camera.sample && <AttentionChip state={camera.sample.state} />}
                {tooDark && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/12 px-2.5 py-1 text-xs font-medium text-amber-600">
                    <Lightbulb className="size-3.5" aria-hidden />Too dark
                  </span>
                )}
              </div>
            </div>
          )}
          {(camera.status === "idle" || cameraFailed) && (
            <AppButton type="button" variant="secondary" size="sm" className="mt-3" onClick={() => void camera.start()}>
              <ScanFace className="size-4" />
              {cameraFailed ? "Try again" : "Turn on camera"}
            </AppButton>
          )}
        </CheckRow>

        <CheckRow icon={<Maximize2 className="size-5" />} title="Fullscreen" state="info">
          Turns on when you press Start. Leaving fullscreen — pressing Esc, switching tabs or windows — ends the interview immediately.
        </CheckRow>
      </ul>

      <div className="mt-5 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-2)] p-4">
        <h3 className="text-sm font-medium">How proctoring works</h3>
        <ul className="mt-2 space-y-1.5 text-sm leading-6 text-[var(--app-fg-muted)]">
          <li>
            Keep your eyes on the screen. Looking away for more than {PROCTOR.awaySeconds} seconds earns one warning; a second time ends the
            interview.
          </li>
          <li>Stay alone and in frame. Leaving the camera view or a second person appearing counts the same as looking away.</li>
          <li>
            Stay in fullscreen on a single display. Leaving fullscreen, switching tabs, connecting a display or turning the camera off ends the
            interview at once.
          </li>
          <li>If the interview is ended this way, you will be told exactly why.</li>
        </ul>
      </div>
    </section>
  );
}

interface ProctorMonitorProps extends LiveProctor {
  session: ProctorSession;
}

/** Live-room overlay: self-view + attention state in a corner, and the warning banner when one fires. */
export function ProctorMonitor({ session, sample, warnings, banner }: ProctorMonitorProps) {
  // Never show a reassuring green chip before a single frame has been analysed —
  // that is exactly what made a dead camera look like a passing check.
  const waiting = !session.stream || !sample;
  return (
    <>
      {banner && (
        <>
          {/* An amber vignette: the warning has to register in peripheral vision, because
              the person being warned for looking away is not reading the screen. */}
          <div
            className="pointer-events-none fixed inset-0 z-[55] motion-safe:animate-pulse"
            style={{ boxShadow: "inset 0 0 0 6px rgba(245,158,11,.85), inset 0 0 120px rgba(245,158,11,.28)" }}
            aria-hidden
          />
          <div role="alert" className="pointer-events-none fixed inset-x-0 top-8 z-[60] flex justify-center px-4">
            <div className="pointer-events-auto flex max-w-xl items-start gap-4 rounded-2xl border-2 border-amber-500 bg-[var(--app-surface)] px-6 py-5 shadow-[var(--shadow-pop)]">
              <TriangleAlert className="mt-0.5 size-8 shrink-0 text-amber-500" aria-hidden />
              <div>
                <p className="text-lg font-semibold tracking-tight text-[var(--app-fg)]">
                  Warning {warnings.length} of {PROCTOR.warningsBeforeFail}
                </p>
                <p className="mt-1 text-base leading-6 text-[var(--app-fg)]">{describeViolation(banner.code).warning}</p>
                <p className="mt-1 text-sm font-medium text-amber-600">One more and this interview ends.</p>
              </div>
            </div>
          </div>
        </>
      )}

      <aside
        className="fixed bottom-4 left-4 z-40 w-44 overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-[var(--shadow-pop)]"
        aria-label="Proctoring monitor"
      >
        <CameraPreview stream={session.stream} className="aspect-[4/3] w-full bg-black" />
        <div className="flex items-center justify-between gap-2 px-2.5 py-2">
          {waiting ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--app-border-strong)] bg-[var(--app-surface-2)] px-2.5 py-1 text-xs font-medium text-[var(--app-fg-muted)]">
              <LoaderCircle className="size-3.5 animate-spin" aria-hidden />Starting camera
            </span>
          ) : (
            <AttentionChip state={sample.state} compact />
          )}
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums ${
              warnings.length ? "bg-amber-500/15 text-amber-600" : "bg-[var(--app-surface-2)] text-[var(--app-fg-soft)]"
            }`}
            title="Warnings used"
          >
            {warnings.length}/{PROCTOR.warningsBeforeFail}
          </span>
        </div>
      </aside>
    </>
  );
}

/** Shown on /processing, /report and from history instead of a report when the proctor ended the interview. */
export function ProctorFailedScreen({ verdict, roleTitle }: { verdict: ProctorVerdict; roleTitle?: string }) {
  const copy = describeViolation(verdict.failure.code);
  const timeline = [
    ...verdict.warnings.map((w) => ({ kind: "Warning", at: w.elapsedSeconds, text: describeViolation(w.code).short })),
    { kind: "Ended", at: verdict.failure.elapsedSeconds, text: copy.short },
  ];
  return (
    <div className={`${cardClass} mx-auto max-w-2xl p-8`} role="alert">
      <div className="flex items-start gap-4">
        <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[var(--pastel-rose)] text-[#a13f62]">
          <ShieldAlert className="size-6" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#a13f62]">Interview ended · proctoring</p>
          <h1 className="mt-1 font-display text-3xl font-light">This interview was failed</h1>
          {roleTitle && <p className="mt-1 truncate text-sm text-[var(--app-fg-muted)]">{roleTitle}</p>}
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-[var(--app-surface-2)] p-5">
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--app-fg-soft)]">Reason</p>
        <h2 className="mt-1 font-medium text-[var(--app-fg)]">{copy.title}</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--app-fg-muted)]">{copy.reason}</p>
      </div>

      <ol className="mt-5 space-y-2" aria-label="What happened">
        {timeline.map((t, i) => (
          <li key={i} className="flex items-center gap-3 text-sm">
            <span
              className={`w-16 shrink-0 rounded-full px-2 py-0.5 text-center text-[10px] font-semibold uppercase tracking-wide ${
                t.kind === "Ended" ? "bg-[var(--pastel-rose)] text-[#a13f62]" : "bg-amber-500/15 text-amber-600"
              }`}
            >
              {t.kind}
            </span>
            <span className="font-mono text-xs tabular-nums text-[var(--app-fg-soft)]">{formatTime(t.at)}</span>
            <span className="text-[var(--app-fg)]">{t.text}</span>
          </li>
        ))}
      </ol>

      <p className="mt-5 text-xs leading-5 text-[var(--app-fg-muted)]">
        No report is produced for a failed interview. Your camera was analysed on this device only and nothing from it was uploaded or stored.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <AppButtonLink to="/ai-interviews" variant="secondary">
          Back to interviews
        </AppButtonLink>
        <AppButtonLink to="/ai-interviews/new">Start a new interview</AppButtonLink>
      </div>
    </div>
  );
}
