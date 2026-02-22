import SiteNavbar from "../layout/site-navbar";

function SearchBar() {
  return (
    <div className="relative max-w-[720px] mx-auto">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">🔍</span>
      <input
        placeholder="Search for a question..."
        className="w-full h-12 rounded-full bg-transparent border border-white/12 pl-11 pr-4 text-sm placeholder:text-white/40 focus:outline-none focus:border-white/25"
      />
    </div>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      className={`transition-transform ${open ? "rotate-180" : "rotate-0"} text-white/70`}
    >
      <path fill="currentColor" d="M7 10l5 5 5-5H7z" />
    </svg>
  );
}

function FAQItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <div className={`rounded-xl border ${open ? "border-[#2b5bd9]/50" : "border-white/12"} bg-white/[0.03]`}> 
      <button
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
        onClick={onToggle}
      >
        <div className="text-white font-semibold text-sm sm:text-base">{q}</div>
        <Chevron open={open} />
      </button>
      {open && (
        <div className="mx-4 mb-4 rounded-lg bg-[#0f162a] border border-white/10 px-4 py-4 text-white/70 text-sm">
          {a}
        </div>
      )}
    </div>
  );
}

import { useState } from "react";

export default function FAQScreen() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const toggle = (i: number) => setOpenIndex((prev) => (prev === i ? null : i));

  const items = [
    {
      q: "How do I create a resume?",
      a: "To create a resume, start by selecting a template. Then, fill in your personal information, work experience, education, and skills. You can preview your resume at any time and download it in various formats.",
    },
    { q: "Can I use my own template?", a: "Yes, you can import your own template or customize existing templates to match your style." },
    { q: "What is the cost of ResumeCraft?", a: "We offer a free tier and premium plans with additional features like AI tailoring, advanced analytics, and priority support." },
    { q: "Is my data secure?", a: "We use industry-standard encryption and follow best practices to protect your data. You can manage privacy preferences anytime." },
    { q: "How do I contact support?", a: "You can reach our support team via the Help Center, or email us at support@resumecraft.example." },
  ];

  return (
    <div className="min-h-svh bg-[var(--app-bg)] text-white">
      <SiteNavbar />
      <main className="max-w-[1100px] mx-auto px-6 py-12">
        <h1 className="text-3xl sm:text-5xl font-bold text-center">Frequently Asked Questions</h1>
        <p className="text-white/70 text-center mt-2">Find answers to the most common questions about ResumeCraft.</p>

        <div className="mt-8">
          <SearchBar />
        </div>

        <div className="mt-8 space-y-4 max-w-[820px] mx-auto">
          {items.map((it, i) => (
            <FAQItem key={it.q} q={it.q} a={it.a} open={openIndex === i} onToggle={() => toggle(i)} />
          ))}
        </div>
      </main>
    </div>
  );
}