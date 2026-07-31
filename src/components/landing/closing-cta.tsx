// The closing band.
//
// Deliberately the only inverted surface on the page: after ~six screens of warm
// paper, flipping to ink is the strongest possible full stop, and it costs
// nothing but a background swap. It inverts correctly in both themes because it
// is built from `--app-fg` on `--app-bg` rather than from a hardcoded near-black.

import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { EASE } from "./easing";
import { SplitHeadline } from "./motion-primitives";

export default function ClosingCta() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-[var(--app-fg)] px-6 py-24 text-[var(--app-bg)] sm:py-32">
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

      <div className="relative mx-auto max-w-[1160px]">
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
          <Link
            to="/signup"
            className="group inline-flex h-13 items-center gap-2.5 rounded-full bg-[var(--app-bg)] px-8 text-[15px] font-semibold text-[var(--app-fg)] transition-transform duration-300 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-bg)]/50"
          >
            Start building — free
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>

          <Link
            to="/ats-checker"
            className="text-[15px] font-medium underline decoration-current/30 underline-offset-[6px] transition-opacity hover:opacity-70"
          >
            Or just check the one you have
          </Link>
        </motion.div>

        <motion.p
          className="mt-8 font-mono text-[11px] uppercase tracking-[0.18em] opacity-55"
          initial={reduce ? undefined : { opacity: 0 }}
          whileInView={{ opacity: 0.55 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.5 }}
        >
          No credit card &nbsp;&#9670;&nbsp; Free plan stays free &nbsp;&#9670;&nbsp; Cancel any time
        </motion.p>
      </div>
    </section>
  );
}
