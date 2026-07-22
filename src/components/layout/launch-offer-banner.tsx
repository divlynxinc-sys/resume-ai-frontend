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
      className="flex min-h-9 flex-wrap items-center justify-center gap-x-5 gap-y-1 border-b px-4 py-2 text-center text-[13px]"
      style={{
        backgroundColor: isDark ? "#232743" : "#ECEEFB",
        borderColor: isDark ? "rgba(255,255,255,0.08)" : "#D9DDF7",
        color: isDark ? "#F4F5FF" : "#29358F",
      }}
    >
      <span className="font-medium">
        {LAUNCH_OFFER.label} <span aria-hidden="true">&middot;</span>{" "}
        <strong className="font-semibold">{LAUNCH_OFFER.percentOff}% off all plans</strong>
      </span>
      {showCta && (
        <Link
          to="/pricing"
          className="inline-flex items-center gap-1 font-semibold underline decoration-current/30 underline-offset-4 transition-opacity hover:opacity-70"
          style={{ color: "inherit" }}
        >
          View plans <span aria-hidden="true">&rarr;</span>
        </Link>
      )}
    </div>
  );
}
