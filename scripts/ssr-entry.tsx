// Server-render entry for the marketing pages.
//
// The blog can be prerendered from plain data (content/blog/render.ts), but the
// landing page and /pricing are real React trees with contexts, so the only way to
// get their HTML without duplicating the markup (and inviting drift) is to actually
// run React on the server.
//
// This file is bundled by scripts/prerender.mjs via esbuild and executed in Node.
// It is NOT part of the app bundle and is not covered by `tsc -b` (tsconfig.app.json
// only includes src/). Keep it dependency-light and defensive.
//
// What we do NOT wrap in: GoogleOAuthProvider (injects a script tag, and no marketing
// page calls useGoogleLogin) and ToastProvider (nothing here calls useToast). Adding a
// provider that portals to document.body would throw — react-dom/server has no portals.

import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";

import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { PlanProvider } from "@/contexts/PlanContext";

import LandingPageScreen from "@/components/modal/landing-page";
import PricingScreen from "@/components/modal/pricing";
import FAQScreen from "@/components/modal/faq";
import EnterpriseScreen from "@/components/modal/enterprise";
import SecurityScreen from "@/components/modal/security";
import AtsCheckerScreen from "@/components/modal/ats-checker";

const PAGES: Record<string, () => React.ReactElement> = {
  "/": () => <LandingPageScreen />,
  // The tool renders with empty inputs here — which is correct. The crawler gets
  // the explanatory content and the FAQ (the part that ranks); the analysis only
  // ever runs on a real user's paste.
  "/ats-checker": () => <AtsCheckerScreen />,
  "/pricing": () => <PricingScreen />,
  "/faq": () => <FAQScreen />,
  "/enterprise": () => <EnterpriseScreen />,
  "/security": () => <SecurityScreen />,
};

export function routes(): string[] {
  return Object.keys(PAGES);
}

/**
 * Renders one route to a static HTML string.
 *
 * Every page is rendered LOGGED OUT (AuthProvider starts with user = null and its
 * network call lives in a useEffect, which the server renderer never runs). That is
 * exactly right: a crawler is always an anonymous visitor, so the HTML it gets is
 * the HTML a first-time human gets.
 */
export function renderPage(path: string): string {
  const Page = PAGES[path];
  if (!Page) throw new Error(`No SSR page registered for ${path}`);

  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[path]}>
      <ThemeProvider>
        <AuthProvider>
          <PlanProvider>{Page()}</PlanProvider>
        </AuthProvider>
      </ThemeProvider>
    </MemoryRouter>
  );
}
