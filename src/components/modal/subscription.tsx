import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiLock } from "react-icons/fi";
import SiteNavbar from "../layout/site-navbar";
import { pricingService } from "@/services";

type Plan = {
  title: string;
  slug?: string;
  price: string;
  subtitle?: string;
};

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">{title}</h2>
      {subtitle ? (
        <p className="mt-2 text-sm text-white/60 max-w-2xl">{subtitle}</p>
      ) : null}
    </div>
  );
}

export default function SubscriptionScreen() {
  const navigate = useNavigate();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "redirecting">("idle");
  const startedRef = useRef(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("selectedPlan");
      if (raw) setPlan(JSON.parse(raw));
    } catch {}
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    if (!plan?.slug || startedRef.current) return;
    startedRef.current = true;

    if (!localStorage.getItem("accessToken")) {
      navigate("/login?next=/subscribe", { replace: true });
      return;
    }

    setStatus("redirecting");
    pricingService
      .createPolarCheckout(plan.slug)
      .then((res) => {
        window.location.href = res.checkout_url;
      })
      .catch((err: Error) => {
        setError(err.message || "Could not start checkout. Please try again.");
        setStatus("idle");
      });
  }, [plan, navigate]);

  const priceLabel = plan?.price || "$—";
  const planTitle = plan?.title || "Selected Plan";
  const subtitle = plan?.subtitle || "";

  return (
    <div className="min-h-screen w-full bg-[var(--app-bg)] text-white">
      <SiteNavbar />

      <main className="mx-auto max-w-3xl px-6 pt-8 pb-16">
        <SectionTitle
          title="Subscribe"
          subtitle="You'll be redirected to our secure payment provider (Polar) to complete checkout."
        />

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
          <h3 className="text-lg font-semibold">Plan Summary</h3>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <div className="text-white font-medium">{planTitle}</div>
              {subtitle ? <div className="text-xs text-white/60">{subtitle}</div> : null}
            </div>
            <div className="text-2xl font-bold">{priceLabel}</div>
          </div>

          <ul className="mt-4 space-y-2 text-sm text-white/80">
            <li>• Immediate access to all features included in your plan</li>
            <li>• Auto-renewal every billing period (cancel anytime)</li>
            <li>• Email receipt and invoice from Polar</li>
          </ul>

          <div className="mt-6 flex items-center justify-between">
            <p className="text-xs text-white/50 flex items-center gap-2">
              <FiLock className="size-4 text-sky-400" /> Powered by Polar — payments are processed on a PCI-compliant page; we never see your card details.
            </p>
          </div>

          <div className="mt-6">
            {!plan?.slug && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                No plan selected.{" "}
                <Link to="/pricing" className="underline">
                  Pick a plan first
                </Link>
                .
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            {status === "redirecting" && (
              <div className="flex items-center gap-3 text-sm text-white/80">
                <span className="inline-block size-4 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
                Redirecting to secure checkout…
              </div>
            )}

            {error && plan?.slug && (
              <button
                onClick={() => {
                  setError(null);
                  startedRef.current = false;
                  setPlan({ ...plan });
                }}
                className="mt-4 rounded-xl bg-sky-500 hover:bg-sky-400 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-sky-500/30"
              >
                Try again
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 text-xs text-white/60">
          By subscribing you agree to our{" "}
          <Link to="/terms" className="text-cyan-300 hover:underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="text-cyan-300 hover:underline">
            Privacy Policy
          </Link>
          .
        </div>
      </main>

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 -top-24 size-[420px] rounded-full bg-[radial-gradient(closest-side,rgba(64,196,255,0.08),transparent_70%)]" />
        <div className="absolute -right-24 -bottom-24 size-[420px] rounded-full bg-[radial-gradient(closest-side,rgba(132,94,255,0.08),transparent_70%)]" />
      </div>
    </div>
  );
}
