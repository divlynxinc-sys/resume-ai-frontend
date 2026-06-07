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

// Only attempt the Polar self-heal once per browser session, so we don't hit
// Polar on every navigation for genuinely free users.
const RECONCILE_FLAG = "polar-reconciled";

interface PlanContextValue {
  currentPlan: string | null;
  isPaid: boolean;
  isLoading: boolean;
  /** Open the upgrade modal manually (e.g. from a pre-click guard). */
  openUpgradeModal: (reason?: string) => void;
  refresh: () => void;
}

const PlanContext = createContext<PlanContextValue | null>(null);

export function PlanProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [modalReason, setModalReason] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

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

  const openUpgradeModal = useCallback((reason?: string) => {
    setModalReason(reason ?? null);
    setModalOpen(true);
  }, []);

  const value = useMemo<PlanContextValue>(
    () => ({
      currentPlan,
      isPaid: !!currentPlan,
      isLoading,
      openUpgradeModal,
      refresh: fetchPlan,
    }),
    [currentPlan, isLoading, openUpgradeModal, fetchPlan],
  );

  return (
    <PlanContext.Provider value={value}>
      {children}
      {modalOpen &&
        createPortal(
          <UpgradeModal reason={modalReason} onClose={() => setModalOpen(false)} />,
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
