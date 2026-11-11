import { useId, useState } from "react";
import { FileText, LoaderCircle } from "lucide-react";
import { resumeService, type ResumeListItem } from "@/services/resume";
import { readSavedJobDescription } from "@/lib/saved-job-description";

/** Loads a saved résumé's target job description only after the user chooses to use it. */
export function SavedJobDescription({
  onChoose,
  hasText,
  maxLength,
}: {
  onChoose: (description: string) => void;
  hasText: boolean;
  maxLength?: number;
}) {
  const selectId = useId();
  const [open, setOpen] = useState(false);
  const [resumes, setResumes] = useState<ResumeListItem[] | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");

  const toggle = () => {
    setOpen(!open);
    if (open || resumes !== null || loading) return;
    setLoading(true);
    setError("");
    resumeService.list({ limit: 50 })
      .then((result) => setResumes(result.items))
      .catch(() => setError("Couldn't load your saved résumés. Try again."))
      .finally(() => setLoading(false));
  };

  const choose = async () => {
    if (!selectedId || importing) return;
    setImporting(true);
    setError("");
    try {
      const resume = await resumeService.get(Number(selectedId));
      const { description, error: descriptionError } = readSavedJobDescription(resume, maxLength);
      if (descriptionError) {
        setError(descriptionError);
        return;
      }
      onChoose(description);
      setOpen(false);
    } catch {
      setError("Couldn't load that job description. Try again or paste it instead.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="text-sm">
      <button type="button" onClick={toggle} aria-expanded={open} aria-controls={selectId}
        className="inline-flex items-center gap-2 font-medium text-[var(--accent-text)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]">
        <FileText className="size-4" />Use a saved job description
      </button>
      {open && (
        <div id={selectId} className="mt-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-2)] p-4">
          <label htmlFor={`${selectId}-resume`} className="block font-medium text-[var(--app-fg)]">Choose a saved résumé</label>
          <p className="mt-1 text-xs text-[var(--app-fg-muted)]">Its target job description will be copied into this field. You can edit it afterward.</p>
          {loading ? <p className="mt-3 flex items-center gap-2 text-[var(--app-fg-muted)]"><LoaderCircle className="size-4 animate-spin" />Loading résumés…</p> : resumes?.length === 0 ? (
            <p className="mt-3 text-[var(--app-fg-muted)]">No saved résumés yet.</p>
          ) : resumes && (
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <select id={`${selectId}-resume`} value={selectedId} onChange={(event) => { setSelectedId(event.target.value); setError(""); }} disabled={importing}
                className="min-h-11 min-w-0 flex-1 rounded-lg border border-[var(--app-border-strong)] bg-[var(--app-surface)] px-3 text-[var(--app-fg)]">
                <option value="">Select a résumé</option>
                {resumes.map((resume) => <option key={resume.id} value={resume.id}>{resume.title || "Untitled résumé"}</option>)}
              </select>
              <button type="button" onClick={choose} disabled={!selectedId || importing}
                className="min-h-11 rounded-lg bg-[var(--accent)] px-4 font-medium text-white hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-50">
                {importing ? "Loading…" : hasText ? "Replace current text" : "Use description"}
              </button>
            </div>
          )}
          {error && <p role="alert" className="mt-2 text-xs text-red-600">{error}</p>}
        </div>
      )}
    </div>
  );
}
