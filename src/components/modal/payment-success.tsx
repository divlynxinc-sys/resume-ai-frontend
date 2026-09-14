import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FiCheck } from "react-icons/fi";
import SiteNavbar from "../layout/site-navbar";
import { interviewCreditsService, pricingService } from "@/services";
import { useConfettiBurst } from "@/hooks/use-confetti-burst";
import { INTERVIEW_CREDITS_UPDATED_EVENT } from "@/lib/interview-credits";

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
    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
      <span className="size-4 grid place-items-center rounded-full bg-emerald-500 text-white">
        ✓
      </span>
      Payment Successful
    </div>
  );
}

function ProBadge() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/40 bg-indigo-500/10 px-3 py-1 text-indigo-700 dark:text-indigo-300 text-xs font-medium">
      <span className="size-4 grid place-items-center rounded-full bg-indigo-500 text-white">★</span>
      Pro
    </div>
  );
}

type SyncState =
  | { status: "pending" }
  | { status: "ok"; planName: string | null }
  | { status: "error"; message: string };

type CreditsSyncState =
  | { status: "pending" }
  | { status: "ok"; credits: number; balance: number }
  | { status: "delayed"; balance: number }
  | { status: "error"; message: string };

// Polar can redirect back a few seconds before the order is marked paid, so poll.
const CREDITS_SYNC_ATTEMPTS = 8;
const CREDITS_SYNC_INTERVAL_MS = 2500;

/** /success?purchase=interview_credits — a one-time AI Interview credit pack, not a plan. */
function CreditsPurchaseSuccess({ checkoutId }: { checkoutId: string | null }) {
  const confettiRef = useConfettiBurst();
  const [sync, setSync] = useState<CreditsSyncState>({ status: "pending" });

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;
    const attempt = async (n: number) => {
      try {
        const res = await interviewCreditsService.sync(checkoutId);
        if (cancelled) return;
        if (res.checkout_confirmed) {
          setSync({ status: "ok", credits: res.checkout_credits, balance: res.balance });
          window.dispatchEvent(new CustomEvent(INTERVIEW_CREDITS_UPDATED_EVENT));
          return;
        }
        if (n + 1 >= CREDITS_SYNC_ATTEMPTS) {
          setSync({ status: "delayed", balance: res.balance });
          return;
        }
        timer = window.setTimeout(() => void attempt(n + 1), CREDITS_SYNC_INTERVAL_MS);
      } catch (err) {
        if (cancelled) return;
        setSync({ status: "error", message: err instanceof Error ? err.message : "Couldn't confirm your purchase." });
      }
    };
    void attempt(0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [checkoutId]);

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: "var(--app-bg)", color: "var(--app-fg)" }}>
      <SiteNavbar />
      <canvas ref={confettiRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-50" />
      <main className="mx-auto max-w-2xl px-6 py-12 text-center">
        <SuccessBadge />
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight md:text-4xl">
          {sync.status === "ok" ? `${sync.credits} interview credits added` : "Thanks for your purchase!"}
        </h1>
        <p className="mt-2" style={{ color: "var(--app-fg-muted)" }}>
          Each credit is one live AI interview plus its full readiness report. Credits never expire.
        </p>

        <div
          className="mt-8 rounded-2xl p-6 text-left"
          style={{ backgroundColor: "var(--app-surface)", border: "1px solid var(--app-border)", boxShadow: "var(--shadow-soft)" }}
          aria-live="polite"
        >
          {sync.status === "pending" && (
            <span className="inline-flex items-center gap-2 text-sm" style={{ color: "var(--app-fg-muted)" }}>
              <span className="inline-block size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Adding credits to your account…
            </span>
          )}
          {sync.status === "ok" && (
            <p className="text-sm">
              You now have <strong>{sync.balance}</strong> interview {sync.balance === 1 ? "credit" : "credits"}.
            </p>
          )}
          {sync.status === "delayed" && (
            <p className="text-sm" style={{ color: "var(--app-fg-muted)" }}>
              Payment received. Your credits are still on their way and usually arrive within a minute. You currently
              have <strong>{sync.balance}</strong>. Refresh this page, or check AI Interviews shortly.
            </p>
          )}
          {sync.status === "error" && (
            <p className="text-sm text-rose-600 dark:text-rose-300">
              We couldn't confirm your credits automatically ({sync.message}). They'll appear once your payment
              clears. Refresh this page to check again.
            </p>
          )}
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/ai-interviews/new"
              className="rounded-lg bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-500/30 hover:bg-emerald-400"
            >
              Start an interview
            </Link>
            <Link
              to="/ai-interviews"
              className="rounded-lg px-5 py-2 text-sm font-medium"
              style={{
                backgroundColor: "var(--btn-secondary-bg)",
                border: "1px solid var(--btn-secondary-border)",
                color: "var(--btn-secondary-text)",
              }}
            >
              Back to AI Interviews
            </Link>
          </div>
        </div>
        <p className="mt-4 text-xs" style={{ color: "var(--app-fg-muted)" }}>
          You'll receive an email receipt from Polar shortly.
        </p>
      </main>
    </div>
  );
}

