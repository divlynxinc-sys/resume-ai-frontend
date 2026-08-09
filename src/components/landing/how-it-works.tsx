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
import { Check, FileDown, FileText, MessageCircle, Sparkles, UploadCloud } from "lucide-react";
import { EASE } from "./easing";
import { Eyebrow, Reveal, SplitHeadline } from "./motion-primitives";

const STEPS = [
  {
    n: "01",
    title: "Choose the role you want",
    body: "Paste the description you're actually applying to. Jobsynk pulls out the repeated competencies, named tools, seniority cues, and outcomes the hiring team cares about.",
  },
  {
    n: "02",
    title: "Bring the resume that fits best",
    body: "Pick an existing resume, upload one, or start from a clean template. Your original stays intact while this application gets its own focused version.",
  },
  {
    n: "03",
    title: "Review the gaps and approve every edit",
    body: "See what a parser sees, which role keywords are missing, and which bullets need stronger evidence. Jobsynk suggests the change; you decide what belongs in your story.",
  },
  {
    n: "04",
    title: "Leave with the full application kit",
    body: "Export a parser-safe resume, then carry the same role context into your cover letter and interview preparation. No retyping the job description or rebuilding your story from scratch.",
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

function ResumeInputVisual() {
  const reduce = useReducedMotion();
  return (
    <div className="flex h-full flex-col justify-center px-6 py-7">
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--app-fg-soft)]">
        Choose your starting point
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <motion.div
          className="relative overflow-hidden rounded-xl border border-[var(--accent)] bg-[var(--accent-soft)] p-4"
          initial={reduce ? undefined : { opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: EASE }}
        >
          <span className="absolute right-2 top-2 grid size-5 place-items-center rounded-full bg-[var(--accent)] text-white"><Check className="size-3" /></span>
          <FileText className="size-5 text-[var(--accent-text)]" />
          <p className="mt-8 text-[12px] font-semibold text-[var(--app-fg)]">Product Design</p>
          <p className="mt-1 text-[10px] text-[var(--app-fg-soft)]">Updated yesterday</p>
          <div className="mt-3 space-y-1.5">{["76%", "92%", "68%"].map((width) => <span key={width} className="block h-1 rounded-full bg-[var(--app-border-strong)]" style={{ width }} />)}</div>
        </motion.div>
        <motion.div
          className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--app-border-strong)] bg-[var(--app-surface-2)] p-4 text-center"
          initial={reduce ? undefined : { opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: EASE, delay: 0.12 }}
        >
          <span className="grid size-10 place-items-center rounded-full bg-[var(--app-surface)] text-[var(--app-fg-muted)]"><UploadCloud className="size-4" /></span>
          <p className="mt-3 text-[11px] font-semibold text-[var(--app-fg)]">Upload another</p>
          <p className="mt-1 text-[9px] text-[var(--app-fg-soft)]">PDF or DOCX</p>
        </motion.div>
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-3 text-[11px] text-[var(--app-fg-muted)]">
        <Sparkles className="size-4 shrink-0 text-[var(--accent)]" />
        We create a role-specific copy. Your original stays untouched.
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

function ApplicationKitVisual() {
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

      <ul className="min-w-0 space-y-2.5">
        {[
          { label: "Resume PDF", icon: FileDown },
          { label: "Cover letter", icon: FileText },
          { label: "Interview prep", icon: MessageCircle },
        ].map((item, index) => (
          <motion.li
            key={item.label}
            className="flex items-center gap-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-2)] px-2.5 py-2 text-[11.5px] text-[var(--app-fg-muted)]"
            initial={reduce ? undefined : { opacity: 0, x: 10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, ease: EASE, delay: 0.6 + index * 0.12 }}
          >
            <item.icon className="size-3.5 shrink-0 text-[var(--accent-text)]" />
            <span className="truncate">{item.label}</span>
            <Check className="ml-auto size-3.5 shrink-0 text-[var(--tone-win)]" strokeWidth={3} />
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

const VISUALS = [JobDescriptionVisual, ResumeInputVisual, ScoreVisual, ApplicationKitVisual] as const;

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
    <li ref={ref} className="relative lg:flex lg:min-h-[52vh] lg:flex-col lg:justify-center">
      <Reveal>
        <div className="flex items-center gap-4">
          <span className="relative z-10 grid size-8 shrink-0 place-items-center rounded-full border border-[var(--accent)]/25 bg-[var(--accent-soft)] font-mono text-[11px] tracking-[0.06em] text-[var(--accent-text)]">
            {step.n}
          </span>
          <h3 className="font-display text-2xl font-light leading-tight tracking-tight text-[var(--app-fg)] sm:text-[28px]">
            {step.title}
          </h3>
        </div>
        <p className="mt-4 max-w-lg pl-12 text-[15px] leading-relaxed text-[var(--app-fg-muted)]">
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
              { text: "One role." },
              { text: " One smooth path to ready.", className: "italic text-[var(--app-fg-muted)]" },
            ]}
          />
        </h2>
      </header>

      {/* No `items-start` here on purpose: the right column has to stretch to the
          row height, or the sticky panel inside it runs out of parent to be
          sticky within and scrolls away after the first step. */}
      <div className="mt-12 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-16">
        <ol className="relative space-y-14 before:absolute before:bottom-8 before:left-4 before:top-8 before:w-px before:bg-gradient-to-b before:from-[var(--accent)] before:via-[var(--app-border-strong)] before:to-transparent lg:space-y-0">
          {STEPS.map((step, index) => (
            <Step key={step.n} step={step} index={index} onActive={setActive} />
          ))}
        </ol>

        <div className="hidden lg:block">
          <div className="sticky top-28">
            <div className="relative h-[22rem]">
              <AnimatePresence mode="sync" initial={false}>
                <motion.div
                  key={active}
                  className="absolute inset-0"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.45, ease: EASE }}
                >
                  <StepVisual index={active} />
                </motion.div>
              </AnimatePresence>
            </div>

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
