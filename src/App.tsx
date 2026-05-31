import { lazy, Suspense } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
  ScrollRestoration,
} from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

// ─── Lazy-load every page ─────────────────────────────────────────────────────
const LandingPage        = lazy(() => import("./components/modal/landing-page"));
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

// ─── Route guards ─────────────────────────────────────────────────────────────
function PrivateRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return (
    <>
      <ScrollRestoration />
      <Outlet />
    </>
  );
}

function PublicOnlyRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

// ─── Router ───────────────────────────────────────────────────────────────────
const router = createBrowserRouter([
  // Public – always accessible
  { path: "/",               element: <Page><LandingPage /></Page> },
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
]);

export default function App() {
  return <RouterProvider router={router} />;
}
