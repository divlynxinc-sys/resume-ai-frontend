import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import SiteNavbar from "../layout/site-navbar";
import PageWithSidebar from "../layout/page-with-sidebar";
import { TEMPLATES, renderTemplate, type TemplateInput } from "@/lib/resume-templates";

/**
 * Sample data used to render template previews on this page.
 * Lorem-style realistic content so users see what each template looks like
 * without ever leaking real PII into the previews.
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

/* Subtle pastel tint per card so the grid doesn't feel monotone */
const TINTS = [
  "var(--pastel-lavender)",
  "var(--pastel-peach)",
  "var(--pastel-mint)",
  "var(--pastel-sky)",
  "var(--pastel-butter)",
  "var(--pastel-rose)",
];

function TemplateCard({
  title,
  slug,
  html,
  tint,
}: {
  title: string;
  slug: string;
  html: string;
  tint: string;
}) {
  const navigate = useNavigate();
  return (
    <div className="w-full">
      <div
        className="relative group w-full aspect-[3/4] rounded-2xl border border-[var(--app-border)] overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-pop)] hover:border-[var(--app-border-strong)]"
        style={{ backgroundColor: tint, boxShadow: "var(--shadow-soft)" }}
        onClick={() => navigate(`/resumes?template=${slug}`)}
      >
        {/* Resume preview — actual rendered template, scaled */}
        <iframe
          srcDoc={html}
          title={`${title} preview`}
          aria-hidden
          tabIndex={-1}
          loading="lazy"
          sandbox=""
          className="absolute top-0 left-0 origin-top-left pointer-events-none border-0 bg-white"
          style={{
            width: "300%",
            height: "300%",
            transform: "scale(0.3333)",
          }}
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 z-20 flex items-end justify-center pb-5 bg-gradient-to-t from-[rgba(26,26,26,0.55)] via-transparent to-transparent opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/resumes?template=${slug}`);
            }}
            className="px-4 py-2 rounded-full text-xs font-medium shadow-md cursor-pointer transition-colors"
            style={{ backgroundColor: "#ffffff", color: "var(--app-fg)" }}
          >
            Use this template
          </button>
        </div>
      </div>
      <div className="mt-3 text-sm font-medium text-[var(--app-fg)]">{title}</div>
    </div>
  );
}

export default function TemplatesScreen() {
  // Render each template's HTML once with the sample data.
  const cards = useMemo(() => {
    return Object.values(TEMPLATES).map((tpl) => ({
      slug: tpl.slug,
      name: tpl.name,
      html: renderTemplate(tpl.slug, SAMPLE_DATA),
    }));
  }, []);

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-fg)]">
      <SiteNavbar />
      <PageWithSidebar activeRoute="templates" mainClassName="mx-auto max-w-7xl pb-24">
        <div className="pt-10">
          <div className="text-xs font-medium tracking-[0.16em] uppercase text-[var(--accent-text)]">Templates</div>
          <h1 className="font-display text-3xl md:text-4xl font-light tracking-tight text-[var(--app-fg)] mt-1.5">
            Choose your <span className="italic">template</span>
          </h1>
          <p className="mt-3 text-sm text-[var(--app-fg-muted)] max-w-xl leading-relaxed">
            Expertly crafted, ATS-friendly resume templates. Pick one to start — you can switch any time.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cards.map((c, i) => (
            <TemplateCard
              key={c.slug}
              title={c.name}
              slug={c.slug}
              html={c.html}
              tint={TINTS[i % TINTS.length]}
            />
          ))}
        </div>
      </PageWithSidebar>
    </div>
  );
}
