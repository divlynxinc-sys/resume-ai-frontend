// The feature list, as an index rather than a grid of cards.
//
// WHAT THIS REPLACES: three separate 3×2 grids of icon-in-a-rounded-square
// cards — eighteen boxes, all the same size, all the same shape, most of them
// describing the same product from a slightly different angle ("ATS Score &
// Compatibility", "ATS Optimizer", "Real-Time Score & Fixes"). That repetition
// is the single loudest generated-page signal a marketing site can emit, and it
// buried the six things the product genuinely does.
//
// So: six rows, one per shipped surface, each one a link to the page that does
// it. Ruled lines instead of borders, a hover that moves rather than glows.
//
// EVERY ROW MUST POINT AT SOMETHING REAL. If a row is added here, the route it
// links to has to exist in `App.tsx` and do the thing the row claims. The plan
// tag is not decoration either — it mirrors the gate in `PlanContext`, so a
// visitor is never surprised by a paywall they weren't told about.

import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { EASE } from "./easing";
import { Eyebrow, Reveal, SplitHeadline } from "./motion-primitives";

type Tier = "Free" | "Paid plan";

const FEATURES: Array<{
  n: string;
  title: string;
  body: string;
  to: string;
  tier: Tier;
}> = [
  {
    n: "01",
    title: "ATS checker",
    body: "Ten checks, a score out of 100, and the exact line to change for each miss. No account — your file is read in the browser and never uploaded.",
    to: "/ats-checker",
    tier: "Free",
  },
  {
    n: "02",
    title: "Resume builder",
    body: "Single-column, parser-safe layouts with real selectable text. Write it once, export a PDF that arrives at the other end intact.",
    to: "/signup?next=%2Fresumes",
    tier: "Free",
  },
  {
    n: "03",
    title: "Job-description match",
    body: "Paste the posting next to your resume and see which of its words yours never says — the gap that decides whether a recruiter's search finds you.",
    to: "/ats-checker",
    tier: "Free",
  },
  {
    n: "04",
    title: "Cover letters",
    body: "Written from your resume and the posting together, streamed as it drafts, in your register rather than a template's. Edit it before it goes.",
    to: "/signup?next=%2Fcover-letter",
    tier: "Paid plan",
  },
  {
    n: "05",
    title: "Interview answers",
    body: "The questions this role will actually ask, answered out of the experience already on your resume — so you rehearse your material, not someone else's.",
    to: "/signup?next=%2Fqa-answers",
    tier: "Paid plan",
  },
  {
    n: "06",
    title: "Recruiter emails",
    body: "Short outreach and follow-ups that read like a person wrote them, built from the role and your own background.",
    to: "/signup?next=%2Fhr-email-drafts",
    tier: "Paid plan",
  },
];

function FeatureRow({ feature }: { feature: (typeof FEATURES)[number] }) {
  return (
    <li className="border-t border-[var(--app-border)] last:border-b">
      <Link
        to={feature.to}
        className="group relative block rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40"
      >
        <motion.div initial="rest" whileHover="hover" className="relative px-2 sm:px-4">
          {/* Warms the row on hover instead of outlining it. */}
          <motion.span
            aria-hidden
            className="absolute inset-y-0 -left-2 -right-2 rounded-xl bg-[var(--app-surface)] sm:-left-4 sm:-right-4"
            variants={{ rest: { opacity: 0 }, hover: { opacity: 1 } }}
            transition={{ duration: 0.28, ease: EASE }}
          />

          <div className="relative grid grid-cols-[2.25rem_1fr] items-start gap-x-4 py-7 sm:grid-cols-[3.5rem_minmax(0,1fr)_auto] sm:gap-x-8 sm:py-9">
            <motion.span
              className="font-mono text-[12px] tracking-[0.08em] text-[var(--app-fg-soft)]"
              variants={{ rest: { color: "var(--app-fg-soft)" }, hover: { color: "var(--accent-text)" } }}
              transition={{ duration: 0.25 }}
            >
              {feature.n}
            </motion.span>

            <motion.div
              variants={{ rest: { x: 0 }, hover: { x: 7 } }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <h3 className="font-display text-xl font-normal tracking-tight text-[var(--app-fg)] sm:text-2xl">
                {feature.title}
                <span className="ml-3 align-middle font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--app-fg-soft)] sm:hidden">
                  {feature.tier}
                </span>
              </h3>
              <p className="mt-2 max-w-xl text-[14.5px] leading-relaxed text-[var(--app-fg-muted)]">
                {feature.body}
              </p>
            </motion.div>

            <div className="col-start-2 mt-4 hidden items-center gap-5 self-center sm:col-start-3 sm:mt-0 sm:flex">
              <span
                className="rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em]"
                style={
                  feature.tier === "Free"
                    ? { backgroundColor: "var(--pastel-mint)", color: "var(--tone-win)" }
                    : { backgroundColor: "var(--app-surface-2)", color: "var(--app-fg-soft)" }
                }
              >
                {feature.tier}
              </span>
              <motion.span
                aria-hidden
                className="grid size-9 place-items-center rounded-full border border-[var(--app-border)] text-[var(--app-fg-muted)]"
                variants={{
                  rest: { opacity: 0.4, x: 0, borderColor: "var(--app-border)" },
                  hover: { opacity: 1, x: 4, borderColor: "var(--accent)" },
                }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                <ArrowUpRight className="size-4" />
              </motion.span>
            </div>
          </div>
        </motion.div>
      </Link>
    </li>
  );
}

export default function FeatureIndex() {
  return (
    <section id="features" className="mx-auto max-w-[1160px] scroll-mt-24 px-6">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <Eyebrow>What you get</Eyebrow>
          <h2 className="mt-4 font-display text-[2rem] font-light leading-[1.1] tracking-tight text-[var(--app-fg)] sm:text-5xl">
            <SplitHeadline
              segments={[
                { text: "Six tools." },
                { text: " Three are free.", className: "italic text-[var(--app-fg-muted)]" },
              ]}
            />
          </h2>
        </div>
        <Reveal delay={0.15}>
          <p className="max-w-xs text-[14.5px] leading-relaxed text-[var(--app-fg-muted)]">
            Nothing here is a demo. Every row links to the page that does the work.
          </p>
        </Reveal>
      </header>

      <ul className="mt-14">
        {FEATURES.map((feature) => (
          <FeatureRow key={feature.n} feature={feature} />
        ))}
      </ul>
    </section>
  );
}
