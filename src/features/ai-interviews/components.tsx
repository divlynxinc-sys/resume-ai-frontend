import { ChevronDown, LoaderCircle, Mic, Pause, Play, RotateCcw, Square } from "lucide-react";
import { AppButton } from "@/components/ui/AppButton";
import type { DimensionScores, InterviewAnswer } from "./types";
import { formatTime } from "./utils";

export const cardClass = "rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-[var(--shadow-soft)]";

export function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: React.ReactNode; description: string; action?: React.ReactNode }) {
  return <div className="flex flex-col gap-5 border-b border-[var(--app-border)] pb-7 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-[var(--accent-text)]">{eyebrow}</p><h1 className="mt-2 font-display text-3xl font-light tracking-tight text-[var(--app-fg)] sm:text-5xl">{title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--app-fg-muted)]">{description}</p></div>{action}</div>;
}

export function LoadingPanel({ label = "Loading interview…" }: { label?: string }) { return <div className={`${cardClass} flex min-h-64 items-center justify-center gap-3 p-8 text-sm text-[var(--app-fg-muted)]`}><LoaderCircle className="size-5 animate-spin text-[var(--accent)]" />{label}</div>; }
export function ErrorPanel({ message, onRetry }: { message: string; onRetry?: () => void }) { return <div className={`${cardClass} p-8 text-center`} role="alert"><h2 className="font-display text-2xl font-light text-[var(--app-fg)]">We hit a snag</h2><p className="mx-auto mt-2 max-w-lg text-sm text-[var(--app-fg-muted)]">{message}</p>{onRetry ? <AppButton className="mt-5" onClick={onRetry}>Try again</AppButton> : null}</div>; }

export function LevelMeter({ level, active }: { level: number; active: boolean }) {
  return <div className="flex h-12 items-center justify-center gap-1" aria-label={active ? `Microphone level ${level} percent` : "Microphone inactive"}>{Array.from({ length: 24 }, (_, i) => <span key={i} className={`w-1 rounded-full transition-all ${active && i < Math.ceil(level / 4.2) ? "bg-[var(--accent)]" : "bg-[var(--app-border-strong)]"}`} style={{ height: `${10 + (i % 6) * 5}px` }} />)}</div>;
}

export function RecorderControls({ recorder, selectedDeviceId }: { recorder: ReturnType<typeof import("./hooks").useAudioRecorder>; selectedDeviceId?: string }) {
  const isActive = recorder.state === "recording" || recorder.state === "paused";
  return <div>
    <LevelMeter level={recorder.level} active={recorder.state === "recording"} />
    <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
      {recorder.state === "idle" || recorder.state === "unsupported" ? <AppButton onClick={() => recorder.start(selectedDeviceId)} disabled={recorder.state === "unsupported"}><Mic className="size-4" />Start recording</AppButton> : null}
      {recorder.state === "recording" ? <AppButton variant="secondary" onClick={recorder.pause}><Pause className="size-4" />Pause</AppButton> : null}
      {recorder.state === "paused" ? <AppButton variant="secondary" onClick={recorder.resume}><Play className="size-4" />Resume</AppButton> : null}
      {isActive ? <AppButton variant="secondary" onClick={recorder.stop}><Square className="size-4" />Stop</AppButton> : null}
      {recorder.state === "recorded" ? <AppButton variant="secondary" onClick={recorder.clearRecording}><RotateCcw className="size-4" />Re-record</AppButton> : null}
      <span className="min-w-16 text-center font-mono text-sm text-[var(--app-fg-muted)]">{formatTime(Math.round(recorder.durationMs / 1000))}</span>
    </div>
    {recorder.url ? <audio className="mx-auto mt-4 w-full max-w-md" src={recorder.url} controls aria-label="Recorded answer playback" /> : null}
    {recorder.error ? <p className="mt-4 rounded-xl bg-[var(--pastel-rose)] p-3 text-sm text-[#a13f62]" role="alert">{recorder.error}</p> : null}
  </div>;
}

const dimensions: { key: keyof DimensionScores; label: string; weight: string }[] = [{ key: "relevance", label: "Relevance", weight: "30%" }, { key: "evidence", label: "Evidence", weight: "25%" }, { key: "structure", label: "Structure", weight: "15%" }, { key: "roleAlignment", label: "Role alignment", weight: "20%" }, { key: "communication", label: "Communication", weight: "10%" }];
export function ScoreBreakdown({ scores }: { scores: DimensionScores }) { return <div className="space-y-4">{dimensions.map(({ key, label, weight }) => <div key={key}><div className="mb-1.5 flex justify-between text-sm"><span className="text-[var(--app-fg)]">{label} <span className="text-xs text-[var(--app-fg-soft)]">· {weight}</span></span><strong>{scores[key]}</strong></div><div className="h-2 overflow-hidden rounded-full bg-[var(--app-surface-2)]"><div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 motion-safe:transition-[width] motion-safe:duration-700" style={{ width: `${scores[key]}%` }} /></div></div>)}</div>; }

export function AnswerFeedback({ answer, question }: { answer: InterviewAnswer; question: string }) {
  const e = answer.evaluation;
  return <details className={`${cardClass} group overflow-hidden`}><summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5"><div><p className="text-xs font-medium uppercase tracking-wider text-[var(--accent-text)]">Question feedback</p><h3 className="mt-1 text-sm font-medium text-[var(--app-fg)]">{question}</h3></div><ChevronDown className="size-5 shrink-0 text-[var(--app-fg-soft)] transition-transform group-open:rotate-180" /></summary>{e ? <div className="grid gap-6 border-t border-[var(--app-border)] p-5 lg:grid-cols-2"><div><h4 className="text-sm font-semibold">Mock transcript</h4><p className="mt-2 text-sm leading-6 text-[var(--app-fg-muted)]">“{answer.transcript}”</p><h4 className="mt-5 text-sm font-semibold">Evidence from your answer</h4><p className="mt-2 text-sm text-[var(--app-fg-muted)]">{e.evidence}</p><h4 className="mt-5 text-sm font-semibold">Improved answer outline</h4><ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-[var(--app-fg-muted)]">{e.improvedOutline.map((x) => <li key={x}>{x}</li>)}</ol></div><div><ScoreBreakdown scores={e.scores} /><div className="mt-5 grid gap-4 sm:grid-cols-2"><div><h4 className="text-sm font-semibold text-emerald-600">What worked</h4><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--app-fg-muted)]">{e.worked.map((x) => <li key={x}>{x}</li>)}</ul></div><div><h4 className="text-sm font-semibold text-amber-600">What could improve</h4><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--app-fg-muted)]">{e.improvements.map((x) => <li key={x}>{x}</li>)}</ul></div></div></div></div> : null}</details>;
}
