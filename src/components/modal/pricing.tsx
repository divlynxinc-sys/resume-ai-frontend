import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { FiCheck } from "react-icons/fi";
import SiteNavbar from "../layout/site-navbar";
import PageWithSidebar from "../layout/page-with-sidebar";
import LaunchOfferBanner from "../layout/launch-offer-banner";
import { usePlan } from "@/contexts/PlanContext";
import { pricingService } from "@/services";
import { settingsService } from "@/services/settings";
import { LAUNCH_OFFER, isLaunchOfferActive, launchOfferPriceLabel } from "@/lib/launch-offer";




type PlanProps = {
  title: string;
  slug: string;
  price: string;
  /** Pre-discount price, shown struck through next to `price` during the launch offer. */
  originalPrice?: string;
  subtitle?: string;
  blurb?: string;
  button: string;
  features: string[];
  highlight?: boolean;
  label?: string;
  labelClassName?: string;
  pop?: boolean;
  popMode?: "hover" | "always";
};

function PlanCard({
  title,
  slug,
  price,
  originalPrice,
  subtitle,
  blurb,
  button,
  features,
  highlight,
  label,
  isCurrent,
  hasActiveSubscription,
  onSwitch,
}: PlanProps & {
  blurb?: string;
  isCurrent?: boolean;
  hasActiveSubscription?: boolean;
  onSwitch?: (slug: string, title: string, price: string, subtitle?: string) => void;
}) {
  const navigate = useNavigate();
  const isSwitchTarget = !!hasActiveSubscription && !isCurrent;
  return (
    <div className="relative group transition-all duration-300">
      <div
        className="relative rounded-2xl px-7 py-8 h-full flex flex-col text-left transition-all duration-300 bg-[var(--app-surface)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]"
        style={{
          color: "var(--app-fg)",
          border: isCurrent
            ? "2px solid #10B981"
            : highlight
            ? "2px solid var(--accent)"
            : "1px solid var(--app-border)",
        }}
      >
        {isCurrent ? (
          <div
            className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full text-[10px] font-semibold tracking-[0.14em] uppercase px-3 py-1 bg-emerald-500"
            style={{ color: "#ffffff" }}
          >
            Current plan
          </div>
        ) : label ? (
          <div
            className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full text-[10px] font-semibold tracking-[0.14em] uppercase px-3 py-1 bg-[var(--accent)]"
            style={{ color: "#ffffff" }}
          >
            {label}
          </div>
        ) : null}
        <div>
          <div
            className="font-display text-2xl font-medium tracking-tight"
            style={{ color: "var(--app-fg)" }}
          >
            {title}
          </div>
          {blurb ? (
            <p
              className="mt-2 text-sm leading-relaxed"
              style={{ color: "var(--app-fg-muted)" }}
            >
              {blurb}
            </p>
          ) : null}
          <div className="mt-5 flex items-baseline gap-1.5">
            {originalPrice && (
              <span
                className="font-display text-2xl font-light tracking-tight line-through"
                style={{ color: "var(--app-fg-muted)" }}
              >
                {originalPrice}
              </span>
            )}
            <span
              className="font-display text-5xl font-light tracking-tight"
              style={{ color: "var(--app-fg)" }}
            >
              {price}
            </span>
            {subtitle ? (
              <span
                className="text-sm"
                style={{ color: "var(--app-fg-muted)" }}
              >
                {subtitle}
              </span>
            ) : null}
          </div>
        </div>

        <ul className="mt-7 space-y-3 text-sm flex-1">
          {features.map((f) => (
            <li
              key={f}
              className="flex items-start gap-2.5"
              style={{ color: "var(--app-fg-muted)" }}
            >
              <FiCheck
                className="mt-0.5 shrink-0"
                style={{ color: "var(--accent)" }}
              />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        <button
          onClick={() => {
            if (isCurrent) return;
            if (isSwitchTarget) {
              onSwitch?.(slug, title, price, subtitle);
              return;
            }
            try {
              sessionStorage.setItem("selectedPlan", JSON.stringify({ title, slug, price, subtitle }));
            } catch {}
            const isAuthed = !!localStorage.getItem("accessToken");
            navigate(isAuthed ? "/subscribe" : "/login?next=/subscribe");
          }}
          disabled={isCurrent}
          className="mt-7 w-full rounded-lg px-5 py-3 text-sm font-medium transition-colors disabled:cursor-default"
          style={
            isCurrent
              ? { backgroundColor: "var(--app-surface-2)", color: "var(--app-fg-muted)", border: "1px solid var(--app-border)", cursor: "default" }
              : highlight
              ? { backgroundColor: "var(--accent)", color: "#ffffff", cursor: "pointer" }
              : { backgroundColor: "var(--app-surface)", color: "var(--app-fg)", border: "1px solid var(--app-border-strong)", cursor: "pointer" }
          }
        >
          {isCurrent ? "Current plan" : isSwitchTarget ? "Switch to this plan" : button}
        </button>
      </div>
    </div>
  );
}

type PlanData = {
  title: string;
  slug: string;
  price: string;
  subtitle?: string;
  blurb?: string;
  button: string;
  features: string[];
  highlight?: boolean;
  label?: string;
};

const FEATURE_LIST = [
  "AI-tailored resumes",
  "AI-tailored cover letters",
  "HR email drafts",
  "Q&A Prep",
  "ATS optimization insights",
];

const defaultPlans: PlanData[] = [
  {
    title: "Weekly",
    slug: "weekly",
    price: "$14.99",
    subtitle: "/ week",
    blurb: "Try the full toolkit on a short-term sprint.",
    button: "Get Weekly",
    features: FEATURE_LIST,
  },
  {
    title: "Monthly",
    slug: "monthly",
    price: "$35.99",
    subtitle: "/ month",
    blurb: "Best for an active job search across many roles.",
    button: "Get Monthly",
    features: FEATURE_LIST,
    highlight: true,
    label: "Most Popular",
  },
  {
    title: "3 months",
    slug: "three_months",
    price: "$79.99",
    subtitle: "/ 3 months",
    blurb: "Best value for a longer search — save vs monthly.",
    button: "Get 3 months",
    features: FEATURE_LIST,
  },
];

type PendingSwitch = {
  slug: string;
  title: string;
  price: string;
  subtitle?: string;
};

export function PricingSection() {
  const { currentPlan } = usePlan();
  const [plans, setPlans] = useState<PlanData[]>(defaultPlans);
  const [currentPlanName, setCurrentPlanName] = useState<string | null>(currentPlan);

  // Switch-confirmation modal state
  const [pendingSwitch, setPendingSwitch] = useState<PendingSwitch | null>(null);
  const [switching, setSwitching] = useState(false);
  const [switchError, setSwitchError] = useState<string | null>(null);

  useEffect(() => {
    setCurrentPlanName(currentPlan);
  }, [currentPlan]);

  // Backend-driven plans use a different schema (credit-based). Until the
  // backend matches the new time-based plan structure, keep the static
  // defaults so the landing/pricing pages stay consistent.
  useEffect(() => {
    if (false as boolean) {
      pricingService.listPlans().then((data) => {
        if (data && data.length > 0) {
          setPlans(data.map((p) => ({
            title: p.name,
            slug: p.slug,
            price: p.price === 0 ? "Free" : `$${p.price}`,
            subtitle: `/ ${p.credits} credits`,
            button: `Get ${p.name}`,
            features: p.features,
            highlight: p.is_popular,
            label: p.is_popular ? "Most Popular" : undefined,
          })));
        }
      }).catch(() => {});
    }
  }, []);

  // Fetch the user's current plan so we can mark the right card. Only when
  // logged in — anonymous visitors see the regular CTA buttons.
  useEffect(() => {
    if (!localStorage.getItem("accessToken")) return;

    let cancelled = false;
    const fetchPlan = () => {
      settingsService
        .getAccountSummary()
        .then((res) => {
          if (cancelled) return;
          setCurrentPlanName(res.current_plan);
        })
        .catch(() => {});
    };

    fetchPlan();
    const onPlanUpdated = () => fetchPlan();
    window.addEventListener("plan-updated", onPlanUpdated);
    return () => {
      cancelled = true;
      window.removeEventListener("plan-updated", onPlanUpdated);
    };
  }, []);

  const normalizedCurrent = (currentPlanName || "").trim().toLowerCase();
  const hasActiveSubscription = !!normalizedCurrent;

  // Launch offer: show the discounted price with the original struck through.
  // Polar charges the discounted amount (backend pre-applies POLAR_DISCOUNT_ID).
  const offerActive = isLaunchOfferActive();
  const displayPlans = offerActive
    ? plans.map((p) => ({
        ...p,
        price: launchOfferPriceLabel(p.price),
        originalPrice: p.price,
      }))
    : plans.map((p) => ({ ...p, originalPrice: undefined as string | undefined }));

  const handleSwitchRequest = (slug: string, title: string, price: string, subtitle?: string) => {
    setSwitchError(null);
    setPendingSwitch({ slug, title, price, subtitle });
  };

  const confirmSwitch = async () => {
    if (!pendingSwitch) return;
    setSwitching(true);
    setSwitchError(null);
    try {
      const res = await pricingService.switchSubscription(pendingSwitch.slug);
      setCurrentPlanName(res.current_plan);
      window.dispatchEvent(new CustomEvent("plan-updated"));
      setPendingSwitch(null);
    } catch (err) {
      setSwitchError(err instanceof Error ? err.message : "Failed to switch plan.");
    } finally {
      setSwitching(false);
    }
  };

  return (
    <section className="mx-auto max-w-6xl px-6 pt-4 pb-20 text-center">
      <div className="text-xs font-medium tracking-[0.18em] uppercase text-[var(--accent-text)] mb-3">Pricing</div>
      <h1 className="font-display text-3xl md:text-5xl font-light tracking-tight text-[var(--app-fg)] leading-tight">
        Pick a plan, <span className="italic">land the role.</span>
      </h1>
      <p className="mt-5 max-w-2xl mx-auto text-[var(--app-fg-muted)] leading-relaxed">
        Pick a plan to add AI-generated resumes, cover letters, emails, and Q&amp;A Prep to each application.
      </p>
      {offerActive && (
        <div
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/40 bg-indigo-500/10 px-4 py-1.5 text-sm font-medium"
          style={{ color: "var(--app-fg)" }}
        >
          🎉 {LAUNCH_OFFER.label}: {LAUNCH_OFFER.percentOff}% off all plans — already
          applied at checkout.
        </div>
      )}

      <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 items-stretch max-w-5xl mx-auto">
        {displayPlans.map((plan) => (
          <PlanCard
            key={plan.title}
            title={plan.title}
            slug={plan.slug}
            price={plan.price}
            originalPrice={plan.originalPrice}
            subtitle={plan.subtitle}
            blurb={plan.blurb}
            button={plan.button}
            features={plan.features}
            highlight={plan.highlight}
            label={plan.label}
            isCurrent={!!normalizedCurrent && plan.title.trim().toLowerCase() === normalizedCurrent}
            hasActiveSubscription={hasActiveSubscription}
            onSwitch={handleSwitchRequest}
          />
        ))}
      </div>

      {pendingSwitch && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4">
          <div
            className="w-full max-w-md rounded-2xl p-6 text-left"
            style={{
              backgroundColor: "var(--app-surface)",
              border: "1px solid var(--app-border)",
              boxShadow: "var(--shadow-pop)",
              color: "var(--app-fg)",
            }}
          >
            <h3 className="text-lg font-semibold">Switch to {pendingSwitch.title}?</h3>
            <p className="mt-2 text-sm" style={{ color: "var(--app-fg-muted)" }}>
              You're currently on the <strong>{currentPlanName}</strong> plan. Switching to{" "}
              <strong>{pendingSwitch.title}</strong> ({pendingSwitch.price}
              {pendingSwitch.subtitle ? ` ${pendingSwitch.subtitle}` : ""}) will update your existing
              subscription. Polar will prorate the difference on your next invoice — no second
              checkout, no double-charge.
            </p>
            {switchError && (
              <div className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-600 dark:text-rose-300">
                {switchError}
              </div>
            )}
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setPendingSwitch(null)}
                disabled={switching}
                className="rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60"
                style={{
                  backgroundColor: "var(--btn-secondary-bg)",
                  border: "1px solid var(--btn-secondary-border)",
                  color: "var(--btn-secondary-text)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmSwitch}
                disabled={switching}
                className="rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                style={{ backgroundColor: "var(--accent)" }}
              >
                {switching ? "Switching…" : `Switch to ${pendingSwitch.title}`}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}

export default function PricingScreen() {
  return (
    <div className="min-h-screen w-full bg-[var(--app-bg)] text-white">
      <SiteNavbar />
      <PageWithSidebar mainClassName="">
        <PricingSection />
      </PageWithSidebar>
    </div>
  );
}
