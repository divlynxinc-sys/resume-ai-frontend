// The hero visual: a job search told as an application timeline.
//
// It replaces the ATS upload panel that used to sit here. That panel asked for
// work (find your file, drag it in) before the visitor had been given a reason
// to care. This asks for nothing and states the premise instead: three
// applications go out and die, the resume gets tailored, the next one converts.
//
// Everything is one `beat` counter. Each row derives its own state from it, so
// there is a single timeline to reason about and a single place to retime the
// story. The loop restarts from the top, which matters — most visitors arrive
// mid-sequence after scrolling back up.
//
// HONESTY: this is a drawn illustration, not a customer record, and the caption
// says so on the page. The same reasoning killed the invented testimonials that
// used to live further down (see `landing-page.tsx`): a claim a visitor cannot
// check is worth less than nothing on a page that also sells an ATS checker
// whose whole pitch is "no tool can give you a real ATS score".

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { Sparkles } from "lucide-react";
import { EASE } from "./easing";

/* ── Timeline ──────────────────────────────────────────────────────────────
   BEAT_MS[n] is how long beat n holds before advancing. The last entry is the
   pause on the finished state before the loop restarts. */
const BEAT_MS = [
  450,  //  0  empty
  900,  //  1  Northwind applied
  620,  //  2  Northwind goes quiet
  900,  //  3  Lumen applied
  620,  //  4  Lumen rejects
  900,  //  5  Cobalt applied
  1150, //  6  Cobalt rejects
  1500, //  7  tailored with Jobsynk
  900,  //  8  the rewrite lands
  900,  //  9  Meridian applied
  900,  // 10  screening
  1000, // 11  interview
  3400, // 12  offer — hold, then loop
];

const LAST_BEAT = BEAT_MS.length - 1;
/** Beat at which the rail is fully drawn. */
const RAIL_FULL = 12;

type Tone = "idle" | "reject" | "progress" | "win";

const TONE: Record<Tone, { bg: string; fg: string }> = {
  idle: { bg: "var(--app-surface-2)", fg: "var(--app-fg-muted)" },
  reject: { bg: "var(--pastel-rose)", fg: "var(--tone-reject)" },
  progress: { bg: "var(--accent-soft)", fg: "var(--accent-text)" },
  win: { bg: "var(--pastel-mint)", fg: "var(--tone-win)" },
};

const REJECTIONS = [
  {
    role: "Product Designer",
    company: "Northwind Studio",
    monogram: "N",
    tint: "var(--pastel-sky)",
    outcome: "No reply",
    appearsAt: 1,
    resolvesAt: 2,
  },
  {
    role: "UX Designer",
    company: "Lumen Health",
    monogram: "L",
    tint: "var(--pastel-butter)",
    outcome: "Rejected",
    appearsAt: 3,
    resolvesAt: 4,
  },
  {
    role: "Senior Product Designer",
    company: "Cobalt Labs",
    monogram: "C",
    tint: "var(--pastel-peach)",
    outcome: "Rejected",
    appearsAt: 5,
    resolvesAt: 6,
  },
] as const;

/** Beat → stage for the final application. */
const WIN_STAGES: Array<{ at: number; label: string; tone: Tone }> = [
  { at: 9, label: "Applied", tone: "idle" },
  { at: 10, label: "Screening", tone: "progress" },
  { at: 11, label: "Interview", tone: "progress" },
  { at: 12, label: "Offer", tone: "win" },
];

/* ── Pieces ────────────────────────────────────────────────────────────────*/

/**
 * Fixed-width so a status change never reflows the row — the chip swapping from
 * "Applied" to "Rejected" should read as the same object changing, not as the
 * row rebuilding itself.
 */
