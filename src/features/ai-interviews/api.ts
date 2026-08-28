import { resumeService } from "@/services/resume";
import {
  interviewsService,
  type DimensionScoresDto,
  type InterviewAnswerDto,
  type InterviewReportDto,
  type InterviewSessionDto,
  type LiveConnectionDto,
} from "@/services/interviews";
import type {
  DimensionScores,
  InterviewAnswer,
  InterviewApi,
  InterviewReport,
  InterviewSession,
  InterviewSetup,
  InterviewType,
  LiveConnection,
  ResumeOption,
  Seniority,
} from "./types";

/**
 * Maps the backend's snake_case DTOs onto the UI domain types. The pages only
 * ever see `InterviewSession` & co, so the wire format can change here alone.
 */

function scores(dto: DimensionScoresDto | undefined): DimensionScores {
  return {
    relevance: dto?.relevance ?? 0,
    evidence: dto?.evidence ?? 0,
    structure: dto?.structure ?? 0,
    roleAlignment: dto?.role_alignment ?? 0,
    communication: dto?.communication ?? 0,
  };
}

function answer(dto: InterviewAnswerDto): InterviewAnswer {
  return {
    id: dto.id,
    questionId: dto.question_id,
    transcript: dto.transcript,
    evaluation: dto.evaluation
      ? {
          scores: scores(dto.evaluation.scores),
          evidence: dto.evaluation.evidence ?? "",
          worked: dto.evaluation.worked ?? [],
          improvements: dto.evaluation.improvements ?? [],
          improvedOutline: dto.evaluation.improved_outline ?? [],
        }
      : undefined,
  };
}

function report(dto: InterviewReportDto | null): InterviewReport | undefined {
  if (!dto) return undefined;
  return {
    overallScore: dto.overall_score,
    scores: scores(dto.scores),
    summary: dto.summary || undefined,
    strengths: dto.strengths ?? [],
    improvements: dto.improvements ?? [],
    actionPlan: dto.action_plan ?? [],
    generatedAt: dto.generated_at,
  };
}

export function toSession(dto: InterviewSessionDto): InterviewSession {
  return {
    id: dto.id,
    status: dto.status,
    questionTarget: dto.question_target,
    setup: {
      roleTitle: dto.role_title,
      interviewType: dto.interview_type as InterviewType,
      seniority: dto.seniority as Seniority,
      durationMinutes: (dto.duration_minutes === 10 || dto.duration_minutes === 20 ? dto.duration_minutes : 15) as 10 | 15 | 20,
      resumeId: dto.resume_id != null ? String(dto.resume_id) : undefined,
      resumeTitle: dto.resume_title ?? undefined,
      jobDescription: dto.job_description ?? undefined,
    },
    questions: (dto.questions ?? []).map((q) => ({ id: q.id, prompt: q.prompt, category: q.category, isFollowUp: q.is_follow_up })),
    answers: (dto.answers ?? []).map(answer),
    report: report(dto.report),
    transcript: dto.transcript?.map((t) => ({ role: t.role, text: t.text, at: t.at ?? undefined })),
    error: dto.error ?? undefined,
    endedReason: dto.ended_reason ?? undefined,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
    startedAt: dto.started_at ?? undefined,
    completedAt: dto.completed_at ?? undefined,
    processingStartedAt: dto.processing_started_at ?? undefined,
  };
}

function toConnection(dto: LiveConnectionDto): LiveConnection {
  return {
    url: dto.url,
    token: dto.token,
    roomName: dto.room_name,
    participantIdentity: dto.participant_identity,
    agentJoinTimeoutSeconds: dto.agent_join_timeout_seconds ?? 25,
  };
}

class LiveInterviewApi implements InterviewApi {
  async listInterviews() {
    const result = await interviewsService.list({ limit: 50 });
    return result.items.map(toSession);
  }

  async listResumes(): Promise<ResumeOption[]> {
    const result = await resumeService.list({ limit: 50 });
    return result.items.map((r) => ({ id: String(r.id), title: r.title, updatedAt: r.updated_at }));
  }

  async uploadResume(file: File): Promise<ResumeOption> {
    const resume = await resumeService.fromUpload(file);
    return { id: String(resume.id), title: resume.title, updatedAt: resume.updated_at };
  }

  async createInterview(setup: InterviewSetup) {
    const dto = await interviewsService.create({
      interview_type: setup.interviewType,
      role_title: setup.roleTitle.trim(),
      seniority: setup.seniority,
      duration_minutes: setup.durationMinutes,
      resume_id: setup.resumeId ? Number(setup.resumeId) : null,
      job_description: setup.jobDescription?.trim() || null,
    });
    return toSession(dto);
  }

  async getInterview(id: string) {
    return toSession(await interviewsService.get(id));
  }

  async startInterview(id: string) {
    const dto = await interviewsService.start(id);
    return { session: toSession(dto.session), connection: toConnection(dto.connection) };
  }

  async completeInterview(id: string) {
    return toSession(await interviewsService.complete(id));
  }

  async retryInterview(id: string) {
    return toSession(await interviewsService.retry(id));
  }

  async deleteInterview(id: string) {
    await interviewsService.remove(id);
  }
}

export const interviewApi: InterviewApi = new LiveInterviewApi();
