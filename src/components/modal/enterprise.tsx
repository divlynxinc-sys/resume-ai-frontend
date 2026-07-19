import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Building2,
  Check,
  ChevronRight,
  Clock3,
  Crown,
  Headphones,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  UsersRound,
  Workflow,
} from "lucide-react";
import SiteFooter from "../layout/site-footer";
import SiteNavbar from "../layout/site-navbar";

type Plan = {
  name: string;
  price: string;
  seats: string;
  summary: string;
  action: string;
  features: string[];
  featured?: boolean;
};

const PLANS: Plan[] = [
  {
    name: "Team",
    price: "$199",
    seats: "Up to 10 seats",
    summary: "A focused workspace for growing teams building consistent candidate experiences.",
    action: "Talk to Sales",
    features: ["Centralized billing", "Role-based access", "Shared resume templates", "Standard support"],
  },
  {
    name: "Business",
    price: "$499",
    seats: "Up to 50 seats",
    summary: "Advanced administration and security for organizations ready to scale.",
    action: "Talk to Sales",
    features: ["SSO with SAML or OAuth", "Advanced admin controls", "Organization audit logs", "Priority support"],
    featured: true,
  },
  {
    name: "Enterprise Plus",
    price: "Custom",
    seats: "Flexible seat count",
    summary: "A tailored partnership for complex workflows, compliance needs, and global teams.",
    action: "Contact Sales",
    features: ["Data residency options", "Custom integrations", "Dedicated account manager", "Premier support"],
  },
];

const CAPABILITIES = [
  {
    icon: UsersRound,
    title: "One workspace, every team",
    copy: "Organize access, shared templates, and team-wide resume standards from a central workspace.",
  },
  {
    icon: LockKeyhole,
    title: "Controls that scale",
    copy: "Support authentication, permissions, and oversight requirements as your organization grows.",
  },
  {
    icon: Workflow,
    title: "Built around your workflow",
    copy: "Connect the tools and processes your teams already rely on with tailored implementation support.",
  },
  {
    icon: Headphones,
    title: "A team behind your team",
    copy: "Get practical help with evaluation, onboarding, adoption, and the details of deployment.",
  },
];

const ROLLOUT = [
  ["Discover", "We learn your team structure, workflows, and goals."],
  ["Configure", "We shape access, standards, and integrations around you."],
  ["Launch", "Your organization rolls out with hands-on guidance."],
];

function Feature({ children }: { children: string }) {
  return (
    <li className="flex items-start gap-3 text-sm text-[var(--app-fg-muted)]">
      <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent-text)]">
        <Check className="size-3" strokeWidth={2.8} />
      </span>
      <span>{children}</span>
    </li>
  );
}

function PlanCard({ plan, onSelect }: { plan: Plan; onSelect: (plan: Plan) => void }) {
  return (
    <article
      className={`relative flex h-full flex-col overflow-hidden rounded-3xl border bg-white p-6 dark:bg-[var(--app-surface)] sm:p-7 ${
        plan.featured
          ? "border-[var(--accent)] shadow-[var(--shadow-pop)]"
          : "border-[var(--app-border)] shadow-[var(--shadow-soft)]"
      }`}
    >
      {plan.featured ? <div className="absolute inset-x-0 top-0 h-1 bg-[var(--accent)]" aria-hidden="true" /> : null}

      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-[var(--app-fg)]">{plan.name}</h3>
        {plan.featured ? (
          <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--accent-text)]">
            Recommended
          </span>
        ) : null}
      </div>

      <p className="mt-7 flex items-end gap-2">
        <span className="font-display text-5xl font-light tracking-tight text-[var(--app-fg)]">{plan.price}</span>
        {plan.price !== "Custom" ? <span className="pb-1.5 text-sm text-[var(--app-fg-soft)]">/ month</span> : null}
      </p>
      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.13em] text-[var(--accent-text)]">{plan.seats}</p>
      <p className="mt-5 min-h-18 text-sm leading-6 text-[var(--app-fg-muted)]">{plan.summary}</p>

      <ul className="mt-7 flex-1 space-y-3.5">
        {plan.features.map((feature) => (
          <Feature key={feature}>{feature}</Feature>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => onSelect(plan)}
        className={`mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 ${
          plan.featured
            ? "bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:bg-[var(--btn-primary-hover)]"
            : "border border-[var(--btn-secondary-border)] bg-white text-[var(--btn-secondary-text)] hover:bg-[var(--btn-secondary-hover)] dark:bg-[var(--btn-secondary-bg)]"
        }`}
      >
        {plan.action}
        <ArrowRight className="size-4" />
      </button>
    </article>
  );
}

