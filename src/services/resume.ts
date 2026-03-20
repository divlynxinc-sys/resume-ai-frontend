import api from "@/lib/api";

export interface ResumeListItem {
  id: number;
  title: string;
  updated_at: string;
  status: string;
}

export interface ResumeContent {
  info: Record<string, unknown>;
  experience: unknown[];
  education: unknown[];
  skills: string[];
  summary: string;
  job_description: Record<string, unknown>;
  custom: Record<string, unknown>;
}

export interface Resume {
  id: number;
  title: string;
  template_id: number | null;
  status: string;
  content: ResumeContent;
  created_at: string;
  updated_at: string;
}

export interface ResumeListResponse {
  items: ResumeListItem[];
  total: number;
}

export interface OptimizeResumeResponse {
  message: string;
  resume: ResumeContent;
  ats: unknown;
  ats_score_id: number | null;
}

export const resumeService = {
  list: (params?: { limit?: number; offset?: number; q?: string }) => {
    const qs = new URLSearchParams();
    if (params?.limit != null) qs.set("limit", String(params.limit));
    if (params?.offset != null) qs.set("offset", String(params.offset));
    if (params?.q) qs.set("q", params.q);
    return api.get<ResumeListResponse>(`/resumes?${qs}`);
  },

  get: (id: number) => api.get<Resume>(`/resumes/${id}`),

  create: (data: { title: string; template_id?: number | null }) =>
    api.post<Resume>(`/resumes?mode=scratch`, { ...data, content: null }),

  update: (id: number, data: Partial<Pick<Resume, "title" | "template_id" | "status" | "content">>) =>
    api.patch<Resume>(`/resumes/${id}`, data),

  duplicate: (id: number) => api.post<Resume>(`/resumes/${id}/duplicate`),

  delete: (id: number) => api.delete<void>(`/resumes/${id}`),

  fromUpload: (file: File, title?: string, templateId?: number) => {
    const fd = new FormData();
    fd.append("file", file);
    if (title) fd.append("title", title);
    if (templateId != null) fd.append("template_id", String(templateId));
    return api.post<Resume>("/resumes/from-upload", fd);
  },

  mergeUpload: (id: number, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return api.patch<Resume>(`/resumes/${id}/from-upload`, fd);
  },

  parseUpload: (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return api.post<ResumeContent>("/resumes/parse-upload", fd);
  },

  getContent: (id: number, section: string) =>
    api.get<unknown>(`/resumes/${id}/content?section=${section}`),

  patchContent: (id: number, section: string, body: unknown) =>
    api.patch<{ message: string; section: string; content: unknown }>(
      `/resumes/${id}/content?section=${section}`,
      body
    ),

  optimizeWithAi: (id: number, params?: { update_resume_content?: boolean; store_ats_score?: boolean }) => {
    const qs = new URLSearchParams();
    if (params?.update_resume_content != null) {
      qs.set("update_resume_content", params.update_resume_content ? "true" : "false");
    }
    if (params?.store_ats_score != null) {
      qs.set("store_ats_score", params.store_ats_score ? "true" : "false");
    }
    const qsStr = qs.toString();
    return api.post<OptimizeResumeResponse>(`/resumes/${id}/ai/optimize${qsStr ? `?${qsStr}` : ""}`);
  },

  saveAtsScore: (id: number, data: unknown) =>
    api.post<unknown>(`/resumes/${id}/ats-score`, data),

  getAtsScore: (id: number) => api.get<unknown>(`/resumes/${id}/ats-score`),

  getSectionDefinition: (section: string) =>
    api.get<{ section: string; fields: unknown[] }>(
      `/resumes/sections/definition?section=${section}`
    ),
};
