// Landing-page FAQ.
//
// It earns its place twice: it answers the objections that stop a signup, and
// it is the one block on this page shaped the way an answer engine wants to
// quote — a literal question followed immediately by a self-contained answer.
// The copy lives in `content/site-faq.ts` because the prerenderer emits the same
// six pairs as FAQPage JSON-LD, and rendered text that disagrees with the
// structured data is worse than shipping neither.

import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { HOME_FAQ } from "@/content/site-faq";
import { EASE } from "./easing";
import { Eyebrow, Reveal, SplitHeadline } from "./motion-primitives";

function FaqRow({
  question,
  answer,
  open,
  onToggle,
}: {
  question: string;
  answer: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-[var(--app-border)]">
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="flex w-full items-start justify-between gap-6 py-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40"
        >
          <span className="font-display text-lg font-normal leading-snug tracking-tight text-[var(--app-fg)] sm:text-xl">
            {question}
          </span>
          <motion.span
            aria-hidden
            className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border border-[var(--app-border)] text-[var(--app-fg-muted)]"
            animate={{
              rotate: open ? 135 : 0,
              backgroundColor: open ? "var(--accent-soft)" : "rgba(0,0,0,0)",
              borderColor: open ? "var(--accent)" : "var(--app-border)",
            }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <Plus className="size-3.5" />
          </motion.span>
        </button>
      </h3>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="overflow-hidden"
          >
            <p className="max-w-2xl pb-7 pr-10 text-[14.5px] leading-relaxed text-[var(--app-fg-muted)]">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LandingFaq() {
  // First one starts open so the section reads as content, not as six closed
  // doors — and so the prerendered HTML ships at least one full answer visible.
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="mx-auto max-w-[1160px] scroll-mt-24 px-6">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Eyebrow>Questions</Eyebrow>
          <h2 className="mt-4 font-display text-[2rem] font-light leading-[1.08] tracking-tight text-[var(--app-fg)] sm:text-[2.75rem]">
            <SplitHeadline
              segments={[
                { text: "Answered" },
                { text: " plainly.", className: "italic text-[var(--app-fg-muted)]" },
              ]}
            />
          </h2>
          <Reveal delay={0.1}>
            <p className="mt-5 max-w-sm text-[14.5px] leading-relaxed text-[var(--app-fg-muted)]">
              More on{" "}
              <Link
                to="/faq"
                className="font-medium text-[var(--accent-text)] underline decoration-current/30 underline-offset-4 transition-opacity hover:opacity-70"
              >
                the full FAQ
              </Link>
              , or read the reasoning on{" "}
              <Link
                to="/blog"
                className="font-medium text-[var(--accent-text)] underline decoration-current/30 underline-offset-4 transition-opacity hover:opacity-70"
              >
                the blog
              </Link>
              .
            </p>
          </Reveal>
        </div>

        <div className="border-t border-[var(--app-border)]">
          {HOME_FAQ.map((item, index) => (
            <FaqRow
              key={item.q}
              question={item.q}
              answer={item.a}
              open={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
