import { useEffect, useState, type ReactNode } from "react";
import { Wand2, LayoutGrid, ShieldCheck, Sparkles, ChevronUp, FileText, ListChecks, BarChart3, UserCheck, BadgeCheck, ArrowRight, Link as LinkIcon, Gauge } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import SiteNavbar from "../layout/site-navbar";
import LaunchOfferBanner from "../layout/launch-offer-banner";
import SiteFooter from "../layout/site-footer";
import { PricingSection } from "./pricing";
import { TailoringSection } from "./tailoring";
import { TemplatesShowingSection } from "./templates-showing";
import { BlogSection } from "./blog";

type ResumePreviewTone = "blue" | "lavender" | "warm";

function useSequentialTyping(texts: string[], enabled: boolean) {
  const [fieldIndex, setFieldIndex] = useState(0);
  const [characterIndex, setCharacterIndex] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const currentText = texts[fieldIndex];
    const fieldComplete = characterIndex >= currentText.length;
    const finalField = fieldIndex === texts.length - 1;
    const delay = fieldComplete ? (finalField ? 3200 : 1100) : 78;

    const timeoutId = window.setTimeout(() => {
      if (!fieldComplete) {
        setCharacterIndex((current) => current + 1);
      } else if (!finalField) {
        setFieldIndex((current) => current + 1);
        setCharacterIndex(0);
      } else {
        setFieldIndex(0);
        setCharacterIndex(0);
      }
    }, delay);

    return () => window.clearTimeout(timeoutId);
  }, [characterIndex, enabled, fieldIndex, texts]);

  if (!enabled || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return { fieldIndex: -1, values: texts };
  }

  return {
    fieldIndex,
    values: texts.map((text, index) => {
      if (index < fieldIndex) return text;
      if (index > fieldIndex) return "";
      return text.slice(0, characterIndex);
    }),
  };
}

