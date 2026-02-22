import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SiteNavbar from "../layout/site-navbar";
import PageWithSidebar from "../layout/page-with-sidebar";
import resumeTemplate from "../../assets/resume-template.png";
import { templatesService, type Template } from "@/services";

const FALLBACK_CARDS = [
  { name: "Modern",        bg: "bg-[#2a3b36]" },
  { name: "Classic",       bg: "bg-[#3a3327]" },
  { name: "Creative",      bg: "bg-[#2f3138]" },
  { name: "ATS-Friendly",  bg: "bg-[#2a4141]" },
  { name: "Minimalist",    bg: "bg-[#3a3a3a]" },
  { name: "Professional",  bg: "bg-[#2d343a]" },
  { name: "Executive",     bg: "bg-[#3b2f2a]" },
  { name: "Academic",      bg: "bg-[#30383a]" },
  { name: "Entry-Level",   bg: "bg-[#3a352a]" },
  { name: "Career Change", bg: "bg-[#3a2f30]" },
];

const BG_PALETTE = [
  "bg-[#2a3b36]", "bg-[#3a3327]", "bg-[#2f3138]", "bg-[#2a4141]",
  "bg-[#3a3a3a]", "bg-[#2d343a]", "bg-[#3b2f2a]", "bg-[#30383a]",
];

function TemplateCard({
  title,
  bg,
  previewUrl,
  isPremium,
}: {
  title: string;
  bg: string;
  previewUrl?: string | null;
  isPremium?: boolean;
}) {
  const navigate = useNavigate();
  return (
    <div className="w-full">
      <div
        className={`relative group w-full aspect-[4/5] rounded-2xl ${bg} border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.35)] overflow-hidden transition-transform duration-200 ease-out hover:scale-[1.03] cursor-pointer`}
      >
        <div className="absolute inset-0 opacity-30 bg-gradient-to-br from-white/10 to-black/10" />
        <img
          src={previewUrl ?? resumeTemplate}
          alt={`${title} template preview`}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[92%] w-auto rounded-lg object-contain bg-white shadow-xl"
        />
        {isPremium && (
          <div className="absolute top-3 right-3 z-10 rounded-full bg-yellow-500/90 px-2 py-0.5 text-[10px] font-semibold text-black">
            PRO
          </div>
        )}
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/35 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
          <button
            onClick={() => navigate("/resumes")}
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
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    templatesService
      .list()
      .then((data) => setTemplates(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const displayCards =
    templates.length > 0
      ? templates.map((t, i) => ({
          key: t.id,
          name: t.name,
          bg: BG_PALETTE[i % BG_PALETTE.length],
          previewUrl: t.preview_url || null,
          isPremium: t.is_premium,
        }))
      : FALLBACK_CARDS.map((c, i) => ({
          key: i,
          name: c.name,
          bg: c.bg,
          previewUrl: null,
          isPremium: false,
        }));

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

        {loading ? (
          <div className="mt-16 flex justify-center">
            <div className="h-8 w-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {displayCards.map((c) => (
              <TemplateCard
                key={c.key}
                title={c.name}
                bg={c.bg}
                previewUrl={c.previewUrl}
                isPremium={c.isPremium}
              />
            ))}
          </div>
        )}
      </PageWithSidebar>
    </div>
  );
}
