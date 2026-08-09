import { resumeService } from "@/services/resume";
import type { DimensionScores, InterviewAnswer, InterviewApi, InterviewQuestion, InterviewReport, InterviewSession, InterviewSetup, QuestionEvaluation, ResumeOption } from "./types";
import { weightedScore } from "./utils";

const STORAGE_KEY = "jobsynk.aiInterviews.v1";
const delay = (ms = 350) => new Promise((resolve) => window.setTimeout(resolve, ms));
const uid = (prefix: string) => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const questionBank: Record<string, string[]> = {
  general: ["Tell me about yourself and what draws you to this role.", "What professional achievement are you most proud of?", "How do you prioritise when several deadlines compete?", "Why is this opportunity the right next step for you?"],
  behavioural: ["Tell me about a time you solved a difficult problem with limited information.", "Describe a disagreement with a teammate and how you handled it.", "Share an example of a mistake you made and what changed afterward.", "Tell me about a time you influenced an outcome without formal authority."],
  technical: ["Walk me through a challenging technical decision and the trade-offs you considered.", "How do you investigate a production issue you cannot reproduce locally?", "Describe how you improve quality without slowing delivery.", "How would you explain a complex system to a non-technical stakeholder?"],
  hr_screening: ["What interests you about this company and role?", "What are you looking for in your next manager and team?", "Why are you considering leaving your current position?", "What would make an offer compelling for you?"],
  leadership: ["Describe a time you helped a team perform through uncertainty.", "How do you set direction while inviting constructive challenge?", "Tell me about a difficult performance conversation you led.", "How do you balance short-term delivery with long-term team health?"],
};

function read(): InterviewSession[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as InterviewSession[]; } catch { return []; }
}
function write(items: InterviewSession[]) { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }
function save(session: InterviewSession) {
  const items = read();
  const index = items.findIndex((item) => item.id === session.id);
  if (index >= 0) items[index] = session; else items.unshift(session);
  write(items);
  return session;
}
function find(id: string) {
  const session = read().find((item) => item.id === id && item.status !== "deleted");
  if (!session) throw new Error("This interview could not be found. It may have been deleted.");
  return session;
}
function questionsFor(setup: InterviewSetup): InterviewQuestion[] {
  const count = setup.durationMinutes === 10 ? 3 : setup.durationMinutes === 15 ? 4 : 5;
  const source = questionBank[setup.interviewType] ?? questionBank.general;
  return Array.from({ length: count }, (_, i) => ({ id: `q_${i + 1}`, prompt: source[i % source.length], category: setup.interviewType }));
}
function scores(seed: number): DimensionScores {
  return { relevance: 72 + seed % 17, evidence: 68 + seed % 19, structure: 75 + seed % 14, roleAlignment: 70 + seed % 18, communication: 78 + seed % 12 };
}
function evaluation(session: InterviewSession, question: InterviewQuestion): QuestionEvaluation {
  const score = scores(session.answers.length * 3 + question.prompt.length);
  return {
    scores: score,
    evidence: "You connected the situation to a concrete decision and described a measurable outcome.",
    worked: ["Clear ownership of the situation", "A calm, easy-to-follow explanation"],
    improvements: ["Quantify the result more precisely", "Make your personal contribution explicit earlier"],
    improvedOutline: ["Open with the outcome", "Set the context in one sentence", "Explain two actions you personally took", "Close with a metric and lesson"],
  };
}
function buildReport(session: InterviewSession): InterviewReport {
  const complete = session.answers.filter((a) => a.evaluation);
  const dimensions = (Object.keys(scores(0)) as (keyof DimensionScores)[]).reduce((acc, key) => {
    acc[key] = Math.round(complete.reduce((sum, a) => sum + (a.evaluation?.scores[key] ?? 75), 0) / Math.max(1, complete.length));
    return acc;
  }, {} as DimensionScores);
  return { overallScore: weightedScore(dimensions), scores: dimensions, strengths: ["Your answers stay relevant to the question", "You communicate decisions with clarity", "Your examples show thoughtful collaboration"], improvements: ["Add sharper measures of impact", "Use a more consistent situation–action–result structure", "Connect each example directly to the target role"], actionPlan: ["Prepare three versatile achievement stories", "Practise 90-second answers with a clear result", "Add one metric to every example", "Repeat this interview after reviewing your outlines"], generatedAt: new Date().toISOString() };
}
function recover(session: InterviewSession) {
  if (session.status === "processing" && session.processingStartedAt && Date.now() - new Date(session.processingStartedAt).getTime() > 6000) {
    session.status = "report_ready"; session.report = buildReport(session); session.completedAt = new Date().toISOString(); session.updatedAt = session.completedAt; save(session);
  }
  return session;
}

