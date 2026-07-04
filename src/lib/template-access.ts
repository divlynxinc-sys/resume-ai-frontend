/**
 * Free-tier template gating: free users get exactly one template
 * (Classic Professional); every other template requires a paid plan.
 *
 * UI-level gate — the templates page locks the cards, and the resume builder
 * coerces any other slug (deep links, stale drafts) back to the free one for
 * unpaid users so preview and export always match what the tier allows.
 */
export const FREE_TEMPLATE_SLUG = "classic-professional";

export function isTemplateLockedForFree(slug: string, isPaid: boolean): boolean {
  return !isPaid && slug !== FREE_TEMPLATE_SLUG;
}
