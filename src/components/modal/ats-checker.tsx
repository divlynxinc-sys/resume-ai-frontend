import { useCallback, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Check,
  Copy,
  Download,
  FileText,
  Loader2,
  Share2,
  ShieldCheck,
  UploadCloud,
  X,
} from "lucide-react";
import SiteNavbar from "../layout/site-navbar";
import SiteFooter from "../layout/site-footer";
import { analyzeResume, type AtsCheck, type AtsReport, type CheckStatus } from "@/lib/ats-check";
import { ACCEPTED_TYPES, ExtractError, extractResumeText } from "@/lib/resume-extract";
import { downloadScoreCard, shareText } from "@/lib/share-card";
import { faqPageSchema, organizationSchema, SITE_URL } from "@/content/blog/schema";
import { ATS_CHECKER_FAQ as FAQ } from "@/content/site-faq";
import { useSeo } from "@/lib/seo";

/**
 * The free, ungated ATS checker.
 *
 * Three rules, and they are the product:
 *   1. NO SIGNUP. Not for the check, not for the result. Rezi walls the result
 *      behind an account; that's the gap this walks through.
 *   2. NO BACKEND. It runs on a paste, in the browser. Nothing is uploaded, which
 *      is both a genuine privacy claim we can make truthfully and the reason this
 *      costs nothing to serve at any traffic volume.
 *   3. NO OVERCLAIMING. We tell people plainly that no ATS emits a score. See the
 *      disclaimer below — it is deliberate, and it is a differentiator.
 */

const STATUS_STYLE: Record<CheckStatus, { icon: typeof Check; tint: string; text: string; label: string }> = {
  pass: { icon: Check, tint: "var(--pastel-mint)", text: "text-[#3F8E5C]", label: "Pass" },
  warn: { icon: AlertTriangle, tint: "var(--pastel-butter)", text: "text-[#A07820]", label: "Could be better" },
  fail: { icon: X, tint: "var(--pastel-rose)", text: "text-[#B85273]", label: "Needs fixing" },
};

function ScoreRing({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);
  const tone = score >= 75 ? "#3F8E5C" : score >= 50 ? "#A07820" : "#B85273";

  return (
    <div className="relative grid size-32 shrink-0 place-items-center">
      <svg viewBox="0 0 128 128" className="size-32 -rotate-90">
        <circle cx="64" cy="64" r={radius} fill="none" stroke="var(--app-border)" strokeWidth="9" />
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke={tone}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 900ms cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="font-display text-3xl font-light text-[var(--app-fg)]">{score}</div>
        <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--app-fg-soft)]">out of 100</div>
      </div>
    </div>
  );
}

