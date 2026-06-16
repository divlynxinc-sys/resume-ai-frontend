const AUTH_ROUTES = new Set(["/login", "/signup"]);

export function getSafeRedirectPath(next: string | null | undefined, fallback = "/dashboard") {
  if (!next) return fallback;
  if (!next.startsWith("/") || next.startsWith("//")) return fallback;

  const path = next.split(/[?#]/, 1)[0];
  if (AUTH_ROUTES.has(path)) return fallback;

  return next;
}

export function withNextParam(authPath: "/login" | "/signup", next: string) {
  return `${authPath}?next=${encodeURIComponent(next)}`;
}
