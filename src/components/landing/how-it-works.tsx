// "How it works", as a scroll-driven sequence rather than four numbered cards.
//
// The old version was a 4-up row of identical rounded boxes: icon, title, one
// line of copy. It described the product without ever showing it. Here the copy
// scrolls on the left while a single panel on the right changes to match — so
// the visitor watches the thing happen instead of reading that it happens.
//
// Below `lg` the sticky column can't work (there is nothing to be sticky next
// to), so each step renders its own visual inline. The visuals are `aria-hidden`
// because they are illustrations of the adjacent prose, and duplicating them for
// two breakpoints should not duplicate them for a screen reader.

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { Check, FileDown } from "lucide-react";
import { EASE } from "./easing";
import { Eyebrow, Reveal, SplitHeadline } from "./motion-primitives";

const STEPS = [
  {
    n: "01",
    title: "Start with the job, not the resume",
    body: "Paste the description you're actually applying to. Jobsynk reads it the way a hiring manager wrote it — the competencies that repeat, the tools named outright, the seniority signals buried in the third paragraph.",
  },
  {
    n: "02",
    title: "See what a parser sees",
    body: "Ten checks run against your resume and score it out of 100: contact details a parser can find, standard headings, bullets that carry a number, dates on every role, and how much of the job's vocabulary you actually use. Each miss is named, in the wording to fix it.",
  },
  {
    n: "03",
    title: "Export something that survives the upload",
    body: "Every template is single-column, real selectable text, no tables and no text boxes — the four things that break a parse. Download as PDF and apply with a document that arrives intact.",
  },
] as const;

/* ── Step visuals ──────────────────────────────────────────────────────────*/

/** Words the JD keeps repeating, lit up one after another under a scan line. */
const JD_TOKENS: Array<{ text: string; key?: boolean }> = [
  { text: "We're looking for a " },
  { text: "product designer", key: true },
  { text: " to own end-to-end flows across our consumer app. You'll run " },
  { text: "user research", key: true },
  { text: ", ship in " },
  { text: "Figma", key: true },
  { text: ", and extend our " },
  { text: "design system", key: true },
  { text: ". Experience with " },
  { text: "accessibility", key: true },
  { text: " and measurable " },
  { text: "conversion", key: true },
  { text: " work is a strong plus." },
];

