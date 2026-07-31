// The free ATS checker, given a section of its own now that it no longer owns
// the hero.
//
// It also absorbs the two "what industry demands / our approach" grids that used
// to sit here — twelve more cards of abstractions ("Consistency & Integrity",
// "Links & Contact Hygiene") that no visitor could act on. The ten checks below
// are the literal list `lib/ats-check.ts` runs, in its order. Naming them is the
// whole argument: anyone can write "ATS-friendly", nobody else shows the marking
// scheme.
//
// KEEP IN SYNC with `ATS_CHECKS` in `src/lib/ats-check.ts`.

import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { EASE } from "./easing";
import { Eyebrow, Reveal, SplitHeadline } from "./motion-primitives";

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

/** A tick that draws itself rather than fading in. */
function DrawnCheck({ delay }: { delay: number }) {
  const reduce = useReducedMotion();
  return (
    <svg viewBox="0 0 16 16" className="size-3.5 shrink-0 text-[var(--accent)]" aria-hidden>
      <motion.path
        d="M3 8.5 L6.5 12 L13 4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduce ? undefined : { pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.4, ease: EASE, delay }}
      />
    </svg>
  );
}

export default function AtsStandard() {
  return (
    <section id="ats-checker" className="mx-auto max-w-[1160px] scroll-mt-24 px-6">
      <div className="grid gap-14 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Eyebrow>The marking scheme</Eyebrow>
          <h2 className="mt-4 font-display text-[2rem] font-light leading-[1.08] tracking-tight text-[var(--app-fg)] sm:text-5xl">
            <SplitHeadline
              segments={[
                { text: "Ten checks." },
                { text: " Free, and no account.", className: "italic text-[var(--app-fg-muted)]" },
              ]}
            />
          </h2>

          <Reveal delay={0.1}>
            <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-[var(--app-fg-muted)]">
              No applicant tracking system gives your resume a score — it is a database, not a
              judge, and any tool implying otherwise is inventing a number. What we can measure is
              whether yours would parse cleanly and read well, which is the part you control.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link
                to="/ats-checker"
                className="group inline-flex h-12 items-center gap-2.5 rounded-full bg-[var(--app-fg)] px-7 text-[15px] font-medium text-[var(--app-bg)] transition-transform duration-300 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40"
              >
                Check my resume
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <p className="text-[13px] leading-relaxed text-[var(--app-fg-soft)]">
                PDF, DOCX or plain text.
                <br className="hidden sm:block" /> Read in your browser — nothing is uploaded.
              </p>
            </div>
          </Reveal>
        </div>

        <ol className="grid grid-cols-1 gap-x-10 sm:grid-cols-2 lg:pt-2">
          {CHECKS.map((check, index) => (
            <motion.li
              key={check}
              className="flex items-center gap-3 border-b border-[var(--app-border)] py-4"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.5, ease: EASE, delay: (index % 5) * 0.07 }}
            >
              <span className="w-5 shrink-0 font-mono text-[11px] text-[var(--app-fg-soft)]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <DrawnCheck delay={0.15 + (index % 5) * 0.07} />
              <span className="text-[14px] leading-snug text-[var(--app-fg)]">{check}</span>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
