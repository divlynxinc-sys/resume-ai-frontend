import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { TEMPLATES, renderTemplate, type TemplateInput } from "@/lib/resume-templates";

/**
 * Dummy data used to render the carousel previews on the landing page.
 * Lorem-style names + realistic-but-fake content so we never display real PII.
 * The carousel pulls from the same TEMPLATES registry as the resume builder,
 * so any template shown here is always available to pick in /templates.
 */
const DUMMY_DATA: TemplateInput = {
  candidate_info: {
    name: "Avery Lawson",
    email: "avery.lawson@example.com",
    phone: "+1 (555) 123-4567",
    linkedin: "linkedin.com/in/averylawson",
    portfolio: "averylawson.design",
  },
  resume: {
    summary:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Senior product designer with seven years crafting calm, accessible interfaces for fintech and healthcare. Curabitur eget mauris vitae quam tincidunt aliquam.",
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

function SectionTitle({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      {eyebrow && (
        <div className="text-xs font-medium tracking-[0.18em] uppercase text-[var(--accent-text)] mb-3">
          {eyebrow}
        </div>
      )}
      <h2 className="font-display text-3xl md:text-4xl font-light tracking-tight text-[var(--app-fg)] leading-tight">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-3 text-[var(--app-fg-muted)] leading-relaxed">{subtitle}</p>
      ) : null}
    </div>
  );
}

function TemplateCard({ slug, name, html }: { slug: string; name: string; html: string }) {
  const navigate = useNavigate();
  return (
    <div data-landing-reveal className="flex-none w-64 sm:w-72">
      <div
        onClick={() => navigate(`/templates?selected=${slug}`)}
        className="relative group w-full aspect-[3/4] rounded-2xl bg-white border border-[var(--app-border)] shadow-[var(--shadow-soft)] overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-pop)]"
      >
        <iframe
          srcDoc={html}
          title={name}
          aria-hidden
          tabIndex={-1}
          loading="lazy"
          sandbox=""
          className="absolute top-0 left-0 origin-top-left pointer-events-none border-0"
          style={{
            width: "300%",
            height: "300%",
            transform: "scale(0.3333)",
          }}
        />
        <div className="absolute inset-0 z-20 flex items-end justify-center pb-5 bg-gradient-to-t from-[rgba(26,26,26,0.55)] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            type="button"
            className="px-4 py-2 rounded-full bg-white text-[var(--app-fg)] text-xs font-medium shadow-md cursor-pointer"
          >
            Use this template
          </button>
        </div>
      </div>
      <div className="mt-3 text-sm font-medium text-[var(--app-fg)] truncate">{name}</div>
    </div>
  );
}

export function TemplatesShowingSection() {
  // Render once per template so iframes aren't created 3x in the marquee.
  // We then use CSS-side duplication only on the wrapper for the seamless loop.
  const cards = useMemo(() => {
    return Object.values(TEMPLATES).map((tpl) => ({
      slug: tpl.slug,
      name: tpl.name,
      html: renderTemplate(tpl.slug, DUMMY_DATA),
    }));
  }, []);

  return (
    <section className="max-w-[1100px] mx-auto px-6">
      <style>{`
        @keyframes scrollXFast { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .templates-scroll-track { animation: scrollXFast 60s linear infinite; will-change: transform; }
        .templates-scroll-track:hover { animation-play-state: paused; }
      `}</style>

      <SectionTitle
        eyebrow="Templates"
        title="Pick a template, make it yours."
        subtitle="A small library of refined, ATS-friendly designs to start from. Click any to use it in the builder."
      />

      <div
        className="mt-14 overflow-hidden"
        style={{
          WebkitMaskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
          maskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
        }}
      >
        <div className="templates-scroll-track flex items-start gap-6 w-max">
          {/* Render twice for the seamless loop; iframes are heavy so cap at 2x */}
          {[...cards, ...cards].map((c, i) => (
            <TemplateCard key={`${c.slug}-${i}`} slug={c.slug} name={c.name} html={c.html} />
          ))}
        </div>
      </div>
    </section>
  );
}