function JobDescriptionVisual() {
  const reduce = useReducedMotion();
  let keyIndex = -1;

  return (
    <div className="flex h-full flex-col justify-center px-6 py-7">
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--app-fg-soft)]">
        Job description
      </div>

      <div className="relative mt-4 overflow-hidden rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-2)] p-4">
        {!reduce && (
          <motion.div
            className="pointer-events-none absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-[var(--accent)]/12 to-transparent"
            initial={{ y: "-100%" }}
            animate={{ y: ["-100%", "420%"] }}
            transition={{ duration: 2.6, ease: "linear", repeat: Infinity, repeatDelay: 1.4 }}
          />
        )}
        <p className="relative text-[13px] leading-7 text-[var(--app-fg-muted)]">
          {JD_TOKENS.map((token, index) => {
            if (!token.key) return <span key={index}>{token.text}</span>;
            keyIndex += 1;
            return (
              <motion.span
                key={index}
                className="rounded px-1 font-medium text-[var(--app-fg)]"
                initial={{ backgroundColor: "rgba(0,0,0,0)" }}
                whileInView={{ backgroundColor: "var(--accent-soft)" }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, ease: EASE, delay: 0.35 + keyIndex * 0.22 }}
              >
                {token.text}
              </motion.span>
            );
          })}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {["6 competencies", "3 tools", "1 seniority signal"].map((chip, index) => (
          <motion.span
            key={chip}
            className="rounded-full border border-[var(--app-border)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--app-fg-soft)]"
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: EASE, delay: 1.5 + index * 0.12 }}
          >
            {chip}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

const CHECK_RESULTS = [
  { label: "Contact details are readable", pass: true },
  { label: "Uses standard section headings", pass: true },
  { label: "Bullets contain numbers", pass: false },
  { label: "Bullets lead with strong verbs", pass: false },
  { label: "Roles carry dates", pass: true },
  { label: "Matches the job description", pass: false },
];

function ScoreVisual() {
  const reduce = useReducedMotion();
  const CIRCUMFERENCE = 2 * Math.PI * 42;
  const score = 68;

  return (
    <div className="flex h-full flex-col justify-center px-6 py-7">
      <div className="flex items-center gap-5">
        <div className="relative size-[104px] shrink-0">
          <svg viewBox="0 0 100 100" className="size-full -rotate-90">
            <circle cx="50" cy="50" r="42" fill="none" strokeWidth="7" stroke="var(--app-border)" />
            <motion.circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              strokeWidth="7"
              strokeLinecap="round"
              stroke="var(--accent)"
              strokeDasharray={CIRCUMFERENCE}
              initial={{ strokeDashoffset: CIRCUMFERENCE }}
              whileInView={{ strokeDashoffset: CIRCUMFERENCE * (1 - score / 100) }}
              viewport={{ once: true }}
              transition={{ duration: 1.4, ease: EASE, delay: 0.2 }}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <span className="font-display text-3xl font-light text-[var(--app-fg)]">{score}</span>
          </div>
        </div>

        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--app-fg-soft)]">
            Out of 100
          </div>
          <p className="mt-1.5 max-w-[15rem] text-[13px] leading-relaxed text-[var(--app-fg-muted)]">
            Three checks failed. Each one names the line to change.
          </p>
        </div>
      </div>

      <ul className="mt-5 space-y-0">
        {CHECK_RESULTS.map((result, index) => (
          <motion.li
            key={result.label}
            className="flex items-center gap-2.5 border-b border-[var(--app-border)] py-2 text-[12.5px] last:border-b-0"
            initial={reduce ? undefined : { opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: EASE, delay: 0.5 + index * 0.09 }}
          >
            <span
              className="grid size-4 shrink-0 place-items-center rounded-full"
              style={{
                backgroundColor: result.pass ? "var(--pastel-mint)" : "var(--pastel-rose)",
                color: result.pass ? "var(--tone-win)" : "var(--tone-reject)",
              }}
            >
              {result.pass ? (
                <Check className="size-2.5" strokeWidth={3.5} />
              ) : (
                <span className="block h-px w-2 bg-current" />
              )}
            </span>
            <span className={result.pass ? "text-[var(--app-fg-muted)]" : "text-[var(--app-fg)]"}>
              {result.label}
            </span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

function ExportVisual() {
  const reduce = useReducedMotion();
  const lines = [
    { w: "58%", h: 9 },
    { w: "34%", h: 5 },
    { w: "100%", h: 4 },
    { w: "92%", h: 4 },
    { w: "26%", h: 6 },
    { w: "96%", h: 4 },
    { w: "88%", h: 4 },
    { w: "70%", h: 4 },
    { w: "26%", h: 6 },
    { w: "94%", h: 4 },
  ];

  return (
    <div className="flex h-full items-center justify-center gap-6 px-6 py-7">
      <div className="relative w-[10.5rem] shrink-0 rounded-lg border border-[var(--app-border)] bg-white p-4 shadow-[var(--shadow-soft)]">
        <div className="space-y-2">
          {lines.map((line, index) => (
            <motion.div
              key={index}
              className="rounded-full"
              style={{
                height: line.h,
                backgroundColor: line.h > 4 ? "#3B3A37" : "#C9C6BF",
              }}
              initial={reduce ? undefined : { width: 0, opacity: 0 }}
              whileInView={{ width: line.w, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.15 + index * 0.07 }}
            />
          ))}
        </div>

        <motion.span
          className="absolute -bottom-3 -right-3 inline-flex items-center gap-1.5 rounded-full bg-[var(--app-fg)] px-2.5 py-1.5 text-[10px] font-semibold text-[var(--app-bg)]"
          initial={reduce ? undefined : { opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, ease: EASE, delay: 1 }}
        >
          <FileDown className="size-3" />
          PDF
        </motion.span>
      </div>

      <ul className="space-y-2.5">
        {["Single column", "Selectable text", "No tables", "No text boxes"].map((item, index) => (
          <motion.li
            key={item}
            className="flex items-center gap-2 text-[12.5px] text-[var(--app-fg-muted)]"
            initial={reduce ? undefined : { opacity: 0, x: 10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, ease: EASE, delay: 0.6 + index * 0.12 }}
          >
            <Check className="size-3.5 text-[var(--tone-win)]" strokeWidth={3} />
            {item}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

const VISUALS = [JobDescriptionVisual, ScoreVisual, ExportVisual] as const;

function StepVisual({ index }: { index: number }) {
  const Visual = VISUALS[index] ?? VISUALS[0];
  return (
    <div
      aria-hidden
      className="h-[22rem] overflow-hidden rounded-[20px] border border-[var(--app-border)] bg-[var(--app-surface)] shadow-[var(--shadow-soft)]"
    >
      <Visual />
    </div>
  );
}

/* ── Section ───────────────────────────────────────────────────────────────*/

function Step({
  step,
  index,
  onActive,
}: {
  step: (typeof STEPS)[number];
  index: number;
  onActive: (index: number) => void;
}) {
  const ref = useRef<HTMLLIElement>(null);
  // A band through the middle of the viewport: whichever step is crossing it
  // owns the sticky panel.
  const inView = useInView(ref, { margin: "-45% 0px -45% 0px" });

  // Effect, not render — reporting up during render would be a cross-component
  // setState and React would (rightly) warn about it.
  useEffect(() => {
    if (inView) onActive(index);
  }, [inView, index, onActive]);

  return (
    <li ref={ref} className="lg:flex lg:min-h-[62vh] lg:flex-col lg:justify-center">
      <Reveal>
        <div className="flex items-baseline gap-4">
          <span className="font-mono text-[13px] tracking-[0.08em] text-[var(--accent-text)]">
            {step.n}
          </span>
          <h3 className="font-display text-2xl font-light leading-tight tracking-tight text-[var(--app-fg)] sm:text-[28px]">
            {step.title}
          </h3>
        </div>
        <p className="mt-4 max-w-lg pl-0 text-[15px] leading-relaxed text-[var(--app-fg-muted)] sm:pl-[2.6rem]">
          {step.body}
        </p>
      </Reveal>

      <div className="mt-8 lg:hidden">
        <StepVisual index={index} />
      </div>
    </li>
  );
}

export default function HowItWorks() {
  const [active, setActive] = useState(0);

  return (
    <section id="how-it-works" className="mx-auto max-w-[1160px] scroll-mt-24 px-6">
      <header className="max-w-2xl">
        <Eyebrow>How it works</Eyebrow>
        <h2 className="mt-4 font-display text-[2rem] font-light leading-[1.1] tracking-tight text-[var(--app-fg)] sm:text-5xl">
          <SplitHeadline
            segments={[
              { text: "Three steps." },
              { text: " Then you apply.", className: "italic text-[var(--app-fg-muted)]" },
            ]}
          />
        </h2>
      </header>

      {/* No `items-start` here on purpose: the right column has to stretch to the
          row height, or the sticky panel inside it runs out of parent to be
          sticky within and scrolls away after the first step. */}
      <div className="mt-16 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-16">
        <ol className="space-y-20 lg:space-y-0">
          {STEPS.map((step, index) => (
            <Step key={step.n} step={step} index={index} onActive={setActive} />
          ))}
        </ol>

        <div className="hidden lg:block">
          <div className="sticky top-28">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                <StepVisual index={active} />
              </motion.div>
            </AnimatePresence>

            <div className="mt-5 flex gap-1.5" aria-hidden>
              {STEPS.map((step, index) => (
                <div
                  key={step.n}
                  className="h-0.5 flex-1 overflow-hidden rounded-full bg-[var(--app-border)]"
                >
                  <motion.div
                    className="h-full origin-left bg-[var(--accent)]"
                    animate={{ scaleX: index <= active ? 1 : 0 }}
                    transition={{ duration: 0.5, ease: EASE }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
