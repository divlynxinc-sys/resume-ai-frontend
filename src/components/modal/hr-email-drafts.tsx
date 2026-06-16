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
  Mail,
  Link as LinkIcon,
  Calendar,
  Clock,
  User,
} from "lucide-react";
import html2pdf from "html2pdf.js";
import SiteNavbar from "../layout/site-navbar";
import PageWithSidebar from "../layout/page-with-sidebar";
import { AppButton } from "@/components/ui/AppButton";
import { hrEmailDraftsService, resumeService } from "@/services";
import GeneratingLoader from "./generating-loader";

type Tone = "professional" | "enthusiastic" | "concise" | "warm";
type ResumeSource = "saved" | "paste";
type EmailType =
  | "application"
  | "follow_up"
  | "thank_you"
  | "scheduling"
  | "referral_request"
  | "offer_clarification"
  | "negotiation";

interface ResumeOption {
  id: number;
  title: string;
  updatedAt?: string;
}

const TONES: { value: Tone; label: string; desc: string }[] = [
  { value: "professional", label: "Professional", desc: "Polished and confident" },
  { value: "enthusiastic", label: "Enthusiastic", desc: "Warm and energetic" },
  { value: "concise", label: "Concise", desc: "Tight and direct" },
  { value: "warm", label: "Warm", desc: "Conversational and sincere" },
];

const EMAIL_TYPES: {
  value: EmailType;
  label: string;
  desc: string;
}[] = [
  { value: "application", label: "Application", desc: "Submit your resume with a strong intro" },
  { value: "follow_up", label: "Follow-up", desc: "Check in after applying" },
  { value: "thank_you", label: "Thank you", desc: "After recruiter call or interview" },
  { value: "scheduling", label: "Scheduling", desc: "Coordinate times and timezone" },
  { value: "referral_request", label: "Referral", desc: "Ask for an internal intro" },
  { value: "offer_clarification", label: "Offer details", desc: "Clarify scope, start date, components" },
  { value: "negotiation", label: "Negotiation", desc: "Collaborative compensation negotiation" },
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
        <FileText className="size-4 text-[var(--accent-text)]" />
        Resume
      </div>

      <div className="inline-flex items-center rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] p-1 text-xs">
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
            onChange={(e) => setSelectedId(e.target.value ? Number(e.target.value) : null)}
            disabled={loadingResumes}
            className="w-full appearance-none rounded-lg border border-[var(--app-border-strong)] bg-[var(--app-surface)] px-3 py-2.5 pr-10 text-sm text-[var(--app-fg)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)] disabled:opacity-60"
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
          className="w-full rounded-lg border border-[var(--app-border-strong)] bg-[var(--app-surface)] px-3 py-2.5 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg-soft)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)] resize-y"
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
                  ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                  : "border-[var(--app-border)] bg-[var(--app-surface)] hover:border-[var(--app-border-strong)]")
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

