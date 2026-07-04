import api from "@/lib/api";

export interface PricingPlan {
  id: number;
  name: string;
  slug: string;
  label: string;
  price: number;
  credits: number;
  description: string;
  features: string[];
  is_popular: boolean;
  display_order: number;
}

export interface PolarCheckoutResponse {
  checkout_url: string;
  checkout_id: string;
}

export interface PolarSyncResponse {
  synced: boolean;
  current_plan: string | null;
  plan_slug: string | null;
  credits_remaining: number;
}

export interface PolarSubscriptionDetails {
  has_subscription: boolean;
  subscription_id: string | null;
  plan_name: string | null;
  plan_slug: string | null;
  status: string | null;
  current_period_end: string | null; // ISO datetime
  cancel_at_period_end: boolean;
  // Money-back / reservation extensions:
  state: string | null;
  refund_eligible_now: boolean;
  refund_window_days: number;
  can_reactivate_free: boolean;
  reserved_until: string | null; // ISO datetime
}

export interface PolarCancelResponse {
  refunded: boolean;
  message: string;
  state: string;
  reserved_until: string | null;
}

export interface PolarReactivateResponse {
  reactivated: boolean;
  message: string;
  current_plan: string | null;
  plan_slug: string | null;
  reserved_until: string | null;
}

export interface PolarPortalResponse {
  portal_url: string;
}

export const pricingService = {
  listPlans: (activeOnly = true) =>
    api.get<PricingPlan[]>(`/pricing/plans?active_only=${activeOnly}`),

  choosePlan: (planId: number) =>
    api.post<{ message: string; credits: number }>(`/pricing/plans/${planId}/choose`),

  createPolarCheckout: (planSlug: string) =>
    api.post<PolarCheckoutResponse>(`/payments/polar/checkout`, { plan_slug: planSlug }),

  syncPolarSubscription: () =>
    api.post<PolarSyncResponse>(`/payments/polar/sync`),

  getCurrentSubscription: () =>
    api.get<PolarSubscriptionDetails>(`/payments/polar/subscription`),

  switchSubscription: (planSlug: string) =>
    api.post<PolarSyncResponse>(`/payments/polar/switch`, { plan_slug: planSlug }),

  cancelSubscription: () =>
    api.post<PolarCancelResponse>(`/payments/polar/cancel`),

  reactivateSubscription: () =>
    api.post<PolarReactivateResponse>(`/payments/polar/reactivate`),

  getPortalUrl: () =>
    api.post<PolarPortalResponse>(`/payments/polar/portal`),
};
