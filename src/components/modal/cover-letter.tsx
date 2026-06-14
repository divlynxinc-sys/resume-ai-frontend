import { useEffect, useMemo, useRef, useState } from "react";
import {
  FileText,
  Sparkles,
  Copy,
  Check,
  Download,
  Square,
  AlertCircle,
  ChevronDown,
  FileType,
  FileType2,
} from "lucide-react";
import html2pdf from "html2pdf.js";
import SiteNavbar from "../layout/site-navbar";
import PageWithSidebar from "../layout/page-with-sidebar";
import { AppButton } from "@/components/ui/AppButton";
import { resumeService, coverLetterService } from "@/services";
import { usePlan } from "@/contexts/PlanContext";

type Tone = "professional" | "enthusiastic" | "concise" | "warm";
type ResumeSource = "saved" | "paste";

interface ResumeOption {
  id: number;
  title: string;
  updatedAt?: string;
}

const TONES: { value: Tone; label: string; desc: string }[] = [
  { value: "professional", label: "Professional", desc: "Polished and confident" },
  { value: "enthusiastic", label: "Enthusiastic", desc: "Warm and energetic" },
  { value: "concise", label: "Concise", desc: "Tight, under 220 words" },
  { value: "warm", label: "Warm", desc: "Conversational and sincere" },
];