function CheckRow({ check }: { check: AtsCheck }) {
  const style = STATUS_STYLE[check.status];
  const Icon = style.icon;

  return (
    <li className="flex gap-4 border-b border-[var(--app-border)] py-4 last:border-0">
      <span
        className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-full ${style.text}`}
        style={{ backgroundColor: style.tint }}
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-3">
          <h3 className="text-sm font-medium text-[var(--app-fg)]">{check.label}</h3>
          <span className={`text-[11px] font-medium ${style.text}`}>{style.label}</span>
        </div>
        <p className="mt-1 text-sm leading-7 text-[var(--app-fg-muted)]">{check.detail}</p>
        {check.fix && (
          <p className="mt-1.5 text-sm leading-7 text-[var(--app-fg-soft)]">
            <span className="font-medium text-[var(--app-fg-muted)]">Fix: </span>
            {check.fix}
          </p>
        )}
      </div>
    </li>
  );
}

/**
 * The share row. This is the growth loop: someone checks their resume, gets a
 * number they're pleased (or annoyed) with, and posts it — carrying the URL to the
 * next person. The card is deliberately a *challenge* ("think yours scores higher?
 * prove it"), because that's what makes a score worth posting.
 *
 * Web Share is used where it exists (every mobile browser), because a native share
 * sheet posts straight to WhatsApp/LinkedIn — which is where this actually spreads.
 * Desktop falls back to copy-to-clipboard.
 */
function ShareRow({ report }: { report: AtsReport }) {
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  const handleDownload = async () => {
    setBusy(true);
    setFailed(false);
    try {
      await downloadScoreCard(report);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  const handleShare = async () => {
    const text = shareText(report);
    const url = `${SITE_URL}/ats-checker`;

    if (navigator.share) {
      try {
        await navigator.share({ title: "My ATS resume score", text, url });
        return;
      } catch {
        // User dismissed the sheet, or the browser refused. Fall through to copy.
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setFailed(true);
    }
  };

  return (
    <div className="mt-7 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-2)] p-5">
      <h3 className="text-sm font-medium text-[var(--app-fg)]">Share your score</h3>
      <p className="mt-1.5 text-xs leading-6 text-[var(--app-fg-soft)]">
        Downloads a one-page card with your score and what we found. It contains no
        personal details and none of your resume text — and if you added a job description,
        those keywords are left off it too.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleDownload}
          disabled={busy}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--btn-primary-bg)] px-5 text-sm font-medium text-[var(--btn-primary-text)] transition-colors hover:bg-[var(--btn-primary-hover)] disabled:cursor-wait disabled:opacity-60"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
          {busy ? "Building your card…" : "Download score card"}
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-[var(--btn-secondary-border)] bg-[var(--btn-secondary-bg)] px-5 text-sm font-medium text-[var(--btn-secondary-text)] transition-colors hover:bg-[var(--btn-secondary-hover)]"
        >
          {copied ? <Check className="size-4 text-[#3F8E5C]" /> : <Share2 className="size-4" />}
          {copied ? "Copied" : "Share link"}
        </button>

        {copied && (
          <span className="inline-flex items-center gap-1.5 text-xs text-[var(--app-fg-soft)]">
            <Copy className="size-3.5" />
            Message copied to your clipboard
          </span>
        )}
      </div>

      {failed && (
        <p className="mt-3 text-xs leading-6 text-[#B85273]">
          Couldn't build the card in this browser. Your result is still on screen — try
          taking a screenshot instead.
        </p>
      )}
    </div>
  );
}

export default function AtsCheckerScreen() {
  const [resume, setResume] = useState("");
  const [jd, setJd] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [fileName, setFileName] = useState<string | null>(null);
  const [reading, setReading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<{ message: string; hint?: string } | null>(null);
  const [showPaste, setShowPaste] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setResume("");
    setJd("");
    setFileName(null);
    setError(null);
    setSubmitted(false);
    setShowPaste(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleFile = useCallback(async (file: File) => {
    setReading(true);
    setError(null);
    setSubmitted(false);
    setFileName(file.name);

    try {
      const { text } = await extractResumeText(file);
      setResume(text);
      // Analyse immediately. The user already told us what they want by dropping
      // the file — making them click a second button is pure friction.
      setSubmitted(true);
    } catch (caught) {
      const failure =
        caught instanceof ExtractError
          ? { message: caught.message, hint: caught.hint }
          : { message: "We couldn't read that file.", hint: "Try a PDF, DOCX or TXT." };
      setError(failure);
      setResume("");
      setFileName(null);
    } finally {
      setReading(false);
    }
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setDragging(false);
      const file = event.dataTransfer.files?.[0];
      if (file) void handleFile(file);
    },
    [handleFile]
  );

  useSeo({
    title: "Free ATS Resume Checker — No Signup | Jobsynk",
    description:
      "Paste your resume and get an instant parse-readiness score plus a named list of what would break an applicant tracking system. Free, no account, nothing uploaded.",
    path: "/ats-checker",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@graph": [
          organizationSchema(),
          {
            "@type": "SoftwareApplication",
            name: "Jobsynk Free ATS Resume Checker",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            url: `${SITE_URL}/ats-checker`,
            description:
              "Free browser-based resume parse-readiness checker. No account required and no upload — the analysis runs entirely on the client.",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          },
          faqPageSchema(FAQ),
        ],
      },
    ],
  });

  // Recomputed only on submit — analysing every keystroke would make the result
  // flicker while someone is still pasting.
  const report = useMemo(
    () => (submitted ? analyzeResume(resume, jd) : null),
    [submitted, resume, jd]
  );

  const tooShort = submitted && report === null;

  return (
    <div className="min-h-svh bg-[var(--app-bg)] text-[var(--app-fg)]">
      <SiteNavbar marketingMode />

      <main>
        <section className="relative overflow-hidden px-6 pb-10 pt-14 text-center sm:pt-20">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute -left-32 -top-40 size-96 rounded-full bg-[var(--pastel-mint)] opacity-40 blur-3xl" />
            <div className="absolute -right-32 -top-32 size-96 rounded-full bg-[var(--pastel-sky)] opacity-35 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-3.5 py-1.5 text-xs font-medium uppercase tracking-[0.16em] text-[var(--accent-text)]">
              <ShieldCheck className="size-4" />
              Free · no signup
            </div>
            <h1 className="font-display text-4xl font-light tracking-tight text-[var(--app-fg)] sm:text-5xl">
              ATS resume checker
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[var(--app-fg-muted)] sm:text-base">
              Upload your resume and get a parse-readiness score plus a named list of everything
              that would trip up an applicant tracking system — in about two seconds, without
              making an account.
            </p>
            <p className="mx-auto mt-3 max-w-xl text-xs leading-6 text-[var(--app-fg-soft)]">
              Your file is read in your browser and never uploaded to a server.
            </p>
          </div>
        </section>

        {/* The tool */}
        <section className="mx-auto max-w-3xl px-6 pb-16">
          <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-[var(--shadow-soft)] sm:p-7">
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED_TYPES}
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleFile(file);
              }}
            />

            {/* The drop zone. A <button> rather than a div, so keyboard and screen
                reader users get it for free — Enter/Space open the file picker. */}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              disabled={reading}
              className={`flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 ${
                dragging
                  ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                  : "border-[var(--app-border-strong)] bg-[var(--app-bg)] hover:border-[var(--accent)]/60 hover:bg-[var(--accent-soft)]/40"
              } ${reading ? "cursor-wait opacity-70" : "cursor-pointer"}`}
            >
              {reading ? (
                <>
                  <Loader2 className="size-8 animate-spin text-[var(--accent-text)]" />
                  <span className="mt-4 text-sm font-medium text-[var(--app-fg)]">
                    Reading {fileName}…
                  </span>
                </>
              ) : resume && fileName ? (
                <>
                  <span className="grid size-12 place-items-center rounded-full bg-[var(--pastel-mint)] text-[#3F8E5C]">
                    <Check className="size-6" />
                  </span>
                  <span className="mt-4 text-sm font-medium text-[var(--app-fg)]">{fileName}</span>
                  <span className="mt-1 text-xs text-[var(--app-fg-soft)]">
                    Read successfully · click to choose a different file
                  </span>
                </>
              ) : (
                <>
                  <span className="grid size-12 place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent-text)]">
                    <UploadCloud className="size-6" />
                  </span>
                  <span className="mt-4 text-base font-medium text-[var(--app-fg)]">
                    Drop your resume here, or click to upload
                  </span>
                  <span className="mt-1.5 text-xs text-[var(--app-fg-soft)]">
                    PDF, DOCX or TXT · analysed in your browser · never uploaded
                  </span>
                </>
              )}
            </button>

            {error && (
              <div className="mt-4 rounded-xl border border-[var(--app-border)] bg-[var(--pastel-rose)] p-4">
                <p className="flex items-start gap-2.5 text-sm font-medium text-[var(--app-fg)]">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[#B85273]" />
                  {error.message}
                </p>
                {error.hint && (
                  <p className="mt-2 pl-[26px] text-sm leading-7 text-[var(--app-fg-muted)]">
                    {error.hint}
                  </p>
                )}
              </div>
            )}

            {tooShort && (
              <p className="mt-4 rounded-xl border border-[var(--app-border)] bg-[var(--pastel-butter)] p-4 text-sm leading-7 text-[var(--app-fg-muted)]">
                There's too little text there to say anything useful — is that the whole resume?
              </p>
            )}

            {/* Paste stays available, but demoted. Some people genuinely can't
                upload (locked-down work laptop, resume living in Google Docs). */}
            {!showPaste && !resume && (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setShowPaste(true)}
                  className="text-xs font-medium text-[var(--app-fg-soft)] underline underline-offset-4 transition-colors hover:text-[var(--accent-text)]"
                >
                  or paste the text instead
                </button>
              </div>
            )}

            {showPaste && !fileName && (
              <div className="mt-5">
                <label
                  htmlFor="resume-text"
                  className="block text-sm font-medium text-[var(--app-fg)]"
                >
                  Paste your resume
                </label>
                <textarea
                  id="resume-text"
                  value={resume}
                  onChange={(event) => {
                    setResume(event.target.value);
                    setSubmitted(false);
                  }}
                  rows={9}
                  placeholder="Paste the full text of your resume…"
                  className="mt-2 w-full resize-y rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] p-4 font-mono text-[13px] leading-6 text-[var(--app-fg)] outline-none transition-colors placeholder:text-[var(--app-fg-soft)] focus:border-[var(--accent)]/50 focus:ring-2 focus:ring-[var(--accent)]/10"
                />
                <button
                  type="button"
                  onClick={() => setSubmitted(true)}
                  disabled={resume.trim().length === 0}
                  className="mt-3 inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--btn-primary-bg)] px-5 text-sm font-medium text-[var(--btn-primary-text)] transition-colors hover:bg-[var(--btn-primary-hover)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <FileText className="size-4" />
                  Check my resume
                </button>
              </div>
            )}

            {/* The JD is always a paste — you copy it out of a job posting, there is
                no file to upload. */}
            {resume && (
              <div className="mt-6 border-t border-[var(--app-border)] pt-6">
                <label htmlFor="jd-text" className="block text-sm font-medium text-[var(--app-fg)]">
                  Job description{" "}
                  <span className="font-normal text-[var(--app-fg-soft)]">(optional)</span>
                </label>
                <p className="mt-1 text-xs leading-6 text-[var(--app-fg-soft)]">
                  Paste one and we'll also check how well your vocabulary matches the role.
                </p>
                <textarea
                  id="jd-text"
                  value={jd}
                  onChange={(event) => setJd(event.target.value)}
                  rows={4}
                  placeholder="Paste the job description…"
                  className="mt-3 w-full resize-y rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] p-4 font-mono text-[13px] leading-6 text-[var(--app-fg)] outline-none transition-colors placeholder:text-[var(--app-fg-soft)] focus:border-[var(--accent)]/50 focus:ring-2 focus:ring-[var(--accent)]/10"
                />
                <button
                  type="button"
                  onClick={reset}
                  className="mt-4 text-sm font-medium text-[var(--app-fg-soft)] transition-colors hover:text-[var(--app-fg)]"
                >
                  Start over
                </button>
              </div>
            )}
          </div>

          {/* Results */}
          {report && (
            <div className="mt-6 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-[var(--shadow-soft)] sm:p-7">
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
                <ScoreRing score={report.score} />
                <div>
                  <h2 className="font-display text-2xl font-light tracking-tight text-[var(--app-fg)]">
                    {report.score >= 75
                      ? "This will parse cleanly."
                      : report.score >= 50
                      ? "This will parse — but it's leaving points on the table."
                      : "This has problems worth fixing before you send it."}
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-[var(--app-fg-muted)]">
                    {report.checks.filter((check) => check.status === "pass").length} of{" "}
                    {report.checks.length} checks passed · {report.wordCount} words.
                  </p>
                </div>
              </div>

              {/* The honesty note. This is a positioning choice, not boilerplate. */}
              <p className="mt-6 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-2)] p-4 text-xs leading-6 text-[var(--app-fg-soft)]">
                <strong className="font-semibold text-[var(--app-fg-muted)]">
                  What this score is, honestly:
                </strong>{" "}
                no applicant tracking system gives your resume an official score, and no tool can
                show you one — including this one. This is a readability and parse-readiness
                estimate against the failure modes that actually break parsers. Treat it as a
                checklist, not a verdict.
              </p>

              <ul className="mt-6">
                {report.checks.map((check) => (
                  <CheckRow key={check.id} check={check} />
                ))}
              </ul>

              {report.keywords && (
                <div className="mt-6 rounded-xl border border-[var(--app-border)] p-5">
                  <h3 className="text-sm font-medium text-[var(--app-fg)]">
                    Against that job description
                  </h3>
                  {report.keywords.missing.length > 0 ? (
                    <>
                      <p className="mt-2 text-sm leading-7 text-[var(--app-fg-muted)]">
                        Prominent terms in the posting that don't appear in your resume:
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {report.keywords.missing.map((term) => (
                          <span
                            key={term}
                            className="rounded-full bg-[var(--pastel-rose)] px-2.5 py-1 text-[11px] font-medium text-[#B85273]"
                          >
                            {term}
                          </span>
                        ))}
                      </div>
                      <p className="mt-4 text-xs leading-6 text-[var(--app-fg-soft)]">
                        Only add the ones that are genuinely true of you. Every term on your resume
                        is an implicit offer to talk about it for five minutes — and a screening
                        call is a spot-check of that offer.
                      </p>
                    </>
                  ) : (
                    <p className="mt-2 text-sm leading-7 text-[var(--app-fg-muted)]">
                      Your resume already covers the prominent terms in that posting.
                    </p>
                  )}
                </div>
              )}

              <ShareRow report={report} />

              <div className="mt-7 rounded-xl border border-[var(--app-border)] bg-[var(--accent-soft)] p-5 text-center">
                <p className="text-sm leading-7 text-[var(--app-fg-muted)]">
                  Want the fixes applied for you? Build it in Jobsynk — the resume builder and an
                  ATS-friendly template are free.
                </p>
                <Link
                  to="/signup"
                  className="mt-4 inline-flex h-10 items-center rounded-lg bg-[var(--btn-primary-bg)] px-5 text-sm font-medium text-[var(--btn-primary-text)] transition-colors hover:bg-[var(--btn-primary-hover)]"
                >
                  Build my resume free
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* Content layer — this is what makes the page rank */}
        <section className="mx-auto max-w-3xl px-6 pb-20">
          <h2 className="font-display text-2xl font-light tracking-tight text-[var(--app-fg)] sm:text-3xl">
            What an ATS actually does with your resume
          </h2>
          <p className="mt-4 text-[15px] leading-8 text-[var(--app-fg-muted)]">
            When you hit <em>Apply</em>, your file goes through a parser whose job is to turn an
            unstructured document into structured fields — name, email, employer, job title, dates,
            skills — and write them into a database row. A recruiter then searches that database.
            They type something like <code className="rounded-md bg-[var(--app-surface-2)] px-1.5 py-0.5 font-mono text-[0.85em]">senior react engineer</code>{" "}
            into a box and eyeball what comes back.
          </p>
          <p className="mt-4 text-[15px] leading-8 text-[var(--app-fg-muted)]">
            That's the whole game. There's no hidden score and no algorithm judging your worth —
            there's a human running a query, and the only question that matters is whether your
            record came back in the results and looked right when it did. Which means the failure
            mode to worry about isn't rejection. It's <strong className="font-semibold text-[var(--app-fg)]">mis-parsing</strong>:
            your job title landing in the wrong field, or your skills section quietly vanishing.
          </p>
          <p className="mt-4 text-[15px] leading-8 text-[var(--app-fg-muted)]">
            The checks above target exactly those failures. For the full picture, read{" "}
            <Link
              to="/blog/ats-resume-format"
              className="font-medium text-[var(--accent-text)] underline decoration-[var(--accent)]/30 underline-offset-4 hover:decoration-[var(--accent)]"
            >
              what actually gets parsed in 2026
            </Link>
            .
          </p>

          <h2 className="mt-14 font-display text-2xl font-light tracking-tight text-[var(--app-fg)] sm:text-3xl">
            Frequently asked questions
          </h2>
          <div className="mt-6 space-y-3">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] px-5 py-4 transition-colors hover:border-[var(--app-border-strong)]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-[var(--app-fg)]">
                  <span>{item.q}</span>
                  <span
                    aria-hidden="true"
                    className="grid size-7 shrink-0 place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent-text)] transition-transform duration-300 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 border-t border-[var(--app-border)] pt-3 text-sm leading-7 text-[var(--app-fg-muted)]">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
