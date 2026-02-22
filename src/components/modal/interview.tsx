import type { ReactNode } from "react";
import { Brain, MessageSquare, Lightbulb, Code2, FolderOpen, CalendarDays } from "lucide-react";
import SiteNavbar from "../layout/site-navbar";
import PageWithSidebar from "../layout/page-with-sidebar";

function FeaturedBadge() {
  return (
    <span className="absolute -top-2 -right-2 rounded-full bg-blue-600/20 text-blue-300 text-[10px] font-semibold px-2 py-1 border border-blue-500/40 shadow-[0_6px_16px_rgba(59,130,246,0.35)]">
      FEATURED
    </span>
  );
}

function IconWrap({ children }: { children: ReactNode }) {
  return (
    <div className="size-9 grid place-items-center rounded-lg bg-blue-950/30 border border-blue-500/30 text-blue-300">
      {children}
    </div>
  );
}

function FeatureCard({
  title,
  desc,
  icon,
  featured = false,
}: {
  title: string;
  desc: string;
  icon: ReactNode;
  featured?: boolean;
}) {
  return (
    <div className="relative overflow-visible rounded-2xl bg-white/[0.035] border border-white/10 p-6 text-white shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
      {featured && <FeaturedBadge />}
      <div className="flex items-center gap-3">
        <IconWrap>{icon}</IconWrap>
        <h3 className="text-base font-semibold tracking-tight">{title}</h3>
      </div>
      <p className="text-white/70 text-sm leading-relaxed mt-3">
        {desc}
      </p>
      <a href="#" className="mt-4 inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm">
        Learn More <span>→</span>
      </a>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative">
      {/* Decorative glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-6 -translate-x-1/2 size-[540px] rounded-full bg-[radial-gradient(closest-side,rgba(59,130,246,0.20),transparent_70%)]" />
      </div>

      <div className="max-w-[1100px] mx-auto px-6 pt-14 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
          <span className="block">Everything You Need to Ace Your</span>
          <span className="block">Interview</span>
        </h1>
        <div className="h-px w-40 bg-white/10 mx-auto mt-4" />
        <p className="text-white/70 mt-4 max-w-2xl mx-auto">
          Our AI-powered tools and expert guidance will help you prepare for any interview
          scenario, ensuring you present your best self and land your dream job.
        </p>
        <div className="mt-6">
          <button className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-[0_12px_40px_rgba(59,130,246,0.35)]">
            Get Started Now
          </button>
        </div>
      </div>
    </section>
  );
}

export default function InterviewScreen() {
  return (
    <div className="min-h-svh bg-[var(--app-bg)] text-white">
      <SiteNavbar />
      <PageWithSidebar activeRoute="interview" mainClassName="mx-auto max-w-[1100px] pb-16">
        <Hero />

        {/* Features Grid */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            title="AI‑Powered Interview Simulation"
            desc="Practice with realistic interview simulations tailored to your target role and industry. Receive instant feedback."
            icon={<Brain className="size-5" />}
            featured
          />
          <FeatureCard
            title="Personalized Interview Feedback"
            desc="Get detailed, personalized feedback on your interview performance from AI and expert coaches to refine your strategy."
            icon={<MessageSquare className="size-5" />}
            featured
          />
          <FeatureCard
            title="Behavioral Question Mastery"
            desc="Master common behavioral questions with our comprehensive guide. Learn to craft compelling stories that highlight your skills."
            icon={<Lightbulb className="size-5" />}
          />
          <FeatureCard
            title="Technical Interview Prep"
            desc="Extensive library of coding challenges, system design questions, and algorithm practice to sharpen your technical skills."
            icon={<Code2 className="size-5" />}
          />
          <FeatureCard
            title="Industry‑Specific Question Banks"
            desc="Access a vast library of interview questions specific to your industry and role. Stay ahead of the curve with the latest trends."
            icon={<FolderOpen className="size-5" />}
          />
          <FeatureCard
            title="Mock Interview Scheduling"
            desc="Schedule mock interviews with experienced professionals. Get real‑time feedback and gain confidence in your interview skills."
            icon={<CalendarDays className="size-5" />}
          />
        </div>
      </PageWithSidebar>
    </div>
  );
}