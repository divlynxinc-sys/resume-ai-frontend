// Shared easing for the marketing surface.
//
// Its own module for the same reason `ui/button-variants.ts` is: a file that
// exports both components and constants breaks React Fast Refresh, and the
// lint config enforces that.

/**
 * One curve for every transition on the landing page. Fast out of the gate,
 * long settle, no overshoot — the same expo-out the site's CSS transitions
 * already use, so Framer Motion and plain CSS move identically.
 */
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
