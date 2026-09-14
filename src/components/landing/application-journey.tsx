import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { Check, FileSearch, Sparkles } from "lucide-react";
import { EASE } from "./easing";

const BEAT_MS = [900, 1500, 1800, 2100, 1600, 3500];
const FINAL_BEAT = BEAT_MS.length - 1;

const SKILLS = ["Figma", "Prototyping", "Design systems", "User research"];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-1.5 flex items-center gap-2">
      <span className="text-[7px] font-bold uppercase tracking-[0.18em] text-[#20222a] sm:text-[8px]">
        {children}
      </span>
      <span className="h-px flex-1 bg-[#d9dbe2]" />
    </div>
  );
}

function ResumeSheet({ beat, reduce }: { beat: number; reduce: boolean }) {
  const tailored = beat >= 3;
  const skillsAdded = beat >= 4;

  return (
    <motion.div
      className="relative mx-auto aspect-[0.76] w-full max-w-[310px] overflow-hidden rounded-[3px] bg-[#fbfbfc] px-[7%] py-[6%] text-[#4d505b] shadow-[0_18px_50px_rgba(0,0,0,.24)]"
      initial={reduce ? undefined : { rotate: -2.5, y: 16, opacity: 0 }}
      animate={{ rotate: beat >= 1 ? 0 : -2.5, y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: EASE }}
    >
      <div className="flex items-start justify-between gap-3 border-b border-[#d9dbe2] pb-[4%]">
        <div>
          <div className="font-display text-[15px] font-semibold leading-none tracking-tight text-[#171920] sm:text-[18px]">
            Maya Chen
          </div>
          <div className="mt-1 text-[7px] font-semibold uppercase tracking-[0.18em] text-[#5865d8] sm:text-[8px]">
            Senior Product Designer
          </div>
        </div>
        <div className="space-y-0.5 text-right text-[5.5px] leading-tight text-[#777b87] sm:text-[6.5px]">
          <p>maya.chen@email.com</p>
          <p>London, UK · mayachen.design</p>
        </div>
      </div>

      <div className="mt-[5%]">
        <SectionLabel>Profile</SectionLabel>
        <p className="text-[6.5px] leading-[1.55] sm:text-[7.5px]">
          Product designer creating clear, accessible experiences for growing digital products.
        </p>
      </div>

      <div className="mt-[5%]">
        <SectionLabel>Experience</SectionLabel>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[7px] font-bold text-[#20222a] sm:text-[8px]">Product Designer</p>
            <p className="text-[6px] text-[#777b87] sm:text-[7px]">Northstar Labs</p>
          </div>
          <p className="shrink-0 text-[5.5px] text-[#8a8d97] sm:text-[6.5px]">2022 — Present</p>
        </div>

        <ul className="mt-2 space-y-1.5 pl-2.5 text-[6.2px] leading-[1.45] sm:text-[7.2px]">
          <li className="list-disc">Led product design across web and mobile experiences.</li>
          <li className="relative list-disc">
            <AnimatePresence initial={false} mode="wait">
              <motion.span
                key={tailored ? "tailored" : "original"}
                initial={reduce ? undefined : { opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -4 }}
                transition={{ duration: 0.45, ease: EASE }}
                className={tailored ? "font-medium text-[#252a45]" : "text-[#737783]"}
              >
                {tailored
                  ? "Built a reusable design system that cut handoff time by 35% across three product teams."
                  : "Responsible for maintaining the company design system."}
              </motion.span>
            </AnimatePresence>
            {beat === 2 && (
              <motion.span
                aria-hidden
                className="absolute -inset-x-1 -inset-y-0.5 rounded-sm border border-[#e7a45e] bg-[#f8e4c8]/45"
                initial={{ opacity: 0, scaleX: 0, transformOrigin: "left" }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.65, ease: EASE }}
              />
            )}
          </li>
          <li className="list-disc">Partnered with research and engineering from discovery to launch.</li>
        </ul>

        <div className="mt-[5%] flex items-start justify-between gap-3">
          <div>
            <p className="text-[7px] font-bold text-[#20222a] sm:text-[8px]">UX Designer</p>
            <p className="text-[6px] text-[#777b87] sm:text-[7px]">Orbit Financial</p>
          </div>
          <p className="shrink-0 text-[5.5px] text-[#8a8d97] sm:text-[6.5px]">2020 — 2022</p>
        </div>
        <ul className="mt-2 space-y-1.5 pl-2.5 text-[6.2px] leading-[1.45] sm:text-[7.2px]">
          <li className="list-disc">Simplified onboarding flows through interviews and usability testing.</li>
          <li className="list-disc">Created prototypes used to align product and engineering teams.</li>
        </ul>
      </div>

      <div className="mt-[5%]">
        <SectionLabel>Skills</SectionLabel>
        <div className="flex flex-wrap gap-1">
          {SKILLS.map((skill, index) => (
            <motion.span
              key={skill}
              className={`rounded-sm px-1.5 py-0.5 text-[5.5px] sm:text-[6.5px] ${index >= 2 ? "bg-[#e8eaff] text-[#434fb8]" : "bg-[#eff0f3]"}`}
              initial={index >= 2 && !reduce ? { opacity: 0, y: 4 } : undefined}
              animate={{ opacity: index < 2 || skillsAdded ? 1 : 0.28, y: 0 }}
              transition={{ duration: 0.45, delay: index * 0.08, ease: EASE }}
            >
              {skill}
            </motion.span>
          ))}
        </div>
      </div>

      {beat >= 1 && beat <= 2 && (
        <motion.div
          aria-hidden
          className="absolute inset-x-0 h-px bg-[#6876ff] shadow-[0_0_12px_3px_rgba(104,118,255,.48)]"
          initial={{ top: "6%", opacity: 0 }}
          animate={{ top: "92%", opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.65, ease: "linear" }}
        />
      )}

      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[3px] border-2 border-[#6876ff]"
        animate={{ opacity: beat === FINAL_BEAT ? 0.65 : 0 }}
        transition={{ duration: 0.5 }}
      />
    </motion.div>
  );
}

function AnalysisRail({ beat, reduce }: { beat: number; reduce: boolean }) {
  const finished = beat >= FINAL_BEAT;
  const score = beat < 2 ? 62 : beat < 3 ? 71 : beat < 4 ? 84 : 92;

  const status =
    beat === 0 ? "Resume loaded" :
    beat === 1 ? "Reading structure" :
    beat === 2 ? "Weak bullet found" :
    beat === 3 ? "Bullet strengthened" :
    beat === 4 ? "Keywords aligned" : "Ready to apply";

  return (
    <div className="flex h-full min-w-0 flex-col gap-2.5">
      <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-3 shadow-[var(--shadow-soft)]">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[8px] uppercase tracking-[0.15em] text-[var(--app-fg-soft)]">Role match</span>
          <span className="text-[10px] font-semibold text-[var(--accent-text)]">{score}%</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--app-surface-2)]">
          <motion.div
            className="h-full rounded-full bg-[var(--accent)]"
            animate={{ width: `${score}%` }}
            transition={{ duration: 0.7, ease: EASE }}
          />
        </div>
        <p className="mt-2 text-[8px] leading-snug text-[var(--app-fg-muted)]">Senior Product Designer</p>
      </div>

      <div className="flex-1 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-3 shadow-[var(--shadow-soft)]">
        <div className="flex items-center gap-2">
          <motion.span
            className={`grid size-6 shrink-0 place-items-center rounded-lg ${finished ? "bg-[var(--pastel-mint)] text-[var(--tone-win)]" : "bg-[var(--accent-soft)] text-[var(--accent-text)]"}`}
            animate={reduce || finished ? undefined : { scale: [1, 1.08, 1] }}
            transition={{ duration: 1.3, repeat: Infinity }}
          >
            {finished ? <Check className="size-3.5" /> : beat < 2 ? <FileSearch className="size-3.5" /> : <Sparkles className="size-3.5" />}
          </motion.span>
          <AnimatePresence initial={false} mode="wait">
            <motion.span
              key={status}
              initial={reduce ? undefined : { opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -4 }}
              className="text-[8.5px] font-semibold leading-tight text-[var(--app-fg)]"
            >
              {status}
            </motion.span>
          </AnimatePresence>
        </div>

        <div className="mt-4 space-y-3">
          {[
            ["Structure", beat >= 1],
            ["Impact", beat >= 3],
            ["Keywords", beat >= 4],
          ].map(([label, done]) => (
            <div key={String(label)} className="flex items-center gap-2">
              <span className={`grid size-3.5 place-items-center rounded-full border ${done ? "border-emerald-500 bg-emerald-500 text-white" : "border-[var(--app-border-strong)]"}`}>
                {done && <Check className="size-2.5" />}
              </span>
              <span className={`text-[8px] ${done ? "text-[var(--app-fg)]" : "text-[var(--app-fg-soft)]"}`}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {finished && (
          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="rounded-xl border border-emerald-500/25 bg-[var(--pastel-mint)] p-3 text-center"
          >
            <p className="text-[9px] font-semibold text-[var(--tone-win)]">Resume tailored</p>
            <p className="mt-0.5 text-[7px] text-[var(--app-fg-muted)]">Every change stays yours.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ApplicationJourney() {
  const reduce = useReducedMotion();
  const wrapRef = useRef<HTMLElement>(null);
  const inView = useInView(wrapRef, { amount: "some" });
  const [beat, setBeat] = useState(0);

  useEffect(() => {
    if (reduce) { setBeat(FINAL_BEAT); return; }
    if (!inView) return;
    let timer: ReturnType<typeof setTimeout>;
    const advance = (current: number) => {
      timer = setTimeout(() => {
        const next = current >= FINAL_BEAT ? 0 : current + 1;
        setBeat(next);
        advance(next);
      }, BEAT_MS[current]);
    };
    advance(beat);
    return () => clearTimeout(timer);
    // The recursive timer owns the current beat and is restarted only when visibility changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce, inView]);

  return (
    <figure ref={wrapRef} className="mx-auto w-full max-w-[500px] lg:max-w-none">
      <div className="relative rounded-[24px] border border-[var(--app-border)] bg-[linear-gradient(145deg,var(--app-surface-2),var(--app-surface))] p-3 shadow-[var(--shadow-pop)] sm:p-5">
        <div aria-hidden className="absolute -inset-px -z-10 rotate-2 rounded-[24px] border border-[var(--app-border)] bg-[var(--app-surface)] opacity-60" />
        <div className="mb-3 flex items-center justify-between gap-4 px-1">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--app-fg-soft)]">Live resume workspace</span>
          <span className="flex items-center gap-1.5 text-[8px] uppercase tracking-[0.12em] text-[var(--app-fg-soft)]">
            <motion.span className="size-1.5 rounded-full bg-[var(--accent)]" animate={reduce ? undefined : { opacity: [1, 0.25, 1] }} transition={{ duration: 1.8, repeat: Infinity }} />
            Jobsynk AI
          </span>
        </div>

        <div className="grid min-h-[390px] grid-cols-[minmax(0,1fr)_92px] gap-3 rounded-[18px] border border-[var(--app-border)] bg-[var(--app-bg)] p-3 shadow-[inset_0_1px_0_color-mix(in_srgb,var(--app-fg)_4%,transparent)] sm:min-h-[440px] sm:grid-cols-[minmax(0,1fr)_118px] sm:gap-4 sm:p-4">
          <ResumeSheet beat={beat} reduce={Boolean(reduce)} />
          <AnalysisRail beat={beat} reduce={Boolean(reduce)} />
        </div>
      </div>

      <figcaption className="mt-4 text-center text-[11.5px] leading-relaxed text-[var(--app-fg-soft)] lg:text-left">
        An illustrative resume workflow. Suggestions are always reviewable before you apply.
      </figcaption>
    </figure>
  );
}
