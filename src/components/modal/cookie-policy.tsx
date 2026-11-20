import type { ReactNode } from "react";
import { BarChart3, Megaphone, Settings2, ShieldCheck, Cookie } from "lucide-react";
import SiteNavbar from "../layout/site-navbar";
import SiteFooter from "../layout/site-footer";

function InfoRow({
  icon,
  title,
  description,
  badge,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <div className="flex items-start gap-4 border-b border-[var(--app-border)] py-5 last:border-b-0">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-text)]">
        {icon}
      </span>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-medium text-[var(--app-fg)] sm:text-base">{title}</h3>
          {badge && (
            <span className="rounded-full bg-[var(--pastel-mint)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#3F8E5C]">
              {badge}
            </span>
          )}
        </div>
        <p className="mt-1.5 text-sm leading-6 text-[var(--app-fg-muted)]">{description}</p>
      </div>
    </div>
  );
}

export default function CookiePolicyScreen() {
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
              <Cookie className="size-4" />
              Privacy preferences
            </div>
            <h1 className="font-display text-4xl font-light tracking-tight text-[var(--app-fg)] sm:text-5xl">
              Cookie <span className="italic">Policy.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[var(--app-fg-muted)] sm:text-base">
              Learn how Jobsynk AI uses cookies and how to control advertising cookies.
            </p>
            <p className="mt-3 text-xs text-[var(--app-fg-soft)]">Last updated: November 20, 2026</p>
          </div>
        </section>

        <div className="mx-auto max-w-4xl space-y-6 px-6 pb-20">
          <article className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-[var(--shadow-soft)] sm:p-8">
            <div className="grid gap-8 md:grid-cols-2">
              <section>
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-[var(--pastel-butter)] text-[#A07820]">
                    <Cookie className="size-5" />
                  </span>
                  <h2 className="font-display text-2xl font-light text-[var(--app-fg)]">What are cookies?</h2>
                </div>
                <p className="mt-4 text-sm leading-7 text-[var(--app-fg-muted)]">
                  Cookies are small data files stored on your device when you visit a website. They help essential features work, remember preferences, and provide useful information about site performance.
                </p>
              </section>

              <section>
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-[var(--pastel-lavender)] text-[#6A55C7]">
                    <Settings2 className="size-5" />
                  </span>
                  <h2 className="font-display text-2xl font-light text-[var(--app-fg)]">Why we use them</h2>
                </div>
                <p className="mt-4 text-sm leading-7 text-[var(--app-fg-muted)]">
                  Jobsynk AI uses essential cookies to operate securely and optional cookies to understand performance, remember choices, and improve how relevant our experience feels.
                </p>
              </section>
            </div>

            <div className="mt-8 flex gap-3 rounded-xl border border-[var(--app-border)] bg-[var(--accent-soft)] p-4">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-[var(--accent-text)]" />
              <p className="text-sm leading-6 text-[var(--app-fg-muted)]">
                Essential cookies cannot be disabled because they support security, authentication, and core site functionality.
              </p>
            </div>
          </article>

          <section className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-[var(--shadow-soft)] sm:p-8">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-text)]">
                <Settings2 className="size-5" />
              </span>
              <div>
                <h2 className="font-display text-2xl font-light text-[var(--app-fg)]">Cookies Jobsynk AI uses</h2>
                <p className="mt-1 text-sm leading-6 text-[var(--app-fg-muted)]">
                  Essential and functional cookies run automatically. Advertising cookies are controlled by the consent message described below, not by a toggle on this page.
                </p>
              </div>
            </div>

            <div className="mt-5">
              <InfoRow
                icon={<ShieldCheck className="size-5" />}
                title="Essential cookies"
                description="Required for secure sign-in, navigation, account features, and reliable operation."
                badge="Always active"
              />
              <InfoRow
                icon={<Settings2 className="size-5" />}
                title="Functional cookies"
                description="Remember your preferences and enable a more personalized Jobsynk AI experience."
                badge="Always active"
              />
              <InfoRow
                icon={<BarChart3 className="size-5" />}
                title="Analytics"
                description="We use Vercel Analytics to understand visits and feature usage. It doesn't use cookies or store identifiers on your device."
                badge="Cookieless"
              />
              <InfoRow
                icon={<Megaphone className="size-5" />}
                title="Advertising cookies"
                description="Used by Google AdSense to show relevant ads. Controlled by the consent message below, not by a toggle here."
              />
            </div>
          </section>

          <article className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-[var(--shadow-soft)] sm:p-8">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-[var(--pastel-peach)] text-[#C25E3A]">
                <Megaphone className="size-5" />
              </span>
              <h2 className="font-display text-2xl font-light text-[var(--app-fg)]">Advertising cookies</h2>
            </div>
            <div className="mt-4 space-y-3 text-sm leading-7 text-[var(--app-fg-muted)]">
              <p>
                Some pages on Jobsynk AI display ads served by Google AdSense. Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this website or other websites. Google&rsquo;s use of advertising cookies enables it and its partners to show you ads based on your visits to Jobsynk AI and other sites on the internet.
              </p>
              <p>
                You can opt out of personalized advertising in <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="font-medium text-[var(--accent-text)] underline underline-offset-4">Google Ads Settings</a>, and opt out of some other third-party vendors&rsquo; advertising cookies at <a href="https://www.aboutads.info/choices" target="_blank" rel="noopener noreferrer" className="font-medium text-[var(--accent-text)] underline underline-offset-4">aboutads.info</a>. If you visit from the European Economic Area, the UK, or Switzerland, a consent message asks for your permission before advertising cookies are used, and you can change your choice there at any time.
              </p>
            </div>
          </article>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
