import { useState, type ReactNode } from "react";
import { BarChart3, CheckCircle2, Cookie, Megaphone, Settings2, ShieldCheck, SlidersHorizontal } from "lucide-react";
import SiteNavbar from "../layout/site-navbar";
import SiteFooter from "../layout/site-footer";

const COOKIE_PREFERENCES_KEY = "jobsynk.cookiePreferences";

type Preferences = {
  performance: boolean;
  functional: boolean;
  targeting: boolean;
};

const DEFAULT_PREFERENCES: Preferences = {
  performance: false,
  functional: false,
  targeting: false,
};

function getSavedPreferences(): Preferences {
  try {
    const saved = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    if (!saved) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(saved) as Partial<Preferences>;
    return {
      performance: Boolean(parsed.performance),
      functional: Boolean(parsed.functional),
      targeting: Boolean(parsed.targeting),
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

function PreferenceSwitch({
  checked,
  onChange,
  disabled = false,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--app-surface)] ${
        checked
          ? "border-[var(--accent)] bg-[var(--accent)]"
          : "border-[var(--app-border-strong)] bg-[var(--btn-secondary-bg)]"
      } ${disabled ? "cursor-not-allowed opacity-80" : "cursor-pointer"}`}
    >
      <span
        className={`absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0"}`}
      />
    </button>
  );
}

function PreferenceRow({
  icon,
  title,
  description,
  checked,
  onChange,
  required = false,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  required?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-5 border-b border-[var(--app-border)] py-5 last:border-b-0">
      <div className="flex min-w-0 gap-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-text)]">
          {icon}
        </span>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-medium text-[var(--app-fg)] sm:text-base">{title}</h3>
            {required && (
              <span className="rounded-full bg-[var(--pastel-mint)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#3F8E5C]">
                Always active
              </span>
            )}
          </div>
          <p className="mt-1.5 text-sm leading-6 text-[var(--app-fg-muted)]">{description}</p>
        </div>
      </div>
      <PreferenceSwitch checked={checked} onChange={onChange} disabled={required} label={`${title} cookies`} />
    </div>
  );
}

export default function CookiePolicyScreen() {
  const [preferences, setPreferences] = useState<Preferences>(getSavedPreferences);
  const [saved, setSaved] = useState(false);

  const persistPreferences = (next: Preferences) => {
    setPreferences(next);
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(next));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 3000);
  };

  const updatePreference = (key: keyof Preferences, checked: boolean) => {
    setPreferences((current) => ({ ...current, [key]: checked }));
    setSaved(false);
  };

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
              Learn how Jobsynk AI uses cookies and choose which optional technologies you’re comfortable with.
            </p>
            <p className="mt-3 text-xs text-[var(--app-fg-soft)]">Last updated: July 3, 2026</p>
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
                Essential cookies cannot be disabled because they support security, authentication, and core site functionality. Optional choices can be changed below at any time.
              </p>
            </div>
          </article>

          <section id="cookie-preferences" className="scroll-mt-24 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-[var(--shadow-soft)] sm:p-8">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-text)]">
                <SlidersHorizontal className="size-5" />
              </span>
              <div>
                <h2 className="font-display text-2xl font-light text-[var(--app-fg)]">Manage cookie preferences</h2>
                <p className="mt-1 text-sm leading-6 text-[var(--app-fg-muted)]">Choose the optional cookies Jobsynk AI may use on this device.</p>
              </div>
            </div>

            <div className="mt-5">
              <PreferenceRow
                icon={<ShieldCheck className="size-5" />}
                title="Essential cookies"
                description="Required for secure sign-in, navigation, account features, and reliable operation."
                checked
                required
                onChange={() => {}}
              />
              <PreferenceRow
                icon={<BarChart3 className="size-5" />}
                title="Performance cookies"
                description="Help us understand visits and feature usage so we can measure and improve performance."
                checked={preferences.performance}
                onChange={(checked) => updatePreference("performance", checked)}
              />
              <PreferenceRow
                icon={<Settings2 className="size-5" />}
                title="Functional cookies"
                description="Remember your preferences and enable a more personalized Jobsynk AI experience."
                checked={preferences.functional}
                onChange={(checked) => updatePreference("functional", checked)}
              />
              <PreferenceRow
                icon={<Megaphone className="size-5" />}
                title="Targeting cookies"
                description="Help tailor communications and measure whether campaigns are useful and relevant."
                checked={preferences.targeting}
                onChange={(checked) => updatePreference("targeting", checked)}
              />
            </div>

            <div className="mt-6 flex flex-wrap gap-3 border-t border-[var(--app-border)] pt-6">
              <button
                type="button"
                onClick={() => persistPreferences({ performance: true, functional: true, targeting: true })}
                className="h-10 rounded-lg bg-[var(--btn-primary-bg)] px-5 text-sm font-medium text-[var(--btn-primary-text)] transition-colors hover:bg-[var(--btn-primary-hover)]"
              >
                Accept all
              </button>
              <button
                type="button"
                onClick={() => persistPreferences(preferences)}
                className="h-10 rounded-lg border border-[var(--btn-secondary-border)] bg-[var(--btn-secondary-bg)] px-5 text-sm font-medium text-[var(--btn-secondary-text)] transition-colors hover:bg-[var(--btn-secondary-hover)]"
              >
                Save preferences
              </button>
              <button
                type="button"
                onClick={() => persistPreferences(DEFAULT_PREFERENCES)}
                className="h-10 rounded-lg px-4 text-sm font-medium text-[var(--app-fg-muted)] transition-colors hover:bg-[var(--btn-secondary-hover)] hover:text-[var(--app-fg)]"
              >
                Reject optional
              </button>
            </div>

            {saved && (
              <div role="status" className="mt-5 flex items-center gap-2 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                <CheckCircle2 className="size-4" />
                Your cookie preferences have been saved.
              </div>
            )}
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
