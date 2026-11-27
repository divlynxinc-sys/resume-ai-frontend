import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getSafeRedirectPath } from "@/lib/navigation";
import SiteNavbar from "../layout/site-navbar";

export default function OnboardingScreen() {
  const { completeOnboarding } = useAuth();
  const [params] = useSearchParams();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const destination = getSafeRedirectPath(params.get("next"));

  const proceed = async () => {
    setError("");
    setSaving(true);
    try {
      await completeOnboarding();
    } catch {
      setError("Could not save your onboarding progress. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-svh bg-[var(--app-bg)] text-[var(--app-fg)]">
      <SiteNavbar />

      <main className="max-w-[960px] mx-auto px-6 py-12">
        <section className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
            <div className="size-12 rounded-xl bg-[oklch(0.488_0.243_264.376)]/20 border border-[oklch(0.488_0.243_264.376)]/35 grid place-items-center">
              <span className="text-2xl">✨</span>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold">Welcome to Jobsynk AI</h1>
              <p className="mt-2 text-[var(--app-fg-muted)]">Let's get you set up. Here are a few quick tips to help you make the most of the app.</p>
              <ul className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[var(--app-fg-muted)]">
                <li className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4">Use AI Tailoring to align your resume to job postings.</li>
                <li className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4">Browse Templates to pick a design that fits your style.</li>
                <li className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4">Track credits and manage your plan under Pricing.</li>
                <li className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4">Visit the Help Center for tutorials and FAQs.</li>
              </ul>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button disabled={saving} onClick={proceed} className="rounded-xl bg-[var(--btn-primary-bg)] px-5 py-2 font-medium text-[var(--btn-primary-text)] hover:bg-[var(--btn-primary-hover)] disabled:opacity-50">
                  {saving ? "Saving…" : destination === "/dashboard" ? "Continue to Dashboard" : "Continue"}
                </button>
                <button disabled={saving} onClick={proceed} className="rounded-xl border border-[var(--app-border)] px-5 py-2 text-[var(--app-fg-muted)] hover:text-[var(--app-fg)] hover:bg-[var(--app-surface)] disabled:opacity-50">Skip for now</button>
              </div>
              {error && <p role="alert" className="mt-3 text-sm text-[var(--tone-reject)]">{error}</p>}
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6">
          <div className="text-[var(--app-fg-muted)] text-sm">Prefer a guided setup? Explore <Link to="/user-details" state={{ fromOnboarding: true }} className="text-[var(--accent-text)] hover:underline">User Details</Link> to fill profile info.</div>
        </section>
      </main>
    </div>
  );
}
