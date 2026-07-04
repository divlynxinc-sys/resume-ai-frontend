/**
 * Launch offer: 50% off all plans, running for 6 months from launch.
 *
 * Display-only — the actual charge is discounted by Polar (backend pre-applies
 * the discount configured via POLAR_DISCOUNT_ID to every checkout). Keep the
 * percent and end date here in sync with the Polar discount, and flip
 * `enabled` to false (or let `endsAt` pass) to retire the offer.
 */
export const LAUNCH_OFFER = {
  enabled: true,
  percentOff: 50,
  endsAt: "2027-01-04T23:59:59Z",
  label: "Launch offer",
};

export function isLaunchOfferActive(): boolean {
  return LAUNCH_OFFER.enabled && Date.now() < new Date(LAUNCH_OFFER.endsAt).getTime();
}

/** Apply the offer to a numeric price (returns the input when inactive). */
export function launchOfferPrice(price: number): number {
  if (!isLaunchOfferActive()) return price;
  return Math.round(price * (1 - LAUNCH_OFFER.percentOff / 100) * 100) / 100;
}

/**
 * Apply the offer to a "$14.99"-style display string. Returns the original
 * string untouched when the offer is inactive or the string has no number.
 */
export function launchOfferPriceLabel(label: string): string {
  if (!isLaunchOfferActive()) return label;
  const match = label.match(/(\d+(?:\.\d+)?)/);
  if (!match) return label;
  const discounted = launchOfferPrice(parseFloat(match[1]));
  return label.replace(match[1], discounted.toFixed(2));
}
