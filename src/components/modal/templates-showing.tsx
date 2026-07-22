import { useMemo } from "react";
import { Link } from "react-router-dom";
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

function htmlForPreview(html: string) {
  const previewStyles = `
    <style>
      html, body { width: 210mm !important; min-width: 210mm !important; min-height: 297mm !important; overflow: hidden !important; scrollbar-width: none !important; }
      body::-webkit-scrollbar, html::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
    </style>
  `;

  return html.includes("</head>")
    ? html.replace("</head>", `${previewStyles}</head>`)
    : `${previewStyles}${html}`;
}

function TemplateCard({
  slug,
  name,
  html,
  decorative = false,
}: {
  slug: string;
  name: string;
  html: string;
  decorative?: boolean;
}) {
  return (
    <article className="group w-[18rem] flex-none sm:w-[20rem] lg:w-[21rem]">
      <div
        className="relative aspect-[210/297] w-full overflow-hidden bg-white shadow-[var(--shadow-soft)] ring-1 ring-[var(--app-border)]"
      >
        <iframe
          srcDoc={htmlForPreview(html)}
          title={name}
          aria-hidden
          tabIndex={-1}
          loading="lazy"
          sandbox=""
          scrolling="no"
          className="pointer-events-none absolute left-0 top-0 origin-top-left border-0 bg-white [--template-scale:0.3627] sm:[--template-scale:0.403] lg:[--template-scale:0.4232]"
          style={{
            width: "794px",
            height: "1123px",
            transform: "scale(var(--template-scale))",
          }}
        />
        <div className="absolute inset-0 z-10 flex items-end justify-center bg-gradient-to-t from-black/55 via-black/10 to-transparent pb-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
          <Link
            to={`/signup?next=${encodeURIComponent(`/resumes?template=${slug}`)}`}
            tabIndex={decorative ? -1 : 0}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--app-border-strong)] bg-[var(--app-surface)] px-4 text-xs font-semibold text-[var(--app-fg)] shadow-[var(--shadow-pop)] transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            Use this template <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 px-1 pt-3">
        <div className="truncate text-sm font-medium text-[var(--app-fg)]">{name}</div>
        <span className="shrink-0 rounded-full bg-[var(--accent-soft)] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-[var(--accent-text)]">
          ATS
        </span>
      </div>
    </article>
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
        @keyframes templatesMarquee {
          from { transform: translate3d(0, 0, 0); }
          to { transform: translate3d(-50%, 0, 0); }
        }
        .templates-scroll-track {
          animation: templatesMarquee 48s linear infinite;
          will-change: transform;
        }
        .templates-scroll-window:hover .templates-scroll-track,
        .templates-scroll-window:focus-within .templates-scroll-track {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .templates-scroll-track { animation: none; transform: translate3d(0, 0, 0); }
        }
      `}</style>

      <SectionTitle
        eyebrow="Templates"
        title="Pick a template, make it yours."
        subtitle="A preview of our refined, ATS-friendly resume designs."
      />

      <div data-landing-reveal className="mt-14 py-2">
        <div
          className="templates-scroll-window overflow-hidden"
          style={{
            WebkitMaskImage: "linear-gradient(to right, transparent 0, black 3rem, black calc(100% - 3rem), transparent 100%)",
            maskImage: "linear-gradient(to right, transparent 0, black 3rem, black calc(100% - 3rem), transparent 100%)",
          }}
        >
          <div className="templates-scroll-track flex w-max items-start">
            {[0, 1].map((copy) => (
              <div
                key={copy}
                aria-hidden={copy === 1 || undefined}
                className="flex shrink-0 items-start gap-5 px-2.5"
              >
                {cards.map((card) => (
                  <TemplateCard
                    key={`${copy}-${card.slug}`}
                    slug={card.slug}
                    name={card.name}
                    html={card.html}
                    decorative={copy === 1}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