export default function PaymentSuccessScreen() {
  const [params] = useSearchParams();
  if (params.get("purchase") === "interview_credits") {
    return <CreditsPurchaseSuccess checkoutId={params.get("checkout_id")} />;
  }
  return <SubscriptionSuccess />;
}

function SubscriptionSuccess() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  const confettiRef = useConfettiBurst();

  const plan: Plan | null = useMemo(() => {
    try {
      const raw = sessionStorage.getItem("selectedPlan");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const [sync, setSync] = useState<SyncState>({ status: "pending" });

  // Pull subscription state from Polar and reconcile the local DB.
  // Polar webhooks can't reach localhost in dev, and even in prod they can lag
  // a few seconds — this call closes that gap so the UI updates immediately.
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const res = await pricingService.syncPolarSubscription();
        if (cancelled) return;
        setSync({ status: "ok", planName: res.current_plan });
        // Broadcast so the navbar / pricing page refetch their plan info.
        window.dispatchEvent(new CustomEvent("plan-updated"));
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Failed to confirm subscription.";
        setSync({ status: "error", message });
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const title = plan?.title ?? "Your Plan";
  const price = plan?.price ?? "$—";
  const subtitle = plan?.subtitle ?? "";
  const features = getFeaturesForPlan(title);
  const isPro = title.toLowerCase() === "pro";

  return (
    <div
      className="min-h-screen w-full"
      style={{ backgroundColor: "var(--app-bg)", color: "var(--app-fg)" }}
    >
      <SiteNavbar />

      {/* Confetti overlay — fixed, non-interactive */}
      <canvas
        ref={confettiRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-50"
      />

      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 justify-center">
            <SuccessBadge />
            {isPro && <ProBadge />}
          </div>
          <h1 className="mt-4 text-3xl md:text-4xl font-extrabold tracking-tight">
            You're all set!
          </h1>
          <p className="mt-2" style={{ color: "var(--app-fg-muted)" }}>
            Thank you for subscribing. Your {title} plan is now active.
          </p>
          {isPro && (
            <p className="mt-1 font-semibold text-indigo-600 dark:text-indigo-300">
              You're Pro now.
            </p>
          )}
        </div>

        {/* Summary card */}
        <div className="mt-8 relative rounded-[20px] p-px bg-gradient-to-b from-emerald-400/30 via-sky-400/20 to-indigo-500/30">
          <div
            className="rounded-[18px] p-6 sm:p-8"
            style={{
              backgroundColor: "var(--app-surface)",
              border: "1px solid var(--app-border)",
              color: "var(--app-fg)",
              boxShadow: "var(--shadow-soft)",
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div>
                <div className="text-lg font-semibold">{title}</div>
                <div className="mt-1 flex items-end gap-2">
                  <div className="text-3xl font-bold">{price}</div>
                  {subtitle ? (
                    <div className="text-sm" style={{ color: "var(--app-fg-muted)" }}>
                      {subtitle}
                    </div>
                  ) : null}
                </div>
              </div>
              <Link
                to="/dashboard"
                className="rounded-lg bg-emerald-500 hover:bg-emerald-400 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-500/30"
              >
                Go to Dashboard
              </Link>
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-semibold">What's included</h2>
              <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {features.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2"
                    style={{ color: "var(--app-fg)" }}
                  >
                    <FiCheck className="text-emerald-500" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="mt-8 rounded-lg px-4 py-3 text-xs"
              style={{
                backgroundColor: "var(--app-surface-2)",
                border: "1px solid var(--app-border)",
                color: "var(--app-fg-muted)",
              }}
            >
              You will receive an email receipt shortly. Manage your subscription anytime from
              Account Settings.
            </div>

            {/* Sync status — reflects whether the backend has caught up with Polar yet. */}
            <div className="mt-3 text-xs">
              {sync.status === "pending" && (
                <span className="inline-flex items-center gap-2" style={{ color: "var(--app-fg-muted)" }}>
                  <span className="inline-block size-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  Confirming your subscription…
                </span>
              )}
              {sync.status === "ok" && sync.planName && (
                <span className="text-emerald-700 dark:text-emerald-300">
                  Your <strong>{sync.planName}</strong> plan is active on your account.
                </span>
              )}
              {sync.status === "ok" && !sync.planName && (
                <span style={{ color: "var(--app-fg-muted)" }}>
                  Payment received — your plan should appear shortly. If it doesn't, try refreshing.
                </span>
              )}
              {sync.status === "error" && (
                <span className="text-rose-600 dark:text-rose-300">
                  Couldn't confirm subscription automatically ({sync.message}). Refresh the page or visit your settings.
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/templates"
            className="inline-block rounded-full px-5 py-2.5 text-sm transition-colors"
            style={{
              backgroundColor: "var(--btn-secondary-bg)",
              border: "1px solid var(--btn-secondary-border)",
              color: "var(--btn-secondary-text)",
            }}
          >
            Explore Templates
          </Link>
        </div>
      </main>

      {/* Decorative glows — subtle in both themes */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 -top-24 size-[420px] rounded-full bg-[radial-gradient(closest-side,rgba(16,185,129,0.10),transparent_70%)]" />
        <div className="absolute -right-24 -bottom-24 size-[420px] rounded-full bg-[radial-gradient(closest-side,rgba(56,189,248,0.10),transparent_70%)]" />
      </div>
    </div>
  );
}
