import { Link } from "react-router-dom";
import { LAUNCH_OFFER, isLaunchOfferActive } from "@/lib/launch-offer";

/**
 * Slim announcement bar for the 50%-off launch offer. Rendered on the landing
 * and pricing pages while the offer is active; disappears on its own once
 * LAUNCH_OFFER.endsAt passes.
 */
export default function LaunchOfferBanner({ showCta = true }: { showCta?: boolean }) {
  if (!isLaunchOfferActive()) return null;

  return (
    <div
      role="status"
      className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2.5 text-center text-sm font-medium text-white"
      style={{
        background:
          "linear-gradient(90deg, var(--accent) 0%, #8b5cf6 50%, var(--accent) 100%)",
      }}
    >
      <span>
        🎉 {LAUNCH_OFFER.label}: {LAUNCH_OFFER.percentOff}% off all plans — for a limited
        time.
      </span>
      {showCta && (
        <Link
          to="/pricing"
          className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-semibold uppercase tracking-wide transition-colors hover:bg-white/30"
        >
          Claim offer
        </Link>
      )}
    </div>
  );
}
