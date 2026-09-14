/**
 * AI Interview credit packs — display catalog.
 *
 * 1 credit = 1 live AI interview, report included. Packs are one-time purchases
 * open to every signed-in user (no subscription needed) and never expire.
 *
 * STATIC on purpose, like the plan cards in pricing.tsx: /pricing is prerendered
 * for crawlers and anonymous visitors, so it can't wait on the backend. Three
 * places must agree — keep them in sync by hand:
 *   - this file (what we show),
 *   - resumeai-backend `InterviewCreditSettings` in app/core/config.py (credits granted),
 *   - the Polar products POLAR_PRODUCT_INTERVIEW_CREDITS_3 / _30 (what is charged).
 *
 * Not discounted by the launch offer — that applies to subscription plans only.
 */

export type InterviewCreditPackKey = "interview_3" | "interview_30";

export type InterviewCreditPack = {
  key: InterviewCreditPackKey;
  credits: number;
  price: number;
  /** What the same credits cost in 3-credit packs, for the "save" line. */
  compareAt?: number;
  title: string;
  blurb: string;
  badge?: string;
};

export const INTERVIEW_CREDIT_PACKS: InterviewCreditPack[] = [
  {
    key: "interview_3",
    credits: 3,
    price: 10,
    title: "3 AI Interviews",
    blurb: "Enough to rehearse for your next interview. Buy it again whenever you need more.",
  },
  {
    key: "interview_30",
    credits: 30,
    price: 90,
    compareAt: 100,
    title: "30 AI Interviews",
    blurb: "For a long search or lots of practice. Works out to $3 per interview.",
    badge: "Save $10",
  },
];

export function formatUsd(amount: number) {
  return `$${Number.isInteger(amount) ? amount : amount.toFixed(2)}`;
}

/** Fired after a purchase is confirmed so every balance display refetches. */
export const INTERVIEW_CREDITS_UPDATED_EVENT = "interview-credits-updated";
/** Fired by lib/api.ts on a 402 `interview_credits_required`. */
export const INTERVIEW_CREDITS_REQUIRED_EVENT = "interview-credits-required";
