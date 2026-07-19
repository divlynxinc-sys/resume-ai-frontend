import { useEffect, useState, type ReactNode } from "react";
import { Sidebar } from "../modal/dashboard";
import { ChevronLeft, ChevronRight, Menu, X } from "lucide-react";
import UsageLimitBanner from "./usage-limit-banner";

const SIDEBAR_OPEN_WIDTH = "w-[260px]";
const SIDEBAR_COLLAPSED_WIDTH = "w-[64px]";
const SIDEBAR_OPEN_LEFT = "left-[248px]";
const SIDEBAR_COLLAPSED_LEFT = "left-[52px]";
const SIDEBAR_STATE_KEY = "jobsynk.sidebarOpen";

export default function PageWithSidebar({
  children,
  activeRoute,
  mainClassName,
  defaultOpen = true,
}: {
  children: ReactNode;
  activeRoute?: string;
  mainClassName?: string;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_STATE_KEY);
      if (stored !== null) return stored === "true";
    } catch {
      // Local storage can be unavailable in restricted browser contexts.
    }
    return defaultOpen;
  });
  const [hasActiveModal, setHasActiveModal] = useState(false);
  // Below md the sidebar is an off-canvas drawer instead of a fixed rail.
  const [mobileOpen, setMobileOpen] = useState(false);

  const setSidebarOpen = (nextOpen: boolean) => {
    setIsOpen(nextOpen);
    try {
      localStorage.setItem(SIDEBAR_STATE_KEY, String(nextOpen));
    } catch {
      // Local storage can be unavailable in restricted browser contexts.
    }
  };

  useEffect(() => {
    const updateModalState = () => {
      setHasActiveModal(
        Boolean(document.querySelector('[role="dialog"][aria-modal="true"]'))
      );
    };

    updateModalState();
    const observer = new MutationObserver(updateModalState);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["role", "aria-modal"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Fixed sidebar — desktop only; mobile uses the drawer below */}
      <div
        className={`hidden md:block fixed top-[64px] left-0 h-[calc(100vh-64px)] z-40 transition-all duration-300 ease-in-out ${isOpen ? SIDEBAR_OPEN_WIDTH : SIDEBAR_COLLAPSED_WIDTH} overflow-hidden`}
      >
        <div className={`app-sidebar-scroll ${isOpen ? SIDEBAR_OPEN_WIDTH : SIDEBAR_COLLAPSED_WIDTH} h-full overflow-auto transition-all duration-300 ease-in-out`}>
          <Sidebar activeRoute={activeRoute} collapsed={!isOpen} />
        </div>
      </div>

      {/* Toggle button — anchored to sidebar edge, desktop only */}
      <button
        onClick={() => {
          if (!hasActiveModal) setSidebarOpen(!isOpen);
        }}
        disabled={hasActiveModal}
        aria-disabled={hasActiveModal}
        className={`hidden md:flex fixed z-50 top-1/2 -translate-y-1/2 transition-all duration-300 ease-in-out
          items-center justify-center
          size-6 rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-fg-muted)] shadow-[var(--shadow-soft)]
          ${hasActiveModal ? "pointer-events-none opacity-40" : "hover:bg-[var(--app-surface-2)] hover:text-[var(--app-fg)]"}
          ${isOpen ? SIDEBAR_OPEN_LEFT : SIDEBAR_COLLAPSED_LEFT}
        `}
        title={isOpen ? "Hide sidebar" : "Show sidebar"}
      >
        {isOpen ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
      </button>

      {/* Spacer to offset content for fixed sidebar — desktop only */}
      <div className={`hidden md:block shrink-0 transition-all duration-300 ease-in-out ${isOpen ? SIDEBAR_OPEN_WIDTH : SIDEBAR_COLLAPSED_WIDTH}`} />

      {/* Mobile off-canvas drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 flex w-64 max-w-[85vw] flex-col bg-[var(--app-bg)] shadow-[var(--shadow-pop)]">
            <div className="flex items-center justify-between border-b border-[var(--app-border)] px-4 py-3">
              <span className="text-sm font-semibold text-[var(--app-fg)]">Menu</span>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="grid size-8 place-items-center rounded-lg text-[var(--app-fg-muted)] hover:bg-[var(--app-surface-2)] hover:text-[var(--app-fg)]"
              >
                <X className="size-4" />
              </button>
            </div>
            <div
              className="app-sidebar-scroll min-h-0 flex-1 overflow-y-auto"
              onClickCapture={(e) => {
                // Tapping a nav item should dismiss the drawer; tip-card buttons live outside <nav>.
                const target = e.target as HTMLElement;
                if (target.closest("nav") && target.closest("button")) setMobileOpen(false);
              }}
            >
              <Sidebar activeRoute={activeRoute} collapsed={false} />
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0 relative">
        <div className={"px-4 py-5 md:px-6 md:py-6 " + (mainClassName ?? "")}>
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="md:hidden mb-4 inline-flex items-center gap-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm font-medium text-[var(--app-fg-muted)] shadow-[var(--shadow-soft)] hover:bg-[var(--app-surface-2)] hover:text-[var(--app-fg)]"
          >
            <Menu className="size-4" />
            Menu
          </button>
          <UsageLimitBanner />
          {children}
        </div>
      </div>
    </div>
  );
}
