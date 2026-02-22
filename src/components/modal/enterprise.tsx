import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiCheck } from "react-icons/fi";
import SiteNavbar from "../layout/site-navbar";

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80">
      {children}
    </span>
  );
}

type PlanProps = {
  title: string;
  price: string;
  subtitle?: string;
  button: string;
  features: string[];
  highlight?: boolean;
  label?: string;
  pop?: boolean;
  popMode?: "hover" | "always";
};

function PlanCard({ title, price, subtitle, button, features, highlight, label, pop, popMode }: PlanProps) {
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
        className={`relative rounded-2xl bg-[#0F1629] border border-white/10 px-6 py-6 h-full ${
          highlight ? "shadow-[0_0_40px_0_rgba(56,189,248,0.25)]" : ""
        } ${pop ? (isAlways ? "ring-1 ring-cyan-400/40 shadow-[0_18px_50px_rgba(56,189,248,0.35)]" : "ring-1 ring-white/10 group-hover:ring-cyan-400/40 group-hover:shadow-[0_18px_50px_rgba(56,189,248,0.35)]") : ""}`}
      >
        {label ? (
          <div className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded-full text-xs px-3 py-1 bg-white text-[#0b1220] font-bold shadow-[0_8px_20px_rgba(255,255,255,0.25)] border border-white/20`}>
            {label}
          </div>
        ) : null}
        <div className="text-white text-base font-semibold">{title}</div>
        <div className="mt-2.5 flex items-end gap-1">
          <span className="text-3xl font-bold text-white">{price}</span>
          {subtitle ? <span className="text-xs text-white/70">{subtitle}</span> : null}
        </div>
        <p className="mt-2 text-xs text-white/60">
          {title === "Team" && "For growing teams that need centralized billing and controls."}
          {title === "Business" && "Advanced security and support for larger organizations."}
          {title === "Enterprise Plus" && "Maximum scale, compliance, and priority support."}
          {title === "Custom" && "Tailored solutions with bespoke features and SLAs."}
        </p>
        <button
          onClick={() => {
            try {
              sessionStorage.setItem("selectedPlan", JSON.stringify({ title, price, subtitle }));
            } catch {}
            navigate("/contact-us");
          }}
          className={`mt-5 w-full rounded-lg px-4 py-2.5 text-sm font-medium ${highlight ? "bg-sky-500 text-white hover:bg-sky-400" : "bg-[#0C1426] text-white hover:bg-[#0D172B] border border-white/12"}`}
        >
          {button}
        </button>
        <ul className="mt-5 space-y-2.5 text-sm">
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

export default function EnterpriseScreen() {
  return (
    <div className="min-h-screen w-full bg-[var(--app-bg)] text-white">
      <SiteNavbar />
      <section className="mx-auto max-w-6xl px-4 pt-12 pb-20">
        <div className="flex items-center gap-3">
          <Badge>SCALABLE</Badge>
          <Badge>SECURE</Badge>
          <Badge>TEAM-READY</Badge>
        </div>
        <h1 className="mt-6 text-4xl md:text-6xl font-extrabold tracking-tight">Enterprise Plans</h1>
        <p className="mt-3 max-w-3xl text-white/70">
          Empower your organization with AI-assisted resume tooling, centralized administration, and enterprise-grade security.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <PlanCard
            title="Team"
            price="From $199/mo"
            subtitle="up to 10 seats"
            button="Talk to Sales"
            features={["Centralized Billing", "Role-Based Access", "Shared Templates", "Standard Support"]}
            pop
            popMode="hover"
          />
          <PlanCard
            title="Business"
            price="From $499/mo"
            subtitle="up to 50 seats"
            button="Talk to Sales"
            features={["SSO (SAML/OAuth)", "Advanced Admin Controls", "Audit Logs", "Priority Support"]}
            highlight
            label="Most Popular"
            pop
            popMode="always"
          />
          <PlanCard
            title="Enterprise Plus"
            price="Custom"
            subtitle="unlimited seats"
            button="Contact Sales"
            features={["Data Residency Options", "Custom Integrations", "Dedicated Manager", "Premier Support"]}
            pop
            popMode="hover"
          />
        </div>

        <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <h3 className="text-xl font-semibold">Need something custom?</h3>
          <p className="mt-2 text-white/70">We work with organizations of all sizes. Let us tailor a package that fits your workflows, compliance requirements, and growth plans.</p>
          <div className="mt-4">
            <Link to="/contact-us" className="inline-flex items-center rounded-lg bg-[oklch(0.488_0.243_264.376)] px-4 py-2 text-sm text-white">Contact Sales</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
