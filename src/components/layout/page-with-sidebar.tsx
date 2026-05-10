import { useEffect, useState, type ReactNode } from "react";
import { Sidebar } from "../modal/dashboard";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [hasActiveModal, setHasActiveModal] = useState(false);

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

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Fixed sidebar */}
      <div
        className={`fixed top-[64px] left-0 h-[calc(100vh-64px)] z-40 transition-all duration-300 ease-in-out ${isOpen ? "w-[260px]" : "w-0"} overflow-hidden`}
      >
        <div className="w-[260px] h-full overflow-y-auto">
          <Sidebar activeRoute={activeRoute} />
        </div>
      </div>

      {/* Toggle button — anchored to sidebar edge */}
      <button
        onClick={() => {
          if (!hasActiveModal) setIsOpen(!isOpen);
        }}
        disabled={hasActiveModal}
        aria-disabled={hasActiveModal}
        className={`fixed z-50 top-1/2 -translate-y-1/2 transition-all duration-300 ease-in-out
          flex items-center justify-center
          size-6 rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-fg-muted)] shadow-[var(--shadow-soft)]
          ${hasActiveModal ? "pointer-events-none opacity-40" : "hover:bg-[var(--app-surface-2)] hover:text-[var(--app-fg)]"}
          ${isOpen ? "left-[248px]" : "left-2"}
        `}
        title={isOpen ? "Hide sidebar" : "Show sidebar"}
      >
        {isOpen ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
      </button>

      {/* Spacer to offset content for fixed sidebar */}
      <div className={`shrink-0 transition-all duration-300 ease-in-out ${isOpen ? "w-[260px]" : "w-0"}`} />

      <div className="flex-1 min-w-0 relative">
        <div className={"px-6 py-6 " + (mainClassName ?? "")}>
          {children}
        </div>
      </div>
    </div>
  );
}
