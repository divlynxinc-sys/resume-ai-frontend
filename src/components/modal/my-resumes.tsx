import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MoreVertical, Pencil, Trash2, Download } from "lucide-react";
import SiteNavbar from "../layout/site-navbar";
import PageWithSidebar from "../layout/page-with-sidebar";
import noResumeIllustration from "../../assets/no-resume.png";
import { resumeService, type ResumeContent } from "@/services";
import { renderTemplate } from "@/lib/resume-templates";

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

function contentToHtml(content: ResumeContent): string {
  const info = (content.info ?? {}) as Record<string, string>;
  const experiences = (content.experience ?? []) as Record<string, string>[];
  const education = (content.education ?? []) as Record<string, string>[];
  const skills = (content.skills ?? []) as string[];
  return renderTemplate("modern-minimal", {
    candidate_info: {
      name: info.full_name ?? "",
      email: info.email ?? "",
      phone: info.phone ?? "",
      linkedin: info.linkedin_url || undefined,
      portfolio: info.portfolio_url || undefined,
    },
    resume: {
      summary: typeof content.summary === "string" ? content.summary : "",
      experiences: experiences
        .map((e) => ({
          role: e.role ?? "",
          company: e.company ?? "",
          location: e.location ?? "",
          startDate: e.start_date ?? "",
          endDate: e.end_date ?? "",
          bullets: e.description ? e.description.split("\n").filter(Boolean) : [],
        }))
        .filter((e) => e.role || e.company),
      projects: [],
      education: education
        .map((e) => ({
          school: e.school ?? "",
          degree: e.degree ?? "",
          field: e.field_of_study ?? "",
          location: e.location ?? "",
          endDate: e.end_date ?? "",
        }))
        .filter((e) => e.school || e.degree),
      skills: skills.length ? [{ category: "Skills", skills }] : [],
    },
  });
}

function MiniResumePreview({ id }: { id: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    resumeService.get(Number(id)).then((resume: any) => {
      if (cancelled) return;
      const content = resume?.content as ResumeContent | undefined;
      if (!content) return;
      try {
        const html = contentToHtml(content);
        const iframe = iframeRef.current;
        const container = containerRef.current;
        if (!iframe || !container) return;
        const doc = iframe.contentDocument;
        if (doc) {
          doc.open();
          doc.write(html);
          doc.close();
        }
        const scale = container.clientWidth / 794;
        iframe.style.transform = `scale(${scale})`;
        setReady(true);
      } catch {
        /* keep skeleton on render failure */
      }
    }).catch(() => { /* keep skeleton on network failure */ });
    return () => { cancelled = true; };
  }, [id]);

  return (
    <div ref={containerRef} className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-white shadow-lg select-none pointer-events-none">
      {/* Skeleton shown while fetching */}
      {!ready && (
        <div className="absolute inset-0 flex flex-col p-3 gap-1.5 bg-white">
          <div className="flex flex-col gap-1 items-center mb-1">
            <div className="h-2 w-2/3 rounded bg-gray-700/80" />
            <div className="h-1.5 w-1/2 rounded bg-gray-300/80" />
            <div className="h-1 w-2/5 rounded bg-gray-200/60" />
          </div>
          <div className="h-px w-full bg-gray-200" />
          {[0.7, 0.9, 0.8, 0.6, 0.85, 0.5].map((w, i) => (
            <div key={i} className="h-1 rounded bg-gray-200" style={{ width: `${w * 100}%` }} />
          ))}
          <div className="mt-1 h-px w-full bg-gray-200" />
          {[0.75, 0.9, 0.55, 0.8, 0.65].map((w, i) => (
            <div key={i} className="h-1 rounded bg-gray-200" style={{ width: `${w * 100}%` }} />
          ))}
          <div className="mt-1 h-px w-full bg-gray-200" />
          {[0.6, 0.85, 0.7].map((w, i) => (
            <div key={i} className="h-1 rounded bg-gray-200" style={{ width: `${w * 100}%` }} />
          ))}
        </div>
      )}
      <iframe
        ref={iframeRef}
        title="Resume preview"
        className="absolute top-0 left-0 origin-top-left border-none"
        style={{ width: 794, height: 1123, display: ready ? "block" : "none" }}
        sandbox="allow-same-origin"
      />
    </div>
  );
}

