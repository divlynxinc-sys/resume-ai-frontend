import { useState, useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
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
    <div className="pt-10">
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{children}</h1>
      {subtitle && <p className="text-white/70 mt-1">{subtitle}</p>}
    </div>
  );
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.35)] ${className}`}>
      {children}
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
    <div>
      <div className="text-xs text-white/60 mb-2">{label}</div>
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full rounded-lg border border-white/15 bg-[#0C1426] px-4 py-3 text-sm outline-none placeholder:text-white/40 focus:border-white/25 read-only:opacity-60 read-only:cursor-default"
      />
    </div>
  );
}

function Switch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 rounded-full border ${
        checked ? "bg-blue-600 border-blue-500" : "bg-white/10 border-white/20"
      }`}
      aria-pressed={checked}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full transition-all ${
          checked ? "translate-x-5 bg-white" : "bg-white/70"
        }`}
      />
    </button>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <div className="text-white/80 font-medium mb-3">{title}</div>;
}

/** Initials avatar for when there's no photo */
function AvatarCircle({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <div className="size-28 rounded-full bg-gradient-to-br from-blue-600/60 to-purple-600/60 border border-white/15 flex items-center justify-center text-2xl font-bold text-white select-none">
      {initials || "?"}
    </div>
  );
}

export default function AccountManagementScreen() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();

  // Profile state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  // Password change state
  const [pwExpanded, setPwExpanded] = useState(false);
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // Subscription state
  const [summary, setSummary] = useState<AccountSummary | null>(null);
  const [subDetails, setSubDetails] = useState<PolarSubscriptionDetails | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [subBusy, setSubBusy] = useState(false);
  const [subError, setSubError] = useState<string | null>(null);

  const refreshSubscriptionState = () => {
    settingsService.getAccountSummary().then(setSummary).catch(() => {});
    pricingService.getCurrentSubscription().then(setSubDetails).catch(() => setSubDetails(null));
  };

  const handleCancelSubscription = async () => {
    setSubBusy(true);
    setSubError(null);
    try {
      const updated = await pricingService.cancelSubscription();
      setSubDetails(updated);
      window.dispatchEvent(new CustomEvent("plan-updated"));
      setShowCancelModal(false);
      showToast("Subscription will end at the end of the current billing period.");
    } catch (err) {
      setSubError(err instanceof Error ? err.message : "Failed to cancel.");
    } finally {
      setSubBusy(false);
    }
  };

  const handleOpenPortal = async () => {
    setSubBusy(true);
    setSubError(null);
    try {
      const res = await pricingService.getPortalUrl();
      window.open(res.portal_url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setSubError(err instanceof Error ? err.message : "Failed to open billing portal.");
    } finally {
      setSubBusy(false);
    }
  };

  // Preferences state
  const [twoFA, setTwoFA] = useState(false);
  const [accentColor, setAccentColor] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);


  // Export / delete
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Hidden file input for avatar (UI only — no API endpoint yet)
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load profile
    profileService.getMe()
      .then((p) => { setName(p.name); setEmail(p.email); })
      .catch(() => {});

    // Load account summary
    settingsService.getAccountSummary()
      .then(setSummary)
      .catch(() => {});

    // Load live subscription details from Polar (for renewal date / pending cancel)
    pricingService.getCurrentSubscription()
      .then(setSubDetails)
      .catch(() => setSubDetails(null));

    const onPlanUpdated = () => refreshSubscriptionState();
    window.addEventListener("plan-updated", onPlanUpdated);
    // Refetch when the user comes back from the Polar customer portal tab.
    const onFocus = () => refreshSubscriptionState();
    window.addEventListener("focus", onFocus);

    // Load preferences
    settingsService.getPreferences()
      .then((prefs) => {
        if (prefs.theme) setTheme(prefs.theme as "dark" | "light");
        setEmailNotif(prefs.email_notifications);
        setTwoFA(prefs.two_factor_enabled);
      })
      .catch(() => {});

    return () => {
      window.removeEventListener("plan-updated", onPlanUpdated);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  // ── Profile save ───────────────────────────────────────────────────────────
  const handleProfileSave = async () => {
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      await profileService.updateMe({ name });
      setProfileMsg("Profile updated!");
    } catch (err: unknown) {
      setProfileMsg((err as Error).message || "Update failed.");
    } finally {
      setProfileSaving(false);
      setTimeout(() => setProfileMsg(null), 3000);
    }
  };

  // ── Password change ────────────────────────────────────────────────────────
  const handlePasswordChange = async () => {
    if (!oldPw || !newPw || !confirmPw) {
      setPwMsg({ text: "All fields are required.", ok: false });
      return;
    }
    if (newPw !== confirmPw) {
      setPwMsg({ text: "New passwords don't match.", ok: false });
      return;
    }
    setPwSaving(true);
    setPwMsg(null);
    try {
      await profileService.changePassword({
        old_password: oldPw,
        new_password: newPw,
        confirm_password: confirmPw,
      });
      showToast("Password updated successfully!");
      setOldPw(""); setNewPw(""); setConfirmPw("");
      setTimeout(() => { setPwExpanded(false); setPwMsg(null); }, 500);
    } catch (err: unknown) {
      setPwMsg({ text: (err as Error).message || "Failed to change password.", ok: false });
    } finally {
      setPwSaving(false);
    }
  };

  // ── Preferences save ───────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      await settingsService.updatePreferences({
        theme,
        email_notifications: emailNotif,
        two_factor_enabled: twoFA,
      });
      setSaveMsg("Saved!");
    } catch {
      setSaveMsg("Failed to save.");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(null), 3000);
    }
  };

  // ── Export data ────────────────────────────────────────────────────────────
  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await settingsService.exportData();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "my-data-export.json";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  // ── Delete account ─────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!window.confirm("Permanently delete your account and all data? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await settingsService.deleteAccount();
      await logout();
      navigate("/login");
    } catch {
      setDeleting(false);
      alert("Delete failed. Please try again.");
    }
  };

  const displayName = name || user?.name || user?.email || "User";

  return (
    <div className="min-h-svh bg-[var(--app-bg)] text-white">
      <SiteNavbar />
      <PageWithSidebar activeRoute="account" mainClassName="mx-auto max-w-5xl pb-12">
        <PageTitle subtitle="Manage your profile, security, preferences, and privacy">
          Account & Customization Hub
        </PageTitle>

        {/* ── Profile Information ── */}
        <section className="mt-8">
          <SectionHeader title="Profile Information" />
          <Card>
            <div className="grid grid-cols-1 md:grid-cols-[12rem_1fr] gap-6 items-start">
              {/* Avatar */}
              <div className="space-y-3">
                <AvatarCircle name={displayName} />
                {/* Photo upload — no API endpoint yet; hidden but shows coming-soon */}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" />
                <button
                  onClick={() => alert("Photo upload coming soon.")}
                  className="w-full rounded-md bg-white/8 border border-white/12 px-3 py-2 text-sm text-white/60 cursor-not-allowed"
                  title="Photo upload not yet available"
                >
                  Upload New Photo
                </button>
              </div>

              {/* Editable fields */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Full Name" value={name} onChange={setName} placeholder="Your name" />
                  <Field label="Email Address" value={email} readOnly />
                </div>
                <div className="flex items-center gap-4 pt-1">
                  {profileMsg && (
                    <span className={`text-sm ${profileMsg.includes("!") ? "text-green-400" : "text-red-400"}`}>
                      {profileMsg}
                    </span>
                  )}
                  <button
                    onClick={handleProfileSave}
                    disabled={profileSaving}
                    className="rounded-lg bg-[oklch(0.488_0.243_264.376)] px-4 py-2 text-sm text-white disabled:opacity-60"
                  >
                    {profileSaving ? "Saving…" : "Save Profile"}
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* ── Password & Security ── */}
        <section className="mt-8">
          <SectionHeader title="Password & Security" />
          <Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="text-sm text-white/80">Change Password</div>
                <button
                  onClick={() => { setPwExpanded((v) => !v); setPwMsg(null); }}
                  className="rounded-lg bg-white/8 border border-white/12 px-4 py-2 text-sm hover:bg-white/10"
                >
                  {pwExpanded ? "Cancel" : "Update Password"}
                </button>

                {pwExpanded && (
                  <div className="mt-3 space-y-3">
                    <Field
                      label="Current Password"
                      type="password"
                      value={oldPw}
                      onChange={setOldPw}
                      placeholder="••••••••"
                    />
                    <Field
                      label="New Password"
                      type="password"
                      value={newPw}
                      onChange={setNewPw}
                      placeholder="••••••••"
                    />
                    <Field
                      label="Confirm New Password"
                      type="password"
                      value={confirmPw}
                      onChange={setConfirmPw}
                      placeholder="••••••••"
                    />
                    {pwMsg && (
                      <p className={`text-xs ${pwMsg.ok ? "text-green-400" : "text-red-400"}`}>
                        {pwMsg.text}
                      </p>
                    )}
                    <button
                      onClick={handlePasswordChange}
                      disabled={pwSaving}
                      className="rounded-lg bg-[oklch(0.488_0.243_264.376)] px-4 py-2 text-sm text-white disabled:opacity-60 w-full"
                    >
                      {pwSaving ? "Changing…" : "Change Password"}
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Two‑Factor Authentication (2FA)</div>
                    <div className="text-xs text-white/60">Extra protection for your account</div>
                  </div>
                  <Switch checked={twoFA} onChange={setTwoFA} />
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* ── Subscription & Billing ── */}
        <section className="mt-8">
          <SectionHeader title="Subscription & Billing" />
          <Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <div className="text-sm text-white/70">Current Plan</div>
                <div className="mt-1 text-white font-semibold">{summary?.current_plan ?? "—"}</div>
                <div className="mt-2 text-xs text-white/60">
                  AI credits: {summary?.credits_remaining != null ? summary.credits_remaining : "—"}
                </div>
                {subDetails?.has_subscription && subDetails.current_period_end && (
                  <div className="mt-2 text-xs text-white/60">
                    {subDetails.cancel_at_period_end
                      ? `Ends on ${new Date(subDetails.current_period_end).toLocaleDateString()}`
                      : `Renews on ${new Date(subDetails.current_period_end).toLocaleDateString()}`}
                  </div>
                )}
                {subDetails?.cancel_at_period_end && (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs text-amber-700 dark:text-amber-300">
                    Cancellation scheduled
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-3 justify-start md:justify-end">
                {!subDetails?.has_subscription && (
                  <Link to="/pricing" className="rounded-lg bg-[oklch(0.488_0.243_264.376)] px-4 py-2 text-sm text-white">
                    Upgrade Plan
                  </Link>
                )}
                {subDetails?.has_subscription && !subDetails.cancel_at_period_end && (
                  <>
                    <Link to="/pricing" className="rounded-lg bg-white/8 border border-white/12 px-4 py-2 text-sm">
                      Change Plan
                    </Link>
                    <button
                      onClick={() => { setSubError(null); setShowCancelModal(true); }}
                      disabled={subBusy}
                      className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-sm text-rose-600 dark:text-rose-300 disabled:opacity-60"
                    >
                      Cancel Subscription
                    </button>
                  </>
                )}
                <button
                  onClick={handleOpenPortal}
                  disabled={subBusy}
                  className="rounded-lg bg-white/8 border border-white/12 px-4 py-2 text-sm disabled:opacity-60"
                  title="Manage payment method & invoices on Polar"
                >
                  Payment & Invoices
                </button>
              </div>
            </div>
            {subError && (
              <div className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-600 dark:text-rose-300">
                {subError}
              </div>
            )}
          </Card>
        </section>

        {showCancelModal && createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4">
            <div
              className="w-full max-w-md rounded-2xl p-6 text-left"
              style={{
                backgroundColor: "var(--app-surface)",
                border: "1px solid var(--app-border)",
                boxShadow: "var(--shadow-pop)",
                color: "var(--app-fg)",
              }}
            >
              <h3 className="text-lg font-semibold">Cancel your subscription?</h3>
              <div className="mt-3 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-600 dark:text-rose-300">
                <strong>This cannot be undone.</strong> Once you cancel, you will not be able to
                resume this subscription — you'd need to start a new one later.
              </div>
              <p className="mt-3 text-sm" style={{ color: "var(--app-fg-muted)" }}>
                You'll keep access until
                {" "}
                <strong>
                  {subDetails?.current_period_end
                    ? new Date(subDetails.current_period_end).toLocaleDateString()
                    : "the end of this billing period"}
                </strong>
                . After that your plan ends, your AI credits are cleared, and we won't bill you again.
                {" "}
                <span className="text-white/80">No refund is issued for the remaining time.</span>
              </p>
              {subError && (
                <div className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-600 dark:text-rose-300">
                  {subError}
                </div>
              )}
              <div className="mt-5 flex justify-end gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  disabled={subBusy}
                  className="rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60"
                  style={{
                    backgroundColor: "var(--btn-secondary-bg)",
                    border: "1px solid var(--btn-secondary-border)",
                    color: "var(--btn-secondary-text)",
                  }}
                >
                  Keep subscription
                </button>
                <button
                  onClick={handleCancelSubscription}
                  disabled={subBusy}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                  style={{ backgroundColor: "#DC2626" }}
                >
                  {subBusy ? "Cancelling…" : "Confirm cancel"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* ── Theme & Appearance ── */}
        <section className="mt-8">
          <SectionHeader title="Theme & Appearance" />
          <Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Dark Mode</div>
                  <div className="text-xs text-white/60">Use a darker theme</div>
                </div>
                <Switch checked={theme === "dark"} onChange={(v) => setTheme(v ? "dark" : "light")} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Accent Color</div>
                  <div className="text-xs text-white/60">Blue highlights</div>
                </div>
                <Switch checked={accentColor} onChange={setAccentColor} />
              </div>
            </div>
          </Card>
        </section>

        {/* ── Notification Preferences ── */}
        <section className="mt-8">
          <SectionHeader title="Notification Preferences" />
          <Card>
            <div className="flex items-center justify-between max-w-sm">
              <div>
                <div className="text-sm font-medium">Email Notifications</div>
                <div className="text-xs text-white/60">Receive updates and tips by email</div>
              </div>
              <Switch checked={emailNotif} onChange={setEmailNotif} />
            </div>
          </Card>
        </section>

        {/* ── Data & Privacy ── */}
        <section className="mt-8">
          <SectionHeader title="Data & Privacy" />
          <Card className="border-red-500/30 bg-red-900/15">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handleExport}
                disabled={exporting}
                className="rounded-lg bg-white/10 border border-white/20 px-4 py-2 text-sm disabled:opacity-60"
              >
                {exporting ? "Exporting…" : "Export My Data"}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 hover:bg-red-500 px-4 py-2 text-sm text-white disabled:opacity-60"
              >
                {deleting ? "Deleting…" : "Delete My Account"}
              </button>
            </div>
          </Card>
        </section>

        {/* ── Preferences Save ── */}
        <div className="mt-8 flex items-center justify-end gap-4">
          {saveMsg && (
            <span className={`text-sm ${saveMsg === "Saved!" ? "text-green-400" : "text-red-400"}`}>
              {saveMsg}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-[oklch(0.488_0.243_264.376)] px-5 py-3 text-white text-sm shadow-[0_8px_24px_rgba(43,91,217,0.35)] disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save Preferences"}
          </button>
        </div>
      </PageWithSidebar>

    </div>
  );
}