function StatusChip({ label, tone }: { label: string; tone: Tone }) {
  return (
    <div className="relative h-6 w-[5.25rem] shrink-0 sm:w-[5.75rem]">
      <AnimatePresence initial={false} mode="wait">
        <motion.span
          key={label}
          initial={{ opacity: 0, y: 7 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -7 }}
          transition={{ duration: 0.26, ease: EASE }}
          className="absolute inset-0 inline-flex items-center justify-center rounded-full text-[11px] font-semibold"
          style={{ backgroundColor: TONE[tone].bg, color: TONE[tone].fg }}
        >
          {label}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

function Row({
  visible,
  dimmed,
  monogram,
  tint,
  role,
  company,
  chip,
  highlight = false,
}: {
  visible: boolean;
  dimmed: boolean;
  monogram: string;
  tint: string;
  role: string;
  company: string;
  chip: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <li className="relative">
      {/* Empty slot. Rows keep their space from the first frame so nothing
          reflows as the story plays; without this the panel would be mostly
          blank for the first half of the loop, which reads as broken rather
          than as a tracker waiting to fill. */}
      <motion.span
        aria-hidden
        className="absolute inset-0 flex items-center gap-3.5"
        animate={{ opacity: visible ? 0 : 1 }}
        transition={{ duration: 0.4, ease: EASE }}
      >
        <span className="size-9 shrink-0 rounded-[11px] border border-dashed border-[var(--app-border)]" />
        <span className="h-full flex-1 rounded-xl border border-dashed border-[var(--app-border)]" />
      </motion.span>

      <motion.div
        className="relative flex items-center gap-3.5"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: visible ? (dimmed ? 0.42 : 1) : 0, x: visible ? 0 : 20 }}
        transition={{ duration: 0.55, ease: EASE }}
      >
        <span
          aria-hidden
          className="relative z-10 grid size-9 shrink-0 place-items-center rounded-[11px] text-[12.5px] font-semibold text-[var(--app-fg)]"
          style={{ backgroundColor: tint }}
        >
          {monogram}
        </span>

        <motion.div
          className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border bg-[var(--app-surface)] px-3.5 py-2.5"
          animate={{
            borderColor: highlight ? "var(--tone-win)" : "var(--app-border)",
            boxShadow: highlight
              ? "0 0 0 4px color-mix(in srgb, var(--pastel-mint) 70%, transparent)"
              : "0 0 0 0px rgba(0,0,0,0)",
          }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13.5px] font-medium leading-tight text-[var(--app-fg)]">
              {role}
            </div>
            <div className="mt-0.5 truncate text-[11.5px] leading-tight text-[var(--app-fg-soft)]">
              {company}
            </div>
          </div>
          {chip}
        </motion.div>
      </motion.div>
    </li>
  );
}

/**
 * The turn in the story. The old bullet fades and strikes through while the
 * rewritten one wipes in from the left — a clip-path wipe rather than a
 * character-by-character typewriter, because the rewritten line wraps to two
 * lines at this width and a typewriter would reflow it mid-animation.
 */
