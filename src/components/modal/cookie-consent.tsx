import type { ReactNode } from "react";

function CookieIcon() {
  return (
    <div className="leading-none">
      <span className="text-white/90 text-3xl">🍪</span>
    </div>
  );
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-white/5 border border-white/12 shadow-[0_16px_40px_rgba(0,0,0,0.35)] p-5 sm:p-6 ${className}`}>{children}</div>
  );
}

export default function CookieConsentScreen() {
  return (
    <div className="h-svh bg-[var(--app-bg)] text-white">
      {/* Popup anchored bottom-left */}
      <div className="fixed left-6 bottom-6 w-[500px] max-w-[92vw]">
        <Card>
          <div className="flex items-start gap-3">
            <CookieIcon />
            <div>
              <div className="text-white font-semibold">We Value Your Privacy</div>
              <p className="text-sm text-white/70 mt-2 leading-relaxed">
                Our website uses cookies to enhance your experience, analyze site traffic, and for personalization and marketing.
                By clicking "Accept All", you agree to our use of cookies. You can manage your cookie settings at any time. For more information,
                please see our <a href="#" className="underline text-white/90 hover:text-white">Privacy Policy</a>.
              </p>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <button className="text-white/80 hover:text-white text-sm">Manage Preferences</button>
            <div className="flex items-center gap-3">
              <button className="h-10 px-4 rounded-xl bg-white/6 border border-white/12 text-white text-sm">Decline</button>
              <button className="h-10 px-4 rounded-xl bg-[#2b5bd9] text-white text-sm">Accept All</button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}