import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Check } from "lucide-react";
import resumeThumbsUp from "@/assets/illustrations/resume-thumbs-up.webp";
import { EASE } from "./easing";
import { SplitHeadline } from "./motion-primitives";

function HumanResumeIllustration({ reduce }: { reduce: boolean }) {
  return (
    <motion.figure
      className="relative mx-auto flex min-h-[360px] w-full max-w-[470px] items-end justify-center sm:min-h-[430px]"
      initial={reduce ? undefined : { opacity: 0, y: 24, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.85, ease: EASE }}
    >
      <motion.div
        aria-hidden
        className="absolute inset-x-8 bottom-3 h-3/4 rounded-[50%] bg-[var(--accent)] opacity-15 blur-[70px]"
        animate={reduce ? undefined : { scale: [1, 1.06, 1], opacity: [0.12, 0.2, 0.12] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <img
        src={resumeThumbsUp}
        alt="A professional holding a resume and giving a thumbs-up"
        className="relative z-10 max-h-[430px] w-auto max-w-full object-contain drop-shadow-[0_24px_34px_rgba(0,0,0,0.28)]"
      />
      <motion.div
        className="absolute bottom-5 left-0 z-20 flex items-center gap-2 rounded-full border border-[var(--app-border-strong)] bg-[var(--app-bg)] px-3.5 py-2 text-[10px] font-semibold text-[var(--app-fg)] shadow-xl sm:left-3"
        initial={reduce ? undefined : { opacity: 0, x: -12 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55, ease: EASE, delay: 0.55 }}
      >
        <span className="grid size-5 shrink-0 place-items-center rounded-full bg-emerald-400 text-[#173d2d]"><Check className="size-3" strokeWidth={3} /></span>
        <span className="whitespace-nowrap">Resume ready to send</span>
      </motion.div>
    </motion.figure>
  );
}

export default function ClosingCta() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-[var(--app-fg)] px-6 py-20 text-[var(--app-bg)] sm:py-24">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-1/2 size-[28rem] -translate-y-1/2 rounded-full bg-[var(--accent)] opacity-[0.16] blur-[110px]"
        animate={reduce ? undefined : { x: [0, 70, 0], y: [0, -40, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-20 bottom-0 size-[24rem] rounded-full bg-[var(--pastel-peach)] opacity-[0.14] blur-[110px]"
        animate={reduce ? undefined : { x: [0, -60, 0], y: [0, 30, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative mx-auto grid max-w-[1160px] items-center gap-8 lg:grid-cols-[minmax(0,1fr)_470px] lg:gap-12">
        <div>
          <h2 className="max-w-3xl font-display text-[2.25rem] font-light leading-[1.05] tracking-tight sm:text-6xl">
            <SplitHeadline
              segments={[
                { text: "The next application" },
                { text: " should be the one that lands.", className: "italic opacity-70" },
              ]}
            />
          </h2>

          <motion.div
            className="mt-10 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-8"
            initial={reduce ? undefined : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.35 }}
          >
            <Link to="/signup" className="group inline-flex h-13 items-center gap-2.5 rounded-full bg-[var(--app-bg)] px-8 text-[15px] font-semibold text-[var(--app-fg)] transition-transform duration-300 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-bg)]/50">
              Start building
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link to="/ats-checker" className="text-[15px] font-medium underline decoration-current/30 underline-offset-[6px] transition-opacity hover:opacity-70">
              Or just check the one you have
            </Link>
          </motion.div>

          <motion.p className="mt-8 font-mono text-[11px] uppercase tracking-[0.18em] opacity-55" initial={reduce ? undefined : { opacity: 0 }} whileInView={{ opacity: 0.55 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: EASE, delay: 0.5 }}>
            No credit card &nbsp;&#9670;&nbsp; Review every edit &nbsp;&#9670;&nbsp; Cancel any time
          </motion.p>
        </div>

        <HumanResumeIllustration reduce={Boolean(reduce)} />
      </div>
    </section>
  );
}
