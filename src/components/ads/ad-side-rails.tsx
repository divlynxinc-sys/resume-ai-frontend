import AdSlot from "./ad-slot";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  AD_SLOTS,
  RAIL_HEIGHT_PX,
  RAIL_WIDTH_PX,
  hasRailSlots,
  railBreakpointFor,
} from "@/lib/ads";

/**
 * Fixed left + right ad rails for the public content pages.
 *
 * Rendered — not merely hidden — only above the breakpoint at which a 160px rail
 * clears the page's widest container. Hiding with `hidden xl:block` would push a
 * zero-width `<ins>` on narrow screens and permanently burn the slot (see AdSlot).
 *
 * `z-20` puts these UNDER the sticky navbar (`z-30`) and well under modals, so an
 * ad can never sit on top of a control the user is trying to click — which is both
 * an AdSense policy requirement and basic decency.
 *
 * NOT used on `/` (the landing page's widest section is 1280px, so rails would only
 * appear above ~1712px) or anywhere behind auth.
 */
export default function AdSideRails({
  /** Widest container on the host page, in px. Drives the breakpoint. */
  contentWidthPx,
}: {
  contentWidthPx: number;
}) {
  const wideEnough = useMediaQuery(`(min-width: ${railBreakpointFor(contentWidthPx)}px)`);

  if (!wideEnough || !hasRailSlots()) return null;

  // One unit is enough to run both rails — AdSense permits the same unit more than
  // once per page. Two units just gives you per-side reporting.
  const left = AD_SLOTS.railLeft || AD_SLOTS.railRight;
  const right = AD_SLOTS.railRight || AD_SLOTS.railLeft;

  return (
    <>
      <Rail side="left" slot={left} />
      <Rail side="right" slot={right} />
    </>
  );
}

function Rail({ side, slot }: { side: "left" | "right"; slot: string }) {
  return (
    <aside
      role="complementary"
      aria-label="Advertisement"
      className={`fixed top-[88px] z-20 ${side === "left" ? "left-6" : "right-6"}`}
      style={{ width: RAIL_WIDTH_PX }}
    >
      <span className="mb-1.5 block text-center text-[10px] uppercase tracking-[0.14em] text-[var(--app-fg-muted)] opacity-60">
        Advertisement
      </span>
      {/*
        `minHeight`, never `height`. The AdSense units are RESPONSIVE, so Google
        picks the creative size from the container's width and sets the final height
        itself — a hard `height` would clip anything it picks that isn't exactly
        600px tall. The min just reserves the box so the caption doesn't sit alone
        while the ad loads. (No CLS risk either way: the rail is `position: fixed`,
        so it is out of flow and can't shove page content around.)
      */}
      <AdSlot
        slot={slot}
        format="vertical"
        responsive={false}
        style={{ width: RAIL_WIDTH_PX, minHeight: RAIL_HEIGHT_PX }}
      />
    </aside>
  );
}
