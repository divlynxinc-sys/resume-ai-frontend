// Full-bleed ticker of the ten ATS checks, sitting directly under the hero.
//
// It does three jobs at once: it gives the fold a hard horizontal edge to break
// against, it puts real product vocabulary in front of the visitor before any
// pitch, and it moves — which tells you the page is alive without asking you to
// scroll for proof.
//
// Animation is CSS (`.landing-ticker` in index.css), not Framer Motion: it runs
// forever, so it belongs on the compositor rather than in a JS frame loop.

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
      className="landing-ticker relative overflow-hidden border-y border-[var(--app-border)] py-4"
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
                className="flex items-center whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--app-fg-soft)]"
              >
                {check}
                <span aria-hidden className="mx-7 text-[var(--accent)]">
                  &#9670;
                </span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
