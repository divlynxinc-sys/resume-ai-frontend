import { useEffect, useState } from "react";

/**
 * SSR-safe `window.matchMedia` subscription.
 *
 * `scripts/prerender.mjs` shims `matchMedia` to always return `matches: false`,
 * so anything gated on this hook is simply absent from the prerendered HTML —
 * which is what we want for ads: crawlers get the content, not the ad markup.
 * The client mounts with `createRoot` (not `hydrateRoot`), so the server/client
 * disagreement costs nothing.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const mql = window.matchMedia(query);
    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);

    setMatches(mql.matches); // resync in case the viewport changed before mount
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

export default useMediaQuery;
