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

export const pricingService = {
  listPlans: (activeOnly = true) =>
    api.get<PricingPlan[]>(`/pricing/plans?active_only=${activeOnly}`),

  choosePlan: (planId: number) =>
    api.post<{ message: string; credits: number }>(`/pricing/plans/${planId}/choose`),

  createPolarCheckout: (planSlug: string) =>
    api.post<PolarCheckoutResponse>(`/payments/polar/checkout`, { plan_slug: planSlug }),
};
