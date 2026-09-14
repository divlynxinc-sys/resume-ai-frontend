import { useState } from "react";
import { jobDescriptionService } from "@/services";

export type JobDescriptionMode = "paste" | "link";

function errorMessage(e: unknown, fallback: string) {
  return e instanceof Error && e.message ? e.message : fallback;
}

function hostnameOf(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ""); }
  catch { return "that link"; }
}

/**
 * Shared "paste or add a link" behavior for every job-description field in the
 * app (cover letter, recruiter outreach, interview answers, ATS checker, the
 * résumé builder, AI Interviews). Pair with `JobDescriptionModeToggle` and
 * `JobDescriptionLinkPanel`. `onImported` should set the page's own job
 * description state — importing never bypasses that state, so existing
 * validation/character limits keep applying unchanged.
 */
export function useJobDescriptionImport(onImported: (text: string) => void) {
  const [mode, setMode] = useState<JobDescriptionMode>("paste");
  const [url, setUrl] = useState("");
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");
  const [importedFrom, setImportedFrom] = useState("");

  const fetchFromLink = async () => {
    const trimmed = url.trim();
    if (!trimmed || fetching) return;
    setFetching(true);
    setError("");
    try {
      const dto = await jobDescriptionService.fetchFromUrl(trimmed);
      onImported(dto.job_description);
      const host = hostnameOf(dto.source_url);
      setImportedFrom(dto.truncated ? `${host} (trimmed to 8,000 characters)` : host);
      setUrl("");
      setMode("paste");
    } catch (e) {
      setError(errorMessage(e, "Unable to import that link. Try pasting the description instead."));
    } finally {
      setFetching(false);
    }
  };

  const clearImportedNote = () => setImportedFrom("");

  return { mode, setMode, url, setUrl, fetching, error, importedFrom, fetchFromLink, clearImportedNote };
}