function ResumeCard({ item, onRename, onDelete }: { item: ResumeItem; onRename: (id: string, newTitle: string) => void; onDelete: (id: string) => void }) {
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(item.title);
  const [menuOpen, setMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const commit = () => {
    const trimmed = editValue.trim() || "Untitled";
    setEditing(false);
    if (trimmed !== item.title) onRename(item.id, trimmed);
  };

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const formattedDate = item.updatedAt
    ? new Date(item.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
    : null;

  return (
    <div className="group/card rounded-xl border border-white/10 bg-white/[0.04] overflow-hidden flex flex-col hover:border-white/20 hover:bg-white/[0.06] transition-all">
      {/* Mini document preview — clickable to edit */}
      <div
        className="px-4 pt-4 pb-2 cursor-pointer"
        onClick={() => navigate(`/resumes?id=${item.id}`)}
      >
        <MiniResumePreview id={item.id} />
      </div>

      {/* Card footer */}
      <div className="px-4 pb-4 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {editing ? (
              <input
                ref={inputRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={commit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commit();
                  if (e.key === "Escape") { setEditValue(item.title); setEditing(false); }
                }}
                className="w-full rounded border border-white/20 bg-white/10 px-2 py-0.5 text-sm font-medium text-white outline-none focus:border-blue-500/50"
                autoFocus
              />
            ) : (
              <h3
                className="text-sm font-semibold truncate cursor-default"
                title={item.title || "Untitled Resume"}
              >
                {item.title || "Untitled Resume"}
              </h3>
            )}
            {formattedDate && (
              <p className="text-xs text-white/50 mt-0.5">Updated {formattedDate}</p>
            )}
          </div>

          {/* 3-dot menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="p-1 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            >
              <MoreVertical className="size-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 z-20 w-40 rounded-lg border border-white/10 bg-[#0f1629] shadow-xl py-1 text-sm">
                <button
                  onClick={() => { setMenuOpen(false); setEditValue(item.title); setEditing(true); setTimeout(() => inputRef.current?.select(), 0); }}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-white/[0.05] text-white/80 hover:text-white"
                >
                  <Pencil className="size-3.5" /> Rename
                </button>
                <button
                  onClick={() => { setMenuOpen(false); onDelete(item.id); }}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-red-500/10 text-red-400 hover:text-red-300"
                >
                  <Trash2 className="size-3.5" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/resumes?id=${item.id}`)}
            className="flex-1 py-1.5 text-sm rounded-md bg-white text-black hover:bg-white/90 font-medium transition-colors"
          >
            Edit
          </button>
          <button
            title="Download"
            className="p-1.5 rounded-md border border-white/20 hover:bg-white/[0.06] text-white/60 hover:text-white transition-colors"
            onClick={() => alert("Download: wire this to the PDF export in the builder.")}
          >
            <Download className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MyResumesScreen() {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setLoading(true);
    resumeService.list({ limit: 50 })
      .then((data: any) => {
        const items = Array.isArray(data) ? data : (data?.items ?? data?.results ?? data?.data ?? []);
        setResumes(
          items.map((r: any, idx: number) => ({
            id: String(r?.id ?? idx),
            title: r?.title ?? "Untitled Resume",
            updatedAt: r?.updatedAt ?? r?.updated_at,
          }))
        );
      })
      .catch((e: any) => {
        console.warn("Failed to load resumes from API", e);
        setResumes([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleRename = async (id: string, newTitle: string) => {
    setResumes((prev) => prev.map((r) => r.id === id ? { ...r, title: newTitle } : r));
    try {
      await resumeService.update(Number(id), { title: newTitle });
    } catch { /* silently fail */ }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await resumeService.delete(Number(id));
      setResumes((prev) => prev.filter((r) => r.id !== id));
    } catch { /* silently fail */ }
    finally {
      setDeleting(false);
      setDeleteConfirmId(null);
    }
  };

  const hasResumes = resumes.length > 0;
  const filteredResumes = resumes.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-svh bg-[var(--app-bg)] text-white">
      <SiteNavbar />

      {/* Delete confirmation modal */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4">
          <div className="w-full max-w-sm rounded-xl border border-white/10 bg-[#0f1629] p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white">Delete Resume?</h3>
            <p className="mt-2 text-sm text-white/70">This action cannot be undone.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={deleting}
                className="rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 disabled:opacity-50 transition-colors"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <PageWithSidebar activeRoute="my-resumes">
        <main className="px-6 py-4">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h1 className="text-2xl font-black tracking-tight">My Resumes</h1>

              <div className="flex items-center gap-3">
                {/* Search Bar */}
                <div className="relative w-full md:w-72 group">
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
                <button
                  onClick={() => navigate("/resumes")}
                  className="shrink-0 px-4 py-2 rounded-xl bg-[oklch(0.488_0.243_264.376)] text-white text-sm font-medium hover:brightness-110 transition-colors"
                >
                  + New Resume
                </button>
              </div>
            </div>

            <div className="mt-6">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-xl border border-white/10 bg-white/[0.04] overflow-hidden animate-pulse">
                      <div className="mx-4 mt-4 aspect-[3/4] rounded-lg bg-white/10" />
                      <div className="px-4 pb-4 pt-3 flex flex-col gap-2">
                        <div className="h-3 w-2/3 rounded bg-white/10" />
                        <div className="h-2 w-1/3 rounded bg-white/[0.06]" />
                        <div className="h-8 rounded-md bg-white/10 mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : !hasResumes ? (
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredResumes.map((item) => (
                    <ResumeCard key={item.id} item={item} onRename={handleRename} onDelete={(id) => setDeleteConfirmId(id)} />
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
