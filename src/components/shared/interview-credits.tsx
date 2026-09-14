import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { interviewCreditsService, type InterviewCreditsDto } from "@/services/interviewCredits";
import {
  formatUsd,
  INTERVIEW_CREDIT_PACKS,
  INTERVIEW_CREDITS_REQUIRED_EVENT,
  INTERVIEW_CREDITS_UPDATED_EVENT,
  type InterviewCreditPack,
  type InterviewCreditPackKey,
} from "@/lib/interview-credits";
import { withNextParam } from "@/lib/navigation";

/*
 * AI Interview credits UI, shared by /pricing (add-on section), /ai-interviews
 * (balance + out-of-credits modal) and /success. Everything that touches
 * window/localStorage runs in effects or handlers: /pricing is prerendered.
 */

function hasSession() {
  return typeof window !== "undefined" && !!localStorage.getItem("accessToken");
}

/** Live balance for the signed-in user; `null` data while anonymous or loading. */
export function useInterviewCredits() {
  const [data, setData] = useState<InterviewCreditsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!hasSession()) {
      setData(null);
      setLoading(false);
      return;
    }
    try {
      setData(await interviewCreditsService.get());
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't load your interview credits.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onUpdated = () => void refresh();
    window.addEventListener(INTERVIEW_CREDITS_UPDATED_EVENT, onUpdated);
    return () => window.removeEventListener(INTERVIEW_CREDITS_UPDATED_EVENT, onUpdated);
  }, [refresh]);

  return {
    data,
    balance: data?.balance ?? 0,
    unlimited: !!data?.unlimited,
    loading,
    error,
    refresh,
  };
}

/** Starts a hosted Polar checkout for a pack, sending anonymous visitors to log in first. */
export function useBuyInterviewCredits() {
  const navigate = useNavigate();
  const location = useLocation();
  const [pending, setPending] = useState<InterviewCreditPackKey | null>(null);
  const [error, setError] = useState("");

  const buy = useCallback(
    async (pack: InterviewCreditPackKey) => {
      setError("");
      if (!hasSession()) {
        navigate(withNextParam("/login", `${location.pathname}${location.search}`));
        return;
      }
      setPending(pack);
      try {
        const res = await interviewCreditsService.createCheckout(pack);
        window.location.href = res.checkout_url;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't open checkout. Please try again.");
        setPending(null);
      }
    },
    [navigate, location.pathname, location.search],
  );

  return { buy, pending, error };
}

function PackCard({
  pack,
  pending,
  disabled,
  onBuy,
}: {
  pack: InterviewCreditPack;
  pending: boolean;
  disabled: boolean;
  onBuy: () => void;
}) {
  const featured = !!pack.badge;
  return (
    <div
      className="relative flex h-full flex-col rounded-2xl bg-[var(--app-surface)] px-5 py-6 text-left"
      style={{ border: featured ? "2px solid var(--accent)" : "1px solid var(--app-border)", color: "var(--app-fg)" }}
    >
      {pack.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--accent)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
          {pack.badge}
        </div>
      )}
      <div className="font-display text-xl font-medium tracking-tight">{pack.title}</div>
      <div className="mt-3 flex flex-wrap items-baseline gap-1.5">
        {pack.compareAt && (
          <span className="font-display text-xl font-light tracking-tight text-[var(--app-fg-muted)] line-through">
            {formatUsd(pack.compareAt)}
          </span>
        )}
        <span className="font-display text-4xl font-light tracking-tight">{formatUsd(pack.price)}</span>
        <span className="text-sm text-[var(--app-fg-muted)]">one-time</span>
      </div>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--app-fg-muted)]">{pack.blurb}</p>
      <button
        type="button"
        onClick={onBuy}
        disabled={disabled}
        className="mt-5 w-full rounded-lg px-5 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        style={
          featured
            ? { backgroundColor: "var(--accent)", color: "#ffffff" }
            : { backgroundColor: "var(--app-surface)", color: "var(--app-fg)", border: "1px solid var(--app-border-strong)" }
        }
      >
        {pending ? "Opening checkout…" : `Buy ${pack.credits} credits`}
      </button>
    </div>
  );
}

function CheckoutError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-left text-sm text-rose-600 dark:text-rose-300" role="alert">
      {message}
    </p>
  );
}

/** The two full pack cards (used by the out-of-credits modal). */
export function InterviewCreditPacks() {
  const { buy, pending, error } = useBuyInterviewCredits();
  return (
    <div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {INTERVIEW_CREDIT_PACKS.map((pack) => (
          <PackCard
            key={pack.key}
            pack={pack}
            pending={pending === pack.key}
            disabled={pending !== null}
            onBuy={() => void buy(pack.key)}
          />
        ))}
      </div>
      <CheckoutError message={error} />
    </div>
  );
}

