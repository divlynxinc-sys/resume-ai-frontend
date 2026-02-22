import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { FiCheck } from "react-icons/fi";
import SiteNavbar from "../layout/site-navbar";

type Plan = {
  title: string;
  price: string;
  subtitle?: string;
};

function getFeaturesForPlan(title: string): string[] {
  switch (title) {
    case "Free":
      return ["5 AI Credits", "Basic Templates", "Standard Support"];
    case "Starter":
      return ["50 AI Credits", "All Templates", "Priority Support"];
    case "Premium":
      return ["200 AI Credits", "AI Cover Letters", "Premium Support"];
    case "Pro":
      return ["500 AI Credits", "Interview Prep Module", "24/7 VIP Support"];
    case "Enterprise":
      return ["Custom Credit Pool", "Team Management", "Dedicated Account Manager"];
    default:
      return ["Access to features in your selected plan"];
  }
}

function SuccessBadge() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-emerald-300 text-xs">
      <span className="size-4 grid place-items-center rounded-full bg-emerald-500 text-white">
        ✓
      </span>
      Payment Successful
    </div>
  );
}

function ProBadge() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/40 bg-indigo-500/10 px-3 py-1 text-indigo-300 text-xs">
      <span className="size-4 grid place-items-center rounded-full bg-indigo-500 text-white">★</span>
      Pro
    </div>
  );
}

export default function PaymentSuccessScreen() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  const plan: Plan | null = useMemo(() => {
    try {
      const raw = sessionStorage.getItem("selectedPlan");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const title = plan?.title ?? "Your Plan";
  const price = plan?.price ?? "$—";
  const subtitle = plan?.subtitle ?? "";
  const features = getFeaturesForPlan(title);
  const isPro = title.toLowerCase() === "pro";

  return (
    <div className="min-h-screen w-full bg-[var(--app-bg)] text-white">
      <SiteNavbar />

      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 justify-center">
            <SuccessBadge />
            {isPro && <ProBadge />}
          </div>
          <h1 className="mt-4 text-3xl md:text-4xl font-extrabold tracking-tight">You're all set!</h1>
          <p className="mt-2 text-white/70">Thank you for subscribing. Your {title} plan is now active.</p>
          {isPro && (
            <p className="mt-1 text-indigo-300 font-semibold">You're Pro now.</p>
          )}
        </div>

        {/* Summary card */}
        <div className="mt-8 relative rounded-[20px] p-px bg-gradient-to-b from-emerald-400/20 via-sky-400/15 to-indigo-500/20">
          <div className="rounded-[18px] bg-[#0F1629] border border-white/12 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div>
                <div className="text-lg font-semibold">{title}</div>
                <div className="mt-1 flex items-end gap-2">
                  <div className="text-3xl font-bold">{price}</div>
                  {subtitle ? <div className="text-sm text-white/60">{subtitle}</div> : null}
                </div>
              </div>
              <Link to="/dashboard" className="rounded-lg bg-emerald-500 hover:bg-emerald-400 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-500/30">Go to Dashboard</Link>
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-semibold">What's included</h2>
              <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-white/85">
                    <FiCheck className="text-emerald-400" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 rounded-lg bg-black/20 border border-white/10 px-4 py-3 text-xs text-white/60">
              You will receive an email receipt shortly. Manage your subscription anytime from Account Settings.
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link to="/templates" className="rounded-full bg-[#0C1426] border border-white/12 hover:bg-[#0D172B] px-5 py-2.5 text-sm text-white">Explore Templates</Link>
        </div>
      </main>

      {/* Decorative glows */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -left-24 -top-24 size-[420px] rounded-full bg-[radial-gradient(closest-side,rgba(16,185,129,0.08),transparent_70%)]" />
        <div className="absolute -right-24 -bottom-24 size-[420px] rounded-full bg-[radial-gradient(closest-side,rgba(56,189,248,0.08),transparent_70%)]" />
      </div>
    </div>
  );
}
