import { useState, type ReactNode } from "react";
import { Sidebar } from "../modal/dashboard";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function PageWithSidebar({
  children,
  activeRoute,
  mainClassName,
}: {
  children: ReactNode;
  activeRoute?: string;
  mainClassName?: string;
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex min-h-[calc(100vh-64px)] relative">
      <div
        className={`shrink-0 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "w-[260px]" : "w-0"}`}
      >
        <div className="w-[260px] sticky top-0 h-screen overflow-y-auto">
           <Sidebar activeRoute={activeRoute} />
        </div>
      </div>
      
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed z-50 top-1/2 -translate-y-1/2 transition-all duration-300 ease-in-out
          flex items-center justify-center
          size-6 rounded-full border border-white/10 bg-[#0f162a] text-white shadow-lg hover:bg-white/10
          ${isOpen ? "left-[248px]" : "left-4"}
        `}
        title={isOpen ? "Hide sidebar" : "Show sidebar"}
      >
         {isOpen ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
      </button>

      <div className="flex-1 min-w-0 relative">
        <div className={"px-6 py-6 " + (mainClassName ?? "")}>
            {children}
        </div>
      </div>
    </div>
  );
}