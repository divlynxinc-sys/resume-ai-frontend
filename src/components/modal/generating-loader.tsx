// Aesthetic "writing" loader for streaming AI panes (cover letter, Q&A, HR email).
// Shown while the model is generating but no tokens have streamed back yet, so the
// output pane never feels empty during the wait. Mimics text taking shape
// (heading → paragraphs → sign-off) with a staggered shimmer.

const PARAGRAPHS = [
  [88],
  [98, 95, 92, 68],
  [97, 99, 90, 84, 58],
  [94, 88, 76],
  [34],
];

export default function GeneratingLoader({
  label = "Generating…",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div className={`space-y-5 ${className}`}>
      <div className="flex items-center gap-2 text-xs text-[var(--app-fg-muted)]">
        <span className="relative flex size-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-60 animate-ping" />
          <span className="relative inline-flex size-2 rounded-full bg-[var(--accent)]" />
        </span>
        {label}
      </div>
      {PARAGRAPHS.map((para, pi) => (
        <div key={pi} className="space-y-2.5">
          {para.map((w, li) => (
            <div
              key={li}
              className="h-3 rounded bg-gradient-to-r from-[var(--app-surface-2)] via-[var(--app-border)] to-[var(--app-surface-2)] bg-[length:200%_100%] animate-pulse"
              style={{ width: `${w}%`, animationDelay: `${(pi * 5 + li) * 110}ms` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
