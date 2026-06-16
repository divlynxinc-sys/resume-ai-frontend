import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MoreVertical, Pencil, Trash2, Download, FileText, X } from "lucide-react";
import SiteNavbar from "../layout/site-navbar";
import PageWithSidebar from "../layout/page-with-sidebar";
import noResumeIllustration from "../../assets/no-resume.png";
import { resumeService, type ResumeContent } from "@/services";
import { renderTemplate } from "@/lib/resume-templates";

import {
  downloadResumeHtmlAsDocx,
  downloadResumeHtmlAsPdf,
  resumeContentToHtml,
  safeFileName,
} from "@/lib/resume-export";
import {
  mapContentToLocal,
  toTemplateInput,
  readResumeDraft,
  type ResumeData,
} from "./resume-builder.helpers";

interface ResumeItem {
  id: string;
  title: string;
  updatedAt?: string;
}

type DownloadFormat = "pdf" | "docx";

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
        <h2 className="font-display text-2xl font-light tracking-tight text-[var(--app-fg)]">
          No resumes <span className="italic">yet</span>
        </h2>
        <p className="text-[var(--app-fg-muted)] max-w-md">
          Kickstart your journey by building your first resume.
        </p>
        <button
          onClick={() => navigate("/templates")}
          className="px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
          style={{ backgroundColor: "var(--accent)", color: "#ffffff" }}
        >
          Create your first resume
        </button>
      </div>
    </div>
  );
}

const EMPTY_RESUME: ResumeData = {
  name: "", email: "", phone: "", location: "", linkedin: "", portfolio: "",
  experiences: [], education: [], skills: [], summary: "",
  job: { title: "", company: "", location: "", description: "" },
  customSections: [],
};

// Render a resume card using the SAME mapping + template the builder uses, so the
// preview matches the editor exactly (and respects the resume's chosen template
// instead of always rendering modern-minimal).
function renderResumeCardHtml(resume: ResumeData, templateSlug: string): string {
  try {
    return renderTemplate(templateSlug, toTemplateInput(resume));
  } catch {
    return renderTemplate("modern-minimal", toTemplateInput(resume));
  }
}

