import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { usePlan, useMinPlanPrice } from "@/contexts/PlanContext";

// Friendly names for the backend's UsageFeature keys.
const FEATURE_LABELS: Record<string, string> = {
  resume_ai: "AI resume optimization",
  cover_letter: "cover letter generation",
  qa_answers: "Q&A answer generation",
  hr_email: "HR email drafts",
};

function resetHint(resetsAt: string | null): string {
  if (!resetsAt) return "It resets within a week.";
  const ts = new Date(resetsAt).getTime();
  if (Number.isNaN(ts)) return "It resets within a week.";
  const ms = ts - Date.now();
  if (ms <= 0) return "You can try again now.";
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
  return days <= 1 ? "It resets within a day." : `It resets in about ${days} days.`;
}

/**
 * Persistent "you've hit your weekly AI limit" banner, shown at the top of every
 * sidebar page after a 429 until the rolling window resets (or it's dismissed).
 * Free users get a subscribe CTA; paid users just see when it resets.
 */
export default function UsageLimitBanner() {
  const { usageLimitHits, isPaid, dismissUsageLimit } = usePlan();
  const hit = usageLimitHits[0];
  const minPrice = useMinPlanPrice(!!hit && !isPaid);

  if (!hit) return null;

  const label = FEATURE_LABELS[hit.feature] ?? "this AI feature";

  return (
    <div
      role="status"
      className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border px-4 py-3 text-sm"
      style={{
        backgroundColor: "var(--app-surface)",
        borderColor: isPaid ? "var(--app-border)" : "rgba(99, 102, 241, 0.4)",
        color: "var(--app-fg)",
        boxShadow: "var(--shadow-soft)",
      }}
    >
      <span className="flex-1 min-w-[200px]">
        {isPaid ? (
          <>
            You've reached your weekly limit for {label}. {resetHint(hit.resetsAt)}
          </>
        ) : (
          <>
            You've hit your free weekly limit for {label}. Subscribe
            {minPrice != null ? ` from $${minPrice.toFixed(2)}` : " to a plan"} to keep
            using AI features.
          </>
        )}
      </span>
      {!isPaid && (
        <Link
          to="/pricing"
          className="shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium text-white"
          style={{ backgroundColor: "var(--accent)" }}
        >
          View plans
        </Link>
      )}
      <button
        onClick={() => dismissUsageLimit(hit.feature)}
        aria-label="Dismiss"
        className="shrink-0 rounded-md p-1 transition-colors hover:bg-[var(--app-surface-2)]"
        style={{ color: "var(--app-fg-muted)" }}
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
