import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Database, EyeOff, KeyRound, Lock, MessageCircle, RefreshCw, ShieldCheck, UserCheck } from "lucide-react";
import SiteNavbar from "../layout/site-navbar";
import SiteFooter from "../layout/site-footer";

function SecurityCard({
  icon,
  title,
  description,
  tint,
  iconColor,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  tint: string;
  iconColor: string;
}) {
  return (
    <article className="group rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--app-border-strong)] hover:shadow-[var(--shadow-soft)]">
      <span className={`grid size-11 place-items-center rounded-xl ${iconColor}`} style={{ backgroundColor: tint }}>
        {icon}
      </span>
      <h2 className="mt-5 text-base font-medium tracking-tight text-[var(--app-fg)]">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--app-fg-muted)]">{description}</p>
    </article>
  );
}

const USER_SAFETY_STEPS = [
  "Use a strong, unique password for your Jobsynk AI account.",
  "Never share verification codes or password reset links.",
  "Sign out when using a shared or public device.",
  "Review account activity and report anything unexpected.",
];

export default function SecurityScreen() {
  return (
    <div className="min-h-svh bg-[var(--app-bg)] text-[var(--app-fg)]">
      <SiteNavbar />

      <main>
        <section className="relative overflow-hidden px-6 pb-14 pt-16 text-center sm:pt-20">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute -left-32 -top-40 size-96 rounded-full bg-[var(--pastel-lavender)] opacity-40 blur-3xl" />
            <div className="absolute -right-32 -top-32 size-96 rounded-full bg-[var(--pastel-mint)] opacity-35 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-3.5 py-1.5 text-xs font-medium uppercase tracking-[0.16em] text-[var(--accent-text)]">
              <ShieldCheck className="size-4" />
              Trust &amp; protection
            </div>
            <h1 className="font-display text-4xl font-light tracking-tight text-[var(--app-fg)] sm:text-5xl">
              Security, <span className="italic">built in.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[var(--app-fg-muted)] sm:text-base">
              Jobsynk AI is designed with safeguards that help protect your account, personal information, and resume data throughout your experience.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-6 pb-20">
          <section aria-label="Security practices" className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <SecurityCard
              icon={<Lock className="size-5" />}
              title="Protected connections"
              description="Secure connections help protect information while it moves between your browser and Jobsynk AI."
              tint="var(--accent-soft)"
              iconColor="text-[#3949B5]"
            />
            <SecurityCard
              icon={<KeyRound className="size-5" />}
              title="Account authentication"
              description="Authentication checks and verification flows help prevent unauthorized access to your account."
              tint="var(--pastel-lavender)"
              iconColor="text-[#6A55C7]"
            />
            <SecurityCard
              icon={<EyeOff className="size-5" />}
              title="Privacy-conscious design"
              description="We limit exposure of personal information and provide controls for managing your account data."
              tint="var(--pastel-mint)"
              iconColor="text-[#3F8E5C]"
            />
            <SecurityCard
              icon={<RefreshCw className="size-5" />}
              title="Ongoing safeguards"
              description="We continue reviewing product behavior and security practices as Jobsynk AI evolves."
              tint="var(--pastel-butter)"
              iconColor="text-[#A07820]"
            />
          </section>

          <section className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <article className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-[var(--shadow-soft)] sm:p-8">
              <div className="flex items-start gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-text)]">
                  <Database className="size-5" />
                </span>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--accent-text)]">Your information</p>
                  <h2 className="mt-2 font-display text-2xl font-light text-[var(--app-fg)] sm:text-3xl">Data controls that stay within reach.</h2>
                </div>
              </div>
              <p className="mt-5 text-sm leading-7 text-[var(--app-fg-muted)]">
                Your resume contains information that matters. Jobsynk AI provides account tools for managing profile details, reviewing preferences, and requesting an export of your account data.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/privacy" className="inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--btn-primary-bg)] px-5 text-sm font-medium text-[var(--btn-primary-text)] transition-colors hover:bg-[var(--btn-primary-hover)]">
                  Read Privacy Policy
                  <ArrowRight className="size-4" />
                </Link>
                <Link to="/account" className="inline-flex h-10 items-center rounded-lg border border-[var(--btn-secondary-border)] bg-[var(--btn-secondary-bg)] px-5 text-sm font-medium text-[var(--btn-secondary-text)] transition-colors hover:bg-[var(--btn-secondary-hover)]">
                  Manage Account
                </Link>
              </div>
            </article>

            <article className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-[var(--shadow-soft)] sm:p-8">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-[var(--pastel-mint)] text-[#3F8E5C]">
                  <UserCheck className="size-5" />
                </span>
                <h2 className="font-display text-2xl font-light text-[var(--app-fg)]">Protect your account</h2>
              </div>
              <ul className="mt-6 space-y-4">
                {USER_SAFETY_STEPS.map((step) => (
                  <li key={step} className="flex items-start gap-3 text-sm leading-6 text-[var(--app-fg-muted)]">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[#3F8E5C]" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </article>
          </section>

          <section className="mt-12 rounded-2xl border border-[var(--app-border)] bg-[var(--accent-soft)] p-7 text-center sm:p-9">
            <MessageCircle className="mx-auto size-7 text-[var(--accent-text)]" />
            <h2 className="mt-4 font-display text-2xl font-light text-[var(--app-fg)] sm:text-3xl">See something concerning?</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[var(--app-fg-muted)]">
              If you notice unexpected account activity or have a question about our security practices, contact the Jobsynk AI team. We’re here to help.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to="/contact-us" className="inline-flex h-10 items-center rounded-lg bg-[var(--btn-primary-bg)] px-5 text-sm font-medium text-[var(--btn-primary-text)] transition-colors hover:bg-[var(--btn-primary-hover)]">
                Contact Security Team
              </Link>
              <Link to="/help-center" className="inline-flex h-10 items-center rounded-lg border border-[var(--btn-secondary-border)] bg-[var(--btn-secondary-bg)] px-5 text-sm font-medium text-[var(--btn-secondary-text)] transition-colors hover:bg-[var(--btn-secondary-hover)]">
                Visit Help Center
              </Link>
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
