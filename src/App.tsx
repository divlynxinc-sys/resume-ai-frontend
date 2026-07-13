import { lazy, Suspense } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
  ScrollRestoration,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getSafeRedirectPath, withNextParam } from "@/lib/navigation";

// ─── Lazy-load every page ─────────────────────────────────────────────────────
const LandingPage        = lazy(() => import("./components/modal/landing-page"));
const BlogScreen         = lazy(() => import("./components/modal/blog"));
const BlogPostScreen     = lazy(() => import("./components/modal/blog-post"));
const AtsCheckerScreen   = lazy(() => import("./components/modal/ats-checker"));
const LoginScreen        = lazy(() => import("./components/modal/login"));
const Signup             = lazy(() => import("./components/modal/signup"));
const OnboardingScreen   = lazy(() => import("./components/modal/onboarding"));
const Dashboard          = lazy(() => import("./components/modal/dashboard"));
const ResumeBuilder      = lazy(() => import("./components/modal/resume-builder"));
const TemplatesScreen    = lazy(() => import("./components/modal/templates"));
const TailoringScreen    = lazy(() => import("./components/modal/tailoring"));
const CoverLetterScreen  = lazy(() => import("./components/modal/cover-letter"));
const HREmailDraftsScreen= lazy(() => import("./components/modal/hr-email-drafts"));
const QAAnswersScreen    = lazy(() => import("./components/modal/qa-answers"));
const PricingScreen      = lazy(() => import("./components/modal/pricing"));
const SubscriptionScreen = lazy(() => import("./components/modal/subscription"));
const PaymentSuccess     = lazy(() => import("./components/modal/payment-success"));
const AccountManagement  = lazy(() => import("./components/modal/account-management"));
const InterviewScreen    = lazy(() => import("./components/modal/interview"));
const AIChatModal        = lazy(() => import("./components/modal/ai-chat"));
const MyResumesScreen    = lazy(() => import("./components/modal/my-resumes"));
const UserDetailsScreen  = lazy(() => import("./components/modal/user-details"));
const UserProfileScreen  = lazy(() => import("./components/modal/user-profile"));
const TermsScreen        = lazy(() => import("./components/modal/terms-of-service"));
const PrivacyScreen      = lazy(() => import("./components/modal/privacy-policy"));
const HelpCenterScreen   = lazy(() => import("./components/modal/help-center"));
const DocumentationScreen= lazy(() => import("./components/modal/documentation"));
const FAQScreen          = lazy(() => import("./components/modal/faq"));
const CookiePolicyScreen = lazy(() => import("./components/modal/cookie-policy"));
const SecurityScreen     = lazy(() => import("./components/modal/security"));
const ContactUsScreen    = lazy(() => import("./components/modal/contact-us"));
const EnterpriseScreen   = lazy(() => import("./components/modal/enterprise"));
const ForgotPassword     = lazy(() => import("./components/modal/forgot-password"));
const ResumeGenerated    = lazy(() => import("./components/modal/resume-generated"));
const ResumeComparison   = lazy(() => import("./components/modal/resume-comparison"));
const AdvancedAnalytics  = lazy(() => import("./components/modal/advanced-analytics"));
const NotFound           = lazy(() => import("./components/modal/not-found"));

// ─── Loading fallback ─────────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="min-h-screen bg-[var(--app-bg)] flex items-center justify-center">
      <div className="h-8 w-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
    </div>
  );
}

function Page({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

// ─── Root layout ──────────────────────────────────────────────────────────────
/**
 * Wraps EVERY route so that `<ScrollRestoration/>` runs everywhere.
 *
 * It used to live inside `PrivateRoute` only, which meant the whole public surface
 * had no scroll handling: clicking "Check my resume free" halfway down the landing
 * page loaded `/ats-checker` still scrolled halfway down. React Router keeps the
 * scroll offset across a client-side navigation unless something resets it.
 *
 * `ScrollRestoration` scrolls to top on a PUSH, restores the saved offset on a POP
 * (browser back/forward — which is what you actually want), and scrolls to the
 * element when the URL carries a hash.
 *
 * ⚠️ Render exactly ONE of these in the tree. Two instances fight over the scroll
 * position — which is why it is here and not in the guards.
 */
function RootLayout() {
  return (
    <>
      <ScrollRestoration />
      <Outlet />
    </>
  );
}

// ─── Route guards ─────────────────────────────────────────────────────────────
function PrivateRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) {
    const next = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to={withNextParam("/login", next)} replace />;
  }

  return <Outlet />;
}

function PublicOnlyRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const [searchParams] = useSearchParams();

  if (isLoading) return <PageLoader />;
  if (isAuthenticated) return <Navigate to={getSafeRedirectPath(searchParams.get("next"))} replace />;
  return <Outlet />;
}

// ─── Router ───────────────────────────────────────────────────────────────────
// Everything nests under RootLayout so <ScrollRestoration/> applies to every route,
// public and private alike. Adding a top-level route OUTSIDE this wrapper would
// silently lose scroll-to-top on navigation — don't.
const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
  // Public – always accessible
  { path: "/",               element: <Page><LandingPage /></Page> },
  // Public content surface. These are ALSO emitted as static HTML by
  // scripts/prerender.mjs, because AI crawlers (GPTBot, ClaudeBot,
  // PerplexityBot) fetch JS but never execute it — to them a lazy() route is a
  // blank page. Vercel serves the prerendered file from the filesystem before
  // the SPA rewrite in vercel.json ever applies; React then mounts over it.
  { path: "/blog",           element: <Page><BlogScreen /></Page> },
  { path: "/blog/:slug",     element: <Page><BlogPostScreen /></Page> },
  // Free tool. DELIBERATELY ungated — no auth, no backend, no LLM call. It runs
  // entirely client-side (lib/ats-check.ts + lib/resume-extract.ts), which is what
  // lets us give the result away without a signup wall. The whole point of it.
  { path: "/ats-checker",    element: <Page><AtsCheckerScreen /></Page> },
  { path: "/pricing",        element: <Page><PricingScreen /></Page> },
  { path: "/terms",          element: <Page><TermsScreen /></Page> },
  { path: "/privacy",        element: <Page><PrivacyScreen /></Page> },
  { path: "/cookie-policy",  element: <Page><CookiePolicyScreen /></Page> },
  { path: "/security",       element: <Page><SecurityScreen /></Page> },
  { path: "/contact-us",     element: <Page><ContactUsScreen /></Page> },
  { path: "/enterprise",     element: <Page><EnterpriseScreen /></Page> },
  { path: "/faq",            element: <Page><FAQScreen /></Page> },
  { path: "/forgot-password",element: <Page><ForgotPassword /></Page> },

  // Public-only (redirect authenticated users away)
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: "/login",  element: <Page><LoginScreen /></Page> },
      { path: "/signup", element: <Page><Signup /></Page> },
    ],
  },

  // Protected – requires authentication
  {
    element: <PrivateRoute />,
    children: [
      { path: "/onboarding",        element: <Page><OnboardingScreen /></Page> },
      { path: "/dashboard",         element: <Page><Dashboard /></Page> },
      { path: "/resumes",           element: <Page><ResumeBuilder /></Page> },
      { path: "/templates",         element: <Page><TemplatesScreen /></Page> },
      { path: "/tailoring",         element: <Page><TailoringScreen /></Page> },
      { path: "/cover-letter",      element: <Page><CoverLetterScreen /></Page> },
      { path: "/hr-email-drafts",   element: <Page><HREmailDraftsScreen /></Page> },
      { path: "/qa-answers",        element: <Page><QAAnswersScreen /></Page> },
      { path: "/subscribe",         element: <Page><SubscriptionScreen /></Page> },
      { path: "/success",           element: <Page><PaymentSuccess /></Page> },
      { path: "/account",           element: <Page><AccountManagement /></Page> },
      { path: "/interview",         element: <Page><InterviewScreen /></Page> },
      { path: "/ai-chat",           element: <Page><AIChatModal /></Page> },
      { path: "/my-resumes",        element: <Page><MyResumesScreen /></Page> },
      { path: "/user-details",      element: <Page><UserDetailsScreen /></Page> },
      { path: "/user-profile",      element: <Page><UserProfileScreen /></Page> },
      { path: "/help-center",       element: <Page><HelpCenterScreen /></Page> },
      { path: "/documentation",     element: <Page><DocumentationScreen /></Page> },
      { path: "/analytics",         element: <Page><AdvancedAnalytics /></Page> },
      { path: "/resume-generated",  element: <Page><ResumeGenerated /></Page> },
      { path: "/resume-comparison", element: <Page><ResumeComparison /></Page> },
    ],
  },

      // 404
      { path: "*", element: <Page><NotFound /></Page> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
