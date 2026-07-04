import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { settingsService } from "@/services/settings";
import { pricingService } from "@/services";
import { useAuth } from "@/contexts/AuthContext";
import { LAUNCH_OFFER, isLaunchOfferActive, launchOfferPrice } from "@/lib/launch-offer";

// Only attempt the Polar self-heal once per browser session, so we don't hit
// Polar on every navigation for genuinely free users.
const RECONCILE_FLAG = "polar-reconciled";

/** A recorded "weekly usage cap hit" for one feature, persisted until it resets. */
export interface UsageLimitHit {
  feature: string;
  message: string | null;
  resetsAt: string | null;
  hitAt: number;
}

const USAGE_HITS_KEY = "jobsynk.usageLimitHits";
const FALLBACK_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

function loadUsageHits(): Record<string, UsageLimitHit> {
  try {
    const raw = localStorage.getItem(USAGE_HITS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, UsageLimitHit>;
    const now = Date.now();
    const alive: Record<string, UsageLimitHit> = {};
    for (const [feature, hit] of Object.entries(parsed)) {
      const resetTs = hit.resetsAt ? new Date(hit.resetsAt).getTime() : NaN;
      const expiry = Number.isNaN(resetTs) ? hit.hitAt + FALLBACK_WINDOW_MS : resetTs;
      if (expiry > now) alive[feature] = hit;
    }
    return alive;
  } catch {
    return {};
  }
}

function saveUsageHits(hits: Record<string, UsageLimitHit>) {
  try {
    localStorage.setItem(USAGE_HITS_KEY, JSON.stringify(hits));
  } catch {
    // Local storage can be unavailable in restricted browser contexts.
  }
}

interface PlanContextValue {
  currentPlan: string | null;
  isPaid: boolean;
  isLoading: boolean;
  /** Open the upgrade modal manually (e.g. from a pre-click guard). */
  openUpgradeModal: (reason?: string) => void;
  refresh: () => void;
  /** Features whose weekly cap the user has hit (newest first), for the banner. */
  usageLimitHits: UsageLimitHit[];
  dismissUsageLimit: (feature: string) => void;
}

const PlanContext = createContext<PlanContextValue | null>(null);

export function PlanProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [modalReason, setModalReason] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Hidden weekly usage cap (backend 429). Free users get an upgrade CTA in the
  // modal/banner; paid users just see when it resets.
  const [usageModalOpen, setUsageModalOpen] = useState(false);
  const [usageMessage, setUsageMessage] = useState<string | null>(null);
  const [usageResetsAt, setUsageResetsAt] = useState<string | null>(null);
  const [usageHits, setUsageHits] = useState<Record<string, UsageLimitHit>>(loadUsageHits);

  // Track in a ref so the global `upgrade-required` listener (defined once) always
  // sees the latest value without re-binding on every isPaid change.
  const isPaidRef = useRef(false);

  const fetchPlan = useCallback(() => {
    if (!isAuthenticated) {
      setCurrentPlan(null);
      isPaidRef.current = false;
      return;
    }
    setIsLoading(true);
    settingsService
      .getAccountSummary()
      .then((res) => {
        setCurrentPlan(res.current_plan);
        isPaidRef.current = !!res.current_plan;

        // Self-heal: if the account looks unpaid, reconcile against Polar once
        // per session. Polar webhooks can't reach localhost in dev, and even in
        // prod the post-checkout redirect may land on a different environment —
        // either way the local DB can lag behind an actually-active Polar sub.
        // The sync endpoint is idempotent and only clears an already-null plan
        // when there's genuinely no active subscription, so this is safe.
        if (!res.current_plan && !sessionStorage.getItem(RECONCILE_FLAG)) {
          sessionStorage.setItem(RECONCILE_FLAG, "1");
          pricingService
            .syncPolarSubscription()
            .then((sync) => {
              if (sync.synced && sync.current_plan) {
                setCurrentPlan(sync.current_plan);
                isPaidRef.current = true;
                window.dispatchEvent(new CustomEvent("plan-updated"));
              }
            })
            .catch(() => {
              // Polar unreachable / no sub — leave the unpaid state as-is.
            });
        }
      })
      .catch(() => {
        // Keep prior value on transient errors.
      })
      .finally(() => setIsLoading(false));
  }, [isAuthenticated]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  // Refresh on the same broadcast used by payment-success / pricing.
  useEffect(() => {
    const onPlanUpdated = () => fetchPlan();
    window.addEventListener("plan-updated", onPlanUpdated);
    return () => window.removeEventListener("plan-updated", onPlanUpdated);
  }, [fetchPlan]);

  // Listen to backend-driven 402s and surface the modal.
  useEffect(() => {
    const onUpgradeRequired = (e: Event) => {
      const detail = (e as CustomEvent<{ message?: string }>).detail;
      setModalReason(detail?.message ?? null);
      setModalOpen(true);
    };
    window.addEventListener("upgrade-required", onUpgradeRequired);
    return () => window.removeEventListener("upgrade-required", onUpgradeRequired);
  }, []);

  // Listen to backend-driven 429s (hidden weekly usage cap): surface the modal
  // and persist the hit so the banner survives reloads until the window resets.
  useEffect(() => {
    const onUsageLimit = (e: Event) => {
      const detail = (e as CustomEvent<{ message?: string; resetsAt?: string; feature?: string }>)
        .detail;
      setUsageMessage(detail?.message ?? null);
      setUsageResetsAt(detail?.resetsAt ?? null);
      setUsageModalOpen(true);
      const feature = detail?.feature || "ai";
      setUsageHits((prev) => {
        const next = {
          ...prev,
          [feature]: {
            feature,
            message: detail?.message ?? null,
            resetsAt: detail?.resetsAt ?? null,
            hitAt: Date.now(),
          },
        };
        saveUsageHits(next);
        return next;
      });
    };
    window.addEventListener("usage-limit-reached", onUsageLimit);
    return () => window.removeEventListener("usage-limit-reached", onUsageLimit);
  }, []);

  const openUpgradeModal = useCallback((reason?: string) => {
    setModalReason(reason ?? null);
    setModalOpen(true);
  }, []);

  const dismissUsageLimit = useCallback((feature: string) => {
    setUsageHits((prev) => {
      if (!(feature in prev)) return prev;
      const next = { ...prev };
      delete next[feature];
      saveUsageHits(next);
      return next;
    });
  }, []);

  const usageLimitHits = useMemo(() => {
    const now = Date.now();
    return Object.values(usageHits)
      .filter((h) => {
        const resetTs = h.resetsAt ? new Date(h.resetsAt).getTime() : NaN;
        const expiry = Number.isNaN(resetTs) ? h.hitAt + FALLBACK_WINDOW_MS : resetTs;
        return expiry > now;
      })
      .sort((a, b) => b.hitAt - a.hitAt);
  }, [usageHits]);

  const value = useMemo<PlanContextValue>(
    () => ({
      currentPlan,
      isPaid: !!currentPlan,
      isLoading,
      openUpgradeModal,
      refresh: fetchPlan,
      usageLimitHits,
      dismissUsageLimit,
    }),
    [currentPlan, isLoading, openUpgradeModal, fetchPlan, usageLimitHits, dismissUsageLimit],
  );

  return (
    <PlanContext.Provider value={value}>
      {children}
      {modalOpen &&
        createPortal(
          <UpgradeModal reason={modalReason} onClose={() => setModalOpen(false)} />,
          document.body,
        )}
      {usageModalOpen &&
        createPortal(
          <UsageLimitModal
            message={usageMessage}
            resetsAt={usageResetsAt}
            isPaid={!!currentPlan}
            onClose={() => setUsageModalOpen(false)}
          />,
          document.body,
        )}
    </PlanContext.Provider>
  );
}

export function usePlan() {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used within <PlanProvider>");
  return ctx;
}

/**
 * Convenience guard: runs `action` if the user is on a paid plan; otherwise opens
 * the upgrade modal with `reason`. Use this to wrap premium AI button click handlers.
 */
export function useRequirePaid() {
  const { isPaid, openUpgradeModal } = usePlan();
  return useCallback(
    (action: () => void, reason?: string) => {
      if (isPaid) {
        action();
      } else {
        openUpgradeModal(reason);
      }
    },
    [isPaid, openUpgradeModal],
  );
}

// ─── Modal ──────────────────────────────────────────────────────────────────────

function UpgradeModal({ reason, onClose }: { reason: string | null; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 text-left"
        style={{
          backgroundColor: "var(--app-surface)",
          border: "1px solid var(--app-border)",
          boxShadow: "var(--shadow-pop)",
          color: "var(--app-fg)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-indigo-500/40 bg-indigo-500/10 px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] uppercase text-indigo-700 dark:text-indigo-300">
            Pro
          </span>
          <h3 className="text-lg font-semibold">Unlock AI tailoring</h3>
        </div>
        <p className="mt-3 text-sm" style={{ color: "var(--app-fg-muted)" }}>
          {reason || "This feature uses our AI engine to tailor your application materials to each job posting. Upgrade to a plan to use it."}
        </p>
        <ul className="mt-4 space-y-2 text-sm" style={{ color: "var(--app-fg-muted)" }}>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-emerald-500">✓</span>
            <span>AI-tailored resumes matched to every job description</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-emerald-500">✓</span>
            <span>AI-generated cover letters and HR email drafts</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-emerald-500">✓</span>
            <span>AI resume optimization, all templates, priority generation</span>
          </li>
        </ul>
        {isLaunchOfferActive() && (
          <p className="mt-4 rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-3 py-2 text-sm font-medium">
            🎉 {LAUNCH_OFFER.label}: {LAUNCH_OFFER.percentOff}% off all plans — applied
            automatically at checkout.
          </p>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            style={{
              backgroundColor: "var(--btn-secondary-bg)",
              border: "1px solid var(--btn-secondary-border)",
              color: "var(--btn-secondary-text)",
            }}
          >
            Maybe later
          </button>
          <a
            href="/pricing"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-white"
            style={{ backgroundColor: "var(--accent)" }}
          >
            View plans
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Usage-limit modal ────────────────────────────────────────────────────────────

// Cheapest active plan price, fetched once per page load and shared by the
// usage-limit modal and banner ("plans start at $X").
let minPricePromise: Promise<number | null> | null = null;

function fetchMinPlanPrice(): Promise<number | null> {
  if (!minPricePromise) {
    minPricePromise = pricingService
      .listPlans()
      .then((plans) => {
        const prices = plans.map((p) => p.price).filter((p) => p > 0);
        // Reflect the launch offer so upsell copy matches the pricing page.
        return prices.length ? launchOfferPrice(Math.min(...prices)) : null;
      })
      .catch(() => {
        minPricePromise = null; // allow a retry next time
        return null;
      });
  }
  return minPricePromise;
}

/** Cheapest paid-plan price, or null while loading / on failure. */
export function useMinPlanPrice(enabled = true): number | null {
  const [price, setPrice] = useState<number | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    fetchMinPlanPrice().then((p) => {
      if (alive) setPrice(p);
    });
    return () => {
      alive = false;
    };
  }, [enabled]);
  return price;
}

/** Turn an ISO `resets_at` into a soft, user-friendly hint (never exact tokens). */
function formatResetHint(resetsAt: string | null): string | null {
  if (!resetsAt) return null;
  const ts = new Date(resetsAt).getTime();
  if (Number.isNaN(ts)) return null;
  const ms = ts - Date.now();
  if (ms <= 0) return "You can try again now.";
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
  return days <= 1 ? "It resets within a day." : `It resets in about ${days} days.`;
}

function UsageLimitModal({
  message,
  resetsAt,
  isPaid,
  onClose,
}: {
  message: string | null;
  resetsAt: string | null;
  isPaid: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const resetHint = formatResetHint(resetsAt);
  const minPrice = useMinPlanPrice(!isPaid);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 text-left"
        style={{
          backgroundColor: "var(--app-surface)",
          border: "1px solid var(--app-border)",
          boxShadow: "var(--shadow-pop)",
          color: "var(--app-fg)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold">
          {isPaid ? "You're going fast! 🚀" : "You've hit your free weekly limit"}
        </h3>
        <p className="mt-3 text-sm" style={{ color: "var(--app-fg-muted)" }}>
          {message ||
            "You've reached your weekly limit for this feature. Please try again in a few days."}
        </p>
        {resetHint && (
          <p className="mt-2 text-sm" style={{ color: "var(--app-fg-muted)" }}>
            {resetHint}
          </p>
        )}
        {!isPaid && (
          <p className="mt-2 text-sm" style={{ color: "var(--app-fg-muted)" }}>
            Subscribe to a paid plan for higher weekly limits
            {minPrice != null ? ` — plans start at $${minPrice.toFixed(2)}` : ""}.
          </p>
        )}
        <div className="mt-6 flex justify-end gap-3">
          {isPaid ? (
            <button
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: "var(--accent)" }}
            >
              Got it
            </button>
          ) : (
            <>
              <button
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: "var(--btn-secondary-bg)",
                  border: "1px solid var(--btn-secondary-border)",
                  color: "var(--btn-secondary-text)",
                }}
              >
                Maybe later
              </button>
              <a
                href="/pricing"
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm font-medium text-white"
                style={{ backgroundColor: "var(--accent)" }}
              >
                View plans
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