function EmailTypeSelect({
  value,
  onChange,
}: {
  value: EmailType;
  onChange: (v: EmailType) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-[var(--app-fg)]">Email type</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {EMAIL_TYPES.map((t) => {
          const active = value === t.value;
          return (
            <button
              key={t.value}
              onClick={() => onChange(t.value)}
              className={
                "rounded-lg border px-3 py-2.5 text-left transition-all " +
                (active
                  ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                  : "border-[var(--app-border)] bg-[var(--app-surface)] hover:border-[var(--app-border-strong)]")
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

function buildTextHtml(title: string, content: string, opts: { wordCompat: boolean }): string {
  const paragraphs = content
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  const renderParagraph = (p: string) => {
    const inner = opts.wordCompat ? escapeHtml(p).replace(/\n/g, "<br />") : escapeHtml(p);
    return `<p style="margin:0 0 12pt 0;${opts.wordCompat ? "" : "white-space:pre-wrap;"}">${inner}</p>`;
  };

  const wordNs = opts.wordCompat
    ? ' xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"'
    : "";

  return `<!DOCTYPE html><html${wordNs}><head><meta charset="utf-8"><title>${escapeHtml(title)}</title></head>
<body style="font-family:Georgia,serif;color:#1a1a1a;line-height:1.6;font-size:11pt;max-width:760px;margin:0 auto;padding:40px 50px;">
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
      if (!ref.current) return;
      const target = e.target as Node;
      if (!ref.current.contains(target)) setOpen(false);
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}
        className={
          "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors " +
          (disabled
            ? "opacity-60 cursor-not-allowed border-[var(--app-border)] text-[var(--app-fg-muted)]"
            : "border-[var(--app-border)] text-[var(--app-fg)] hover:bg-[var(--app-surface-2)]")
        }
      >
        <Download className="size-4" />
        Download
        <ChevronDown className="size-3" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-36 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-[var(--shadow-pop)] overflow-hidden z-20">
          {[
            { id: "pdf", label: "PDF" },
            { id: "docx", label: "Word" },
            { id: "txt", label: "Text" },
          ].map((it) => (
            <button
              key={it.id}
              onClick={() => {
                setOpen(false);
                onPick(it.id as DownloadFormat);
              }}
              className="w-full text-left px-3 py-2 text-xs text-[var(--app-fg)] hover:bg-[var(--app-surface-2)] transition-colors"
            >
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

type Draft = { index: number; subject: string; body: string; raw: string };

function parseDrafts(text: string): Draft[] {
  const matches = Array.from(text.matchAll(/^===\s*DRAFT\s+(\d+)\s*===\s*$/gm));
  if (!matches.length) return [];
  const drafts: Draft[] = [];
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    const start = (m.index ?? 0) + m[0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index ?? text.length : text.length;
    const segment = text.slice(start, end).trim();
    if (!segment) continue;
    const idx = Number(m[1] ?? i + 1) || i + 1;
    const subjMatch = segment.match(/^Subject:\s*(.+)$/im);
    const bodyMatch = segment.match(/^Body:\s*([\s\S]*)$/im);
    const subject = (subjMatch?.[1] ?? "").trim();
    const body = (bodyMatch?.[1] ?? segment).trim();
    drafts.push({ index: idx, subject, body, raw: segment });
  }
  return drafts;
}

function mailtoHref(subject: string, body: string): string {
  const s = encodeURIComponent(subject || "");
  const b = encodeURIComponent(body || "");
  return `mailto:?subject=${s}&body=${b}`;
}

export default function HREmailDraftsScreen() {
  const [source, setSource] = useState<ResumeSource>("saved");
  const [resumes, setResumes] = useState<ResumeOption[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [resumeText, setResumeText] = useState("");

  const [jobDescription, setJobDescription] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [tone, setTone] = useState<Tone>("professional");
  const [emailType, setEmailType] = useState<EmailType>("application");
  const [draftCount, setDraftCount] = useState(3);

  const [recipientName, setRecipientName] = useState("");
  const [jobLink, setJobLink] = useState("");
  const [dateApplied, setDateApplied] = useState("");
  const [availability, setAvailability] = useState("");
  const [extraContext, setExtraContext] = useState("");

  const [output, setOutput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

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

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const hasContext = useMemo(() => {
    return Boolean(
      jobDescription.trim() ||
        company.trim() ||
        role.trim() ||
        jobLink.trim() ||
        extraContext.trim()
    );
  }, [jobDescription, company, role, jobLink, extraContext]);

  const canGenerate = useMemo(() => {
    if (streaming) return false;
    if (!hasContext) return false;
    if (source === "saved") return selectedId !== null;
    return resumeText.trim().length > 0;
  }, [streaming, hasContext, source, selectedId, resumeText]);

  const parsedDrafts = useMemo(() => {
    if (streaming) return [];
    return parseDrafts(output);
  }, [output, streaming]);

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setError(null);
    setOutput("");
    setCopied(false);
    setStreaming(true);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      await hrEmailDraftsService.generate(
        {
          resume_id: source === "saved" ? selectedId ?? undefined : undefined,
          resume_text: source === "paste" ? resumeText : undefined,
          job_description: jobDescription.trim() || undefined,
          tone,
          company: company.trim() || undefined,
          role: role.trim() || undefined,
          email_type: emailType,
          recipient_name: recipientName.trim() || undefined,
          job_link: jobLink.trim() || undefined,
          date_applied: dateApplied.trim() || undefined,
          availability: availability.trim() || undefined,
          extra_context: extraContext.trim() || undefined,
          drafts: draftCount,
        },
        {
          signal: ctrl.signal,
          onToken: (chunk) => setOutput((prev) => prev + chunk),
          onDone: () => setStreaming(false),
          onError: (err) => {
            if (err.name !== "AbortError") setError(err.message);
            setStreaming(false);
          },
        }
      );
    } catch {
      /* handled via onError */
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
    setStreaming(false);
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard denied */
    }
  };

  const handleDownload = (fmt: DownloadFormat) => {
    if (!output) return;
    const stamp = new Date().toISOString().slice(0, 10);
    const baseName = `hr-email-drafts-${stamp}`;

    if (fmt === "txt") {
      saveBlob(new Blob([output], { type: "text/plain;charset=utf-8" }), `${baseName}.txt`);
      return;
    }

    if (fmt === "docx") {
      const html = buildTextHtml("HR Email Drafts", output, { wordCompat: true });
      saveBlob(new Blob(["﻿", html], { type: "application/msword" }), `${baseName}.doc`);
      return;
    }

    const html = buildTextHtml("HR Email Drafts", output, { wordCompat: false });
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
      maxWidth: "760px",
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
      <PageWithSidebar activeRoute="hr-email-drafts">
        <main className="px-2">
          <div className="mx-auto max-w-6xl">
            <div>
              <div className="text-xs font-medium tracking-[0.16em] uppercase text-[var(--accent-text)]">
                AI Writer
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-light tracking-tight text-[var(--app-fg)] mt-1.5">
                HR <span className="italic">email drafts</span>
              </h1>
              <p className="text-[var(--app-fg-muted)] mt-2 text-sm max-w-xl">
                Generate recruiter-ready emails for applications, follow-ups, thank-yous, scheduling, and more.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 space-y-6">
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

                <EmailTypeSelect value={emailType} onChange={setEmailType} />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-[var(--app-fg-muted)]">
                      Company (optional)
                    </label>
                    <input
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Acme Inc."
                      className="w-full rounded-lg border border-[var(--app-border-strong)] bg-[var(--app-surface)] px-3 py-2.5 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg-soft)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-[var(--app-fg-muted)]">
                      Role (optional)
                    </label>
                    <input
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="e.g. Software Engineer"
                      className="w-full rounded-lg border border-[var(--app-border-strong)] bg-[var(--app-surface)] px-3 py-2.5 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg-soft)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)]"
                    />
                  </div>
                </div>

                <ToneSelect tone={tone} setTone={setTone} />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-[var(--app-fg)]">
                      Job description (optional)
                    </div>
                    <div className="text-xs text-[var(--app-fg-soft)]">{jobDescription.length} chars</div>
                  </div>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description to tailor keywords and the fit statement."
                    rows={5}
                    className="w-full rounded-lg border border-[var(--app-border-strong)] bg-[var(--app-surface)] px-3 py-2.5 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg-soft)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)] resize-y"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-[var(--app-fg-muted)] flex items-center gap-2">
                      <User className="size-3.5 text-[var(--app-fg-soft)]" />
                      Recipient name (optional)
                    </label>
                    <input
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="e.g. Sarah"
                      className="w-full rounded-lg border border-[var(--app-border-strong)] bg-[var(--app-surface)] px-3 py-2.5 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg-soft)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-[var(--app-fg-muted)] flex items-center gap-2">
                      <LinkIcon className="size-3.5 text-[var(--app-fg-soft)]" />
                      Job link (optional)
                    </label>
                    <input
                      value={jobLink}
                      onChange={(e) => setJobLink(e.target.value)}
                      placeholder="https://…"
                      className="w-full rounded-lg border border-[var(--app-border-strong)] bg-[var(--app-surface)] px-3 py-2.5 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg-soft)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-[var(--app-fg-muted)] flex items-center gap-2">
                      <Calendar className="size-3.5 text-[var(--app-fg-soft)]" />
                      Date applied (optional)
                    </label>
                    <input
                      value={dateApplied}
                      onChange={(e) => setDateApplied(e.target.value)}
                      placeholder="e.g. May 10, 2026"
                      className="w-full rounded-lg border border-[var(--app-border-strong)] bg-[var(--app-surface)] px-3 py-2.5 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg-soft)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-[var(--app-fg-muted)] flex items-center gap-2">
                      <Clock className="size-3.5 text-[var(--app-fg-soft)]" />
                      Availability (optional)
                    </label>
                    <input
                      value={availability}
                      onChange={(e) => setAvailability(e.target.value)}
                      placeholder="e.g. Mon–Thu 2–6pm PKT"
                      className="w-full rounded-lg border border-[var(--app-border-strong)] bg-[var(--app-surface)] px-3 py-2.5 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg-soft)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-[var(--app-fg-muted)]">
                    Extra context (optional)
                  </label>
                  <textarea
                    value={extraContext}
                    onChange={(e) => setExtraContext(e.target.value)}
                    placeholder="Add any specifics: referral name, interview stage, offer notes, key requirements to emphasize…"
                    rows={3}
                    className="w-full rounded-lg border border-[var(--app-border-strong)] bg-[var(--app-surface)] px-3 py-2.5 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg-soft)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)] resize-y"
                  />
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-[var(--app-fg)]">Number of drafts</div>
                  <div className="inline-flex items-center rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] p-1 text-xs">
                    {[2, 3, 4].map((n) => (
                      <button
                        key={n}
                        onClick={() => setDraftCount(n)}
                        className={
                          "px-3 py-1.5 rounded-md transition-colors " +
                          (draftCount === n
                            ? "bg-[var(--accent-soft)] text-[var(--accent-text)] font-medium"
                            : "text-[var(--app-fg-muted)] hover:text-[var(--app-fg)]")
                        }
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  {!hasContext && (
                    <div className="text-xs text-[var(--app-fg-soft)]">
                      Add at least a company, role, job link, job description, or extra context to generate a good draft.
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <AppButton
                    variant="primary"
                    size="lg"
                    disabled={!canGenerate}
                    onClick={handleGenerate}
                    className="flex-1"
                  >
                    {streaming ? (
                      <>
                        <Square className="size-4" />
                        Generating…
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-4" />
                        Generate drafts
                      </>
                    )}
                  </AppButton>

                  {streaming && (
                    <button
                      onClick={handleStop}
                      className="inline-flex items-center gap-2 rounded-lg border border-[var(--app-border)] px-3 py-2.5 text-sm text-[var(--app-fg)] hover:bg-[var(--app-surface-2)] transition-colors"
                    >
                      <Square className="size-4" />
                      Stop
                    </button>
                  )}
                </div>

                {error && (
                  <div className="rounded-xl border border-[var(--pastel-rose)]/50 bg-[var(--pastel-rose)]/20 p-3 text-sm text-[var(--app-fg)] flex items-start gap-2">
                    <AlertCircle className="size-4 mt-0.5 text-[#B85273]" />
                    <div>
                      <div className="font-medium">Couldn’t generate drafts</div>
                      <div className="text-xs text-[var(--app-fg-muted)] mt-0.5">{error}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 flex flex-col min-h-[520px]">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium text-[var(--app-fg)] flex items-center gap-2">
                    <Mail className="size-4 text-[var(--accent-text)]" />
                    Output
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      disabled={!output}
                      className={
                        "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors " +
                        (!output
                          ? "opacity-60 cursor-not-allowed border-[var(--app-border)] text-[var(--app-fg-muted)]"
                          : "border-[var(--app-border)] text-[var(--app-fg)] hover:bg-[var(--app-surface-2)]")
                      }
                    >
                      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                    <DownloadMenu disabled={!output} onPick={handleDownload} />
                  </div>
                </div>

                <div className="mt-4 flex-1 overflow-auto rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-2)]">
                  {!output && !streaming ? (
                    <div className="h-full flex flex-col items-center justify-center text-center px-6 py-10">
                      <div className="size-12 grid place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-text)] mb-4">
                        <Sparkles className="size-5" />
                      </div>
                      <div className="text-sm font-medium text-[var(--app-fg)]">Your drafts will appear here</div>
                      <div className="text-xs text-[var(--app-fg-muted)] mt-1.5 max-w-xs">
                        Pick a resume, choose an email type, add a bit of context, and click Generate.
                      </div>
                    </div>
                  ) : streaming && !output ? (
                    <GeneratingLoader label="Drafting your emails…" className="p-4" />
                  ) : parsedDrafts.length > 0 && !streaming ? (
                    <div className="p-4 space-y-3">
                      {parsedDrafts.map((d) => (
                        <div
                          key={d.index}
                          className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-xs font-medium tracking-[0.12em] uppercase text-[var(--app-fg-soft)]">
                                Draft {d.index}
                              </div>
                              <div className="mt-1 text-sm font-medium text-[var(--app-fg)]">
                                {d.subject ? d.subject : "Subject not provided"}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <a
                                href={mailtoHref(d.subject, d.body)}
                                className="inline-flex items-center gap-2 rounded-lg border border-[var(--app-border)] px-3 py-2 text-xs font-medium text-[var(--app-fg)] hover:bg-[var(--app-surface-2)] transition-colors"
                              >
                                <Mail className="size-4" />
                                Open
                              </a>
                              <button
                                onClick={async () => {
                                  try {
                                    await navigator.clipboard.writeText(
                                      `Subject: ${d.subject}\n\n${d.body}`
                                    );
                                  } catch {
                                    /* clipboard denied */
                                  }
                                }}
                                className="inline-flex items-center gap-2 rounded-lg border border-[var(--app-border)] px-3 py-2 text-xs font-medium text-[var(--app-fg)] hover:bg-[var(--app-surface-2)] transition-colors"
                              >
                                <Copy className="size-4" />
                                Copy
                              </button>
                            </div>
                          </div>
                          <div className="mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed text-[var(--app-fg)]">
                            {`Subject: ${d.subject || ""}\n\n${d.body}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <pre className="p-4 whitespace-pre-wrap font-sans text-sm leading-relaxed text-[var(--app-fg)]">
                      {output}
                      {streaming && (
                        <span className="inline-block w-1.5 h-4 ml-0.5 align-middle bg-[var(--accent)] animate-pulse" />
                      )}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </PageWithSidebar>
    </div>
  );
}
