/**
 * Google AdSense configuration — the single source of truth for ad placement.
 *
 * The loader script lives in `index.html` (`pagead2.googlesyndication.com/...?client=`)
 * and `public/ads.txt` authorises this publisher. Neither needs touching again.
 * What *does* change here are the ad-unit slot IDs below.
 *
 * ─── HOW TO FILL IN THE SLOT IDS ──────────────────────────────────────────────
 * AdSense → Ads → "By ad unit" → Display ads → create ONE unit per entry below,
 * shape = **Vertical**, ad size = **Responsive** (NOT Fixed 160×600 — fixed limits
 * the request to one creative size, and 160×600 has thin demand; responsive lets
 * the same 160px rail also fill with other vertical sizes). Google hands back a
 * snippet containing:
 *
 *     data-ad-slot="1234567890"
 *
 * Copy that 10-digit number in. Slot IDs are NOT secrets — they ship in the page
 * source of every AdSense site, so hardcoding them here is correct.
 *
 * Until an ID is filled in, `AdSlot` renders nothing at all. That is deliberate:
 * an empty `data-ad-slot` makes AdSense log a TagError and can count against the
 * site during review, so shipping this file with blank IDs is safe.
 *
 * ─── WE DEVIATE FROM GOOGLE'S SNIPPET ON TWO ATTRIBUTES — ON PURPOSE ──────────
 * The snippet Google hands you is written for an in-flow unit of unknown shape:
 *
 *     data-ad-format="auto"  data-full-width-responsive="true"
 *
 * `AdSlot` is called with `format="vertical"` and `responsive={false}` instead:
 *
 *  • **`vertical` not `auto`** — `auto` lets AdSense pick any shape that fits the
 *    container, including a squat square that would leave two-thirds of a 600px
 *    rail empty. `vertical` restricts it to tall creatives, which is the whole
 *    point of a rail. (The `?client=` loader is already in index.html; the extra
 *    copy in each snippet is redundant and must NOT be added again.)
 *  • **`full-width-responsive=false`** — that flag makes an ad break out to the
 *    full viewport width on narrow screens. A rail is 160px and never renders on
 *    narrow screens anyway, so `true` is at best meaningless and at worst lets an
 *    ad escape its box.
 *
 * Do not "restore" Google's version.
 */

/** Publisher ID. Must match the `client=` param on the loader in index.html. */
export const ADSENSE_CLIENT = "ca-pub-4075875605329268";

export const AD_SLOTS = {
  /** Left side rail — responsive vertical display unit, created 2026-07-27. */
  railLeft: "7661175198",
  /** Right side rail — responsive vertical display unit, created 2026-07-27. */
  railRight: "7201744263",
} as const;

/**
 * Rail box. Width is a hard layout constraint and is what AdSense sizes the
 * creative from. Height is only a RESERVED MINIMUM — the units are responsive, so
 * Google sets the real height. See the note in `ad-side-rails.tsx`.
 */
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
