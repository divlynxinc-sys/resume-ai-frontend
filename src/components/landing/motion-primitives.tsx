// Shared motion building blocks for the marketing surface.
//
// WHY A SEPARATE FILE: the landing page used to reveal everything with one
// IntersectionObserver + a global `[data-landing-reveal]` CSS rule, which meant
// every element on the page entered exactly the same way. That uniformity is
// what makes a page read as generated. These primitives let each section move
// differently — headlines set word by word, rules draw, panels settle — while
// still sharing one easing curve so the page feels like one hand made it.
//
// SSR NOTE: `scripts/prerender.mjs` renders this tree through
// `renderToStaticMarkup`. Motion emits its `initial` values as inline styles
// there, so the crawler still receives every word of copy in the HTML — it just
// arrives with a transform on it, which resolves the moment React hydrates.

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { EASE } from "./easing";

/**
 * Fade-and-rise on scroll. Deliberately plain — it is the *background* motion of
 * the page, so anything using it should be something the eye passes over, not
 * something it stops on.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 22,
  amount = 0.2,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  amount?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? undefined : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount, margin: "0px 0px -60px 0px" }}
      transition={{ duration: 0.75, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

export type HeadlineSegment = {
  text: string;
  /** Applied to every word in the segment — used for the italic display runs. */
  className?: string;
};

/**
 * Headline that sets one word at a time from behind a mask.
 *
 * Each word gets its own overflow-hidden shell; the inner span starts pushed
 * fully below it. The shell carries matching padding/negative-margin on the
 * bottom so Fraunces' descenders ("g", "y", "j") are not sliced off by the mask
 * — that clipping is the classic tell that this effect was bolted on.
 *
 * Words are laid out as inline-blocks with a right margin rather than being
 * separated by real spaces, so the browser still wraps the line normally.
 *
 * ─── WHY THE TRIGGER LIVES ON THE PARENT ─────────────────────────────────────
 * The obvious version — `whileInView` on each word — deadlocks, and silently.
 * IntersectionObserver intersects an element against its ancestors' *clip*
 * rects, and a word parked at y:110% is outside the mask that is meant to
 * reveal it. Ratio is 0, "in view" never fires, and the headline stays blank
 * forever. So the viewport trigger goes on the unclipped wrapper and the words
 * follow by variant propagation, which travels through React context and does
 * not care that there are plain spans in between.
 */
export function SplitHeadline({
  segments,
  className,
  delay = 0,
  stagger = 0.045,
  once = true,
}: {
  segments: HeadlineSegment[];
  className?: string;
  delay?: number;
  stagger?: number;
  once?: boolean;
}) {
  const reduce = useReducedMotion();
  let wordIndex = -1;

  return (
    <motion.span
      className={className}
      initial={reduce ? "visible" : "hidden"}
      whileInView="visible"
      viewport={{ once, amount: 0.2 }}
    >
      {segments.map((segment, segmentIndex) => (
        <span key={segmentIndex} className={segment.className}>
          {segment.text.split(" ").map((word) => {
            wordIndex += 1;
            const index = wordIndex;
            return (
              <span
                key={`${segmentIndex}-${index}`}
                // The mask clips at the padding box, so every bit of room the
                // glyphs need has to be padding:
                //   pb/-mb  descenders (Fraunces' g, y, j) without moving the
                //           line box.
                //   pr      the word gap AND the italic overhang. Fraunces
                //           italic leans past its advance width, so a margin
                //           gap here would slice the last letter of every
                //           italic word ("should" → "shoulɑ").
                className="inline-block overflow-hidden pb-[0.14em] -mb-[0.14em] pr-[0.26em] align-bottom"
              >
                <motion.span
                  className="inline-block"
                  variants={{ hidden: { y: "110%" }, visible: { y: "0%" } }}
                  transition={{ duration: 0.95, ease: EASE, delay: delay + index * stagger }}
                >
                  {word}
                </motion.span>
              </span>
            );
          })}
        </span>
      ))}
    </motion.span>
  );
}

/**
 * Small uppercase mono label. The counterweight to the big Fraunces display
 * type — the size contrast between the two is most of what makes the page feel
 * edited rather than assembled.
 */
export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--app-fg-soft)] ${className}`}
    >
      {children}
    </span>
  );
}