export class MockInterviewApi implements InterviewApi {
  async listInterviews() { await delay(); return read().filter((s) => s.status !== "deleted").map(recover).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)); }
  async listResumes(): Promise<ResumeOption[]> {
    try { const result = await resumeService.list({ limit: 50 }); return result.items.map((r) => ({ id: String(r.id), title: r.title, updatedAt: r.updated_at })); }
    catch { return [{ id: "mock-resume", title: "Product-focused resume" }]; }
  }
  async createInterview(setup: InterviewSetup) { await delay(); const now = new Date().toISOString(); return save({ id: uid("int"), setup, status: "draft", questions: questionsFor(setup), answers: [], currentQuestionIndex: 0, createdAt: now, updatedAt: now, followUpUsed: false }); }
  async getInterview(id: string) { await delay(180); return recover(find(id)); }
  async prepareInterview(id: string) { await delay(); const s = find(id); if (s.status === "draft") s.status = "ready"; s.updatedAt = new Date().toISOString(); return save(s); }
  async startInterview(id: string) { await delay(); const s = find(id); if (!['draft','ready','in_progress'].includes(s.status)) throw new Error("This interview can no longer be started."); s.status = "in_progress"; s.startedAt ||= new Date().toISOString(); s.updatedAt = new Date().toISOString(); return save(s); }
  async registerUpload(id: string, blob: Blob) { find(id); if (!blob.size) throw new Error("Your recording is empty. Record an answer before submitting."); await delay(450); return { mediaAssetId: uid("media"), uploadUrl: "mock://signed-upload" }; }
  async submitAnswer(id: string, input: { questionId: string; mediaAssetId: string; durationMs: number; idempotencyKey: string }) {
    const s = find(id); const duplicate = s.answers.find((a) => a.idempotencyKey === input.idempotencyKey); if (duplicate) return duplicate;
    if (s.status !== "in_progress") throw new Error("This interview is not accepting answers.");
    const question = s.questions.find((q) => q.id === input.questionId); if (!question) throw new Error("The current question is no longer available.");
    if (localStorage.getItem("jobsynk.aiInterviews.failNext") === "true") { localStorage.removeItem("jobsynk.aiInterviews.failNext"); throw new Error("The mock upload was interrupted. Your recording is still available—try again."); }
    const answer: InterviewAnswer = { id: uid("ans"), questionId: input.questionId, durationMs: input.durationMs, idempotencyKey: input.idempotencyKey, status: "uploading", createdAt: new Date().toISOString() };
    s.answers.push(answer); save(s); await delay(450); answer.status = "transcribing"; save(s); await delay(500); answer.status = "evaluating"; save(s); await delay(550);
    answer.status = "completed"; answer.transcript = `In this example, I clarified the goal, worked with the team to choose a practical approach, and followed through until we achieved a stronger result. I also documented what we learned so the next project could move faster.`; answer.evaluation = evaluation(s, question);
    const baseAnswered = s.answers.filter((a) => !s.questions.find((q) => q.id === a.questionId)?.isFollowUp).length;
    if (!s.followUpUsed && baseAnswered === 1 && s.questions.length > 2) { s.questions.splice(s.currentQuestionIndex + 1, 0, { id: uid("followup"), prompt: "What was the most important trade-off you made, and how did you know it was the right one?", category: "Contextual follow-up", isFollowUp: true, parentQuestionId: question.id }); s.followUpUsed = true; }
    s.currentQuestionIndex += 1; s.updatedAt = new Date().toISOString(); save(s); return answer;
  }
  async getAnswer(id: string, answerId: string) { const answer = find(id).answers.find((a) => a.id === answerId); if (!answer) throw new Error("Answer not found."); return answer; }
  async completeInterview(id: string, abandoned = false) { await delay(); const s = find(id); if (abandoned) { s.status = "abandoned"; s.completedAt = new Date().toISOString(); } else { s.status = "processing"; s.processingStartedAt ||= new Date().toISOString(); } s.updatedAt = new Date().toISOString(); return save(s); }
  async getReport(id: string) { const s = recover(find(id)); if (s.status !== "report_ready" || !s.report) throw new Error("Your report is still being prepared."); return s.report; }
  async retryInterview(id: string) { const s = find(id); s.error = undefined; s.status = s.answers.length ? "in_progress" : "ready"; s.updatedAt = new Date().toISOString(); return save(s); }
  async deleteInterview(id: string) { await delay(250); const s = find(id); s.status = "deleted"; s.updatedAt = new Date().toISOString(); save(s); }
}

class LiveInterviewApi implements InterviewApi {
  private unavailable(): never { throw new Error("Live interview API mode is not configured yet. Set VITE_INTERVIEW_API_MODE=mock."); }
  listInterviews = async () => this.unavailable();
  listResumes = async () => this.unavailable();
  createInterview = async (setup: InterviewSetup) => { void setup; return this.unavailable(); };
  getInterview = async (id: string) => { void id; return this.unavailable(); };
  prepareInterview = async (id: string) => { void id; return this.unavailable(); };
  startInterview = async (id: string) => { void id; return this.unavailable(); };
  registerUpload = async (id: string, blob: Blob) => { void id; void blob; return this.unavailable(); };
  submitAnswer = async (id: string, input: { questionId: string; mediaAssetId: string; durationMs: number; idempotencyKey: string }) => { void id; void input; return this.unavailable(); };
  getAnswer = async (id: string, answerId: string) => { void id; void answerId; return this.unavailable(); };
  completeInterview = async (id: string, abandoned?: boolean) => { void id; void abandoned; return this.unavailable(); };
  getReport = async (id: string) => { void id; return this.unavailable(); };
  retryInterview = async (id: string) => { void id; return this.unavailable(); };
  deleteInterview = async (id: string) => { void id; return this.unavailable(); };
}

export const interviewApi: InterviewApi = import.meta.env.VITE_INTERVIEW_API_MODE === "live" ? new LiveInterviewApi() : new MockInterviewApi();
