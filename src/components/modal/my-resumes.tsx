import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import SiteNavbar from "../layout/site-navbar";
import PageWithSidebar from "../layout/page-with-sidebar";
import noResumeIllustration from "../../assets/no-resume.png";
import { resumeService } from "@/services";

// Lightweight types. Adjust if your builder persists richer resume data.
interface ResumeItem {
  id: string;
  title: string;
  updatedAt?: string;
}

function SleepingKoala() {
  return (
    <div className="relative mx-auto w-[150px] sm:w-[200px] md:w-[300px] lg:w-[370px]">
      <img
        src={noResumeIllustration}
        alt="No resumes"
        className="block w-full h-auto object-contain select-none brightness-115 contrast-105 saturate-110"
        draggable={false}
      />
      <div className="pointer-events-none absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2 w-[55%] h-[55%] rounded-full mix-blend-screen opacity-40 bg-[radial-gradient(circle,rgba(255,255,255,0.45)_0%,rgba(255,255,255,0.22)_35%,rgba(255,255,255,0.08)_65%,transparent_100%)]" />
    </div>
  );
}

function EmptyState() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center text-center">
      <SleepingKoala />
      <div className="mt-2 flex flex-col items-center text-center gap-5">
        <h2 className="text-xl font-semibold">No Resumes Created Yet!</h2>
        <p className="text-white/70 max-w-md">
          Kickstart your journey by building your first resume.
        </p>
        <button
          onClick={() => navigate("/resumes")}
          className="px-5 py-2.5 rounded-xl bg-[oklch(0.488_0.243_264.376)] text-white shadow-md shadow-[oklch(0.488_0.243_264.376)/30] hover:brightness-110 transition-colors"
        >
          Create Your First Resume
        </button>
      </div>
    </div>
  );
}

function ResumeCard({ item }: { item: ResumeItem }) {
  const navigate = useNavigate();
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 flex flex-col gap-3 hover:bg-white/[0.06]">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-medium">{item.title || "Untitled Resume"}</h3>
          {item.updatedAt && (
            <p className="text-xs text-white/60">Updated {item.updatedAt}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate("/resumes")}
          className="px-3 py-1.5 text-sm rounded-md bg-white text-black hover:bg-white/90"
        >
          Edit
        </button>
        <button
          onClick={() => {
            // Placeholder: implement download from stored data when available
            alert("Download is not set up yet. We can wire this to export from the builder.");
          }}
          className="px-3 py-1.5 text-sm rounded-md border border-white/20 hover:bg-white/[0.06]"
        >
          Download
        </button>
      </div>
    </div>
  );
}

export default function MyResumesScreen() {
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    resumeService.list({ limit: 50 })
      .then((data: any) => {
        const items = Array.isArray(data) ? data : (data?.results ?? data?.data ?? []);
        setResumes(
          items.map((r: any, idx: number) => ({
            id: r?.id ?? String(idx),
            title: r?.title ?? "Untitled Resume",
            updatedAt: r?.updatedAt ?? r?.updated_at,
          }))
        );
      })
      .catch((e: any) => {
        console.warn("Failed to load resumes from API", e);
        // Fallback to localStorage
        try {
          const raw = localStorage.getItem("resumes");
          if (!raw) { setResumes([]); return; }
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            setResumes(
              parsed.map((r: any, idx: number) => ({
                id: r?.id ?? String(idx),
                title: r?.title ?? "Untitled Resume",
                updatedAt: r?.updatedAt,
              }))
            );
          } else {
            setResumes([]);
          }
        } catch {
          setResumes([]);
        }
      });
  }, []);

  const hasResumes = resumes.length > 0;
  const filteredResumes = resumes.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-svh bg-[var(--app-bg)] text-white">
      <SiteNavbar />

      <PageWithSidebar activeRoute="my-resumes">
        <main className="px-6 py-4">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h1 className="text-2xl font-black tracking-tight">My Resumes</h1>

              {/* Search Bar */}
              <div className="relative w-full md:w-80 group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="size-4 text-white/40 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Search resumes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full rounded-xl border border-white/10 bg-white/[0.03] pl-10 pr-4 py-2 text-sm text-white placeholder-white/30 focus:border-blue-500/50 focus:bg-white/[0.05] focus:ring-1 focus:ring-blue-500/20 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="mt-6">
              {!hasResumes ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6 grid justify-items-center items-start min-h-[320px]">
                  <EmptyState />
                </div>
              ) : filteredResumes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-white/10 bg-white/[0.02]">
                   <div className="p-4 rounded-full bg-white/5 mb-4">
                      <Search className="size-8 text-white/20" />
                   </div>
                   <h3 className="text-lg font-medium text-white/80">No matches found</h3>
                   <p className="text-sm text-white/50 mt-1">Try searching for a different resume name.</p>
                   <button
                     onClick={() => setSearchQuery("")}
                     className="mt-6 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                   >
                     Clear search
                   </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredResumes.map((item) => (
                    <ResumeCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </PageWithSidebar>
    </div>
  );
}
