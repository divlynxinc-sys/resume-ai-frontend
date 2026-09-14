import { formatTime, type TimerPhase } from "./utils";

const PHASE_COLOR: Record<TimerPhase, string> = {
  normal: "var(--accent)",
  warning: "#f59e0b",
  critical: "#f43f5e",
  overtime: "#8b5cf6",
};

const PHASE_NOTE: Record<TimerPhase, string> = {
  normal: "left",
  warning: "left",
  critical: "left",
  overtime: "Wrapping up",
};

const R = 15;
const CIRCUMFERENCE = 2 * Math.PI * R;

interface SessionTimerProps {
  remaining: number;
  elapsed: number;
  total: number;
  phase: TimerPhase;
  progress: number;
}

/**
 * Countdown ring + tabular digits. Past the planned duration it flips to
 * counting up under a "Wrapping up" label, because the interviewer — not the
 * clock — decides when the session actually ends.
 */
export function SessionTimer({ remaining, elapsed, total, phase, progress }: SessionTimerProps) {
  const overtime = phase === "overtime";
  const display = overtime ? formatTime(elapsed - total) : formatTime(remaining);
  const label = overtime
    ? `Over the planned ${Math.round(total / 60)} minutes by ${display}. Sam is wrapping up.`
    : `${formatTime(remaining)} remaining of ${Math.round(total / 60)} minutes`;

  return (
    <div
      role="timer"
      aria-label={label}
      title={label}
      className="inline-flex items-center gap-2.5 rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] py-1.5 pl-1.5 pr-3.5 shadow-[var(--shadow-soft)]"
      style={{ ["--timer" as string]: PHASE_COLOR[phase] }}
    >
      <span className="relative grid size-9 place-items-center">
        <svg viewBox="0 0 36 36" className="size-9 -rotate-90 overflow-visible">
          <circle cx="18" cy="18" r={R} fill="none" stroke="var(--app-surface-2)" strokeWidth="3" />
          <circle
            cx="18" cy="18" r={R} fill="none"
            stroke="var(--timer)" strokeWidth="3" strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (overtime ? 1 : progress)}
            className="motion-safe:transition-[stroke-dashoffset,stroke] motion-safe:duration-1000 motion-safe:ease-linear"
          />
        </svg>
        {(phase === "critical" || overtime) && <span className="absolute size-1.5 rounded-full bg-[var(--timer)] motion-safe:animate-ping" aria-hidden />}
      </span>
      <span className="flex flex-col leading-none">
        <span className={`font-mono text-[15px] font-medium tabular-nums tracking-tight ${phase === "normal" ? "text-[var(--app-fg)]" : "text-[var(--timer)]"}`}>
          {overtime ? `+${display}` : display}
        </span>
        <span className="mt-1 text-[10px] font-medium uppercase tracking-[.12em] text-[color-mix(in_srgb,var(--timer)_78%,var(--app-fg-muted))]">
          {PHASE_NOTE[phase]}
        </span>
      </span>
    </div>
  );
}
