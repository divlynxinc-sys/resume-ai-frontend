import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, FileText } from "lucide-react";
import SiteNavbar from "../layout/site-navbar";
import PageWithSidebar from "../layout/page-with-sidebar";
import { TEMPLATES, renderTemplate, type TemplateInput } from "@/lib/resume-templates";

/**
 * Sample data used to render template previews on this page.
 * Realistic placeholder content lets users inspect the layout without using PII.
 */
const SAMPLE_DATA: TemplateInput = {
  candidate_info: {
    name: "Avery Lawson",
    email: "avery.lawson@example.com",
    phone: "+1 (555) 123-4567",
    linkedin: "linkedin.com/in/averylawson",
    portfolio: "averylawson.design",
  },
  resume: {
    summary:
      "Senior product designer with seven years crafting calm, accessible interfaces for fintech and healthcare. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur eget mauris vitae quam tincidunt aliquam.",
    experiences: [
      {
        role: "Senior Product Designer",
        company: "Northwind Studio",
        location: "Remote",
        startDate: "2022-03",
        bullets: [
          "Led design of a consumer banking app used by 200k monthly users.",
          "Reduced onboarding drop-off by 28% through a refreshed flow.",
          "Established the design system adopted across four product squads.",
        ],
      },
      {
        role: "Product Designer",
        company: "Lumen Health",
        location: "Berlin",
        startDate: "2019-06",
        endDate: "2022-02",
        bullets: [
          "Shipped a clinician dashboard now in 12 hospitals across the EU.",
          "Ran weekly research sessions; converted insights into shipped features.",
        ],
      },
    ],
    projects: [
      {
        title: "Open-source icon library",
        link: "github.com/avery/icons",
        bullets: [
          "Authored 320 hand-tuned outline icons in a unified grid.",
          "1.2k stars, used by ~40 production design systems.",
        ],
      },
    ],
    education: [
      {
        school: "Royal College of Art",
        degree: "MA",
        field: "Visual Communication",
        location: "London",
        endDate: "2019",
      },
      {
        school: "University of Toronto",
        degree: "BFA",
        field: "Design",
        location: "Toronto",
        endDate: "2017",
      },
    ],
    skills: [
      { category: "Design", skills: ["Figma", "Prototyping", "Design Systems", "Accessibility"] },
      { category: "Research", skills: ["User Interviews", "Usability Testing", "Surveys"] },
      { category: "Collaboration", skills: ["Agile", "Cross-functional", "Workshops"] },
    ],
  },
};

const TEMPLATE_META: Record<string, { tone: string; bestFor: string }> = {
  "modern-minimal": {
    tone: "Clean and spacious",
    bestFor: "Product, operations, and general roles",
  },
  "classic-professional": {
    tone: "Formal and polished",
    bestFor: "Corporate, finance, and consulting",
  },
  "left-sidebar": {
    tone: "Structured profile",
    bestFor: "Design, tech, and portfolio-forward roles",
  },
  "compact-single-column": {
    tone: "Dense and ATS-first",
    bestFor: "Experienced candidates with more detail",
  },
  "creative-bold": {
    tone: "High-contrast and memorable",
    bestFor: "Creative, brand, and modern teams",
  },
};

function htmlForPreview(html: string) {
  const previewStyles = `
    <style>
      html, body { overflow: hidden !important; scrollbar-width: none !important; }
      body::-webkit-scrollbar, html::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
    </style>
  `;

  return html.includes("</head>")
    ? html.replace("</head>", `${previewStyles}</head>`)
    : `${previewStyles}${html}`;
}

function TemplateCard({
  title,
  slug,
  html,
  tone,
  bestFor,
}: {
  title: string;
  slug: string;
  html: string;
  tone: string;
  bestFor: string;
}) {
  const navigate = useNavigate();

  return (
    <article className="group w-full rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-3 shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--app-border-strong)] hover:shadow-[var(--shadow-pop)]">
      <div
        className="relative w-full aspect-[210/297] overflow-hidden rounded-xl bg-white cursor-pointer ring-1 ring-[var(--app-border)]"
        onClick={() => navigate(`/resumes?template=${slug}`)}
      >
        <iframe
          srcDoc={htmlForPreview(html)}
          title={`${title} preview`}
          aria-hidden
          tabIndex={-1}
          loading="lazy"
          sandbox=""
          scrolling="no"
          className="absolute left-0 top-0 origin-top-left pointer-events-none border-0 bg-white"
          style={{
            width: "300%",
            height: "300%",
            transform: "scale(0.3333)",
          }}
        />

        <div className="absolute inset-0 z-20 flex items-end justify-center bg-gradient-to-t from-[rgba(26,26,26,0.58)] via-transparent to-transparent pb-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/resumes?template=${slug}`);
            }}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium shadow-md transition-colors"
            style={{ backgroundColor: "#ffffff", color: "var(--app-fg)" }}
          >
            Use this template
            <ArrowRight className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="px-1 pb-1 pt-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-[var(--app-fg)]">{title}</h3>
            <p className="mt-1 text-xs text-[var(--app-fg-muted)]">{tone}</p>
          </div>
          <span className="rounded-full bg-[var(--accent-soft)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--accent-text)]">
            ATS
          </span>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-[var(--app-fg-soft)]">
          <CheckCircle2 className="size-3.5 shrink-0" />
          <span className="truncate">{bestFor}</span>
        </div>
      </div>
    </article>
  );
}

export default function TemplatesScreen() {
  const cards = useMemo(() => {
    return Object.values(TEMPLATES).map((tpl) => ({
      slug: tpl.slug,
      name: tpl.name,
      html: renderTemplate(tpl.slug, SAMPLE_DATA),
      meta: TEMPLATE_META[tpl.slug] ?? {
        tone: "Balanced and professional",
        bestFor: "Most job applications",
      },
    }));
  }, []);

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-fg)]">
      <SiteNavbar />
      <PageWithSidebar activeRoute="templates" mainClassName="mx-auto max-w-7xl pb-24">
        <section className="pt-8">
          <div className="flex flex-col gap-6 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-[var(--shadow-soft)] md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.22em] text-[var(--accent-text)]">
                Templates
              </div>
              <h1 className="font-display mt-1.5 text-3xl font-light tracking-tight text-[var(--app-fg)] md:text-4xl">
                Choose your <span className="italic">template</span>
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--app-fg-muted)]">
                Expertly crafted, ATS-friendly resume templates. Preview the real layouts, choose a style, and start editing right away.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm sm:flex sm:items-center">
              <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-3">
                <div className="flex items-center gap-2 text-[var(--app-fg)]">
                  <FileText className="size-4 text-[var(--accent-text)]" />
                  <span className="font-semibold">{cards.length}</span>
                </div>
                <div className="mt-1 text-xs text-[var(--app-fg-muted)]">Templates</div>
              </div>
              <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-3">
                <div className="flex items-center gap-2 text-[var(--app-fg)]">
                  <CheckCircle2 className="size-4 text-[var(--accent-text)]" />
                  <span className="font-semibold">ATS</span>
                </div>
                <div className="mt-1 text-xs text-[var(--app-fg-muted)]">Friendly</div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cards.map((c) => (
            <TemplateCard
              key={c.slug}
              title={c.name}
              slug={c.slug}
              html={c.html}
              tone={c.meta.tone}
              bestFor={c.meta.bestFor}
            />
          ))}
        </div>
      </PageWithSidebar>
    </div>
  );
}
