import { Link } from "react-router-dom";
import { LAUNCH_OFFER, isLaunchOfferActive } from "@/lib/launch-offer";
import { useTheme } from "@/contexts/ThemeContext";

/**
 * Slim announcement bar for the 50%-off launch offer. Rendered on the landing
 * and pricing pages while the offer is active; disappears on its own once
 * LAUNCH_OFFER.endsAt passes.
 */
export default function LaunchOfferBanner({ showCta = true }: { showCta?: boolean }) {
  const { theme } = useTheme();

  if (!isLaunchOfferActive()) return null;

  const isDark = theme === "dark";

  return (
    <div
      role="status"
      className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2.5 text-center text-sm font-medium"
      style={{
        background: isDark
          ? "#FFFFFF"
          : "linear-gradient(90deg, var(--accent) 0%, #8b5cf6 50%, var(--accent) 100%)",
        color: isDark ? "#111111" : "#FFFFFF",
      }}
    >
      <span>
        🎉 {LAUNCH_OFFER.label}: {LAUNCH_OFFER.percentOff}% off all plans — for a limited
        time.
      </span>
      {showCta && (
        <Link
          to="/pricing"
          className="rounded-full px-3 py-0.5 text-xs font-semibold uppercase tracking-wide transition-opacity hover:opacity-80"
          style={{
            backgroundColor: isDark ? "#111111" : "#FFFFFF",
            color: isDark ? "#FFFFFF" : "#4F46C8",
          }}
        >
          Claim offer
        </Link>
      )}
    </div>
  );
}
