import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiCheck } from "react-icons/fi";
import SiteNavbar from "../layout/site-navbar";
import PageWithSidebar from "../layout/page-with-sidebar";
import { pricingService } from "@/services";




type PlanProps = {
  title: string;
  price: string;
  subtitle?: string;
  button: string;
  features: string[];
  highlight?: boolean;
  label?: string;
  labelClassName?: string;
  pop?: boolean;
  popMode?: "hover" | "always";
};

function PlanCard({ title, price, subtitle, button, features, highlight, label, labelClassName, pop, popMode }: PlanProps) {
  const navigate = useNavigate();
  const isAlways = pop && popMode === "always";
  return (
    <div
      className={`relative group transition-transform duration-200 ${
        highlight ? "rounded-[26px] p-1 bg-gradient-to-b from-sky-500/40 to-cyan-500/40" : ""
      } ${pop ? (isAlways ? "-translate-y-0.5 scale-[1.02]" : "hover:-translate-y-0.5 hover:scale-[1.02]") : ""}`}
    >
      {pop ? (
        <div className={`pointer-events-none absolute -inset-3 rounded-[28px] bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.18),transparent_60%)] blur-2xl ${isAlways ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity`} />
      ) : null}
      <div
        className={`relative rounded-2xl bg-[#0f1629] border border-white/10 px-8 py-8 h-full flex flex-col ${
          highlight ? "shadow-[0_0_50px_0_rgba(56,189,248,0.6)] border-sky-500/30" : ""
        } ${pop ? (isAlways ? "ring-1 ring-cyan-400/40 shadow-[0_18px_50px_rgba(56,189,248,0.35)]" : "ring-1 ring-white/10 group-hover:ring-cyan-400/40 group-hover:shadow-[0_18px_50px_rgba(56,189,248,0.35)]") : ""}`}
      >
        {label ? (
          <div className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded-full text-xs px-3 py-1 ${labelClassName ?? "bg-sky-500 text-white shadow"}`}>
            {label}
          </div>
        ) : null}
        <div className="min-h-[140px]">
          <div className="text-white text-lg font-semibold">{title}</div>
          <div className="mt-3 flex items-end gap-1">
            <span className="text-4xl font-bold text-white">{price}</span>
            {subtitle ? <span className="text-sm text-white/70">{subtitle}</span> : null}
          </div>
          <p className="mt-2 text-sm text-white/60">
            {title === "Free" && "Perfect for getting started."}
            {title === "Starter" && "Ideal for first-time job seekers."}
            {title === "Premium" && "For professionals aiming high."}
            {title === "Pro" && "For serious career builders."}
            {title === "Enterprise" && "For teams and organizations."}
          </p>
        </div>
        <button
          onClick={() => {
            try {
              sessionStorage.setItem("selectedPlan", JSON.stringify({ title, price, subtitle }));
            } catch {}
            navigate("/subscribe");
          }}
          className={`mt-6 w-full rounded-lg px-5 py-3.5 text-base font-medium cursor-pointer bg-[#0e1526] text-white hover:bg-[#131d35] border border-white/12`}
        >
          {button}
        </button>
        <ul className="mt-6 space-y-3 text-base">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-2 text-white/85">
              <FiCheck className="text-sky-400" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

type PlanData = {
  title: string;
  price: string;
  subtitle?: string;
  button: string;
  features: string[];
  highlight?: boolean;
  label?: string;
};

const defaultPlans: PlanData[] = [
  {
    title: "Free",
    price: "$0",
    subtitle: "/ forever",
    button: "Get Started",
    features: ["5 AI Credits", "Basic Templates", "Standard Support"],
  },
  {
    title: "Starter",
    price: "$9.99",
    subtitle: "/ 50 credits",
    button: "Get Starter",
    features: ["50 AI Credits", "All Templates", "Priority Support"],
  },
  {
    title: "Premium",
    price: "$29.99",
    subtitle: "/ 200 credits",
    button: "Get Premium",
    features: ["200 AI Credits", "AI Cover Letters", "Premium Support"],
    highlight: true,
    label: "Most Popular",
  },
  {
    title: "Pro",
    price: "$49.99",
    subtitle: "/ 500 credits",
    button: "Get Pro",
    features: ["500 AI Credits", "Interview Prep", "24/7 VIP Support"],
  },
];

export function PricingSection() {
  const [plans, setPlans] = useState<PlanData[]>(defaultPlans);

  useEffect(() => {
    pricingService.listPlans().then((data) => {
      if (data && data.length > 0) {
        setPlans(data.map((p) => ({
          id: p.id,
          title: p.name,
          price: p.price === 0 ? "Free" : `$${p.price}`,
          subtitle: `/ ${p.credits} credits`,
          button: `Get ${p.name}`,
          features: p.features,
          highlight: p.is_popular,
          label: p.is_popular ? "Most Popular" : undefined,
        })));
      }
    }).catch(() => {});
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-4 pt-4 pb-20 text-center">
      <h1 className="mt-2 text-2xl md:text-3xl font-extrabold tracking-tight">Intelligent Pricing for Your Success</h1>
      <div className="h-[3px] w-28 bg-blue-500/80 mx-auto mt-4 rounded-full" />
      <p className="mt-4 max-w-3xl mx-auto text-white/70">
        Our AI-powered platform operates on a credit-based system, ensuring you pay as you grow and only pay for the features you actually use. Start for free and scale up as your career grows.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <PlanCard
            key={plan.title}
            title={plan.title}
            price={plan.price}
            subtitle={plan.subtitle}
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
