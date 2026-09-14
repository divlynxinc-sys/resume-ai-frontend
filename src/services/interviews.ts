import api from "@/lib/api";

/**
 * AI Interviews — backend contract (`resumeai-backend/app/routers/interviews.py`).
 * snake_case DTOs live here; the feature's UI types are mapped in
 * `src/features/ai-interviews/api.ts`. Page code never imports these directly.
 */

export type InterviewStatusDto =
  | "ready"
  | "in_progress"
  | "processing"
  | "report_ready"
  | "abandoned"
  | "failed"
  | "deleted";

export interface DimensionScoresDto {
  relevance: number;
  evidence: number;
  structure: number;
  role_alignment: number;
  communication: number;
}

export interface InterviewQuestionDto {
  id: string;
  prompt: string;
  category: string;
  is_follow_up?: boolean;
}

export interface InterviewAnswerDto {
  id: string;
  question_id: string;
  transcript: string;
  evaluation: {
    scores: DimensionScoresDto;
    evidence: string;
    worked: string[];
    improvements: string[];
    improved_outline: string[];
  };
}

export interface InterviewReportDto {
  overall_score: number;
  scores: DimensionScoresDto;
  summary?: string;
  strengths: string[];
  improvements: string[];
  action_plan: string[];
  generated_at: string;
}

export interface TranscriptTurnDto {
  role: "assistant" | "user";
  text: string;
  at?: number | null;
}

export interface InterviewSessionDto {
  id: string;
  status: InterviewStatusDto;
  interview_type: string;
  role_title: string;
  seniority: string;
  duration_minutes: number;
  resume_id: number | null;
  resume_title: string | null;
  job_description: string | null;
  question_target: number;
  questions: InterviewQuestionDto[];
  answers: InterviewAnswerDto[];
  report: InterviewReportDto | null;
  transcript?: TranscriptTurnDto[];
  error: string | null;
  ended_reason: string | null;
  /** null until started (or for admins); "refunded" when the interview never ran on our side. */
  credit_status: "charged" | "refunded" | null;
  started_at: string | null;
  processing_started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface InterviewCreateDto {
  interview_type: string;
  role_title: string;
  seniority: string;
  duration_minutes: number;
  resume_id?: number | null;
  job_description?: string | null;
}

export interface LiveConnectionDto {
  url: string;
  token: string;
  room_name: string;
  participant_identity: string;
  agent_join_timeout_seconds: number;
}

export interface InterviewStartDto {
  session: InterviewSessionDto;
  connection: LiveConnectionDto;
}

export const interviewsService = {
  list: (params?: { limit?: number; offset?: number }) => {
    const qs = new URLSearchParams();
    if (params?.limit != null) qs.set("limit", String(params.limit));
    if (params?.offset != null) qs.set("offset", String(params.offset));
    const suffix = qs.toString() ? `?${qs}` : "";
    return api.get<{ items: InterviewSessionDto[]; total: number }>(`/interviews${suffix}`);
  },
  create: (body: InterviewCreateDto) => api.post<InterviewSessionDto>("/interviews", body),
  get: (id: string) => api.get<InterviewSessionDto>(`/interviews/${encodeURIComponent(id)}`),
  start: (id: string) => api.post<InterviewStartDto>(`/interviews/${encodeURIComponent(id)}/start`),
  complete: (id: string) => api.post<InterviewSessionDto>(`/interviews/${encodeURIComponent(id)}/complete`),
  retry: (id: string) => api.post<InterviewSessionDto>(`/interviews/${encodeURIComponent(id)}/retry`),
  remove: (id: string) => api.delete<void>(`/interviews/${encodeURIComponent(id)}`),
};