function PivotRow({ visible, rewriting }: { visible: boolean; rewriting: boolean }) {
  return (
    <li className="relative">
      <motion.span
        aria-hidden
        className="absolute inset-0 flex items-start gap-3.5"
        animate={{ opacity: visible ? 0 : 1 }}
        transition={{ duration: 0.4, ease: EASE }}
      >
        <span className="size-9 shrink-0 rounded-full border border-dashed border-[var(--app-border)]" />
        <span className="h-full flex-1 rounded-xl border border-dashed border-[var(--app-border)]" />
      </motion.span>

      <motion.div
        className="relative flex items-start gap-3.5"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : 20 }}
        transition={{ duration: 0.55, ease: EASE }}
      >
        <span className="relative z-10 grid size-9 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-white">
          <Sparkles className="size-4" />
          {visible && (
            <motion.span
              aria-hidden
              className="absolute inset-0 rounded-full border-2 border-[var(--accent)]"
              animate={{ scale: [1, 1.75], opacity: [0.55, 0] }}
              transition={{ duration: 1.9, repeat: Infinity, ease: "easeOut" }}
            />
          )}
        </span>

        <div className="min-w-0 flex-1 rounded-xl border border-dashed border-[var(--accent)]/45 bg-[var(--accent-soft)] px-3.5 py-3">
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--accent-text)]">
            Rewritten for the role
          </div>

          <motion.p
            className="mt-2 text-[12px] leading-relaxed text-[var(--app-fg-muted)] line-through decoration-[var(--app-fg-soft)]/70"
            animate={{ opacity: rewriting ? 0.4 : 0.85 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            Responsible for managing the company's social media accounts.
          </motion.p>

          <motion.p
            className="mt-1.5 text-[12px] font-medium leading-relaxed text-[var(--app-fg)]"
            initial={{ clipPath: "inset(0 100% 0 0)" }}
            animate={{ clipPath: rewriting ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)" }}
            transition={{ duration: 0.85, ease: EASE }}
          >
            Grew Instagram from{" "}
            <span className="rounded px-1" style={{ backgroundColor: "var(--pastel-mint)" }}>
              4k to 27k
            </span>{" "}
            followers in 11 months — now ~18% of site traffic.
          </motion.p>
        </div>
      </motion.div>
    </li>
  );
}

/* ── Component ─────────────────────────────────────────────────────────────*/

export default function ApplicationJourney() {
  const reduce = useReducedMotion();
  const wrapRef = useRef<HTMLElement>(null);
  // Nothing should tick while the hero is scrolled past — this loops forever,
  // and an off-screen animation is pure battery cost.
  //
  // `amount: "some"` (any part visible), NOT a fraction: on a 390px viewport the
  // panel sits below the fold with only its top ~140px of ~570px on screen, so
  // anything above ~0.2 meant the story never started on a phone at all — you'd
  // scroll to an empty tracker and past it.
  const inView = useInView(wrapRef, { amount: "some" });
  const [beat, setBeat] = useState(0);

  useEffect(() => {
    if (reduce) {
      setBeat(LAST_BEAT);
      return;
    }
    if (!inView) return;

    let timer: ReturnType<typeof setTimeout>;
    const advance = (current: number) => {
      timer = setTimeout(() => {
        const next = current >= LAST_BEAT ? 0 : current + 1;
        setBeat(next);
        advance(next);
      }, BEAT_MS[current]);
    };
    advance(beat);
    return () => clearTimeout(timer);
    // `beat` is intentionally excluded: including it would tear down and rebuild
    // the timer on every tick, and the recursion already carries it forward.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce, inView]);

  const pivotVisible = beat >= 7;
  const winStage = WIN_STAGES.filter((stage) => beat >= stage.at).at(-1);
  const hired = beat >= 12;

  return (
    <figure ref={wrapRef} className="mx-auto w-full max-w-md lg:max-w-none">
      {/* The sheet and the panel share this wrapper so the backdrop tracks the
          panel's height — parenting it to the <figure> would stretch it over the
          caption underneath. */}
      <div className="relative">
        {/* Depth without a drop shadow doing all the work: a second sheet,
            rotated a degree and a half, reading as the stack of applications
            underneath. */}
        <div
          aria-hidden
          className="absolute inset-x-3 -bottom-2 top-4 -rotate-[1.4deg] rounded-[22px] border border-[var(--app-border)] bg-[var(--app-surface)] opacity-60"
        />

        <div className="relative rounded-[22px] border border-[var(--app-border)] bg-[var(--app-surface)] p-4 shadow-[var(--shadow-pop)] sm:p-6">
          <div className="flex items-center justify-between gap-4 pb-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--app-fg-soft)]">
              Your applications
            </span>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--app-fg-soft)]">
              <motion.span
                aria-hidden
                className="size-1.5 rounded-full"
                style={{ backgroundColor: hired ? "var(--tone-win)" : "var(--tone-reject)" }}
                animate={reduce ? undefined : { opacity: [1, 0.25, 1] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              />
              Live
            </span>
          </div>

          <div className="relative">
            {/* Rail. The grey track is always there; the accent line grows over it
                so the eye has something to follow between rows. */}
            <div
              aria-hidden
              className="absolute left-[18px] top-4 bottom-4 w-px -translate-x-1/2 bg-[var(--app-border)]"
            />
            <motion.div
              aria-hidden
              className="absolute left-[18px] top-4 bottom-4 w-px -translate-x-1/2 origin-top bg-[var(--accent)]"
              animate={{ scaleY: Math.min(beat / RAIL_FULL, 1) }}
              transition={{ duration: 0.6, ease: EASE }}
            />

            <ul className="relative space-y-2.5">
              {REJECTIONS.map((item) => (
                <Row
                  key={item.company}
                  visible={beat >= item.appearsAt}
                  dimmed={pivotVisible}
                  monogram={item.monogram}
                  tint={item.tint}
                  role={item.role}
                  company={item.company}
                  chip={
                    <StatusChip
                      label={beat >= item.resolvesAt ? item.outcome : "Applied"}
                      tone={beat >= item.resolvesAt ? "reject" : "idle"}
                    />
                  }
                />
              ))}

              <PivotRow visible={pivotVisible} rewriting={beat >= 8} />

              <Row
                visible={beat >= 9}
                dimmed={false}
                monogram="M"
                tint="var(--pastel-lavender)"
                role="Product Designer"
                company="Meridian Systems"
                highlight={hired}
                chip={<StatusChip label={winStage?.label ?? "Applied"} tone={winStage?.tone ?? "idle"} />}
              />
            </ul>
          </div>

          {/* The tally. It is the punchline, so it gets the swap animation. */}
          <div className="mt-5 flex h-5 items-center border-t border-[var(--app-border)] pt-4">
            <AnimatePresence initial={false} mode="wait">
              <motion.p
                key={hired ? "after" : "before"}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="text-[12px] text-[var(--app-fg-muted)]"
              >
                {hired ? (
                  <>
                    <span className="font-semibold text-[var(--tone-win)]">1 offer</span> from the
                    first tailored application.
                  </>
                ) : (
                  <>
                    <span className="font-semibold text-[var(--tone-reject)]">0 replies</span> from
                    three untailored applications.
                  </>
                )}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <figcaption className="mt-6 text-center text-[11.5px] leading-relaxed text-[var(--app-fg-soft)] lg:text-left">
        An illustration of the problem, not a customer record. We don't publish
        outcome statistics we can't prove.
      </figcaption>
    </figure>
  );
}
