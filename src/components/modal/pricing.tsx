import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiCheck } from "react-icons/fi";
import SiteNavbar from "../layout/site-navbar";
import PageWithSidebar from "../layout/page-with-sidebar";
import { pricingService } from "@/services";




type PlanProps = {
  title: string;
  slug: string;
  price: string;
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

function PlanCard({ title, slug, price, subtitle, blurb, button, features, highlight, label }: PlanProps & { blurb?: string }) {
  const navigate = useNavigate();
  return (
    <div className="relative group transition-all duration-300">
      <div
        className="relative rounded-2xl px-7 py-8 h-full flex flex-col text-left transition-all duration-300 bg-[var(--app-surface)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]"
        style={{
          color: "var(--app-fg)",
          border: highlight
            ? "2px solid var(--accent)"
            : "1px solid var(--app-border)",
        }}
      >
        {label ? (
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
            try {
              sessionStorage.setItem("selectedPlan", JSON.stringify({ title, slug, price, subtitle }));
            } catch {}
            const isAuthed = !!localStorage.getItem("accessToken");
            navigate(isAuthed ? "/subscribe" : "/login?next=/subscribe");
          }}
          className="mt-7 w-full rounded-lg px-5 py-3 text-sm font-medium cursor-pointer transition-colors"
          style={
            highlight
              ? { backgroundColor: "var(--accent)", color: "#ffffff" }
              : { backgroundColor: "var(--app-surface)", color: "var(--app-fg)", border: "1px solid var(--app-border-strong)" }
          }
        >
          {button}
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
  "Q&A answers",
  "PDF & DOCX downloads",
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

export function PricingSection() {
  const [plans, setPlans] = useState<PlanData[]>(defaultPlans);

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

  return (
    <section className="mx-auto max-w-6xl px-6 pt-4 pb-20 text-center">
      <div className="text-xs font-medium tracking-[0.18em] uppercase text-[var(--accent-text)] mb-3">Pricing</div>
      <h1 className="font-display text-3xl md:text-5xl font-light tracking-tight text-[var(--app-fg)] leading-tight">
        Pick a plan, <span className="italic">land the role.</span>
      </h1>
      <p className="mt-5 max-w-2xl mx-auto text-[var(--app-fg-muted)] leading-relaxed">
        Pick a plan to add AI-generated resumes, cover letters, emails, and Q&amp;A answers to each application.
      </p>

      <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 items-stretch max-w-5xl mx-auto">
        {plans.map((plan) => (
          <PlanCard
            key={plan.title}
            title={plan.title}
            slug={plan.slug}
            price={plan.price}
            subtitle={plan.subtitle}
            blurb={plan.blurb}
            button={plan.button}
            features={plan.features}
            highlight={plan.highlight}
            label={plan.label}
          />
        ))}
      </div>
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
