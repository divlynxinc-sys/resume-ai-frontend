import { useEffect, useRef, type CSSProperties } from "react";
import { ADSENSE_CLIENT } from "@/lib/ads";

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

type AdSlotProps = {
  /** `data-ad-slot` from the AdSense unit snippet. Empty string ⇒ renders nothing. */
  slot: string;
  /** `data-ad-format`. "vertical" for rails, "auto" for in-flow units. */
  format?: "auto" | "vertical" | "horizontal" | "rectangle" | "fluid";
  /** Only meaningful for `format="auto"`; fixed-size units must pass false. */
  responsive?: boolean;
  style?: CSSProperties;
  className?: string;
};

/**
 * One AdSense display unit.
 *
 * The three things that actually break AdSense in a React SPA, and how each is
 * handled here:
 *
 *  1. **StrictMode double-mounts effects.** Pushing the same `<ins>` twice throws
 *     `TagError: All 'ins' elements ... already have ads in them`. Guarded by a ref
 *     plus AdSense's own `data-adsbygoogle-status` attribute.
 *  2. **Zero-width containers.** Pushing an `<ins>` that is `display:none` or 0px
 *     wide makes AdSense record `availableWidth=0` and leave the slot permanently
 *     blank — it does not retry. So callers must NOT hide rails with a CSS
 *     breakpoint; they must not render them at all (see `AdSideRails`).
 *  3. **Ad blockers.** `adsbygoogle.js` never loads, `window.adsbygoogle` stays a
 *     plain array, the push is inert. Wrapped in try/catch so it can't take a page
 *     down either way.
 */
export default function AdSlot({
  slot,
  format = "auto",
  responsive = true,
  style,
  className,
}: AdSlotProps) {
  const insRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!slot) return;
    const el = insRef.current;
    if (!el) return;
    if (pushed.current || el.getAttribute("data-adsbygoogle-status")) return;
    if (el.getBoundingClientRect().width === 0) return;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // Blocked or not yet loaded — the slot stays empty, which is the correct
      // failure mode. Never surface this to the user.
    }
  }, [slot]);

  if (!slot) return null;

  /**
   * ─── WHY YOU SEE A DASHED BOX ON localhost ──────────────────────────────────
   * **AdSense never serves ads on localhost.** Ads are authorised per-domain, and
   * `jobsynk.co` is the only authorised origin — from `127.0.0.1` the tag loads,
   * requests, and gets nothing back, every time. Combined with the collapse rule
   * for unfilled slots, that made every ad position *invisible* in dev, which is
   * indistinguishable from "the code is broken".
   *
   * So in dev we draw the box instead: same dimensions, same position, visible.
   * You can lay out and test breakpoints locally; real creatives only ever appear
   * on the deployed domain.
   *
   * `import.meta.env?.DEV` — optional chaining is load-bearing, it matches the
   * pattern in `lib/api.ts`. The prerenderer defines `DEV: false`, so SSR takes
   * the real path.
   */
  if (import.meta.env?.DEV) {
    return (
      <div
        className={`grid place-items-center rounded-lg border border-dashed border-[var(--app-border-strong)] bg-[var(--app-surface-2)] ${className ?? ""}`}
        style={{ ...style, display: "grid" }}
      >
        <span className="px-2 text-center text-[11px] leading-5 text-[var(--app-fg-muted)]">
          Ad slot <code>{slot}</code>
          <br />
          <span className="opacity-60">dev preview — AdSense won't serve on localhost</span>
        </span>
      </div>
    );
  }

  return (
    <ins
      ref={insRef}
      className={`adsbygoogle${className ? ` ${className}` : ""}`}
      style={{ display: "block", ...style }}
      data-ad-client={ADSENSE_CLIENT}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={responsive ? "true" : "false"}
    />
  );
}