function MiniPack({
  pack,
  pending,
  disabled,
  onBuy,
}: {
  pack: InterviewCreditPack;
  pending: boolean;
  disabled: boolean;
  onBuy: () => void;
}) {
  const featured = !!pack.badge;
  return (
    <div
      className="relative flex flex-col rounded-xl bg-[var(--app-surface)] p-4"
      style={{ border: featured ? "2px solid var(--accent)" : "1px solid var(--app-border)" }}
    >
      {pack.badge && (
        <span className="absolute -top-2.5 right-3 rounded-full bg-[var(--accent)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
          {pack.badge}
        </span>
      )}
      <div className="text-sm font-medium text-[var(--app-fg)]">{pack.title}</div>
      <div className="mt-1 flex flex-wrap items-baseline gap-1.5">
        {pack.compareAt && (
          <span className="text-sm text-[var(--app-fg-muted)] line-through">{formatUsd(pack.compareAt)}</span>
        )}
        <span className="font-display text-3xl font-light tracking-tight text-[var(--app-fg)]">{formatUsd(pack.price)}</span>
        <span className="text-xs text-[var(--app-fg-muted)]">one-time</span>
      </div>
      <button
        type="button"
        onClick={onBuy}
        disabled={disabled}
        className="mt-3 w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        style={
          featured
            ? { backgroundColor: "var(--accent)", color: "#ffffff" }
            : { backgroundColor: "var(--app-surface)", color: "var(--app-fg)", border: "1px solid var(--app-border-strong)" }
        }
      >
        {pending ? "Opening…" : `Buy ${pack.credits}`}
      </button>
    </div>
  );
}

/**
 * Pricing add-on band. Deliberately compact and placed ABOVE the plan cards
 * (inside PricingSection), so it's seen first while the plans stay visible
 * right below it.
 */
export function InterviewCreditsAddon() {
  const location = useLocation();
  const { buy, pending, error } = useBuyInterviewCredits();
  useEffect(() => {
    if (location.hash === "#interview-credits") {
      document.getElementById("interview-credits")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [location.hash]);

  return (
    <section id="interview-credits" aria-labelledby="interview-credits-heading" className="mx-auto max-w-5xl scroll-mt-24 text-left">
      <div className="grid gap-5 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-2)] p-5 sm:p-6 md:grid-cols-[1.2fr_1fr] md:items-center">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent-text)]">Add-on · AI Interviews</div>
          <h2 id="interview-credits-heading" className="mt-1.5 font-display text-2xl font-light tracking-tight text-[var(--app-fg)]">
            Practise out loud, <span className="italic">get scored.</span>
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--app-fg-muted)]">
            1 credit = 1 live mock interview with its full report. One-time, no subscription needed, and credits never
            expire. Buy 3 again whenever you need more.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 pt-1">
          {INTERVIEW_CREDIT_PACKS.map((pack) => (
            <MiniPack
              key={pack.key}
              pack={pack}
              pending={pending === pack.key}
              disabled={pending !== null}
              onBuy={() => void buy(pack.key)}
            />
          ))}
        </div>
      </div>
      <CheckoutError message={error} />
    </section>
  );
}

/** Imperatively open the out-of-credits modal (e.g. a pre-click guard). */
export function openInterviewCreditsModal(message?: string) {
  window.dispatchEvent(new CustomEvent(INTERVIEW_CREDITS_REQUIRED_EVENT, { detail: { message } }));
}

/** Mount once per page tree; opens on the 402 event lib/api.ts dispatches. */
export function InterviewCreditsModal() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onRequired = (e: Event) => {
      setMessage((e as CustomEvent<{ message?: string }>).detail?.message || "");
      setOpen(true);
    };
    window.addEventListener(INTERVIEW_CREDITS_REQUIRED_EVENT, onRequired);
    return () => window.removeEventListener(INTERVIEW_CREDITS_REQUIRED_EVENT, onRequired);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  if (!open) return null;
  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-labelledby="interview-credits-title"
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl p-6 text-left"
        style={{
          backgroundColor: "var(--app-surface)",
          border: "1px solid var(--app-border)",
          boxShadow: "var(--shadow-pop)",
          color: "var(--app-fg)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="interview-credits-title" className="font-display text-2xl font-light">
          Get interview credits
        </h3>
        <p className="mt-2 text-sm text-[var(--app-fg-muted)]">
          {message || "You need an AI interview credit to start an interview."} Each credit is one live interview plus
          its full report, and credits never expire.
        </p>
        <div className="mt-7">
          <InterviewCreditPacks />
        </div>
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={close}
            className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            style={{
              backgroundColor: "var(--btn-secondary-bg)",
              border: "1px solid var(--btn-secondary-border)",
              color: "var(--btn-secondary-text)",
            }}
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
