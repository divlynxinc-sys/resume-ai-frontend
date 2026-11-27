const AUTH_ROUTES = new Set(["/login", "/signup", "/onboarding"]);

export function getSafeRedirectPath(next: string | null | undefined, fallback = "/dashboard") {
  if (!next) return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || /[\\\u0000-\u001f\u007f]/.test(next)) return fallback;

  const url = new URL(next, "https://jobsynk.invalid");
  if (url.origin !== "https://jobsynk.invalid" || url.pathname.startsWith("//")) return fallback;
  const path = url.pathname.toLowerCase().replace(/\/+$/, "");
  if (AUTH_ROUTES.has(path)) return fallback;

  return url.pathname + url.search + url.hash;
}

export function withNextParam(authPath: "/login" | "/signup", next: string) {
  return `${authPath}?next=${encodeURIComponent(next)}`;
}

export function onboardingPath(next?: string | null) {
  const destination = getSafeRedirectPath(next, "");
  return destination ? "/onboarding?next=" + encodeURIComponent(destination) : "/onboarding";
}
