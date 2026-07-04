import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { CreditCard, Download, Lock, Mail, Shield, Trash2, User } from "lucide-react";
import SiteNavbar from "../layout/site-navbar";
import PageWithSidebar from "../layout/page-with-sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/contexts/ToastContext";
import { settingsService, profileService, pricingService } from "@/services";
import type { AccountSummary } from "@/services/settings";
import type { PolarSubscriptionDetails } from "@/services/pricing";

function PageTitle({ children, subtitle }: { children: ReactNode; subtitle?: string }) {
  return (
    <header className="pt-8">
      <div className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--accent-text)]">
        Settings
      </div>
      <h1 className="mt-2 font-display text-3xl md:text-4xl font-light tracking-tight text-[var(--app-fg)]">
        {children}
      </h1>
      {subtitle ? (
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--app-fg-muted)]">
          {subtitle}
        </p>
      ) : null}
    </header>
  );
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-[var(--shadow-soft)] ${className}`}>
      {children}
    </section>
  );
}

function SectionTitle({ icon, title, subtitle }: { icon: ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-text)]">
        {icon}
      </div>
      <div>
        <h2 className="text-base font-medium text-[var(--app-fg)]">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-[var(--app-fg-muted)]">{subtitle}</p> : null}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  readOnly,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-[var(--app-fg-muted)]">{label}</span>
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        className="mt-2 w-full rounded-lg border border-[var(--app-border-strong)] bg-[var(--btn-secondary-bg)] px-3.5 py-2.5 text-sm text-[var(--app-fg)] outline-none placeholder:text-[var(--app-fg-soft)] transition-colors focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15 read-only:cursor-default read-only:opacity-65"
      />
    </label>
  );
}

function Switch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 rounded-full border transition-colors ${
        checked ? "border-[var(--accent)] bg-[var(--accent)]" : "border-[var(--app-border-strong)] bg-[var(--btn-secondary-bg)]"
      }`}
      aria-pressed={checked}
    >
      <span
        className={`absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center justify-center rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, onClick, disabled }: { children: ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center justify-center rounded-lg border border-[var(--app-border-strong)] bg-[var(--btn-secondary-bg)] px-4 py-2.5 text-sm font-medium text-[var(--btn-secondary-text)] transition-colors hover:bg-[var(--btn-secondary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </button>
  );
}

function Modal({
  title,
  children,
  actions,
}: {
  title: string;
  children: ReactNode;
  actions: ReactNode;
}) {
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(26,26,26,0.35)] p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-md rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 text-[var(--app-fg)] shadow-[var(--shadow-pop)]">
        <h3 className="font-display text-2xl font-light tracking-tight">{title}</h3>
        <div className="mt-4 text-sm leading-relaxed text-[var(--app-fg-muted)]">{children}</div>
        <div className="mt-6 flex justify-end gap-3">{actions}</div>
      </div>
    </div>,
    document.body
  );
}

export default function AccountManagementScreen() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSaving, setPwSaving] = useState(false);

  const [summary, setSummary] = useState<AccountSummary | null>(null);
  const [subDetails, setSubDetails] = useState<PolarSubscriptionDetails | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [subBusy, setSubBusy] = useState(false);
  const [subError, setSubError] = useState<string | null>(null);

  const [twoFA, setTwoFA] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);
  const [prefSaving, setPrefSaving] = useState(false);

  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const refreshSubscriptionState = () => {
    settingsService.getAccountSummary().then(setSummary).catch(() => {});
    pricingService.getCurrentSubscription().then(setSubDetails).catch(() => setSubDetails(null));
  };

  useEffect(() => {
    profileService.getMe()
      .then((p) => {
        setName(p.name);
        setEmail(p.email);
      })
      .catch(() => {
        setName(user?.name ?? "");
        setEmail(user?.email ?? "");
      });

    refreshSubscriptionState();

    settingsService.getPreferences()
      .then((prefs) => {
        if (prefs.theme) setTheme(prefs.theme as "dark" | "light");
        setEmailNotif(prefs.email_notifications);
        setTwoFA(prefs.two_factor_enabled);
      })
      .catch(() => {});

    const onPlanUpdated = () => refreshSubscriptionState();
    const onFocus = () => refreshSubscriptionState();
    window.addEventListener("plan-updated", onPlanUpdated);
    window.addEventListener("focus", onFocus);

    return () => {
      window.removeEventListener("plan-updated", onPlanUpdated);
      window.removeEventListener("focus", onFocus);
    };
  }, [setTheme, user?.email, user?.name]);

  const handleProfileSave = async () => {
    setProfileSaving(true);
    try {
      await profileService.updateMe({ name });
      showToast("Profile updated.");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Profile update failed.", "error");
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!oldPw || !newPw || !confirmPw) {
      showToast("All password fields are required.", "error");
      return;
    }
    if (newPw !== confirmPw) {
      showToast("New passwords do not match.", "error");
      return;
    }

    setPwSaving(true);
    try {
      await profileService.changePassword({
        old_password: oldPw,
        new_password: newPw,
        confirm_password: confirmPw,
      });
      setOldPw("");
      setNewPw("");
      setConfirmPw("");
      showToast("Password updated.");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to change password.", "error");
    } finally {
      setPwSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    setPrefSaving(true);
    try {
      await settingsService.updatePreferences({
        theme,
        email_notifications: emailNotif,
        two_factor_enabled: twoFA,
      });
      showToast("Preferences saved.");
    } catch {
      showToast("Failed to save preferences.", "error");
    } finally {
      setPrefSaving(false);
    }
  };

  const handleOpenPortal = async () => {
    setSubBusy(true);
    setSubError(null);
    try {
      const res = await pricingService.getPortalUrl();
      window.open(res.portal_url, "_blank", "noopener,noreferrer");
    } catch (err: unknown) {
      setSubError(err instanceof Error ? err.message : "Failed to open billing portal.");
    } finally {
      setSubBusy(false);
    }
  };

  const handleCancelSubscription = async () => {
    setSubBusy(true);
    setSubError(null);
    try {
      const res = await pricingService.cancelSubscription();
      refreshSubscriptionState();
      window.dispatchEvent(new CustomEvent("plan-updated"));
      setShowCancelModal(false);
      showToast(
        res.refunded
          ? "Cancelled and refunded in full."
          : "Cancelled. You can re-subscribe for free until your period ends.",
      );
    } catch (err: unknown) {
      setSubError(err instanceof Error ? err.message : "Failed to cancel subscription.");
    } finally {
      setSubBusy(false);
    }
  };

  const handleReactivateSubscription = async () => {
    setSubBusy(true);
    setSubError(null);
    try {
      await pricingService.reactivateSubscription();
      refreshSubscriptionState();
      window.dispatchEvent(new CustomEvent("plan-updated"));
      showToast("Your plan is active again until the end of your current period.");
    } catch (err: unknown) {
      setSubError(err instanceof Error ? err.message : "Failed to reactivate subscription.");
    } finally {
      setSubBusy(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await settingsService.exportData();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "jobsynk-ai-data-export.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showToast("Data export started.");
    } catch {
      showToast("Export failed. Please try again.", "error");
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await settingsService.deleteAccount();
      await logout();
      navigate("/login");
    } catch {
      showToast("Delete failed. Please try again.", "error");
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const planName = summary?.current_plan || "Free";
  const renewalLabel = subDetails?.current_period_end
    ? new Date(subDetails.current_period_end).toLocaleDateString()
    : null;

  return (
    <div className="min-h-svh bg-[var(--app-bg)] text-[var(--app-fg)]">
      <SiteNavbar />
      <PageWithSidebar activeRoute="account" mainClassName="mx-auto max-w-5xl pb-16">
        <PageTitle subtitle="Keep the essentials current: profile, security, billing, preferences, and account data.">
          Settings
        </PageTitle>

        <div className="mt-8 grid gap-5">
          <Card>
            <div className="grid gap-6 md:grid-cols-[16rem_1fr]">
              <SectionTitle icon={<User className="size-5" />} title="Profile" subtitle="Your visible account details." />
              <div className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full name" value={name} onChange={setName} placeholder="Your name" />
                  <Field label="Email address" value={email} readOnly />
                </div>
                <div>
                  <PrimaryButton onClick={handleProfileSave} disabled={profileSaving}>
                    {profileSaving ? "Saving..." : "Save Profile"}
                  </PrimaryButton>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="grid gap-6 md:grid-cols-[16rem_1fr]">
              <SectionTitle icon={<Lock className="size-5" />} title="Security" subtitle="Password and extra account protection." />
              <div className="grid gap-5">
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Current password" type="password" value={oldPw} onChange={setOldPw} placeholder="Current password" />
                  <Field label="New password" type="password" value={newPw} onChange={setNewPw} placeholder="New password" />
                  <Field label="Confirm password" type="password" value={confirmPw} onChange={setConfirmPw} placeholder="Confirm password" />
                </div>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <PrimaryButton onClick={handlePasswordChange} disabled={pwSaving}>
                    {pwSaving ? "Updating..." : "Update Password"}
                  </PrimaryButton>
                  <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-2)] px-4 py-3 sm:min-w-72">
                    <div>
                      <div className="text-sm font-medium text-[var(--app-fg)]">Two-factor authentication</div>
                      <div className="text-xs text-[var(--app-fg-muted)]">Extra protection at sign-in.</div>
                    </div>
                    <Switch checked={twoFA} onChange={setTwoFA} />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="grid gap-6 md:grid-cols-[16rem_1fr]">
              <SectionTitle icon={<CreditCard className="size-5" />} title="Billing" subtitle="Plan and payment controls." />
              <div className="grid gap-5">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <div className="text-xs text-[var(--app-fg-muted)]">Current plan</div>
                    <div className="mt-1 text-sm font-medium text-[var(--app-fg)]">{planName}</div>
                  </div>
                  <div>
                    <div className="text-xs text-[var(--app-fg-muted)]">AI credits</div>
                    <div className="mt-1 text-sm font-medium text-[var(--app-fg)]">
                      {summary?.credits_remaining ?? "-"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[var(--app-fg-muted)]">
                      {subDetails?.cancel_at_period_end ? "Ends" : "Renews"}
                    </div>
                    <div className="mt-1 text-sm font-medium text-[var(--app-fg)]">
                      {renewalLabel ?? "-"}
                    </div>
                  </div>
                </div>

                {subDetails?.can_reactivate_free ? (
                  <div className="w-fit rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs text-amber-700 dark:text-amber-300">
                    Cancelled — paid features locked. Re-subscribe free until {renewalLabel ?? "your period ends"}.
                  </div>
                ) : subDetails?.cancel_at_period_end ? (
                  <div className="w-fit rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs text-amber-700 dark:text-amber-300">
                    Cancellation scheduled
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/pricing"
                    className="inline-flex items-center justify-center rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)]"
                  >
                    {subDetails?.has_subscription ? "Change Plan" : "Upgrade Plan"}
                  </Link>
                  <SecondaryButton onClick={handleOpenPortal} disabled={subBusy}>
                    Payment & Invoices
                  </SecondaryButton>
                  {subDetails?.can_reactivate_free ? (
                    <button
                      type="button"
                      onClick={handleReactivateSubscription}
                      disabled={subBusy}
                      className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {subBusy ? "Reactivating…" : "Reactivate (free)"}
                    </button>
                  ) : subDetails?.has_subscription && !subDetails.cancel_at_period_end ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSubError(null);
                        setShowCancelModal(true);
                      }}
                      disabled={subBusy}
                      className="inline-flex items-center justify-center rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-2.5 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-500/15 disabled:cursor-not-allowed disabled:opacity-60 dark:text-rose-300"
                    >
                      Cancel Subscription
                    </button>
                  ) : null}
                </div>
                {subError ? (
                  <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-600 dark:text-rose-300">
                    {subError}
                  </div>
                ) : null}
              </div>
            </div>
          </Card>

          <Card>
            <div className="grid gap-6 md:grid-cols-[16rem_1fr]">
              <SectionTitle icon={<Mail className="size-5" />} title="Preferences" subtitle="Theme and account notifications." />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-2)] px-4 py-3">
                  <div>
                    <div className="text-sm font-medium text-[var(--app-fg)]">Dark mode</div>
                    <div className="text-xs text-[var(--app-fg-muted)]">Use the darker app theme.</div>
                  </div>
                  <Switch checked={theme === "dark"} onChange={(v) => setTheme(v ? "dark" : "light")} />
                </div>
                <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-2)] px-4 py-3">
                  <div>
                    <div className="text-sm font-medium text-[var(--app-fg)]">Email notifications</div>
                    <div className="text-xs text-[var(--app-fg-muted)]">Receive product updates and tips.</div>
                  </div>
                  <Switch checked={emailNotif} onChange={setEmailNotif} />
                </div>
                <div className="sm:col-span-2">
                  <PrimaryButton onClick={handleSavePreferences} disabled={prefSaving}>
                    {prefSaving ? "Saving..." : "Save Preferences"}
                  </PrimaryButton>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="grid gap-6 md:grid-cols-[16rem_1fr]">
              <SectionTitle icon={<Shield className="size-5" />} title="Data & Privacy" subtitle="Export your data or close the account." />
              <div className="flex flex-wrap gap-3">
                <SecondaryButton onClick={handleExport} disabled={exporting}>
                  <span className="inline-flex items-center gap-2">
                    <Download className="size-4" />
                    {exporting ? "Exporting..." : "Export My Data"}
                  </span>
                </SecondaryButton>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  disabled={deleting}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-2.5 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-500/15 disabled:cursor-not-allowed disabled:opacity-60 dark:text-rose-300"
                >
                  <Trash2 className="size-4" />
                  Delete Account
                </button>
              </div>
            </div>
          </Card>
        </div>
      </PageWithSidebar>

      {showCancelModal ? (
        <Modal
          title="Cancel subscription?"
          actions={
            <>
              <SecondaryButton onClick={() => setShowCancelModal(false)} disabled={subBusy}>
                Keep Subscription
              </SecondaryButton>
              <button
                type="button"
                onClick={handleCancelSubscription}
                disabled={subBusy}
                className="rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {subBusy ? "Cancelling..." : "Confirm Cancel"}
              </button>
            </>
          }
        >
          {subDetails?.refund_eligible_now ? (
            <>
              You're still within your{" "}
              <span className="font-medium text-[var(--app-fg)]">
                {subDetails.refund_window_days}-day money-back window
              </span>
              , so cancelling now will{" "}
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                refund you 100%
              </span>{" "}
              and end your plan immediately.
            </>
          ) : (
            <>
              You're past the money-back window, so{" "}
              <span className="font-medium text-[var(--app-fg)]">no refund</span> is issued
              and paid features are locked immediately. You can re-subscribe for{" "}
              <span className="font-medium text-[var(--app-fg)]">free</span> anytime until{" "}
              <span className="font-medium text-[var(--app-fg)]">
                {renewalLabel ?? "your period ends"}
              </span>
              , when your plan fully expires. We won't bill you again.
            </>
          )}
          {subError ? (
            <div className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-rose-600 dark:text-rose-300">
              {subError}
            </div>
          ) : null}
        </Modal>
      ) : null}

      {showDeleteModal ? (
        <Modal
          title="Delete account?"
          actions={
            <>
              <SecondaryButton onClick={() => setShowDeleteModal(false)} disabled={deleting}>
                Cancel
              </SecondaryButton>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete Account"}
              </button>
            </>
          }
        >
          This permanently deletes your account and account data. This action cannot be undone.
        </Modal>
      ) : null}
    </div>
  );
}
