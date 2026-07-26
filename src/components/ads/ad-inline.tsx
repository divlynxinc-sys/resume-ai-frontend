import AdSlot from "./ad-slot";
import { useMediaQuery } from "@/hooks/use-media-query";
import { inlineSlot } from "@/lib/ads";

/**
 * An in-flow responsive ad unit — the one that actually works on phones.
 *
 * The side rails only render above ~1200–1584px, which is a minority of real
 * traffic and none of the mobile traffic. This is the workhorse: it sits in the
 * document flow, fills its container's width, and serves at every viewport.
 *
 * ─── WHY THIS ONE *IS* `auto` + full-width-responsive ─────────────────────────
 * The rails deliberately override Google's snippet (`vertical`, no full-width) —
 * see `lib/ads.ts`. Here Google's defaults are correct: the container width varies
 * by page (768px article vs 1100px grid) and by viewport, so letting AdSense pick
 * the shape is exactly what we want.
 *
 * ─── THE HEIGHT RESERVATION IS NOT COSMETIC ──────────────────────────────────
 * Unlike a rail (`position: fixed`, out of flow, cannot shift anything), this unit
 * is IN FLOW. An unreserved slot that pops in at 250px tall shoves the article down
 * and tanks CLS — on the exact pages whose whole purpose is ranking. So the box is
 * reserved up front: taller on mobile (AdSense favours 300×250 / 336×280 there),
 * shorter on desktop (728×90-ish leaderboards). Some slack is unavoidable; a small
 * gap is a far cheaper mistake than a layout shift.
 */
export default function AdInline({
  className,
  /**
   * Render only *below* this viewport width. Used for the slot above the ATS
   * uploader, which exists to replace the side rails on screens too narrow to fit
   * them — above that width the rails already cover the position and this would be
   * a third simultaneous ad.
   *
   * Gated by rendering, never by CSS: a `display:none` <ins> is pushed at zero
   * width and AdSense blanks the slot permanently (see `AdSlot`).
   */
  maxViewport,
}: {
  className?: string;
  maxViewport?: number;
}) {
  // Must run unconditionally — hooks cannot sit behind an early return. A query of
  // `min-width: 0` always matches, which is the "no gate" case.
  const withinRange = useMediaQuery(
    maxViewport ? `(max-width: ${maxViewport - 1}px)` : "(min-width: 0px)"
  );

  // Falls back to a rail unit until a dedicated in-flow unit exists — see
  // `inlineSlot()` for why that is safe. Without the fallback this component
  // renders nothing, which is what left phones with no ads at all.
  const slot = inlineSlot();
  if (!slot || !withinRange) return null;

  return (
    <div data-ad-inline className={`mx-auto w-full ${className ?? ""}`}>
      <span className="mb-1.5 block text-center text-[10px] uppercase tracking-[0.14em] text-[var(--app-fg-muted)] opacity-60">
        Advertisement
      </span>
      <AdSlot
        slot={slot}
        format="auto"
        responsive
        className="min-h-[280px] w-full md:min-h-[120px]"
      />
    </div>
  );
}
