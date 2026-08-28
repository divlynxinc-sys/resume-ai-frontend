import type { DimensionScores, InterviewSetup, InterviewStatus } from "./types";

export const INTERVIEW_TYPE_LABELS = { general: "General", behavioural: "Behavioural", technical: "Technical", hr_screening: "HR screening", leadership: "Leadership" } as const;
export const SENIORITY_LABELS = { entry: "Entry level", mid: "Mid-level", senior: "Senior", lead: "Lead / Manager" } as const;

export function validateSetup(setup: Partial<InterviewSetup>) {
  const errors: Record<string, string> = {};
  if (!setup.roleTitle?.trim()) errors.roleTitle = "Enter the role you want to practise for.";
  else if (setup.roleTitle.trim().length < 2) errors.roleTitle = "Use at least 2 characters.";
  if (!setup.interviewType) errors.interviewType = "Choose an interview type.";
  if (!setup.seniority) errors.seniority = "Choose a seniority level.";
  if (![10, 15, 20].includes(Number(setup.durationMinutes))) errors.durationMinutes = "Choose an interview duration.";
  if ((setup.jobDescription?.length ?? 0) > 8000) errors.jobDescription = "Keep the job description under 8,000 characters.";
  return errors;
}

/** Same weights as the backend/AI service (relevance 30, evidence 25, structure 15, role alignment 20, communication 10). */
export function weightedScore(scores: DimensionScores) {
  return Math.round(scores.relevance * .3 + scores.evidence * .25 + scores.structure * .15 + scores.roleAlignment * .2 + scores.communication * .1);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export function formatTime(totalSeconds: number) {
  const safe = Math.max(0, totalSeconds);
  return `${Math.floor(safe / 60).toString().padStart(2, "0")}:${Math.floor(safe % 60).toString().padStart(2, "0")}`;
}

export function statusLabel(status: InterviewStatus) {
  return ({ ready: "Ready", in_progress: "In progress", processing: "Building report", report_ready: "Report ready", abandoned: "Ended early", failed: "Needs attention", deleted: "Deleted" } as const)[status];
}

/** Where a session should open from history / after a refresh, given its server state. */
export function sessionDestination(id: string, status: InterviewStatus) {
  if (status === "ready") return `/ai-interviews/${id}/ready`;
  if (status === "in_progress") return `/ai-interviews/${id}/live`;
  if (status === "processing" || status === "failed") return `/ai-interviews/${id}/processing`;
  if (status === "report_ready") return `/ai-interviews/${id}/report`;
  return "/ai-interviews";
}

export function readinessNote(score: number) {
  if (score >= 85) return "Interview-ready. Keep your examples sharp and specific.";
  if (score >= 70) return "A strong foundation. Focus on evidence and sharper outcomes next.";
  if (score >= 55) return "Getting there. Tighten structure and lead with results.";
  return "Plenty of room to grow. Work through the action plan and try again.";
}
