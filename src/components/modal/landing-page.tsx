import { useEffect, useState, type ReactNode } from "react";
import { Wand2, LayoutGrid, ShieldCheck, Quote, Sparkles, ArrowRight, ChevronUp, FileText, ListChecks, BarChart3, UserCheck, BadgeCheck, Link as LinkIcon, Gauge } from "lucide-react";
import { AppButtonLink } from "@/components/ui/AppButton";
import SiteNavbar from "../layout/site-navbar";
import SiteFooter from "../layout/site-footer";
import { PricingSection } from "./pricing";
import { TailoringSection } from "./tailoring";
import { TemplatesShowingSection } from "./templates-showing";

function Hero() {
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <section
      id="landing-hero"
      className={`px-6 pt-8 transition-transform transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        entered ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}>
      <div className="relative max-w-4xl mx-auto rounded-2xl border border-white/10 overflow-hidden">
        <div
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at top, rgba(100,116,255,.12), transparent 60%), repeating-linear-gradient(0deg, rgba(255,255,255,.05) 0px, rgba(255,255,255,.05) 1px, transparent 1px, transparent 6px)",
          }}
        />
        <div className="relative p-8 lg:p-12 text-center bg-[#0f162a]">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            Craft a Resume That Gets You Hired
          </h1>
          <p className="mt-3 text-white/70 max-w-2xl mx-auto">
            Our AI‑powered resume builder helps you create a professional resume
            in minutes. Stand out from the competition and land your dream job.
          </p>
          <div className="mt-6 flex items-center justify-center gap-4">
            <AppButtonLink to="/signup" variant="primary" size="lg" className="group shadow-[0_8px_24px_rgba(37,99,235,0.35)]">
              <Sparkles className="size-4" />
              Start Free Today
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </AppButtonLink>
            <AppButtonLink to="/templates" variant="secondary" size="lg">
              <LayoutGrid className="size-4" />
              Browse Templates
            </AppButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionTitle({
  title,
  subtitle,
  className,
}: {
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <header className="text-center">
      <h2
        className={`text-2xl md:text-3xl font-extrabold tracking-tight ${
          className ?? ""
        }`}>
        {title}
      </h2>
      <div className="mt-3 flex justify-center">
        <span className="block h-1 w-40 rounded-full bg-[#2b5bd9]" />
      </div>
      {subtitle && <p className="text-white/70 mt-2">{subtitle}</p>}
    </header>
  );
}

type CardColor = "blue" | "purple" | "emerald" | "amber" | "rose" | "cyan" | "indigo" | "teal" | "orange" | "pink" | "violet" | "lime" | "sky";

const colorStyles: Record<CardColor, { icon: string; border: string; shadow: string }> = {
  blue: { icon: "text-blue-400 bg-blue-500/10 border-blue-500/20", border: "hover:border-blue-500/30", shadow: "hover:shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)]" },
  purple: { icon: "text-purple-400 bg-purple-500/10 border-purple-500/20", border: "hover:border-purple-500/30", shadow: "hover:shadow-[0_0_20px_-5px_rgba(168,85,247,0.3)]" },
  emerald: { icon: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", border: "hover:border-emerald-500/30", shadow: "hover:shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]" },
  amber: { icon: "text-amber-400 bg-amber-500/10 border-amber-500/20", border: "hover:border-amber-500/30", shadow: "hover:shadow-[0_0_20px_-5px_rgba(245,158,11,0.3)]" },
  rose: { icon: "text-rose-400 bg-rose-500/10 border-rose-500/20", border: "hover:border-rose-500/30", shadow: "hover:shadow-[0_0_20px_-5px_rgba(244,63,94,0.3)]" },
  cyan: { icon: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20", border: "hover:border-cyan-500/30", shadow: "hover:shadow-[0_0_20px_-5px_rgba(6,182,212,0.3)]" },
  indigo: { icon: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20", border: "hover:border-indigo-500/30", shadow: "hover:shadow-[0_0_20px_-5px_rgba(99,102,241,0.3)]" },
  teal: { icon: "text-teal-400 bg-teal-500/10 border-teal-500/20", border: "hover:border-teal-500/30", shadow: "hover:shadow-[0_0_20px_-5px_rgba(20,184,166,0.3)]" },
  orange: { icon: "text-orange-400 bg-orange-500/10 border-orange-500/20", border: "hover:border-orange-500/30", shadow: "hover:shadow-[0_0_20px_-5px_rgba(249,115,22,0.3)]" },
  pink: { icon: "text-pink-400 bg-pink-500/10 border-pink-500/20", border: "hover:border-pink-500/30", shadow: "hover:shadow-[0_0_20px_-5px_rgba(236,72,153,0.3)]" },
  violet: { icon: "text-violet-400 bg-violet-500/10 border-violet-500/20", border: "hover:border-violet-500/30", shadow: "hover:shadow-[0_0_20px_-5px_rgba(139,92,246,0.3)]" },
  lime: { icon: "text-lime-400 bg-lime-500/10 border-lime-500/20", border: "hover:border-lime-500/30", shadow: "hover:shadow-[0_0_20px_-5px_rgba(132,204,22,0.3)]" },
  sky: { icon: "text-sky-400 bg-sky-500/10 border-sky-500/20", border: "hover:border-sky-500/30", shadow: "hover:shadow-[0_0_20px_-5px_rgba(14,165,233,0.3)]" },
};

function FeatureCard({
  icon,
  title,
  desc,
  featured = false,
  color = "blue",
}: {
  icon: ReactNode;
  title: string;
  desc: string;
  featured?: boolean;
  color?: CardColor;
}) {
  const styles = colorStyles[color];
  return (
    <div className={`relative overflow-visible rounded-2xl bg-[#0f162a] border border-white/10 p-5 transition-all duration-300 ${styles.border} ${styles.shadow} hover:-translate-y-1`}>
      {featured && (
        <span className="absolute -top-2 -right-2 rounded-full bg-blue-600/20 text-blue-300 text-[10px] font-semibold px-2 py-1 border border-blue-500/40 shadow-[0_6px_16px_rgba(59,130,246,0.35)]">
          FEATURED
        </span>
      )}
      <div className="flex items-center gap-3">
        <div className={`size-10 rounded-xl border flex items-center justify-center ${styles.icon}`}>
          {icon}
        </div>
        <div className="font-medium">{title}</div>
      </div>
      <p className="mt-3 text-sm text-white/60">{desc}</p>
    </div>
  );
}

function Testimonial({
  name,
  role,
  quote,
  color = "sky",
}: {
  name: string;
  role: string;
  quote: string;
  color?: CardColor;
}) {
  const styles = colorStyles[color];
  return (
    <div className={`rounded-2xl bg-[#0f162a] border border-white/10 p-5 transition-all duration-300 ${styles.border} ${styles.shadow} hover:-translate-y-1`}>
      <div className="flex items-center gap-3">
        <div className={`size-9 rounded-full border flex items-center justify-center ${styles.icon}`}>
           <span className="text-xs font-bold">{name.charAt(0)}</span>
        </div>
        <div>
          <div className="text-white/90 font-medium">{name}</div>
          <div className="text-xs text-white/60">{role}</div>
        </div>
        <Quote className={`ml-auto size-4 opacity-50 ${styles.icon.split(" ")[0]}`} />
      </div>
      <p className="mt-3 text-sm text-white/70">"{quote}"</p>
    </div>
  );
}

export default function LandingPageScreen() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("landing-hero");
    if (!hero) return;
    const io = new IntersectionObserver(
      ([entry]) => setShowTop(!entry.isIntersecting),
      { threshold: 0.05 }
    );
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  return (
    <div className="min-h-svh bg-[var(--app-bg)] text-white">
      <SiteNavbar />
      <Hero />

      {/* Key Features */}
      <section className="max-w-[1100px] mx-auto px-6 mt-14">
        <SectionTitle title="Key Features" subtitle="Our platform offers a range of features designed to help you create a standout resume." className="font-extrabold" />
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard featured icon={<Wand2 className="size-5" />} title="AI‑Powered Generation" desc="Let our AI suggest improvements and tailor your resume to specific job descriptions." color="purple" />
          <FeatureCard icon={<LayoutGrid className="size-5" />} title="Customizable Templates" desc="Choose from a variety of professionally designed templates to match your style." color="blue" />
          <FeatureCard icon={<ShieldCheck className="size-5" />} title="ATS Score & Compatibility" desc="Analyze your resume against ATS criteria and get actionable fixes." color="emerald" />
        </div>
      </section>

      {/* Industry Demands & How We Help */}
      <section className="max-w-[1100px] mx-auto px-6 mt-16">
        <SectionTitle
          title="What Industry Demands"
          subtitle="What recruiters and ATS actually look for in your resume."
        />
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard icon={<FileText className="size-5" />} title="ATS Compliance & Structure" desc="Clean headings, consistent bullet points, readable sections that parse correctly." color="blue" />
          <FeatureCard icon={<ListChecks className="size-5" />} title="Role & Keyword Relevance" desc="Presence of job‑specific keywords and competencies aligned to the role." color="purple" />
          <FeatureCard icon={<BarChart3 className="size-5" />} title="Impact Metrics" desc="Quantified outcomes (growth %, savings, speed gains) that prove results." color="orange" />
          <FeatureCard icon={<UserCheck className="size-5" />} title="Core Skills & Tools" desc="Evidence of the exact skills, frameworks, and tools recruiters expect." color="teal" />
          <FeatureCard icon={<BadgeCheck className="size-5" />} title="Consistency & Integrity" desc="No contradictions, duplicates, or exaggerated claims; polished wording." color="pink" />
          <FeatureCard icon={<LinkIcon className="size-5" />} title="Links & Contact Hygiene" desc="Functional links, professional email, and complete profile details." color="indigo" />
        </div>

        <div className="mt-12">
          <SectionTitle
            title="How We Help You Stand Out"
            subtitle="We apply AI to optimize for these checks so you rise to the top."
          />
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard icon={<Wand2 className="size-5" />} title="AI Tailoring to JD" desc="Aligns content to a target job, adding missing keywords and skills." color="violet" />
            <FeatureCard icon={<ShieldCheck className="size-5" />} title="ATS Optimizer" desc="Restructures sections and formatting to pass most ATS systems." color="emerald" />
            <FeatureCard icon={<Sparkles className="size-5" />} title="Achievement Rewriter" desc="Turns tasks into quantified impact statements with crisp phrasing." color="amber" />
            <FeatureCard icon={<LayoutGrid className="size-5" />} title="Smart Template Picks" desc="Recommends designs that fit your profile and industry norms." color="cyan" />
            <FeatureCard icon={<Gauge className="size-5" />} title="Real‑Time Score & Fixes" desc="Shows a score and suggests actionable edits as you write." color="rose" />
            <FeatureCard icon={<ListChecks className="size-5" />} title="Consistency & Typos Fix" desc="Catches duplicates, tense/voice drift, and common errors automatically." color="lime" />
          </div>
        </div>
      </section>

      {/* Templates Showing */}
      <div className="mt-16">
        <TemplatesShowingSection />
      </div>

      {/* Testimonials */}
      <section className="max-w-[1100px] mx-auto px-6 mt-16">
        <SectionTitle title="What Our Users Say" />
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Testimonial
            name="Sarah Miller"
            role="Software Engineer"
            quote="ResumeAI helped me land my dream job at a top tech company. The AI suggestions were spot‑on!"
            color="blue"
          />
          <Testimonial
            name="David Chen"
            role="Marketing Manager"
            quote="It was struggling to update my resume, but ResumeAI made the process simple. Interviews within a week!"
            color="emerald"
          />
          <Testimonial
            name="Emily Rodriguez"
            role="Graphic Designer"
            quote="The customizable templates allowed me to create a resume that truly reflects my personal brand."
            color="pink"
          />
        </div>
      </section>

      {/* Tailoring */}
      <div className="mt-16">
        <TailoringSection />
      </div>

      {/* Pricing: use the dedicated pricing section */}
      <div className="mt-16">
        <PricingSection />
      </div>

      <div className="mt-16">
        <SiteFooter />
      </div>

      {/* Back to Top button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
        className={`fixed bottom-5 right-5 z-50 h-10 w-10 rounded-full bg-[oklch(0.488_0.243_264.376)] hover:bg-[oklch(0.58_0.24_264.376)] text-white shadow-[0_12px_40px_rgba(2,6,23,0.35)] border border-white/10 grid place-items-center transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 ${
          showTop
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-2 pointer-events-none"
        }`}>
        <ChevronUp className="size-4" />
      </button>
    </div>
  );
}