function ResumePicker({
  source,
  setSource,
  resumes,
  loadingResumes,
  selectedId,
  setSelectedId,
  resumeText,
  setResumeText,
}: {
  source: ResumeSource;
  setSource: (s: ResumeSource) => void;
  resumes: ResumeOption[];
  loadingResumes: boolean;
  selectedId: number | null;
  setSelectedId: (id: number | null) => void;
  resumeText: string;
  setResumeText: (s: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-[var(--app-fg)]">
        <span className="grid size-8 place-items-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent-text)]">
          <FileText className="size-4" />
        </span>
        Resume source
      </div>

      {/* Tab toggle */}
      <div className="inline-flex items-center rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-2)] p-1 text-xs">
        <button
          onClick={() => setSource("saved")}
          className={
            "px-3 py-1.5 rounded-md transition-colors " +
            (source === "saved"
              ? "bg-[var(--accent-soft)] text-[var(--accent-text)] font-medium"
              : "text-[var(--app-fg-muted)] hover:text-[var(--app-fg)]")
          }
        >
          From My Resumes
        </button>
        <button
          onClick={() => setSource("paste")}
          className={
            "px-3 py-1.5 rounded-md transition-colors " +
            (source === "paste"
              ? "bg-[var(--accent-soft)] text-[var(--accent-text)] font-medium"
              : "text-[var(--app-fg-muted)] hover:text-[var(--app-fg)]")
          }
        >
          Paste resume text
        </button>
      </div>

      {source === "saved" ? (
        <div className="relative">
          <select
            value={selectedId ?? ""}
            onChange={(e) =>
              setSelectedId(e.target.value ? Number(e.target.value) : null)
            }
            disabled={loadingResumes}
            className="w-full appearance-none rounded-lg border border-[var(--app-border-strong)] bg-[var(--btn-secondary-bg)] px-3 py-2.5 pr-10 text-sm text-[var(--app-fg)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/15 disabled:opacity-60"
          >
            <option value="">
              {loadingResumes
                ? "Loading your resumes…"
                : resumes.length
                ? "Select a resume…"
                : "No saved resumes — paste one instead"}
            </option>
            {resumes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[var(--app-fg-soft)]" />
        </div>
      ) : (
        <textarea
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          placeholder="Paste your resume here — name, contact info, summary, experience, education, skills…"
          rows={8}
          className="w-full rounded-lg border border-[var(--app-border-strong)] bg-[var(--btn-secondary-bg)] px-3 py-2.5 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg-soft)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/15 resize-y"
        />
      )}
    </div>
  );
}

function ToneSelect({ tone, setTone }: { tone: Tone; setTone: (t: Tone) => void }) {
  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-[var(--app-fg)]">Tone</div>
      <div className="grid grid-cols-2 gap-2">
        {TONES.map((t) => {
          const active = tone === t.value;
          return (
            <button
              key={t.value}
              onClick={() => setTone(t.value)}
              className={
                "rounded-lg border px-3 py-2.5 text-left transition-all " +
                (active
                  ? "border-[var(--accent)] bg-[var(--accent-soft)] shadow-[var(--shadow-soft)]"
                  : "border-[var(--app-border)] bg-[var(--btn-secondary-bg)] hover:border-[var(--app-border-strong)] hover:bg-[var(--btn-secondary-hover)]")
              }
            >
              <div
                className={
                  "text-sm font-medium " +
                  (active ? "text-[var(--accent-text)]" : "text-[var(--app-fg)]")
                }
              >
                {t.label}
              </div>
              <div className="text-xs text-[var(--app-fg-muted)] mt-0.5">{t.desc}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

type DownloadFormat = "pdf" | "docx" | "txt";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildLetterHtml(letter: string, opts: { wordCompat: boolean }): string {
  const paragraphs = letter
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  // For Word, single newlines inside a paragraph become <br>; for PDF rendering we
  // rely on the inner whitespace styling.
  const renderParagraph = (p: string) => {
    const inner = opts.wordCompat
      ? escapeHtml(p).replace(/\n/g, "<br />")
      : escapeHtml(p);
    return `<p style="margin:0 0 12pt 0;${opts.wordCompat ? "" : "white-space:pre-wrap;"}">${inner}</p>`;
  };

  const wordNs = opts.wordCompat
    ? ' xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"'
    : "";

  return `<!DOCTYPE html><html${wordNs}><head><meta charset="utf-8"><title>Cover Letter</title></head>
<body style="font-family:Georgia,serif;color:#1a1a1a;line-height:1.6;font-size:11pt;max-width:720px;margin:0 auto;padding:40px 50px;">
${paragraphs.map(renderParagraph).join("\n")}
</body></html>`;
}

function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function DownloadMenu({
  disabled,
  onPick,
}: {
  disabled: boolean;
  onPick: (fmt: DownloadFormat) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-[var(--app-fg-muted)] hover:bg-[var(--app-surface-2)] hover:text-[var(--app-fg)] disabled:opacity-40 disabled:hover:bg-transparent"
      >
        <Download className="size-3" /> Download
        <ChevronDown className="size-3 -ml-0.5" />
      </button>
      {open && !disabled && (
        <div className="absolute right-0 top-full mt-1 z-20 w-44 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-[var(--shadow-pop)] py-1 text-sm">
          <button
            onClick={() => {
              setOpen(false);
              onPick("pdf");
            }}
            className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-[var(--app-surface-2)] text-[var(--app-fg-muted)] hover:text-[var(--app-fg)]"
          >
            <FileType className="size-3.5" /> PDF (.pdf)
          </button>
          <button
            onClick={() => {
              setOpen(false);
              onPick("docx");
            }}
            className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-[var(--app-surface-2)] text-[var(--app-fg-muted)] hover:text-[var(--app-fg)]"
          >
            <FileType2 className="size-3.5" /> Word (.doc)
          </button>
          <button
            onClick={() => {
              setOpen(false);
              onPick("txt");
            }}
            className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-[var(--app-surface-2)] text-[var(--app-fg-muted)] hover:text-[var(--app-fg)]"
          >
            <FileText className="size-3.5" /> Plain text (.txt)
          </button>
        </div>
      )}
    </div>
  );
}

function OutputPanel({
  letter,
  streaming,
  error,
  onCopy,
  onDownload,
  onStop,
  copied,
}: {
  letter: string;
  streaming: boolean;
  error: string | null;
  onCopy: () => void;
  onDownload: (fmt: DownloadFormat) => void;
  onStop: () => void;
  copied: boolean;
}) {
  const empty = !letter && !streaming && !error;
  const waitingForFirstToken = streaming && !letter && !error;

  return (
    <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-[var(--shadow-soft)] flex flex-col h-full min-h-[520px] overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-[var(--app-border)] flex items-center justify-between gap-3 bg-[var(--app-surface)]">
        <div className="flex items-center gap-2 text-sm font-medium text-[var(--app-fg)]">
          <span className="grid size-8 place-items-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent-text)]">
            <Sparkles className="size-4" />
          </span>
          Cover letter
          {streaming && (
            <span className="ml-1 inline-flex items-center gap-1.5 text-xs font-normal text-[var(--app-fg-muted)]">
              <span className="size-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
              Generating…
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {streaming ? (
            <button
              onClick={onStop}
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-[var(--app-fg-muted)] hover:bg-[var(--app-surface-2)] hover:text-[var(--app-fg)]"
              title="Stop generation"
            >
              <Square className="size-3" /> Stop
            </button>
          ) : (
            <>
              <button
                onClick={onCopy}
                disabled={!letter}
                className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-[var(--app-fg-muted)] hover:bg-[var(--app-surface-2)] hover:text-[var(--app-fg)] disabled:opacity-40 disabled:hover:bg-transparent"
              >
                {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                {copied ? "Copied" : "Copy"}
              </button>
              <DownloadMenu disabled={!letter} onPick={onDownload} />
            </>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 px-5 py-4 overflow-auto bg-[var(--app-bg)]/20">
        {error ? (
          <div className="flex items-start gap-3 rounded-lg border border-[var(--pastel-rose)] bg-[var(--pastel-rose)]/30 px-4 py-3 text-sm" style={{ color: "#B85273" }}>
            <AlertCircle className="size-4 mt-0.5 shrink-0" />
            <div>
              <div className="font-medium">Couldn't generate</div>
              <div className="text-xs mt-1 opacity-90">{error}</div>
            </div>
          </div>
        ) : waitingForFirstToken ? (
          <div className="h-full min-h-[420px] flex flex-col items-center justify-center text-center px-6 py-10">
            <div className="relative grid size-16 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-text)]">
              <div className="size-8 rounded-full border-2 border-[var(--accent)]/25 border-t-[var(--accent)] animate-spin" />
              <Sparkles className="absolute size-4" />
            </div>
            <div className="mt-5 text-sm font-medium text-[var(--app-fg)]">
              Generating your cover letter
            </div>
            <div className="mt-1.5 max-w-xs text-xs leading-relaxed text-[var(--app-fg-muted)]">
              We are reading the resume and job description. The draft will start appearing here in a moment.
            </div>
          </div>
        ) : empty ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-6 py-10">
            <div className="size-12 grid place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-text)] mb-4">
              <Sparkles className="size-5" />
            </div>
            <div className="text-sm font-medium text-[var(--app-fg)]">
              Your letter will appear here
            </div>
            <div className="text-xs text-[var(--app-fg-muted)] mt-1.5 max-w-xs">
              Pick a resume, paste the job description, and click Generate. Tokens stream in as the model writes.
            </div>
          </div>
        ) : (
          <div className="min-h-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-5 py-5">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-[var(--app-fg)]">
            {letter}
            {streaming && (
              <span className="inline-block w-1.5 h-4 ml-0.5 align-middle bg-[var(--accent)] animate-pulse" />
            )}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CoverLetterScreen() {
  const { isPaid, openUpgradeModal } = usePlan();
  const [source, setSource] = useState<ResumeSource>("saved");
  const [resumes, setResumes] = useState<ResumeOption[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [resumeText, setResumeText] = useState("");

  const [jobDescription, setJobDescription] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [tone, setTone] = useState<Tone>("professional");

  const [letter, setLetter] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  // Load saved resumes once.
  useEffect(() => {
    setLoadingResumes(true);
    resumeService
      .list({ limit: 50 })
      .then((data: any) => {
        const items = Array.isArray(data) ? data : data?.items ?? [];
        const opts: ResumeOption[] = items.map((r: any) => ({
          id: Number(r?.id),
          title: r?.title ?? "Untitled Resume",
          updatedAt: r?.updated_at,
        }));
        setResumes(opts);
        if (opts.length === 1) setSelectedId(opts[0].id);
        if (opts.length === 0) setSource("paste");
      })
      .catch(() => {
        setResumes([]);
        setSource("paste");
      })
      .finally(() => setLoadingResumes(false));
  }, []);

  // Cancel an in-flight stream when the page unmounts.
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const canGenerate = useMemo(() => {
    if (streaming) return false;
    if (!jobDescription.trim()) return false;
    if (source === "saved") return selectedId !== null;
    return resumeText.trim().length > 0;
  }, [streaming, jobDescription, source, selectedId, resumeText]);

  const handleGenerate = async () => {
    if (!canGenerate) return;
    if (!isPaid) {
      openUpgradeModal("AI cover letters are a paid feature. Upgrade to generate a tailored letter for every application.");
      return;
    }
    setError(null);
    setLetter("");
    setCopied(false);
    setStreaming(true);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      await coverLetterService.generate(
        {
          resume_id: source === "saved" ? selectedId ?? undefined : undefined,
          resume_text: source === "paste" ? resumeText : undefined,
          job_description: jobDescription,
          tone,
          company: company.trim() || undefined,
          role: role.trim() || undefined,
        },
        {
          signal: ctrl.signal,
          onToken: (chunk) => setLetter((prev) => prev + chunk),
          onDone: () => setStreaming(false),
          onError: (err) => {
            // AbortError is expected when the user clicks Stop — don't surface it.
            if (err.name !== "AbortError") setError(err.message);
            setStreaming(false);
          },
        }
      );
    } catch {
      // Errors are already routed through onError above.
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
    setStreaming(false);
  };

  const handleCopy = async () => {
    if (!letter) return;
    try {
      await navigator.clipboard.writeText(letter);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard denied */
    }
  };

  const handleDownload = (fmt: DownloadFormat) => {
    if (!letter) return;
    if (!isPaid) {
      openUpgradeModal("Cover-letter downloads are a paid feature. Upgrade to export your letter.");
      return;
    }
    const stamp = new Date().toISOString().slice(0, 10);
    const baseName = `cover-letter-${stamp}`;

    if (fmt === "txt") {
      saveBlob(new Blob([letter], { type: "text/plain;charset=utf-8" }), `${baseName}.txt`);
      return;
    }

    if (fmt === "docx") {
      // MS Word opens HTML files transparently when given .doc and the
      // application/msword MIME — no extra deps needed.
      const html = buildLetterHtml(letter, { wordCompat: true });
      saveBlob(
        new Blob(["﻿", html], { type: "application/msword" }),
        `${baseName}.doc`
      );
      return;
    }

    // PDF — render the HTML into a hidden node, hand it to html2pdf.
    const html = buildLetterHtml(letter, { wordCompat: false });
    const wrapper = document.createElement("div");
    wrapper.innerHTML = html;
    const body = wrapper.querySelector("body");
    const node = document.createElement("div");
    node.innerHTML = body ? body.innerHTML : html;
    Object.assign(node.style, {
      fontFamily: "Georgia, serif",
      color: "#1a1a1a",
      lineHeight: "1.6",
      fontSize: "11pt",
      maxWidth: "720px",
      margin: "0 auto",
      padding: "40px 50px",
    } satisfies Partial<CSSStyleDeclaration>);

    html2pdf()
      .set({
        margin: [10, 10, 10, 10],
        filename: `${baseName}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(node)
      .save();
  };

  return (
    <div className="min-h-svh bg-[var(--app-bg)] text-[var(--app-fg)]">
      <SiteNavbar />
      <PageWithSidebar activeRoute="cover-letter">
        <main className="px-2 pb-16">
          <div className="mx-auto max-w-6xl">
            {/* Header */}
            <div>
              <div className="text-xs font-medium tracking-[0.16em] uppercase text-[var(--accent-text)]">
                AI Writer
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-light tracking-tight text-[var(--app-fg)] mt-1.5">
                Cover <span className="italic">letter</span>
              </h1>
              <p className="text-[var(--app-fg-muted)] mt-2 text-sm max-w-xl">
                Pick a resume, paste the job description, choose a tone, and generate a tailored draft for the role.
              </p>
            </div>

            {/* Two-column layout */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Inputs */}
              <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 space-y-6 shadow-[var(--shadow-soft)]">
                <ResumePicker
                  source={source}
                  setSource={setSource}
                  resumes={resumes}
                  loadingResumes={loadingResumes}
                  selectedId={selectedId}
                  setSelectedId={setSelectedId}
                  resumeText={resumeText}
                  setResumeText={setResumeText}
                />

                {/* Job description */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-[var(--app-fg)]">
                      Job description
                    </div>
                    <div className="text-xs text-[var(--app-fg-soft)]">
                      {jobDescription.length} chars
                    </div>
                  </div>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the full job description — responsibilities, qualifications, all of it."
                    rows={6}
                    className="w-full rounded-lg border border-[var(--app-border-strong)] bg-[var(--btn-secondary-bg)] px-3 py-2.5 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg-soft)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/15 resize-y"
                  />
                </div>

                {/* Optional details */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-[var(--app-fg-muted)]">
                      Company (optional)
                    </label>
                    <input
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Acme Corp"
                      className="w-full rounded-lg border border-[var(--app-border-strong)] bg-[var(--btn-secondary-bg)] px-3 py-2 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg-soft)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/15"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-[var(--app-fg-muted)]">
                      Role (optional)
                    </label>
                    <input
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="Senior Backend Engineer"
                      className="w-full rounded-lg border border-[var(--app-border-strong)] bg-[var(--btn-secondary-bg)] px-3 py-2 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg-soft)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/15"
                    />
                  </div>
                </div>

                <ToneSelect tone={tone} setTone={setTone} />

                <div className="pt-1">
                  <AppButton
                    variant="primary"
                    size="lg"
                    onClick={handleGenerate}
                    disabled={!canGenerate}
                    className="w-full"
                  >
                    <Sparkles className="size-4" />
                    {streaming ? "Generating…" : "Generate cover letter"}
                  </AppButton>
                </div>
              </div>

              {/* Output */}
              <OutputPanel
                letter={letter}
                streaming={streaming}
                error={error}
                onCopy={handleCopy}
                onDownload={handleDownload}
                onStop={handleStop}
                copied={copied}
              />
            </div>
          </div>
        </main>
      </PageWithSidebar>
    </div>
  );
}
