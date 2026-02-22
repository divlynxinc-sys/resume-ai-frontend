import { useState } from "react";
import type { ReactNode } from "react";
import { Search, User, Edit3, LayoutGrid, Wrench, CreditCard, Zap } from "lucide-react";
import SiteNavbar from "../layout/site-navbar";
import PageWithSidebar from "../layout/page-with-sidebar";


function PageTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="text-center">
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">{title}</h1>
      <p className="mt-2 text-white/60">{subtitle}</p>
    </header>
  );
}

function SectionHeading({ children }: { children: ReactNode }) {
  return <h2 className="text-xl font-semibold text-white text-center">{children}</h2>;
}

function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="mx-auto max-w-2xl mt-4">
      <div className="relative rounded-xl bg-[#0f162a] border border-white/12 shadow-inner">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
          <Search className="size-4" />
        </div>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search for answers..."
          className="w-full bg-transparent px-12 py-3 text-white/90 placeholder:text-white/40 outline-none"
        />
      </div>
    </div>
  );
}

function TopicCard({ icon, title, desc }: { icon: ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-6 text-white">
      <div className="flex items-center gap-3">
        <div className="size-9 rounded-lg bg-white/10 grid place-items-center">
          <span className="text-white/80">{icon}</span>
        </div>
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <p className="text-white/60 text-sm">{desc}</p>
        </div>
      </div>
    </div>
  );
}

function ArticleRow({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-xl bg-[#0f162a] border border-white/10 p-4">
      <div className="text-white/90 font-medium">{title}</div>
      <div className="text-sm text-white/60 mt-1">{desc}</div>
      <a href="#" className="mt-3 inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300">
        Read More <span className="inline-block">→</span>
      </a>
    </div>
  );
}

function HelpCTA() {
  return (
    <div className="relative rounded-2xl border border-white/10 bg-[#0f162a] p-6 sm:p-8">
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-b from-blue-500/10 to-indigo-600/10 blur-2xl" aria-hidden />
      <div className="relative text-center">
        <h3 className="text-xl font-semibold text-white">Still need help?</h3>
        <p className="mt-2 text-sm text-white/70">Our team is available to assist you with any questions or issues.</p>
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a className="rounded-xl bg-[oklch(0.488_0.243_264.376)] px-4 py-2 text-white text-sm" href="#">Contact Support</a>
          <a className="rounded-xl border border-white/12 px-4 py-2 text-white/90 hover:text-white text-sm" href="#">Visit Community Forum</a>
        </div>
      </div>
    </div>
  );
}

export default function HelpCenterScreen() {
  const [query, setQuery] = useState("");

  return (
    <div className="min-h-svh bg-[var(--app-bg)] text-white">
      <SiteNavbar />
      <PageWithSidebar activeRoute="help-center" mainClassName="max-w-[1100px] mx-auto py-8">
        <PageTitle title="Help Center & Knowledge Base" subtitle="Your guide to mastering ResumeAI" />

        <div className="mt-10">
          <SectionHeading>How can we help you?</SectionHeading>
          <SearchBar value={query} onChange={setQuery} />
        </div>

        <div className="mt-12">
          <SectionHeading>Browse by Topic</SectionHeading>
          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-6">
            <TopicCard icon={<Zap className="size-5" />} title="Getting Started" desc="Learn the basics of using ResumeAI." />
            <TopicCard icon={<User className="size-5" />} title="Account Management" desc="Manage your account settings and preferences." />
            <TopicCard icon={<Edit3 className="size-5" />} title="Resume Editing" desc="Edit and customize your resume content." />
            <TopicCard icon={<LayoutGrid className="size-5" />} title="Templates & Design" desc="Explore and apply different resume templates." />
            <TopicCard icon={<Wrench className="size-5" />} title="Troubleshooting" desc="Solve common issues and errors." />
            <TopicCard icon={<CreditCard className="size-5" />} title="Billing & Subscriptions" desc="Manage your subscription and payment details." />
          </div>
        </div>

        <div className="mt-12">
          <SectionHeading>Featured Articles / FAQs</SectionHeading>
          <div className="mt-5 space-y-4">
            <ArticleRow title="How to create a standout resume" desc="Learn the key elements of a compelling resume that will impress recruiters." />
            <ArticleRow title="Tips for writing a strong cover letter" desc="Discover how to craft a cover letter that complements your resume and highlights your skills." />
            <ArticleRow title="Common resume mistakes to avoid" desc="Identify and correct common errors that can negatively impact your resume’s effectiveness." />
          </div>
        </div>

        <div className="mt-12">
          <HelpCTA />
        </div>
      </PageWithSidebar>
    </div>
  );
}