function MiniResumePreview({ id }: { id: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const renderInto = (resume: ResumeData, slug: string) => {
      const iframe = iframeRef.current;
      const container = containerRef.current;
      if (!iframe || !container) return;
      try {
        const html = renderResumeCardHtml(resume, slug);
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
    };

    // Prefer the local draft (latest edits + chosen template) so the card matches
    // what the user last saw in the builder; otherwise use the saved server content.
    const draft = readResumeDraft(Number(id));
    const slug = draft?.templateSlug || "modern-minimal";
    if (draft?.resume) {
      renderInto(draft.resume, slug);
      return () => { cancelled = true; };
    }

    resumeService.get(Number(id)).then((resume: any) => {
      if (cancelled) return;
      const content = resume?.content as ResumeContent | undefined;
      if (!content) return;
      renderInto(mapContentToLocal(content, EMPTY_RESUME), slug);
    }).catch(() => { /* keep skeleton on network failure */ });

    return () => { cancelled = true; };
  }, [id]);

  return (
    <div ref={containerRef} className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-white select-none pointer-events-none border border-[var(--app-border)]">
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

function ResumeCard({
  item,
  onRename,
  onDelete,
  onDownload,
}: {
  item: ResumeItem;
  onRename: (id: string, newTitle: string) => void;
  onDelete: (id: string) => void;
  onDownload: (item: ResumeItem) => void;
}) {
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
    <div className="group/card rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] overflow-hidden flex flex-col hover:border-[var(--app-border-strong)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)] transition-all duration-300">
      {/* Mini document preview — clickable to edit */}
      <div
        className="px-4 pt-4 pb-3 cursor-pointer"
        onClick={() => navigate(`/resumes?id=${item.id}`)}
      >
        <MiniResumePreview id={item.id} />
      </div>

      {/* Card footer */}
      <div className="px-4 pb-4 flex flex-col gap-3">
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
                className="w-full rounded border px-2 py-0.5 text-sm font-medium outline-none"
                style={{
                  borderColor: "var(--app-border-strong)",
                  backgroundColor: "var(--app-surface)",
                  color: "var(--app-fg)",
                }}
                autoFocus
              />
            ) : (
              <h3
                className="text-sm font-medium truncate cursor-default text-[var(--app-fg)]"
                title={item.title || "Untitled Resume"}
              >
                {item.title || "Untitled Resume"}
              </h3>
            )}
            {formattedDate && (
              <p className="text-xs text-[var(--app-fg-soft)] mt-1">Updated {formattedDate}</p>
            )}
          </div>

          {/* 3-dot menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="p-1 rounded-md text-[var(--app-fg-soft)] hover:text-[var(--app-fg)] hover:bg-[var(--app-surface-2)] transition-colors"
            >
              <MoreVertical className="size-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 z-20 w-40 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-[var(--shadow-pop)] py-1 text-sm">
                <button
                  onClick={() => { setMenuOpen(false); setEditValue(item.title); setEditing(true); setTimeout(() => inputRef.current?.select(), 0); }}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-[var(--app-surface-2)] text-[var(--app-fg-muted)] hover:text-[var(--app-fg)]"
                >
                  <Pencil className="size-3.5" /> Rename
                </button>
                <button
                  onClick={() => { setMenuOpen(false); onDelete(item.id); }}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-[var(--pastel-rose)]"
                  style={{ color: "#B85273" }}
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
            className="flex-1 py-2 text-sm rounded-lg font-medium transition-colors hover:opacity-90"
            style={{ backgroundColor: "var(--accent)", color: "#ffffff" }}
          >
            Edit
          </button>
          <button
            title="Download"
            className="p-2 rounded-lg border border-[var(--app-border-strong)] hover:bg-[var(--app-surface-2)] text-[var(--app-fg-muted)] hover:text-[var(--app-fg)] transition-colors"
            onClick={() => onDownload(item)}
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
  const [downloadTarget, setDownloadTarget] = useState<ResumeItem | null>(null);
  const [downloadingFormat, setDownloadingFormat] = useState<DownloadFormat | null>(null);
  const [downloadError, setDownloadError] = useState("");

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

  const handleDownload = async (format: DownloadFormat) => {
    if (!downloadTarget) return;
    setDownloadingFormat(format);
    setDownloadError("");

    try {
      const resume = await resumeService.get(Number(downloadTarget.id));
      if (!resume.content) throw new Error("This resume does not have any content to download.");

      const baseName = safeFileName(resume.title || downloadTarget.title);
      const html = resumeContentToHtml(resume.content, baseName);

      if (format === "pdf") {
        await downloadResumeHtmlAsPdf(html, `${baseName}.pdf`);
      } else {
        downloadResumeHtmlAsDocx(html, `${baseName}.docx`);
      }

      setDownloadTarget(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Download failed. Please try again.";
      setDownloadError(message);
    } finally {
      setDownloadingFormat(null);
    }
  };

  const hasResumes = resumes.length > 0;
  const filteredResumes = resumes.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-svh bg-[var(--app-bg)] text-[var(--app-fg)]">
      <SiteNavbar />

      {/* Delete confirmation modal */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(26,26,26,0.35)] backdrop-blur-[2px] p-4">
          <div className="w-full max-w-sm rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-[var(--shadow-pop)]">
            <h3 className="font-display text-xl font-light text-[var(--app-fg)] tracking-tight">Delete resume?</h3>
            <p className="mt-2 text-sm text-[var(--app-fg-muted)]">This action cannot be undone.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-[var(--app-fg-muted)] hover:bg-[var(--app-surface-2)] hover:text-[var(--app-fg)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={deleting}
                className="rounded-lg px-4 py-2 text-sm font-medium hover:opacity-80 disabled:opacity-50 transition-opacity"
                style={{ backgroundColor: "var(--pastel-rose)", color: "#B85273" }}
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {downloadTarget !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(26,26,26,0.35)] backdrop-blur-[2px] p-4">
          <div className="w-full max-w-sm rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-[var(--shadow-pop)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-xl font-light text-[var(--app-fg)] tracking-tight">Download resume</h3>
                <p className="mt-2 text-sm text-[var(--app-fg-muted)] truncate max-w-[16rem]" title={downloadTarget.title}>
                  {downloadTarget.title || "Untitled Resume"}
                </p>
              </div>
              <button
                onClick={() => {
                  if (downloadingFormat) return;
                  setDownloadTarget(null);
                  setDownloadError("");
                }}
                className="rounded-lg p-1.5 text-[var(--app-fg-soft)] hover:bg-[var(--app-surface-2)] hover:text-[var(--app-fg)] transition-colors disabled:opacity-50"
                disabled={!!downloadingFormat}
                aria-label="Close download options"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
              <button
                onClick={() => handleDownload("pdf")}
                disabled={!!downloadingFormat}
                className="flex items-center justify-between rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-2)] px-4 py-3 text-left transition-colors hover:border-[var(--app-border-strong)] disabled:opacity-60"
              >
                <span className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent-text)]">
                    <Download className="size-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-[var(--app-fg)]">Download as PDF</span>
                    <span className="block text-xs text-[var(--app-fg-muted)]">Best for sharing and printing</span>
                  </span>
                </span>
                <span className="text-xs text-[var(--app-fg-soft)]">{downloadingFormat === "pdf" ? "Preparing..." : ".pdf"}</span>
              </button>

              <button
                onClick={() => handleDownload("docx")}
                disabled={!!downloadingFormat}
                className="flex items-center justify-between rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-2)] px-4 py-3 text-left transition-colors hover:border-[var(--app-border-strong)] disabled:opacity-60"
              >
                <span className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-lg bg-[var(--pastel-sky)] text-[#2A6F97]">
                    <FileText className="size-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-[var(--app-fg)]">Download as DOCX</span>
                    <span className="block text-xs text-[var(--app-fg-muted)]">Editable in Word or Docs</span>
                  </span>
                </span>
                <span className="text-xs text-[var(--app-fg-soft)]">{downloadingFormat === "docx" ? "Preparing..." : ".docx"}</span>
              </button>
            </div>

            {downloadError ? (
              <p className="mt-4 rounded-lg bg-[var(--pastel-rose)] px-3 py-2 text-xs" style={{ color: "#B85273" }}>
                {downloadError}
              </p>
            ) : null}
          </div>
        </div>
      )}

      <PageWithSidebar activeRoute="my-resumes">
        <main className="px-6 py-4">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="text-xs font-medium tracking-[0.16em] uppercase text-[var(--accent-text)]">Library</div>
                <h1 className="font-display text-3xl md:text-4xl font-light tracking-tight text-[var(--app-fg)] mt-1.5">
                  My <span className="italic">resumes</span>
                </h1>
              </div>

              <div className="flex items-center gap-3">
                {/* Search Bar */}
                <div className="relative w-full md:w-72 group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="size-4 text-[var(--app-fg-soft)] group-focus-within:text-[var(--accent)] transition-colors" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search resumes…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none transition-all"
                    style={{
                      backgroundColor: "var(--app-surface)",
                      borderWidth: 1,
                      borderStyle: "solid",
                      borderColor: "var(--app-border-strong)",
                      color: "var(--app-fg)",
                    }}
                  />
                </div>
                <button
                  onClick={() => navigate("/templates")}
                  className="shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{ backgroundColor: "var(--accent)", color: "#ffffff" }}
                >
                  + New resume
                </button>
              </div>
            </div>

            <div className="mt-8">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] overflow-hidden animate-pulse">
                      <div className="mx-4 mt-4 aspect-[3/4] rounded-lg bg-[var(--app-surface-2)]" />
                      <div className="px-4 pb-4 pt-3 flex flex-col gap-2">
                        <div className="h-3 w-2/3 rounded bg-[var(--app-surface-2)]" />
                        <div className="h-2 w-1/3 rounded bg-[var(--app-surface-2)] opacity-60" />
                        <div className="h-8 rounded-md bg-[var(--app-surface-2)] mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : !hasResumes ? (
                <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 sm:p-6 grid justify-items-center items-start min-h-[320px]">
                  <EmptyState />
                </div>
              ) : filteredResumes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)]">
                  <div className="p-4 rounded-full bg-[var(--app-surface-2)] mb-4">
                    <Search className="size-7 text-[var(--app-fg-soft)]" />
                  </div>
                  <h3 className="font-display text-xl font-light text-[var(--app-fg)] tracking-tight">No matches found</h3>
                  <p className="text-sm text-[var(--app-fg-muted)] mt-1">Try searching for a different resume name.</p>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mt-6 text-sm text-[var(--accent-text)] hover:text-[var(--accent-hover)] transition-colors"
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {filteredResumes.map((item) => (
                    <ResumeCard
                      key={item.id}
                      item={item}
                      onRename={handleRename}
                      onDelete={(id) => setDeleteConfirmId(id)}
                      onDownload={(resume) => {
                        setDownloadTarget(resume);
                        setDownloadError("");
                      }}
                    />
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