function WorkspacePreview() {
  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div className="absolute -inset-5 rounded-[2.25rem] bg-[var(--accent-soft)] opacity-80 blur-2xl dark:opacity-30" aria-hidden="true" />
      <div className="relative overflow-hidden rounded-3xl border border-[var(--app-border)] bg-white p-2 shadow-[var(--shadow-pop)] dark:bg-[var(--app-surface)]">
        <div className="rounded-[1.25rem] border border-[var(--app-border)] bg-white dark:bg-[var(--app-surface-2)]">
          <div className="flex items-center justify-between border-b border-[var(--app-border)] px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-xl bg-[var(--accent)] text-[var(--btn-primary-text)]">
                <Building2 className="size-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-[var(--app-fg)]">Organization workspace</p>
                <p className="text-xs text-[var(--app-fg-soft)]">People &amp; access overview</p>
              </div>
            </div>
            <span className="rounded-full bg-[var(--pastel-mint)] px-2.5 py-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">Active</span>
          </div>

          <div className="grid gap-3 p-5 sm:grid-cols-2">
            <div className="rounded-2xl border border-[var(--app-border)] bg-white p-4 dark:bg-[var(--app-surface)]">
              <div className="flex items-center justify-between">
                <span className="grid size-8 place-items-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent-text)]">
                  <UsersRound className="size-4" />
                </span>
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">+12%</span>
              </div>
              <p className="mt-5 font-display text-3xl font-light text-[var(--app-fg)]">48</p>
              <p className="mt-1 text-xs text-[var(--app-fg-muted)]">Active team members</p>
            </div>
            <div className="rounded-2xl border border-[var(--app-border)] bg-white p-4 dark:bg-[var(--app-surface)]">
              <div className="flex items-center justify-between">
                <span className="grid size-8 place-items-center rounded-lg bg-[var(--pastel-lavender)] text-[var(--accent-text)]">
                  <BarChart3 className="size-4" />
                </span>
                <span className="text-xs text-[var(--app-fg-soft)]">This month</span>
              </div>
              <p className="mt-5 font-display text-3xl font-light text-[var(--app-fg)]">184</p>
              <p className="mt-1 text-xs text-[var(--app-fg-muted)]">Resumes created</p>
            </div>
          </div>

          <div className="px-5 pb-5">
            <div className="rounded-2xl border border-[var(--app-border)] bg-white p-4 dark:bg-[var(--app-surface)]">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid size-8 place-items-center rounded-lg bg-[var(--pastel-mint)] text-emerald-700 dark:text-emerald-300">
                    <ShieldCheck className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-[var(--app-fg)]">Security controls</p>
                    <p className="text-xs text-[var(--app-fg-soft)]">SSO and role-based access enabled</p>
                  </div>
                </div>
                <ChevronRight className="size-4 text-[var(--app-fg-soft)]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EnterpriseScreen() {
  const navigate = useNavigate();

  const contactSales = (plan?: Plan) => {
    if (plan) {
      try {
        sessionStorage.setItem(
          "selectedPlan",
          JSON.stringify({ title: plan.name, price: plan.price, subtitle: plan.seats }),
        );
      } catch {
        // Contact sales remains available when browser storage is unavailable.
      }
    }
    navigate("/contact-us");
  };

  return (
    <div className="min-h-svh bg-white text-[var(--app-fg)] dark:bg-[var(--app-bg)]">
      <SiteNavbar />

      <main>
        <section className="relative overflow-hidden border-b border-[var(--app-border)] px-6 py-16 sm:py-20 lg:py-24">
          <div className="pointer-events-none absolute -left-48 -top-48 size-[34rem] rounded-full bg-[var(--pastel-lavender)] opacity-50 blur-3xl dark:opacity-20" aria-hidden="true" />
          <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1fr_0.95fr] lg:gap-20">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--app-border)] bg-white px-3.5 py-2 text-xs font-semibold text-[var(--accent-text)] shadow-[var(--shadow-soft)] dark:bg-[var(--app-surface)]">
                <Sparkles className="size-4" />
                Jobsynk AI for organizations
              </div>
              <h1 className="mt-7 max-w-3xl font-display text-4xl font-light leading-[1.04] tracking-tight sm:text-5xl md:text-6xl">
                Your people do their best work with the <span className="italic text-[var(--accent-text)]">right tools.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-[var(--app-fg-muted)] sm:text-lg sm:leading-8">
                Give every team a smarter way to create standout resumes—with the administration, security, and support your organization needs.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => contactSales()}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[var(--btn-primary-bg)] px-6 text-sm font-medium text-[var(--btn-primary-text)] transition-colors hover:bg-[var(--btn-primary-hover)]"
                >
                  Talk to Sales
                  <ArrowRight className="size-4" />
                </button>
                <a
                  href="#plans"
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-[var(--btn-secondary-border)] bg-white px-6 text-sm font-medium text-[var(--btn-secondary-text)] transition-colors hover:bg-[var(--btn-secondary-hover)] dark:bg-[var(--btn-secondary-bg)]"
                >
                  View plans
                </a>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
                {["Scalable", "Secure", "Team-ready"].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2 text-xs font-medium text-[var(--app-fg-muted)]">
                    <Check className="size-4 text-[var(--accent-text)]" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <WorkspacePreview />
          </div>
        </section>

        <section id="plans" className="scroll-mt-24 px-6 py-20 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-text)]">Plans for every stage</p>
                <h2 className="mt-4 font-display text-4xl font-light leading-tight sm:text-5xl">Start focused. Scale without friction.</h2>
              </div>
              <p className="max-w-md text-sm leading-7 text-[var(--app-fg-muted)]">
                Choose the foundation that fits today, with room for stronger controls and deeper support as your organization grows.
              </p>
            </div>

            <div className="mt-12 grid items-stretch gap-6 md:grid-cols-3">
              {PLANS.map((plan) => (
                <PlanCard key={plan.name} plan={plan} onSelect={contactSales} />
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-[var(--app-border)] px-6 py-20 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-text)]">Everything works together</p>
              <h2 className="mt-4 font-display text-4xl font-light sm:text-5xl">Built for the way organizations operate.</h2>
            </div>

            <div className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-[var(--app-border)] bg-[var(--app-border)] sm:grid-cols-2">
              {CAPABILITIES.map((capability) => {
                const Icon = capability.icon;
                return (
                  <article key={capability.title} className="bg-white p-7 dark:bg-[var(--app-surface)] sm:p-8">
                    <span className="grid size-11 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-text)]">
                      <Icon className="size-5" />
                    </span>
                    <h3 className="mt-6 text-lg font-semibold text-[var(--app-fg)]">{capability.title}</h3>
                    <p className="mt-3 max-w-md text-sm leading-7 text-[var(--app-fg-muted)]">{capability.copy}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-6 py-20 sm:py-24">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-20">
            <div>
              <span className="grid size-11 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-text)]">
                <Clock3 className="size-5" />
              </span>
              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-text)]">Guided rollout</p>
              <h2 className="mt-4 font-display text-4xl font-light leading-tight sm:text-5xl">From first conversation to confident launch.</h2>
              <p className="mt-5 text-sm leading-7 text-[var(--app-fg-muted)]">We work alongside your team through evaluation, setup, and adoption.</p>
            </div>

            <ol className="space-y-3">
              {ROLLOUT.map(([title, copy], index) => (
                <li key={title} className="flex gap-5 rounded-2xl border border-[var(--app-border)] bg-white p-5 shadow-[var(--shadow-soft)] dark:bg-[var(--app-surface)] sm:p-6">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-sm font-semibold text-[var(--accent-text)]">{index + 1}</span>
                  <div>
                    <h3 className="text-base font-semibold text-[var(--app-fg)]">{title}</h3>
                    <p className="mt-1.5 text-sm leading-6 text-[var(--app-fg-muted)]">{copy}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="px-6 pb-24">
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-[var(--accent)] bg-[var(--accent-soft)] p-8 dark:bg-[var(--app-surface)] sm:p-12">
            <div className="pointer-events-none absolute -right-20 -top-32 size-80 rounded-full border border-[var(--accent)] opacity-20" aria-hidden="true" />
            <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-text)]">
                  <Crown className="size-4" />
                  Built around your organization
                </span>
                <h2 className="mt-4 font-display text-3xl font-light sm:text-4xl">Need something more tailored?</h2>
                <p className="mt-3 text-sm leading-7 text-[var(--app-fg-muted)]">
                  Tell us about your workflows, compliance needs, integrations, and team size. We’ll shape a package around your organization.
                </p>
              </div>
              <Link
                to="/contact-us"
                className="inline-flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--btn-primary-bg)] px-6 text-sm font-medium text-[var(--btn-primary-text)] transition-colors hover:bg-[var(--btn-primary-hover)] sm:w-auto"
              >
                Contact Sales
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
