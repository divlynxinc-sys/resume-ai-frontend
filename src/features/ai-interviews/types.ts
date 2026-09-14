/** A band array for the voice visualiser: either a plain array (re-rendered by its owner) or a ref mutated in place at frame rate. */
export type BandSource = readonly number[] | { readonly current: readonly number[] };

/** Who currently holds the floor — drives the visualiser's colour. */
export type WaveTone = "sam" | "you" | "thinking" | "idle" | "muted";

export type InterviewType = "general" | "behavioural" | "technical" | "hr_screening" | "leadership";
export type Seniority = "entry" | "mid" | "senior" | "lead";
export type InterviewStatus = "ready" | "in_progress" | "processing" | "report_ready" | "abandoned" | "failed" | "deleted";

export interface InterviewSetup {
  roleTitle: string;
  interviewType: InterviewType;
  seniority: Seniority;
  durationMinutes: 10 | 15 | 20;
  resumeId?: string;
  resumeTitle?: string;
  jobDescription?: string;
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
}

export interface InterviewAnswer {
  id: string;
  questionId: string;
  transcript?: string;
  evaluation?: QuestionEvaluation;
}

export interface InterviewReport {
  overallScore: number;
  scores: DimensionScores;
  summary?: string;
  strengths: string[];
  improvements: string[];
  actionPlan: string[];
  generatedAt: string;
}

export interface TranscriptTurn {
  role: "assistant" | "user";
  text: string;
  at?: number;
}

export interface InterviewSession {
  id: string;
  setup: InterviewSetup;
  status: InterviewStatus;
  questionTarget: number;
  questions: InterviewQuestion[];
  answers: InterviewAnswer[];
  report?: InterviewReport;
  transcript?: TranscriptTurn[];
  error?: string;
  endedReason?: string;
  /** The interview credit this session used; "refunded" means it was given back automatically. */
  creditStatus?: "charged" | "refunded";
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  processingStartedAt?: string;
}

/** What the browser needs to join the LiveKit room for a live interview. */
export interface LiveConnection {
  url: string;
  token: string;
  roomName: string;
  participantIdentity: string;
  agentJoinTimeoutSeconds: number;
}

export interface ResumeOption { id: string; title: string; updatedAt?: string }

export interface InterviewApi {
  listInterviews(): Promise<InterviewSession[]>;
  listResumes(): Promise<ResumeOption[]>;
  /** Uploads a PDF/DOCX, parses it into a new résumé, and returns it ready to select. */
  uploadResume(file: File): Promise<ResumeOption>;
  createInterview(setup: InterviewSetup): Promise<InterviewSession>;
  getInterview(id: string): Promise<InterviewSession>;
  /** ready → in_progress (idempotent while in progress) and returns a fresh room token. */
  startInterview(id: string): Promise<{ session: InterviewSession; connection: LiveConnection }>;
  /** Candidate left the room from the browser; moves the UI to processing. */
  completeInterview(id: string): Promise<InterviewSession>;
  retryInterview(id: string): Promise<InterviewSession>;
  deleteInterview(id: string): Promise<void>;
}
