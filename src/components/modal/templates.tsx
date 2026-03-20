import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SiteNavbar from "../layout/site-navbar";
import PageWithSidebar from "../layout/page-with-sidebar";
import { TEMPLATES, renderTemplate, type TemplateInput } from "@/lib/resume-templates";

/** Sample data used to render template previews */
const SAMPLE_DATA: TemplateInput = {
  candidate_info: {
    name: "Mustafa Irfan",
    email: "mustafa.irfan@example.com",
    phone: "+44 7123 456789",
    linkedin: "https://www.linkedin.com/in/mustafairfan",
    portfolio: "https://mustafairfan.dev",
  },
  resume: {
    summary:
      "Experienced Machine Learning Engineer with a focus on designing, developing, and deploying scalable ML pipelines using Python, PyTorch, and TensorFlow. Skilled in working with large datasets and deploying models to cloud platforms.",
    experiences: [
      {
        role: "Machine Learning Intern",
        company: "TechNova AI",
        location: "London, UK",
        startDate: "2024-06",
        endDate: "2024-09",
        bullets: [
          "Developed and deployed machine learning models using PyTorch for predictive analytics.",
          "Worked with large datasets to train deep learning models for image recognition tasks.",
          "Integrated AI solutions into production environments, improving system efficiency by 15%.",
        ],
      },
      {
        role: "AI Research Assistant",
        company: "Edinburgh Data Lab",
        location: "Edinburgh, UK",
        startDate: "2023-09",
        endDate: "2024-05",
        bullets: [
          "Designed and implemented scalable ML pipelines for natural language processing tasks.",
          "Trained deep learning models using TensorFlow to improve model accuracy by 10%.",
        ],
      },
    ],
    projects: [
      {
        title: "Resume Parser using NLP",
        link: "https://github.com/mustafairfan/resume-parser",
        bullets: [
          "Developed a resume parser using PyTorch for efficient data extraction.",
          "Integrated the parser into an AI-driven application, improving speed by 20%.",
        ],
      },
    ],
    education: [
      {
        school: "University of Edinburgh",
        degree: "MSc",
        field: "Artificial Intelligence",
        location: "Edinburgh, UK",
        endDate: "2025",
      },
      {
        school: "National University of Sciences and Technology",
        degree: "BSc",
        field: "Computer Science",
        location: "Islamabad, Pakistan",
        endDate: "2023",
      },
    ],
    skills: [
      { category: "Programming", skills: ["Python", "C++", "JavaScript"] },
      { category: "AI/ML", skills: ["TensorFlow", "PyTorch", "Scikit-learn", "Deep Learning", "NLP"] },
      { category: "Tools", skills: ["Docker", "Git", "AWS", "Linux"] },
    ],
  },
};

const BG_PALETTE = [
  "bg-[#2a3b36]", "bg-[#3a3327]", "bg-[#2f3138]", "bg-[#2a4141]", "bg-[#3a3a3a]",
];

/** Renders a live miniature HTML preview of the template inside a scaled iframe */
function TemplatePreview({ slug }: { slug: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const html = renderTemplate(slug, SAMPLE_DATA);
    const doc = iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();
    }
  }, [slug]);

  return (
    <iframe
      ref={iframeRef}
      title={`${slug} preview`}
      className="absolute left-1/2 top-1/2 origin-top-left rounded-lg bg-white shadow-xl pointer-events-none"
      style={{
        width: 794,
        height: 1123,
        transform: "translate(-50%, -50%) scale(0.32)",
        border: "none",
      }}
    />
  );
}

function TemplateCard({
  title,
  slug,
  bg,
}: {
  title: string;
  slug: string;
  bg: string;
}) {
  const navigate = useNavigate();
  return (
    <div className="w-full">
      <div
        className={`relative group w-full aspect-[3/4] rounded-2xl ${bg} border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.35)] overflow-hidden transition-transform duration-200 ease-out hover:scale-[1.03] cursor-pointer`}
      >
        <div className="absolute inset-0 opacity-30 bg-gradient-to-br from-white/10 to-black/10" />
        <TemplatePreview slug={slug} />
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/35 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
          <button
            onClick={() => navigate(`/resumes?template=${slug}`)}
            className="px-4 py-2 rounded-full bg-white text-black text-sm font-medium shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:bg-gray-100 cursor-pointer transition"
          >
            Use Template
          </button>
        </div>
        <div className="absolute left-4 top-4 h-24 w-24 rounded-full bg-black/10 blur-2xl" />
      </div>
      <div className="mt-3 text-sm text-white/80">{title}</div>
    </div>
  );
}

export default function TemplatesScreen() {
  const templateEntries = Object.values(TEMPLATES);

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-white">
      <SiteNavbar />
      <PageWithSidebar activeRoute="templates" mainClassName="mx-auto max-w-7xl pb-24">
        <div className="flex items-start justify-between pt-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Choose Your Template</h1>
            <p className="mt-2 text-sm text-white/60">
              Explore our range of expertly crafted, ATS-friendly resume templates.
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {templateEntries.map((t, i) => (
            <TemplateCard
              key={t.slug}
              title={t.name}
              slug={t.slug}
              bg={BG_PALETTE[i % BG_PALETTE.length]}
            />
          ))}
        </div>
      </PageWithSidebar>
    </div>
  );
}
