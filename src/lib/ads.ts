export const ADSENSE_CLIENT = "ca-pub-4075875605329268";

export const AD_SLOTS = {
  /** Left side rail — responsive vertical display unit, created 2026-07-27. */
  railLeft: "7661175198",
  /** Right side rail — responsive vertical display unit, created 2026-07-27. */
  railRight: "7201744263",
  /** In-flow unit — the one that earns on mobile. Responsive, created 2026-07-27. */
  inline: "6288383772",
} as const;


export const RAIL_WIDTH_PX = 160;
export const RAIL_HEIGHT_PX = 600;

/** Gap between a rail and the viewport edge (matches Tailwind's `left-6`). */
export const RAIL_GUTTER_PX = 24;


export function railBreakpointFor(contentWidthPx: number): number {
  const perSide = RAIL_GUTTER_PX + RAIL_WIDTH_PX + 32; // 32px of breathing room
  return contentWidthPx + perSide * 2;
}

/** True once at least one rail unit has been created in AdSense. */
export function hasRailSlots(): boolean {
  return Boolean(AD_SLOTS.railLeft || AD_SLOTS.railRight);
}

export function inlineSlot(): string {
  return AD_SLOTS.inline || AD_SLOTS.railLeft || AD_SLOTS.railRight;
}

