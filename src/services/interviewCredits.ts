import api from "@/lib/api";
import type { InterviewCreditPackKey } from "@/lib/interview-credits";

/** Backend contract: `resumeai-backend/app/routers/interview_credits.py`. */

export interface InterviewCreditPackDto {
  key: InterviewCreditPackKey;
  credits: number;
  price_cents: number;
  /** False until the Polar product id is configured on the backend. */
  available: boolean;
}

export interface InterviewCreditTransactionDto {
  kind: "purchase" | "order_refunded" | "interview" | "interview_refund";
  delta: number;
  balance_after: number | null;
  pack: InterviewCreditPackKey | null;
  created_at: string;
}

export interface InterviewCreditsDto {
  balance: number;
  /** Admins are never charged; the UI hides purchase prompts for them. */
  unlimited: boolean;
  packs: InterviewCreditPackDto[];
  recent: InterviewCreditTransactionDto[];
}

export interface InterviewCreditsSyncDto {
  balance: number;
  granted_credits: number;
  checkout_confirmed: boolean;
  checkout_credits: number;
}

export const interviewCreditsService = {
  get: () => api.get<InterviewCreditsDto>("/interview-credits"),

  createCheckout: (pack: InterviewCreditPackKey) =>
    api.post<{ checkout_url: string; checkout_id: string }>("/interview-credits/checkout", { pack }),

  sync: (checkoutId?: string | null) =>
    api.post<InterviewCreditsSyncDto>("/interview-credits/sync", { checkout_id: checkoutId ?? null }),
};
