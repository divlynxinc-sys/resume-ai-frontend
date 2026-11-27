export const publicPaths = {
  home: "/",
  blog: "/blog",
  atsChecker: "/ats-checker",
  pricing: "/pricing",
  terms: "/terms",
  privacy: "/privacy",
  cookiePolicy: "/cookie-policy",
  security: "/security",
  enterprise: "/enterprise",
  faq: "/faq",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  login: "/login",
  signup: "/signup",
} as const;

const staticPaths = new Set<string>(Object.values(publicPaths));

export function isPublicAppPath(pathname: string): boolean {
  const path = pathname.toLowerCase().replace(/\/+$/, "") || "/";
  return staticPaths.has(path) || path.startsWith(publicPaths.blog + "/");
}
