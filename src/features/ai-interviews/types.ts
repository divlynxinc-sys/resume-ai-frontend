export type InterviewType = "general" | "behavioural" | "technical" | "hr_screening" | "leadership";
export type Seniority = "entry" | "mid" | "senior" | "lead";
export type InterviewStatus = "draft" | "ready" | "in_progress" | "processing" | "report_ready" | "abandoned" | "failed" | "deleted";
export type AnswerStatus = "recording" | "uploading" | "queued" | "transcribing" | "evaluating" | "completed" | "failed";
export type NextAction = "follow_up" | "next_question" | "complete";

export interface InterviewSetup {
  roleTitle: string;
  interviewType: InterviewType;
  seniority: Seniority;
  durationMinutes: 10 | 15 | 20;
  resumeId?: string;
  resumeTitle?: string;
  jobDescription?: string;
  voiceEnabled: true;
}

export interface DimensionScores {
  relevance: number;
  evidence: number;
  structure: number;
  roleAlignment: number;
  communication: number;
}

export interface QuestionEvaluation {
  scores: DimensionScores;
  evidence: string;
  worked: string[];
  improvements: string[];
  improvedOutline: string[];
}

export interface InterviewQuestion {
  id: string;
  prompt: string;
  category: string;
  isFollowUp?: boolean;
  parentQuestionId?: string;
}

export interface InterviewAnswer {
  id: string;
  questionId: string;
  durationMs: number;
  idempotencyKey: string;
  status: AnswerStatus;
  transcript?: string;
  evaluation?: QuestionEvaluation;
  createdAt: string;
}

export interface InterviewReport {
  overallScore: number;
  scores: DimensionScores;
  strengths: string[];
  improvements: string[];
  actionPlan: string[];
  generatedAt: string;
}

export interface InterviewSession {
  id: string;
  setup: InterviewSetup;
  status: InterviewStatus;
  questions: InterviewQuestion[];
  answers: InterviewAnswer[];
  currentQuestionIndex: number;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  processingStartedAt?: string;
  followUpUsed: boolean;
  report?: InterviewReport;
  error?: string;
}

export interface ResumeOption { id: string; title: string; updatedAt?: string }
export interface UploadRegistration { mediaAssetId: string; uploadUrl: string }

export interface InterviewApi {
  listInterviews(): Promise<InterviewSession[]>;
  listResumes(): Promise<ResumeOption[]>;
  createInterview(setup: InterviewSetup): Promise<InterviewSession>;
  getInterview(id: string): Promise<InterviewSession>;
  prepareInterview(id: string): Promise<InterviewSession>;
  startInterview(id: string): Promise<InterviewSession>;
  registerUpload(id: string, blob: Blob): Promise<UploadRegistration>;
  submitAnswer(id: string, input: { questionId: string; mediaAssetId: string; durationMs: number; idempotencyKey: string }): Promise<InterviewAnswer>;
  getAnswer(id: string, answerId: string): Promise<InterviewAnswer>;
  completeInterview(id: string, abandoned?: boolean): Promise<InterviewSession>;
  getReport(id: string): Promise<InterviewReport>;
  retryInterview(id: string): Promise<InterviewSession>;
  deleteInterview(id: string): Promise<void>;
}