function MiniResumeSheet({
  name,
  role,
  tone = "blue",
  className = "",
  animated = false,
}: {
  name: string;
  role: string;
  tone?: ResumePreviewTone;
  className?: string;
  animated?: boolean;
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

  const details = {
    blue: {
      summary: "Software engineer delivering reliable web platforms, scalable APIs, and measurable improvements to product performance.",
      typing: "",
      tools: ["TypeScript", "GitHub", "PostgreSQL", "AWS"],
      company: "Northstar Systems",
      previousCompany: "BrightWorks Studio",
      school: "University of Washington",
      degree: "BSc, Computer Science",
      project: "Developer Analytics Portal",
      certification: "AWS Cloud Practitioner",
    },
    lavender: {
      summary: "Product designer creating accessible interfaces through research, prototyping, and close collaboration with engineering teams.",
      typing: "Transforms customer insights into polished experiences that improve activation and long-term retention.",
      tools: ["Figma", "FigJam", "Maze", "Notion"],
      company: "CreativeLab Studio",
      previousCompany: "Lumen Products",
      school: "California College of the Arts",
      degree: "BFA, Interaction Design",
      project: "Mobile Banking Redesign",
      certification: "NN/g UX Certification",
    },
    warm: {
      summary: "Product manager aligning customer needs, business goals, and delivery teams to launch useful products with confidence.",
      typing: "",
      tools: ["Jira", "Amplitude", "Notion", "Looker"],
      company: "InnovateTech",
      previousCompany: "NextGen Digital",
      school: "University of Michigan",
      degree: "MBA, Product Strategy",
      project: "Commerce Growth Platform",
      certification: "Certified Scrum Product Owner",
    },
  }[tone];

  const contactName = name.replace("Hello, I'm ", "");
  const contactSlug = contactName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const displayName = animated ? contactName : name;

  const liveDetails = [
    displayName,
    role,
    details.typing,
    "Turned customer feedback into a focused quarterly roadmap.",
    "Launched an end-to-end solution used across three product teams.",
    `${details.certification} · 2023`,
  ];
  const typing = useSequentialTyping(liveDetails, animated);
  const liveText = (index: number) => animated ? typing.values[index] : liveDetails[index];
  const cursor = (index: number) => animated && typing.fieldIndex === index ? (
    <span className="ml-px inline-block font-bold text-[#6a55c7] animate-pulse">|</span>
  ) : null;

  return (
    <article
      aria-hidden
      className={`absolute w-[265px] sm:w-[335px] md:w-[390px] aspect-[0.68] overflow-hidden rounded-lg border bg-gradient-to-br ${tones[tone]} px-6 py-7 text-left shadow-[0_28px_70px_rgba(26,26,26,0.12)] ${className}`}
    >
      <div className="flex items-start justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div className="min-w-0 pr-2">
          <h3 className="min-h-[1.2em] text-[19px] font-black tracking-tight text-slate-950">
            {liveText(0)}{cursor(0)}
          </h3>
          <p className="mt-1.5 min-h-[1.2em] text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            {liveText(1)}{cursor(1)}
          </p>
        </div>
        <div className="hidden shrink-0 space-y-1 text-right text-[8px] font-medium text-slate-400 sm:block">
          <p>{contactSlug.replaceAll("-", ".")}@email.com</p>
          <p>+1 (555) 789-1011</p>
          <p>linkedin.com/in/{contactSlug}</p>
        </div>
      </div>

      <div className="mt-4">
        <h4 className="text-[10px] font-extrabold uppercase tracking-wide text-slate-800">
          Professional Summary
        </h4>
        <p className="mt-2 text-[9px] leading-relaxed text-slate-500">
          {details.summary}
          {animated ? (
            <span className="mt-1 block min-h-[1.8em] text-slate-600">
              {liveText(2)}{cursor(2)}
            </span>
          ) : null}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-5">
        <div>
          <h4 className="text-[10px] font-extrabold uppercase tracking-wide text-slate-800">
            Skills
          </h4>
          <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
            {skills.map((skill) => (
              <span key={skill} className="text-[8px] font-semibold text-slate-500">
                {skill}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-[10px] font-extrabold uppercase tracking-wide text-slate-800">
            Tools
          </h4>
          <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
            {details.tools.map((tool) => (
              <span key={tool} className="text-[8px] font-semibold text-slate-500">
                {tool}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5">
        <h4 className="text-[10px] font-extrabold uppercase tracking-wide text-slate-800">
          Experience
        </h4>
        {[0, 1].map((item) => (
          <div key={item} className="mt-3">
            <div className="flex items-center justify-between gap-4">
              <p className="text-[10px] font-bold text-slate-800">
                {item === 0 ? role : "Associate " + role}
              </p>
              <span className="text-[8px] text-slate-400">{item === 0 ? "2022 - Present" : "2019 - 2022"}</span>
            </div>
            <p className="mt-1 text-[8px] font-semibold text-slate-500">
              {item === 0 ? details.company : details.previousCompany}
            </p>
            <ul className="mt-2 space-y-1.5 text-[8px] leading-relaxed text-slate-500">
              <li>{item === 0 ? "Led cross-functional delivery that improved activation by 24%." : "Built repeatable workflows that shortened delivery cycles by 18%."}</li>
              <li className={item === 0 ? "min-h-[1.35em]" : undefined}>
                {item === 0 ? <>{liveText(3)}{cursor(3)}</> : "Partnered with design and engineering from discovery through launch."}
              </li>
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-5 border-t border-slate-200/80 pt-3">
        <div>
          <h4 className="text-[10px] font-extrabold uppercase tracking-wide text-slate-800">Education</h4>
          <p className="mt-1.5 text-[9px] font-bold text-slate-700">{details.degree}</p>
          <p className="mt-1 text-[8px] text-slate-500">{details.school} · 2019</p>
        </div>
        <div>
          <h4 className="text-[10px] font-extrabold uppercase tracking-wide text-slate-800">Selected Project</h4>
          <p className="mt-1.5 text-[9px] font-bold text-slate-700">{details.project}</p>
          <p className="mt-1 min-h-[2.7em] text-[8px] leading-relaxed text-slate-500">{liveText(4)}{cursor(4)}</p>
        </div>
      </div>

      <div className="mt-3 border-t border-slate-200/80 pt-2.5">
        <h4 className="text-[10px] font-extrabold uppercase tracking-wide text-slate-800">Certification</h4>
        <p className="mt-1 min-h-[1.35em] text-[8px] font-semibold text-slate-500">{liveText(5)}{cursor(5)}</p>
      </div>
    </article>
  );
}

function HeroResumeStack() {
  return (
    <div
      className="relative mx-auto mt-7 h-[365px] w-full max-w-7xl overflow-hidden sm:h-[430px] md:h-[535px]"
      style={{
        WebkitMaskImage: "linear-gradient(to bottom, black 88%, transparent 100%)",
        maskImage: "linear-gradient(to bottom, black 88%, transparent 100%)",
      }}
    >
      <style>{`
        .resume-stack-left {
          transform: translateX(-154%) translateY(54px) rotate(-5deg) scale(0.94);
          opacity: 0.86;
          z-index: 1;
        }

        .resume-stack-center {
          transform: translateX(-50%) translateY(0) rotate(0deg) scale(1);
          opacity: 1;
          z-index: 3;
        }

        .resume-stack-right {
          transform: translateX(54%) translateY(54px) rotate(5deg) scale(0.94);
          opacity: 0.86;
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
          animated
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
        <div aria-hidden className="pointer-events-none absolute -top-10 -left-10 size-72 rounded-full bg-[var(--pastel-lavender)] blur-3xl opacity-60" />
        <div aria-hidden className="pointer-events-none absolute -bottom-16 right-0 size-80 rounded-full bg-[var(--pastel-peach)] blur-3xl opacity-50" />

        <div className="relative text-center py-5 lg:py-8">
          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-light tracking-tight text-[var(--app-fg)] leading-[1.05]">
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
      data-landing-reveal
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

/**
 * Replaces the old `Testimonial` cards, which were three invented people with
 * invented quotes. That was a liability, not an asset:
 *   • Fabricated reviews are illegal in both target markets — the UK's DMCC Act
 *     2024 and the FTC's 16 CFR 465 both ban them outright, and this site takes
 *     live payments.
 *   • It actively undermines the position we're building. The ATS checker tells
 *     users, on screen, that no ATS emits a real score. Honesty is the wedge —
 *     fake five-star reviews on the same page destroy it.
 *   • It's what our competitors get caught doing. Rezi's loudest Reddit criticism
 *     is "I suspect most 5-star reviews are fake", and that now follows their brand.
 *
 * So: no claims about people. Only things a visitor can verify in about ten
 * seconds. When we have REAL, consented customer quotes, they belong here — with
 * a name, a role, a city, and permission.
 */
const CHECKER_LOOKS_FOR = [
  "Contact details a parser can find",
  "Standard section headings",
  "Bullets that carry a number",
  "Duty phrasing vs. real outcomes",
  "Dates on every role",
  "Keywords from the job description",
];

function ProofSection() {
  return (
    <section id="ats-checker" className="max-w-[1100px] mx-auto scroll-mt-24 px-6">
      <SectionTitle
        eyebrow="Proof, not testimonials"
        title="Don't take our word for it."
        subtitle="We're a new product, so we're not going to show you invented five-star reviews. Here's the actual work instead — check it yourself, free, without an account."
      />

      <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* 1. What tailoring actually does — a real before/after, not a claim. */}
        <div
          data-landing-reveal
          className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 transition-all duration-300 hover:border-[var(--app-border-strong)] hover:shadow-[var(--shadow-soft)] sm:p-7"
        >
          <div
            className="size-11 rounded-xl flex items-center justify-center text-[#B85F2E]"
            style={{ backgroundColor: "var(--pastel-peach)" }}
          >
            <Sparkles className="size-5" />
          </div>
          <h3 className="mt-5 text-base font-medium tracking-tight text-[var(--app-fg)]">
            What a rewritten bullet looks like
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-[var(--app-fg-muted)]">
            Same job. Same person. One of these gets a call.
          </p>

          <div className="mt-5 space-y-3">
            <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-2)] p-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--app-fg-soft)]">
                Before
              </div>
              <p className="mt-2 font-mono text-[13px] leading-6 text-[var(--app-fg-muted)]">
                Responsible for managing the company's social media accounts.
              </p>
            </div>

            <div
              className="rounded-xl border border-[var(--app-border)] p-4"
              style={{ backgroundColor: "var(--pastel-mint)" }}
            >
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#3F8E5C]">
                After
              </div>
              <p className="mt-2 font-mono text-[13px] leading-6 text-[var(--app-fg)]">
                Grew Instagram from 4k to 27k followers in 11 months by shifting from daily
                product posts to a weekly customer-story series — now driving ~18% of site
                traffic.
              </p>
            </div>
          </div>

          <Link
            to="/blog/resume-bullet-points-that-get-interviews"
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent-text)] transition-opacity hover:opacity-75"
          >
            How to write these yourself
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {/* 2. The free tool — the strongest "try it" we have. */}
        <div
          data-landing-reveal
          className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 transition-all duration-300 hover:border-[var(--app-border-strong)] hover:shadow-[var(--shadow-soft)] sm:p-7"
        >
          <div
            className="size-11 rounded-xl flex items-center justify-center text-[#3F8E5C]"
            style={{ backgroundColor: "var(--pastel-mint)" }}
          >
            <ShieldCheck className="size-5" />
          </div>
          <h3 className="mt-5 text-base font-medium tracking-tight text-[var(--app-fg)]">
            Check your resume in ten seconds
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-[var(--app-fg-muted)]">
            Upload it and we'll name every formatting choice that would trip a parser. No
            account, and the file is read in your browser — it's never uploaded anywhere.
          </p>

          <ul className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {CHECKER_LOOKS_FOR.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-[13px] leading-6 text-[var(--app-fg-muted)]"
              >
                <BadgeCheck className="mt-1 size-3.5 shrink-0 text-[var(--accent-text)]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <Link
            to="/ats-checker"
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-lg bg-[var(--btn-primary-bg)] px-6 text-sm font-medium text-[var(--btn-primary-text)] transition-colors hover:bg-[var(--btn-primary-hover)]"
          >
            Check my resume free
            <ArrowRight className="size-4" />
          </Link>
          <p className="mt-3 text-xs text-[var(--app-fg-soft)]">
            Free forever · no signup · nothing uploaded
          </p>
        </div>
      </div>
    </section>
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

  useEffect(() => {
    const cards = document.querySelectorAll<HTMLElement>(".landing-page [data-landing-reveal]");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      cards.forEach((card) => card.classList.add("landing-reveal-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("landing-reveal-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px" }
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing-page min-h-svh bg-[var(--app-bg)] text-[var(--app-fg)]">
      <LaunchOfferBanner />
      <SiteNavbar marketingMode />
      <Hero />

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

      <div className="mt-24">
        <TemplatesShowingSection />
      </div>

      {/* Proof — replaced three invented testimonials. See ProofSection above. */}
      <div className="mt-24">
        <ProofSection />
      </div>

      <div className="mt-24">
        <TailoringSection />
      </div>

      <div className="mt-24">
        <PricingSection showPlanActions={false} />
      </div>

      {/* Blog — sits after pricing so it catches visitors who aren't ready to buy
          yet, rather than competing with the conversion moment. */}
      <div className="mt-24">
        <BlogSection />
      </div>

      <div className="mt-24">
        <SiteFooter publicOnly />
      </div>

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
        className={`fixed bottom-20 right-6 z-50 h-11 w-11 rounded-full bg-[var(--app-surface)] border border-[var(--app-border)] grid place-items-center transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--app-border-strong)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/30 ${
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
