import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, CreditCard, FileCheck2, Gavel, Mail, Scale, ShieldCheck, UserCheck } from "lucide-react";
import SiteNavbar from "../layout/site-navbar";
import SiteFooter from "../layout/site-footer";

function TermSection({
  number,
  icon,
  title,
  children,
}: {
  number: number;
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 transition-colors hover:border-[var(--app-border-strong)] sm:p-7">
      <div className="flex items-start gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-text)]">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--accent-text)]">Section {number}</p>
          <h2 className="mt-1.5 font-display text-2xl font-light text-[var(--app-fg)]">{title}</h2>
          <div className="mt-3 text-sm leading-7 text-[var(--app-fg-muted)]">{children}</div>
        </div>
      </div>
    </article>
  );
}

export default function TermsOfServiceScreen() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  return (
    <div className="min-h-svh bg-[var(--app-bg)] text-[var(--app-fg)]">
      <SiteNavbar />

      <main>
        <section className="relative overflow-hidden px-6 pb-14 pt-16 text-center sm:pt-20">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute -left-32 -top-40 size-96 rounded-full bg-[var(--pastel-lavender)] opacity-40 blur-3xl" />
            <div className="absolute -right-32 -top-32 size-96 rounded-full bg-[var(--pastel-peach)] opacity-35 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-3.5 py-1.5 text-xs font-medium uppercase tracking-[0.16em] text-[var(--accent-text)]">
              <FileCheck2 className="size-4" />
              Legal agreement
            </div>
            <h1 className="font-display text-4xl font-light tracking-tight text-[var(--app-fg)] sm:text-5xl">
              Terms of <span className="italic">Service.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[var(--app-fg-muted)] sm:text-base">
              These terms explain the rules and responsibilities that apply when you access or use Jobsynk AI.
            </p>
            <p className="mt-3 text-xs text-[var(--app-fg-soft)]">Effective date: July 3, 2026</p>
          </div>
        </section>

        <div className="mx-auto max-w-4xl px-6 pb-20">
          <div className="mb-6 flex gap-3 rounded-2xl border border-[var(--app-border)] bg-[var(--accent-soft)] p-5">
            <Scale className="mt-0.5 size-5 shrink-0 text-[var(--accent-text)]" />
            <p className="text-sm leading-6 text-[var(--app-fg-muted)]">
              By creating an account or using Jobsynk AI, you agree to these terms and our <Link to="/privacy" className="font-medium text-[var(--accent-text)] underline underline-offset-4">Privacy Policy</Link>. If you do not agree, please do not use the service.
            </p>
          </div>

          <section className="space-y-4" aria-label="Terms of Service sections">
            <TermSection number={1} icon={<FileCheck2 className="size-5" />} title="Acceptance and updates">
              We may update these Terms of Service when our services, practices, or legal obligations change. Updated terms will be published on this page with a revised effective date. Continued use after an update means you accept the revised terms.
            </TermSection>

            <TermSection number={2} icon={<UserCheck className="size-5" />} title="Account responsibilities">
              You are responsible for providing accurate account information, safeguarding your password and verification codes, and all activity performed through your account. Notify us promptly if you suspect unauthorized access.
            </TermSection>

            <TermSection number={3} icon={<ShieldCheck className="size-5" />} title="Acceptable use">
              You may use Jobsynk AI only for lawful purposes. You must not misuse the service, attempt unauthorized access, disrupt platform operation, upload harmful material, infringe another person’s rights, or use generated content deceptively or unlawfully.
            </TermSection>

            <TermSection number={4} icon={<CreditCard className="size-5" />} title="Plans, billing, and cancellations">
              Some features may require a paid plan. Prices, billing periods, and included features are presented before purchase. You authorize applicable charges when subscribing. Refunds and cancellations are handled according to the terms shown at purchase and any rights required by applicable law.
            </TermSection>

            <TermSection number={5} icon={<AlertCircle className="size-5" />} title="AI-generated suggestions">
              Jobsynk AI may provide automated suggestions to help improve resumes and job-search materials. You remain responsible for reviewing their accuracy, ensuring all statements are truthful, and deciding whether the resulting content is appropriate for your use.
            </TermSection>

            <TermSection number={6} icon={<ShieldCheck className="size-5" />} title="Service availability and liability">
              The service is provided on an “as available” basis. We work to keep Jobsynk AI reliable, but do not guarantee uninterrupted access or specific employment outcomes. To the extent permitted by applicable law, we are not liable for indirect, incidental, or consequential losses arising from use of the service.
            </TermSection>

            <TermSection number={7} icon={<Gavel className="size-5" />} title="Governing law and jurisdiction">
              These Terms of Service are governed by the laws of the Islamic Republic of Pakistan. Subject to applicable law, disputes relating to these terms or Jobsynk AI will be handled by the competent courts of Pakistan.
            </TermSection>

            <TermSection number={8} icon={<Mail className="size-5" />} title="Contact us">
              Questions about these terms can be sent to <a href="mailto:divlynx.inc@gmail.com" className="font-medium text-[var(--accent-text)] underline underline-offset-4">divlynx.inc@gmail.com</a>.
            </TermSection>
          </section>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link to="/privacy" className="inline-flex h-10 items-center rounded-lg bg-[var(--btn-primary-bg)] px-5 text-sm font-medium text-[var(--btn-primary-text)] transition-colors hover:bg-[var(--btn-primary-hover)]">
              Read Privacy Policy
            </Link>
            <a href="mailto:divlynx.inc@gmail.com" className="inline-flex h-10 items-center gap-2 rounded-lg border border-[var(--btn-secondary-border)] bg-[var(--btn-secondary-bg)] px-5 text-sm font-medium text-[var(--btn-secondary-text)] transition-colors hover:bg-[var(--btn-secondary-hover)]">
              <Mail className="size-4" />
              Contact Us
            </a>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
