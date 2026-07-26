/**
 * Google AdSense configuration — the single source of truth for ad placement.
 *
 * The loader script lives in `index.html` (`pagead2.googlesyndication.com/...?client=`)
 * and `public/ads.txt` authorises this publisher. Neither needs touching again.
 * What *does* change here are the ad-unit slot IDs below.
 *
 * ─── HOW TO FILL IN THE SLOT IDS ──────────────────────────────────────────────
 * AdSense → Ads → "By ad unit" → Display ads → create ONE unit per entry below,
 * shape = Vertical. Google hands back a snippet containing:
 *
 *     data-ad-slot="1234567890"
 *
 * Copy that 10-digit number in. Slot IDs are NOT secrets — they ship in the page
 * source of every AdSense site, so hardcoding them here is correct.
 *
 * Until an ID is filled in, `AdSlot` renders nothing at all. That is deliberate:
 * an empty `data-ad-slot` makes AdSense log a TagError and can count against the
 * site during review, so shipping this file with blank IDs is safe.
 */

/** Publisher ID. Must match the `client=` param on the loader in index.html. */
export const ADSENSE_CLIENT = "ca-pub-4075875605329268";

export const AD_SLOTS = {
  /** Left side rail — vertical/skyscraper display unit. */
  railLeft: "",
  /** Right side rail — vertical/skyscraper display unit. */
  railRight: "",
} as const;

/** Rail box. 160×600 is the classic wide skyscraper; AdSense fills it reliably. */
export const RAIL_WIDTH_PX = 160;
export const RAIL_HEIGHT_PX = 600;

/** Gap between a rail and the viewport edge (matches Tailwind's `left-6`). */
export const RAIL_GUTTER_PX = 24;

/**
 * Smallest viewport at which a rail can sit beside content of `contentWidth`
 * without overlapping it. Each side costs gutter + rail + a breathing gap.
 *
 * Callers pass the widest container on their page — not the *typical* one. A rail
 * that clears the prose but clips the hero is worse than no rail.
 */
export function railBreakpointFor(contentWidthPx: number): number {
  const perSide = RAIL_GUTTER_PX + RAIL_WIDTH_PX + 32; // 32px of breathing room
  return contentWidthPx + perSide * 2;
}

/** True once at least one rail unit has been created in AdSense. */
export function hasRailSlots(): boolean {
  return Boolean(AD_SLOTS.railLeft || AD_SLOTS.railRight);
}
