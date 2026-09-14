import api from "@/lib/api";

/**
 * Shared "paste or add a link" job-description backend contract
 * (`resumeai-backend/app/routers/job_description.py`). Login-gated only, not
 * paid-gated — this makes no LLM call, and two of its callers (ATS checker,
 * résumé builder) are free-tier.
 */
export interface JobDescriptionFromUrlDto {
  job_description: string;
  source_url: string;
  truncated: boolean;
}

export const jobDescriptionService = {
  fetchFromUrl: (url: string) => api.post<JobDescriptionFromUrlDto>("/job-description/from-url", { url }),
};
