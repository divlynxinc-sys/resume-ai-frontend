import api from "@/lib/api";

export interface Template {
  id: number;
  name: string;
  slug: string;
  preview_url: string;
  is_premium: boolean;
  style: string;
  industry: string | null;
}

export const templatesService = {
  list: (params?: {
    q?: string;
    style?: string;
    industry?: string;
    limit?: number;
    offset?: number;
  }) => {
    const qs = new URLSearchParams();
    if (params?.q) qs.set("q", params.q);
    if (params?.style) qs.set("style", params.style);
    if (params?.industry) qs.set("industry", params.industry);
    if (params?.limit != null) qs.set("limit", String(params.limit));
    if (params?.offset != null) qs.set("offset", String(params.offset));
    return api.get<Template[]>(`/templates?${qs}`);
  },
};
