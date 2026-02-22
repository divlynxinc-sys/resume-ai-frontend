import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import SiteNavbar from "../layout/site-navbar";
import { SiVisa, SiApplepay, SiGooglepay, SiPaypal, SiStripe } from "react-icons/si";
import { FiLock } from "react-icons/fi";

type Plan = {
  title: string;
  price: string; // e.g. "$29"
  subtitle?: string; // e.g. "/ 200 credits"
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

function Input({ label, placeholder, type = "text" }: { label: string; placeholder: string; type?: string }) {
  return (
    <div className="space-y-2">
      <label className="text-xs text-white/70">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full rounded-lg bg-white/[0.06] px-4 py-3 text-white/80 placeholder:text-white/40 outline-none border border-white/10 focus:border-white/20"
      />
    </div>
  );
}

function PaymentMethod({ selected, onSelect, icon, label }: { selected: boolean; onSelect: () => void; icon: ReactNode; label: string }) {
  return (
    <button
      onClick={onSelect}
      className={`flex items-center gap-3 w-full rounded-xl border px-4 py-3 text-sm transition ${selected ? "border-sky-400 bg-sky-500/10 text-white" : "border-white/12 bg-white/[0.04] text-white/80 hover:text-white"}`}
    >
      <div className="size-6 grid place-items-center">{icon}</div>
      <span className="font-medium">{label}</span>
    </button>
  );
}

function MastercardMark({ size = 24 }: { size?: number }) {
  const s = size;
  return (
    <svg width={s} height={s} viewBox="0 0 48 48" aria-label="Mastercard" role="img">
      <circle cx="18" cy="24" r="12" fill="#EB001B" />
      <circle cx="30" cy="24" r="12" fill="#F79E1B" />
      <rect x="22" y="12" width="4" height="24" fill="#FF5F00" />
    </svg>
  );
}

function CardBrands() {
  return (
    <div className="flex items-center gap-5 text-white/70">
      <span className="text-xs">Cards accepted:</span>
      <SiVisa className="size-8 text-[#1A1F71]" />
      <MastercardMark size={32} />
    </div>
  );
}

export default function SubscriptionScreen() {
  const navigate = useNavigate();
  const [method, setMethod] = useState<"card" | "apple" | "google" | "paypal">("card");
  const [plan, setPlan] = useState<Plan | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("selectedPlan");
      if (raw) setPlan(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  const priceLabel = plan?.price || "$—";
  const planTitle = plan?.title || "Selected Plan";
  const subtitle = plan?.subtitle || "";

  return (
    <div className="min-h-screen w-full bg-[var(--app-bg)] text-white">
      <SiteNavbar />

      <main className="mx-auto max-w-6xl px-6 pt-8 pb-16">
        <SectionTitle title="Subscribe" subtitle="Securely complete your subscription. We process payments using Stripe; we never store your card details." />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
              <h3 className="text-lg font-semibold">Payment Method</h3>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <PaymentMethod selected={method === "card"} onSelect={() => setMethod("card")} icon={<FiLock className="text-sky-400" />} label="Credit or Debit Card" />
                <PaymentMethod selected={method === "apple"} onSelect={() => setMethod("apple")} icon={<div className="size-6 rounded-md bg-white text-black grid place-items-center"><SiApplepay className="size-4" /></div>} label="Apple Pay" />
                <PaymentMethod selected={method === "google"} onSelect={() => setMethod("google")} icon={<SiGooglepay className="size-6 text-[#4285F4]" />} label="Google Pay" />
                <PaymentMethod selected={method === "paypal"} onSelect={() => setMethod("paypal")} icon={<SiPaypal className="size-6 text-[#003087]" />} label="PayPal" />
              </div>

              {method === "card" && (
                <div className="mt-6 space-y-4">
                  <CardBrands />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Card Number" placeholder="1234 5678 9012 3456" />
                    <Input label="Name on Card" placeholder="John Doe" />
                    <Input label="Expiry" placeholder="MM/YY" />
                    <Input label="CVC" placeholder="123" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input label="Email" type="email" placeholder="you@example.com" />
                    <Input label="Country/Region" placeholder="United States" />
                    <Input label="ZIP / Postal Code" placeholder="10001" />
                  </div>
                  <p className="text-xs text-white/50 flex items-center gap-2 mt-1">
                    <SiStripe className="size-4" /> Powered by Stripe — your payment details are encrypted and never stored on our servers.
                  </p>
                </div>
              )}

              {method !== "card" && (
                <div className="mt-6 text-sm text-white/70">
                  <p>When you continue, you'll be redirected to complete the payment via {method === "apple" ? "Apple Pay" : method === "google" ? "Google Pay" : "PayPal"}.</p>
                </div>
              )}
            </div>

            {/* Billing details */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
              <h3 className="text-lg font-semibold">Billing Details</h3>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input label="First Name" placeholder="John" />
                <Input label="Last Name" placeholder="Doe" />
                <Input label="Company (optional)" placeholder="Company LLC" />
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Address" placeholder="123 Main Street" />
                <Input label="City" placeholder="San Francisco" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-xs text-white/60">By subscribing you agree to our <Link to="/terms" className="text-cyan-300 hover:underline">Terms</Link> and <Link to="/privacy" className="text-cyan-300 hover:underline">Privacy Policy</Link>.</div>
              <button
                onClick={() => {
                  navigate("/success");
                }}
                className="rounded-xl bg-sky-500 hover:bg-sky-400 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-sky-500/30"
              >
                Subscribe {priceLabel}
              </button>
            </div>
          </div>

          {/* Summary */}
          <aside className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
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
                <li>• Auto-renewal every billing period (can be cancelled anytime)</li>
                <li>• Email receipt and invoice</li>
              </ul>
              <div className="mt-6 rounded-lg bg-black/20 border border-white/10 px-4 py-3 text-xs text-white/60">
                Taxes may be added during payment based on your billing address.
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
              <h3 className="text-lg font-semibold">Other Payment Options</h3>
              <div className="mt-4 flex items-center gap-4">
                <div className="size-8 rounded-md bg-white text-black grid place-items-center"><SiApplepay className="size-5" /></div>
                <SiGooglepay className="size-8 text-[#4285F4]" />
                <SiPaypal className="size-8 text-[#003087]" />
              </div>
              <p className="mt-3 text-xs text-white/60">Choose a quick-pay method to complete checkout faster.</p>
            </div>
          </aside>
        </div>
      </main>

      {/* Decorative glows for consistency */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -left-24 -top-24 size-[420px] rounded-full bg-[radial-gradient(closest-side,rgba(64,196,255,0.08),transparent_70%)]" />
        <div className="absolute -right-24 -bottom-24 size-[420px] rounded-full bg-[radial-gradient(closest-side,rgba(132,94,255,0.08),transparent_70%)]" />
      </div>
    </div>
  );
}
