import type { ReactNode } from "react";
import SiteNavbar from "../layout/site-navbar";


function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-white/5 border border-white/12 shadow-[0_12px_40px_rgba(0,0,0,0.35)] p-6 ${className}`}>{children}</div>
  );
}

function CookieIconLarge() {
  return <span className="text-2xl align-middle">🍪</span>;
}

function Switch({ checked, onChange }: { checked: boolean; onChange: (val: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex w-10 h-6 rounded-full transition-colors border ${
        checked ? "bg-[#2b5bd9] border-[#2b5bd9]" : "bg-white/12 border-white/20"
      }`}
      aria-pressed={checked}
    >
      <span
        className={`absolute top-1/2 -translate-y-1/2 left-[4px] size-4 rounded-full bg-white transition-all ${
          checked ? "translate-x-[16px]" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function ToggleRow({ title, desc, checked, onChange }: { title: string; desc: string; checked: boolean; onChange: (val: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="max-w-[640px]">
        <div className="text-white font-semibold text-sm">{title}</div>
        <p className="text-white/60 text-sm mt-1">{desc}</p>
      </div>
      <Switch checked={checked} onChange={onChange} />
    </div>
  );
}

import { useState } from "react";

export default function CookiePolicyScreen() {
  const [perf, setPerf] = useState(false);
  const [func, setFunc] = useState(false);
  const [targeting, setTargeting] = useState(false);

  return (
    <div className="min-h-svh bg-[var(--app-bg)] text-white">
      <SiteNavbar />
      <main className="max-w-[1000px] mx-auto px-6 py-10">
        <Card className="">
          {/* Header */}
          <div className="flex items-center gap-2">
            <div className="size-7 grid place-items-center text-cyan-300">
              <CookieIconLarge />
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold">Cookie Policy</h1>
          </div>
          <p className="text-white/70 mt-3 text-sm leading-relaxed">
            This Cookie Policy explains how we use cookies and similar technologies to recognize you when you visit our website. It explains what these technologies are and why we use them, as well as your rights to control our use of them.
          </p>

          {/* What are cookies */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold">What are cookies?</h2>
            <p className="text-white/70 mt-2 text-sm leading-relaxed">
              Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.
            </p>
          </div>

          {/* Why do we use cookies */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold">Why do we use cookies?</h2>
            <p className="text-white/70 mt-2 text-sm leading-relaxed">
              We use cookies for several reasons. Some cookies are required for technical reasons in order for our website to operate, and we refer to these as 'essential' or 'strictly necessary' cookies. Other cookies enable us to track and target the interests of our users to enhance the experience on our website. Third parties serve cookies through our website for advertising, analytics, and other purposes.
            </p>
          </div>

          {/* Consent Panel */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold">Cookie Consent Panel</h2>
            <div className="mt-3 space-y-2">
              <ToggleRow
                title="Essential Cookies"
                desc="These cookies are essential for the website to function and cannot be switched off in our systems."
                checked={true}
                onChange={() => {}}
              />
              <ToggleRow
                title="Performance Cookies"
                desc="These cookies allow us to count visits and traffic sources so we can measure and improve site performance."
                checked={perf}
                onChange={setPerf}
              />
              <ToggleRow
                title="Functional Cookies"
                desc="These cookies enable the website to provide enhanced functionality and personalization."
                checked={func}
                onChange={setFunc}
              />
              <ToggleRow
                title="Targeting Cookies"
                desc="These cookies may be set through our site by our advertising partners to build a profile of your interests."
                checked={targeting}
                onChange={setTargeting}
              />
            </div>

            <div className="mt-6 flex items-center gap-4">
              <button className="h-11 px-5 rounded-xl bg-[#2b5bd9] text-white text-sm">Accept All</button>
              <button className="h-11 px-5 rounded-xl bg-white/6 border border-white/12 text-white text-sm">Customize</button>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="mt-10 text-center text-white/60 text-xs">
          <div className="space-x-6">
            <a href="#" className="hover:text-white">Terms of Service</a>
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Cookie Policy</a>
          </div>
          <div className="mt-3">© 2024 ResumeAI. All rights reserved.</div>
        </div>
      </main>
    </div>
  );
}