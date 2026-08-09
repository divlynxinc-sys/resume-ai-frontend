// Full-bleed ticker of the ten ATS checks, sitting directly under the hero.
//
// It does three jobs at once: it gives the fold a hard horizontal edge to break
// against, it puts real product vocabulary in front of the visitor before any
// pitch, and it moves — which tells you the page is alive without asking you to
// scroll for proof.
//
// Animation is CSS (`.landing-ticker` in index.css), not Framer Motion: it runs
// forever, so it belongs on the compositor rather than in a JS frame loop.

import { Check } from "lucide-react";

const CHECKS = [
  "Contact details are readable",
  "Uses standard section headings",
  "Bullets contain numbers",
  "Bullets lead with strong verbs",
  "Length is in range",
  "Written in resume register",
  "Free of filler phrases",
  "Roles carry dates",
  "Bullets are scannable",
  "Matches the job description",
];

export default function ChecksTicker() {
  return (
    <div
      className="landing-ticker relative overflow-hidden border-y border-[var(--app-border)] bg-[var(--app-surface)] py-4 shadow-[inset_0_1px_0_color-mix(in_srgb,var(--app-fg)_3%,transparent)]"
      style={{
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0, black 6rem, black calc(100% - 6rem), transparent 100%)",
        maskImage:
          "linear-gradient(to right, transparent 0, black 6rem, black calc(100% - 6rem), transparent 100%)",
      }}
    >
      <div className="landing-ticker__track flex w-max">
        {[0, 1].map((copy) => (
          <div
            key={copy}
            aria-hidden={copy === 1 || undefined}
            className="flex shrink-0 items-center"
          >
            {CHECKS.map((check) => (
              <span
                key={`${copy}-${check}`}
                className="mx-1.5 flex items-center gap-2 whitespace-nowrap rounded-full border border-[var(--app-border)] bg-[var(--app-surface-2)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--app-fg-muted)]"
              >
                <span className="grid size-4 place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent-text)]"><Check className="size-2.5" strokeWidth={3} /></span>
                {check}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
