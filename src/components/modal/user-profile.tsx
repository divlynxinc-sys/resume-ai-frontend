import { useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import SiteNavbar from "../layout/site-navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { profileService, settingsService } from "@/services";
import type { AccountSummary } from "@/services/settings";

function SectionCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 md:p-6 text-white shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
      {children}
    </div>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  readOnly,
  type = "text",
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="text-sm text-white/80">{label}</div>
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full rounded-md bg-[#0e1526] border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
      />
    </div>
  );
}

export default function UserProfileScreen() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [summary, setSummary] = useState<AccountSummary | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    profileService.getMe()
      .then((p) => { setName(p.name); setEmail(p.email); })
      .catch(() => {});
    settingsService.getAccountSummary()
      .then(setSummary)
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      await Promise.all([
        profileService.updateMe({ name }),
        settingsService.updatePreferences({ theme }),
      ]);
      setSaveMsg("Saved!");
    } catch {
      setSaveMsg("Failed to save. Please try again.");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(null), 3000);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Permanently delete your account and all data? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await settingsService.deleteAccount();
      await logout();
      navigate("/login");
    } catch {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-white">
      <SiteNavbar />

      <main className="mx-auto max-w-3xl px-6 pb-12">
        <section className="pt-10">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Settings</h1>
        </section>

        {/* Profile */}
        <section className="mt-6">
          <div className="text-white/80 font-medium mb-3">Profile</div>
          <SectionCard>
            <div className="space-y-4">
              <LabeledInput label="Name" value={name} onChange={setName} />
              <LabeledInput label="Email" value={email} readOnly />
            </div>
          </SectionCard>
        </section>

        {/* Theme */}
        <section className="mt-8">
          <div className="text-white/80 font-medium mb-3">Theme</div>
          <SectionCard>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setTheme('light')}
                className={`px-4 py-2 rounded-lg text-sm border ${
                  theme === 'light'
                    ? 'border-blue-500/40 text-blue-100 bg-blue-950/30 ring-2 ring-blue-500'
                    : 'border-white/10 text-white/80 bg-white/[0.03]'
                }`}
              >
                Light
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`px-4 py-2 rounded-lg text-sm border ${
                  theme === 'dark'
                    ? 'border-blue-500/40 text-blue-100 bg-blue-950/30 ring-2 ring-blue-500'
                    : 'border-white/10 text-white/80 bg-white/[0.03]'
                }`}
              >
                Dark
              </button>
            </div>
          </SectionCard>
        </section>

        {/* Subscription */}
        <section className="mt-8">
          <div className="text-white/80 font-medium mb-3">Subscription</div>
          <SectionCard>
            <div className="text-sm">
              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="text-white/90">Current Plan</div>
                  <div className="text-white/50">{summary?.current_plan ?? "—"}</div>
                </div>
                <div className="text-white/70">{summary?.credits_remaining != null ? `${summary.credits_remaining} credits` : "—"}</div>
              </div>
              <div className="my-3 h-px bg-white/10" />
              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="text-white/90">Upgrade</div>
                  <div className="text-white/50">Unlock premium templates and more AI credits</div>
                </div>
                <button
                  onClick={() => navigate("/pricing")}
                  className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium"
                >
                  View Plans
                </button>
              </div>
            </div>
          </SectionCard>
        </section>

        {/* Save */}
        <div className="mt-8 flex items-center justify-end gap-4">
          {saveMsg && (
            <span className={`text-sm ${saveMsg === "Saved!" ? "text-green-400" : "text-red-400"}`}>
              {saveMsg}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>

        {/* Account Danger Zone */}
        <section className="mt-8">
          <div className="text-white/80 font-medium mb-3">Account</div>
          <div className="rounded-xl border border-red-500/30 bg-red-900/20 p-5 md:p-6 text-white shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium">Delete Account</div>
                <div className="text-white/70 text-sm">Permanently delete your account and all data.</div>
              </div>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-500 text-white text-sm font-medium disabled:opacity-60"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
