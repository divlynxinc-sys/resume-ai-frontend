import { useEffect, useState, type ReactNode } from "react";
import { Wand2, LayoutGrid, ShieldCheck, Quote, Sparkles, ChevronUp, FileText, ListChecks, BarChart3, UserCheck, BadgeCheck, Link as LinkIcon, Gauge } from "lucide-react";
import { useLocation } from "react-router-dom";
import SiteNavbar from "../layout/site-navbar";
import SiteFooter from "../layout/site-footer";
import { PricingSection } from "./pricing";
import { TailoringSection } from "./tailoring";
import { TemplatesShowingSection } from "./templates-showing";

type ResumePreviewTone = "blue" | "lavender" | "warm";

function MiniResumeSheet({
  name,
  role,
  tone = "blue",
  className = "",
}: {
  name: string;
  role: string;
  tone?: ResumePreviewTone;
  className?: string;
}) {
  const tones: Record<ResumePreviewTone, string> = {
    blue: "from-[#f4f8ff] via-white to-white border-[#d9e4f6]",
    lavender: "from-[#f8f3ff] via-white to-white border-[#eadcf7]",
    warm: "from-[#fbfaf4] via-white to-white border-[#e9e5d8]",
  };

  const skills =
    tone === "warm"
      ? ["Roadmaps", "Analytics", "SQL", "Strategy"]
      : tone === "lavender"
      ? ["Figma", "Research", "Systems", "Testing"]
      : ["React", "Python", "APIs", "Cloud"];

  return (
    <article
      aria-hidden
      className={`absolute w-[265px] sm:w-[335px] md:w-[390px] aspect-[0.72] overflow-hidden rounded-lg border bg-gradient-to-br ${tones[tone]} px-6 py-7 text-left shadow-[0_28px_70px_rgba(26,26,26,0.12)] ${className}`}
    >
      <div className="flex items-start justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div className="min-w-0 pr-2">
          <h3 className="text-[16px] font-black tracking-tight text-slate-950">{name}</h3>
          <p className="mt-1.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            {role}
          </p>
        </div>
        <div className="hidden shrink-0 space-y-1 text-right text-[6px] font-medium text-slate-400 sm:block">
          <p>{name.toLowerCase().replaceAll(" ", ".")}@email.com</p>
          <p>+1 (555) 789-1011</p>
          <p>linkedin.com/in/{name.toLowerCase().replaceAll(" ", "-")}</p>
        </div>
      </div>

      <div className="mt-4">
        <h4 className="text-[8px] font-extrabold uppercase tracking-wide text-slate-800">
          Professional Summary
        </h4>
        <p className="mt-2 text-[7px] leading-relaxed text-slate-500">
          Creative and results-driven professional with experience building clear,
          measurable outcomes across product, teams, and customer-facing work.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-5">
        <div>
          <h4 className="text-[8px] font-extrabold uppercase tracking-wide text-slate-800">
            Skills
          </h4>
          <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
            {skills.map((skill) => (
              <span key={skill} className="text-[6px] font-semibold text-slate-500">
                {skill}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-[8px] font-extrabold uppercase tracking-wide text-slate-800">
            Tools
          </h4>
          <div className="mt-2 space-y-1">
            <div className="h-1.5 w-20 rounded-full bg-slate-200" />
            <div className="h-1.5 w-16 rounded-full bg-slate-200" />
            <div className="h-1.5 w-24 rounded-full bg-slate-200" />
          </div>
        </div>
      </div>

      <div className="mt-5">
        <h4 className="text-[8px] font-extrabold uppercase tracking-wide text-slate-800">
          Experience
        </h4>
        {[0, 1].map((item) => (
          <div key={item} className="mt-3">
            <div className="flex items-center justify-between gap-4">
              <p className="text-[8px] font-bold text-slate-800">
                {item === 0 ? role : "Associate " + role}
              </p>
              <span className="text-[6px] text-slate-400">2021 - Present</span>
            </div>
            <p className="mt-1 text-[6px] font-semibold text-slate-500">BrightWorks Studio</p>
            <ul className="mt-2 space-y-1.5 text-[6px] leading-relaxed text-slate-500">
              <li>Led cross-functional work that improved delivery speed by 24%.</li>
              <li>Created repeatable systems for clearer planning and reporting.</li>
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <div className="h-1.5 rounded-full bg-slate-200" />
        <div className="h-1.5 rounded-full bg-slate-200" />
        <div className="h-1.5 rounded-full bg-slate-200" />
      </div>
    </article>
  );
}

function HeroResumeStack() {
  return (
    <div
      className="relative mx-auto mt-7 h-[345px] w-full max-w-7xl overflow-hidden sm:h-[405px] md:h-[505px]"
      style={{
        WebkitMaskImage: "linear-gradient(to bottom, black 88%, transparent 100%)",
        maskImage: "linear-gradient(to bottom, black 88%, transparent 100%)",
      }}
    >
      <style>{`
        .resume-stack-left {
          transform: translateX(-154%) translateY(54px) rotate(-5deg) scale(0.94);
          opacity: 0.72;
          z-index: 1;
        }

        .resume-stack-center {
          transform: translateX(-50%) translateY(0) rotate(0deg) scale(1);
          opacity: 1;
          z-index: 3;
        }

        .resume-stack-right {
          transform: translateX(54%) translateY(54px) rotate(5deg) scale(0.94);
          opacity: 0.72;
          z-index: 1;
        }

      `}</style>
      <div className="resume-stack absolute inset-0">
        <div className="pointer-events-none absolute inset-x-8 bottom-8 h-32 rounded-[50%] bg-[rgba(91,108,219,0.10)] blur-3xl" />
        <MiniResumeSheet
          name="John Smith"
          role="Software Engineer"
          tone="blue"
          className="resume-sheet resume-stack-left left-1/2 top-3 hidden md:block"
        />
        <MiniResumeSheet
          name="Hello, I'm Michael Davis"
          role="Product Manager"
          tone="warm"
          className="resume-sheet resume-stack-right left-1/2 top-3 hidden md:block"
        />
        <MiniResumeSheet
          name="Emily Johnson"
          role="Product Designer"
          tone="lavender"
          className="resume-sheet resume-stack-center left-1/2 top-0"
        />
      </div>
    </div>
  );
}

function Hero() {
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <section
      id="landing-hero"
      className={`px-6 pt-6 pb-0 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        entered ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}>
      <div className="relative max-w-7xl mx-auto">
        {/* Soft pastel ambient blobs */}
        <div aria-hidden className="pointer-events-none absolute -top-10 -left-10 size-72 rounded-full bg-[var(--pastel-lavender)] blur-3xl opacity-60" />
        <div aria-hidden className="pointer-events-none absolute -bottom-16 -right-10 size-80 rounded-full bg-[var(--pastel-peach)] blur-3xl opacity-50" />

        <div className="relative text-center py-5 lg:py-8">
          <h1 className="font-display text-5xl md:text-7xl font-light tracking-tight text-[var(--app-fg)] leading-[1.05]">
            Craft a resume that
            <br />
            <span className="italic font-normal">gets you hired.</span>
          </h1>

          <p className="mt-6 text-base md:text-lg text-[var(--app-fg-muted)] max-w-xl mx-auto leading-relaxed">
            A calmer way to build resumes. Our AI tailors every word to the role,
            so you stand out without spending the weekend on it.
          </p>

          <HeroResumeStack />
        </div>
      </div>
    </section>
  );
}

function SectionTitle({
  title,
  subtitle,
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
}) {
  return (
    <header className="text-center max-w-2xl mx-auto">
      {eyebrow && (
        <div className="text-xs font-medium tracking-[0.18em] uppercase text-[var(--accent-text)] mb-3">
          {eyebrow}
        </div>
      )}
      <h2 className="font-display text-3xl md:text-4xl font-light tracking-tight text-[var(--app-fg)] leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-[var(--app-fg-muted)] leading-relaxed">{subtitle}</p>
      )}
    </header>
  );
}

type CardColor = "blue" | "purple" | "emerald" | "amber" | "rose" | "cyan" | "indigo" | "teal" | "orange" | "pink" | "violet" | "lime" | "sky";

const pastelStyles: Record<CardColor, { tint: string; iconText: string }> = {
  blue:    { tint: "var(--accent-soft)",     iconText: "text-[#3949B5]" },
  indigo:  { tint: "var(--accent-soft)",     iconText: "text-[#3949B5]" },
  sky:     { tint: "var(--pastel-sky)",      iconText: "text-[#2A6F97]" },
  cyan:    { tint: "var(--pastel-sky)",      iconText: "text-[#2A6F97]" },
  purple:  { tint: "var(--pastel-lavender)", iconText: "text-[#6A55C7]" },
  violet:  { tint: "var(--pastel-lavender)", iconText: "text-[#6A55C7]" },
  pink:    { tint: "var(--pastel-rose)",     iconText: "text-[#B85273]" },
  rose:    { tint: "var(--pastel-rose)",     iconText: "text-[#B85273]" },
  emerald: { tint: "var(--pastel-mint)",     iconText: "text-[#3F8E5C]" },
  teal:    { tint: "var(--pastel-mint)",     iconText: "text-[#3F8E5C]" },
  lime:    { tint: "var(--pastel-mint)",     iconText: "text-[#3F8E5C]" },
  amber:   { tint: "var(--pastel-butter)",   iconText: "text-[#A07820]" },
  orange:  { tint: "var(--pastel-peach)",    iconText: "text-[#B85F2E]" },
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
  const styles = pastelStyles[color];
  return (
    <div
      className={`group relative rounded-2xl bg-[var(--app-surface)] border border-[var(--app-border)] p-6 transition-all duration-300 hover:border-[var(--app-border-strong)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)] ${
        featured ? "ring-1 ring-[var(--accent)]/30" : ""
      }`}
    >
      {featured && (
        <span className="absolute -top-2.5 right-4 rounded-full bg-[var(--accent)] text-white text-[10px] font-semibold tracking-wider px-2.5 py-1 uppercase">
          Featured
        </span>
      )}
      <div
        className={`size-11 rounded-xl flex items-center justify-center ${styles.iconText}`}
        style={{ backgroundColor: styles.tint }}
      >
        {icon}
      </div>
      <h3 className="mt-5 text-base font-medium text-[var(--app-fg)] tracking-tight">{title}</h3>
      <p className="mt-2 text-sm text-[var(--app-fg-muted)] leading-relaxed">{desc}</p>
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
  const styles = pastelStyles[color];
  return (
    <div className="rounded-2xl bg-[var(--app-surface)] border border-[var(--app-border)] p-6 transition-all duration-300 hover:border-[var(--app-border-strong)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]">
      <Quote className={`size-5 ${styles.iconText} opacity-60`} />
      <p className="mt-4 text-sm text-[var(--app-fg)] leading-relaxed">
        "{quote}"
      </p>
      <div className="mt-5 flex items-center gap-3">
        <div
          className={`size-9 rounded-full flex items-center justify-center ${styles.iconText}`}
          style={{ backgroundColor: styles.tint }}
        >
          <span className="text-xs font-semibold">{name.charAt(0)}</span>
        </div>
        <div>
          <div className="text-sm font-medium text-[var(--app-fg)]">{name}</div>
          <div className="text-xs text-[var(--app-fg-soft)]">{role}</div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPageScreen() {
  const [showTop, setShowTop] = useState(false);
  const location = useLocation();

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

  useEffect(() => {
    if (!location.hash) return;
    const id = window.decodeURIComponent(location.hash.slice(1));
    const target = document.getElementById(id);
    if (!target) return;
    requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [location.hash]);

  return (
    <div className="min-h-svh bg-[var(--app-bg)] text-[var(--app-fg)]">
      <SiteNavbar marketingMode />
      <Hero />

      {/* Key Features */}
      <section id="features" className="max-w-[1100px] mx-auto px-6 mt-20 scroll-mt-24">
        <SectionTitle
          eyebrow="Features"
          title="Everything you need, nothing you don't."
          subtitle="A focused toolkit that helps you build a resume worth reading."
        />
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
          <FeatureCard featured icon={<Wand2 className="size-5" />} title="AI-Powered Generation" desc="Let our AI suggest improvements and tailor your resume to specific job descriptions." color="purple" />
          <FeatureCard icon={<LayoutGrid className="size-5" />} title="Customizable Templates" desc="Choose from a variety of professionally designed templates to match your style." color="blue" />
          <FeatureCard icon={<ShieldCheck className="size-5" />} title="ATS Score & Compatibility" desc="Analyze your resume against ATS criteria and get actionable fixes." color="emerald" />
          <FeatureCard icon={<FileText className="size-5" />} title="JD Specific Tailoring" desc="Adapt your resume content to match the requirements and language of a target job description." color="violet" />
          <FeatureCard icon={<BadgeCheck className="size-5" />} title="Resume Feedback" desc="Get clear, actionable feedback on structure, wording, impact, and missing details." color="cyan" />
          <FeatureCard icon={<ListChecks className="size-5" />} title="Keywords Suggestion" desc="Identify relevant role-specific keywords and skills to strengthen your ATS match." color="amber" />
        </div>
      </section>

      {/* Industry Demands & How We Help */}
      <section className="max-w-[1100px] mx-auto px-6 mt-24">
        <SectionTitle
          eyebrow="The benchmark"
          title="What industry demands."
          subtitle="What recruiters and ATS actually look for in your resume."
        />
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
          <FeatureCard icon={<FileText className="size-5" />} title="ATS Compliance & Structure" desc="Clean headings, consistent bullet points, readable sections that parse correctly." color="blue" />
          <FeatureCard icon={<ListChecks className="size-5" />} title="Role & Keyword Relevance" desc="Presence of job-specific keywords and competencies aligned to the role." color="purple" />
          <FeatureCard icon={<BarChart3 className="size-5" />} title="Impact Metrics" desc="Quantified outcomes (growth %, savings, speed gains) that prove results." color="orange" />
          <FeatureCard icon={<UserCheck className="size-5" />} title="Core Skills & Tools" desc="Evidence of the exact skills, frameworks, and tools recruiters expect." color="teal" />
          <FeatureCard icon={<BadgeCheck className="size-5" />} title="Consistency & Integrity" desc="No contradictions, duplicates, or exaggerated claims; polished wording." color="pink" />
          <FeatureCard icon={<LinkIcon className="size-5" />} title="Links & Contact Hygiene" desc="Functional links, professional email, and complete profile details." color="indigo" />
        </div>

        <div className="mt-20">
          <SectionTitle
            eyebrow="Our approach"
            title="How we help you stand out."
            subtitle="We apply AI to optimize for these checks so you rise to the top."
          />
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
            <FeatureCard icon={<Wand2 className="size-5" />} title="AI Tailoring to JD" desc="Aligns content to a target job, adding missing keywords and skills." color="violet" />
            <FeatureCard icon={<ShieldCheck className="size-5" />} title="ATS Optimizer" desc="Restructures sections and formatting to pass most ATS systems." color="emerald" />
            <FeatureCard icon={<Sparkles className="size-5" />} title="Achievement Rewriter" desc="Turns tasks into quantified impact statements with crisp phrasing." color="amber" />
            <FeatureCard icon={<LayoutGrid className="size-5" />} title="Smart Template Picks" desc="Recommends designs that fit your profile and industry norms." color="cyan" />
            <FeatureCard icon={<Gauge className="size-5" />} title="Real-Time Score & Fixes" desc="Shows a score and suggests actionable edits as you write." color="rose" />
            <FeatureCard icon={<ListChecks className="size-5" />} title="Consistency & Typos Fix" desc="Catches duplicates, tense/voice drift, and common errors automatically." color="lime" />
          </div>
        </div>
      </section>

      {/* Templates Showing */}
      <div className="mt-24">
        <TemplatesShowingSection />
      </div>

      {/* Testimonials */}
      <section className="max-w-[1100px] mx-auto px-6 mt-24">
        <SectionTitle
          eyebrow="Testimonials"
          title="What our users say."
        />
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
          <Testimonial
            name="Sarah Miller"
            role="Software Engineer"
            quote="Helped me land my dream job at a top tech company. The AI suggestions were spot-on."
            color="blue"
          />
          <Testimonial
            name="David Chen"
            role="Marketing Manager"
            quote="I was struggling to update my resume, but this made it simple. Interviews within a week."
            color="emerald"
          />
          <Testimonial
            name="Emily Rodriguez"
            role="Graphic Designer"
            quote="The templates allowed me to create a resume that truly reflects my personal brand."
            color="pink"
          />
        </div>
      </section>

      {/* Tailoring */}
      <div className="mt-24">
        <TailoringSection />
      </div>

      {/* Pricing */}
      <div className="mt-24">
        <PricingSection />
      </div>

      <div className="mt-24">
        <SiteFooter />
      </div>

      {/* Back to Top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
        className={`fixed bottom-6 right-6 z-50 h-11 w-11 rounded-full bg-[var(--app-surface)] border border-[var(--app-border)] grid place-items-center transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--app-border-strong)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/30 ${
          showTop
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-2 pointer-events-none"
        }`}
        style={{
          color: "var(--app-fg-muted)",
          boxShadow: "var(--shadow-soft)",
        }}
      >
        <ChevronUp className="size-4" />
      </button>
    </div>
  );
}
