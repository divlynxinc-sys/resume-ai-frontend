import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Cookie, Database, EyeOff, FileText, Gavel, Lock, Mail, Megaphone, ShieldCheck, UserCheck } from "lucide-react";
import SiteNavbar from "../layout/site-navbar";
import SiteFooter from "../layout/site-footer";

const SECTIONS = [
  { id: "collect", label: "Information we collect" },
  { id: "use", label: "How we use information" },
  { id: "sharing", label: "Sharing and processors" },
  { id: "retention", label: "Data retention" },
  { id: "rights", label: "Your choices and rights" },
  { id: "cookies", label: "Cookies" },
  { id: "advertising", label: "Advertising" },
  { id: "law", label: "Governing law" },
  { id: "contact", label: "Contact us" },
];

function PolicySection({
  id,
  icon,
  title,
  children,
}: {
  id: string;
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-b border-[var(--app-border)] py-7 first:pt-0 last:border-b-0 last:pb-0">
      <div className="flex items-start gap-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-text)]">
          {icon}
        </span>
        <div className="min-w-0">
          <h2 className="font-display text-2xl font-light text-[var(--app-fg)]">{title}</h2>
          <div className="mt-3 space-y-3 text-sm leading-7 text-[var(--app-fg-muted)]">{children}</div>
        </div>
      </div>
    </section>
  );
}

export default function PrivacyPolicyScreen() {
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
            <div className="absolute -right-32 -top-32 size-96 rounded-full bg-[var(--pastel-mint)] opacity-35 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-3.5 py-1.5 text-xs font-medium uppercase tracking-[0.16em] text-[var(--accent-text)]">
              <ShieldCheck className="size-4" />
              Your data &amp; privacy
            </div>
            <h1 className="font-display text-4xl font-light tracking-tight text-[var(--app-fg)] sm:text-5xl">
              Privacy <span className="italic">Policy.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[var(--app-fg-muted)] sm:text-base">
              This policy explains what information Jobsynk AI handles, why we use it, and the choices available to you.
            </p>
            <p className="mt-3 text-xs text-[var(--app-fg-soft)]">Last updated: July 20, 2026</p>
          </div>
        </section>

        <div className="mx-auto grid max-w-6xl gap-6 px-6 pb-20 lg:grid-cols-[15rem_minmax(0,1fr)]">
          <aside className="self-start lg:sticky lg:top-24">
            <nav aria-label="Privacy Policy sections" className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 shadow-[var(--shadow-soft)]">
              <p className="px-2 text-xs font-medium uppercase tracking-[0.16em] text-[var(--accent-text)]">On this page</p>
              <ul className="mt-3 space-y-1">
                {SECTIONS.map((section) => (
                  <li key={section.id}>
                    <a href={`#${section.id}`} className="block rounded-lg px-2.5 py-2 text-sm text-[var(--app-fg-muted)] transition-colors hover:bg-[var(--btn-secondary-hover)] hover:text-[var(--app-fg)]">
                      {section.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <article className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-[var(--shadow-soft)] sm:p-8">
            <div className="mb-8 flex gap-3 rounded-xl border border-[var(--app-border)] bg-[var(--accent-soft)] p-4">
              <Lock className="mt-0.5 size-5 shrink-0 text-[var(--accent-text)]" />
              <p className="text-sm leading-6 text-[var(--app-fg-muted)]">
                Jobsynk AI uses your information to provide resume-building and job-search features. We aim to handle that information responsibly and give you practical controls over your account data.
              </p>
            </div>

            <PolicySection id="collect" icon={<Database className="size-5" />} title="Information we collect">
              <p>We collect information you provide, such as your name, email address, account details, resume content, employment history, education, skills, and any job descriptions or materials you submit.</p>
              <p>We may also collect technical information needed to operate and secure the service, including device and browser details, IP address, timestamps, feature interactions, and diagnostic data.</p>
            </PolicySection>

            <PolicySection id="use" icon={<FileText className="size-5" />} title="How we use your information">
              <p>We use information to create and manage your account, generate and improve resume-related outputs, provide support, process subscriptions, maintain security, communicate service updates, and understand product performance.</p>
              <p>Automated systems may process content you submit to provide requested AI features. You should avoid entering information that is unnecessary for your resume or job search.</p>
            </PolicySection>

            <PolicySection id="sharing" icon={<EyeOff className="size-5" />} title="Sharing and service providers">
              <p>We may use service providers that help operate hosting, authentication, payments, analytics, communications, and AI-powered features. They may process information only as needed to provide those services or meet legal obligations.</p>
              <p>We may also disclose information when required by law, to protect rights and safety, investigate misuse, or respond to a valid legal request.</p>
            </PolicySection>

            <PolicySection id="retention" icon={<Lock className="size-5" />} title="Data retention and security">
              <p>We retain information for as long as reasonably necessary to provide Jobsynk AI, maintain business and security records, resolve disputes, and comply with legal obligations. Retention periods may vary by data type and purpose.</p>
              <p>We use administrative and technical safeguards intended to protect information. No online service can guarantee absolute security, so you should also use a strong password and protect your account credentials.</p>
            </PolicySection>

            <PolicySection id="rights" icon={<UserCheck className="size-5" />} title="Your choices and rights">
              <p>You may review or update account information through available settings. You may also request access, correction, export, or deletion of personal information, subject to identity verification and applicable legal requirements.</p>
              <p>To submit a privacy request, email <a href="mailto:info@divlynx.com" className="font-medium text-[var(--accent-text)] underline underline-offset-4">info@divlynx.com</a>.</p>
            </PolicySection>

            <PolicySection id="cookies" icon={<Cookie className="size-5" />} title="Cookies and similar technologies">
              <p>We use essential technologies to operate and secure the service. Optional cookies may support performance measurement, functionality, and relevant communications.</p>
              <p>You can learn more and manage optional preferences in our <Link to="/cookie-policy" className="font-medium text-[var(--accent-text)] underline underline-offset-4">Cookie Policy</Link>.</p>
            </PolicySection>

            <PolicySection id="advertising" icon={<Megaphone className="size-5" />} title="Advertising">
              <p>Some pages on Jobsynk AI display ads served by Google AdSense. Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this website or other websites. Google&rsquo;s use of advertising cookies enables it and its partners to show you ads based on your visits to Jobsynk AI and other sites on the internet.</p>
              <p>You can opt out of personalized advertising in <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="font-medium text-[var(--accent-text)] underline underline-offset-4">Google Ads Settings</a>, and opt out of some other third-party vendors&rsquo; advertising cookies at <a href="https://www.aboutads.info/choices" target="_blank" rel="noopener noreferrer" className="font-medium text-[var(--accent-text)] underline underline-offset-4">aboutads.info</a>. Visitors in the European Economic Area, the UK, and Switzerland are asked for consent before advertising cookies are used.</p>
            </PolicySection>

            <PolicySection id="law" icon={<Gavel className="size-5" />} title="Governing law">
              <p>This Privacy Policy is governed by the laws of the Islamic Republic of Pakistan. Subject to applicable law, matters relating to this policy will fall within the jurisdiction of the competent courts of Pakistan.</p>
            </PolicySection>

            <PolicySection id="contact" icon={<Mail className="size-5" />} title="Contact us">
              <p>If you have a privacy question, concern, or data request, contact us by email at <a href="mailto:info@divlynx.com" className="font-medium text-[var(--accent-text)] underline underline-offset-4">info@divlynx.com</a>.</p>
            </PolicySection>
          </article>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
