import { PROCTOR } from "./config";

/**
 * Extra-display detection via the Window Management API's `screen.isExtended`
 * (Chromium 100+, no permission prompt). `getScreenDetails()` would give a live
 * `screenschange` event but needs a permission grant, so the flag is polled
 * instead — it is a cheap property read.
 */

type ScreenWithExtended = Screen & { isExtended?: boolean };

export function screenCheckSupported(): boolean {
  return typeof window !== "undefined" && typeof window.screen !== "undefined" && "isExtended" in window.screen;
}

export function hasExtendedScreens(): boolean {
  return Boolean((window.screen as ScreenWithExtended).isExtended);
}

/** Emits once immediately, then whenever the answer changes. No-op on unsupported browsers. */
export function watchScreens(onChange: (extended: boolean) => void): () => void {
  if (!screenCheckSupported()) return () => {};
  let last: boolean | null = null;
  const check = () => {
    const next = hasExtendedScreens();
    if (next !== last) {
      last = next;
      onChange(next);
    }
  };
  check();
  const id = window.setInterval(check, PROCTOR.screenPollMs);
  window.addEventListener("resize", check);
  window.addEventListener("focus", check);
  return () => {
    window.clearInterval(id);
    window.removeEventListener("resize", check);
    window.removeEventListener("focus", check);
  };
}
