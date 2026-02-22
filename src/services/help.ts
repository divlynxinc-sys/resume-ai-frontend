import api from "@/lib/api";

export interface HelpTopic {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  display_order: number;
}

export interface HelpArticle {
  id: number;
  title: string;
  slug: string;
  topic_name?: string;
  content?: string;
}

export const helpService = {
  listTopics: () => api.get<HelpTopic[]>("/help/topics"),

  searchArticles: (params?: {
    q?: string;
    topic_id?: number;
    featured_only?: boolean;
    faq_only?: boolean;
    limit?: number;
    offset?: number;
  }) => {
    const qs = new URLSearchParams();
    if (params?.q) qs.set("q", params.q);
    if (params?.topic_id != null) qs.set("topic_id", String(params.topic_id));
    if (params?.featured_only) qs.set("featured_only", "true");
    if (params?.faq_only) qs.set("faq_only", "true");
    if (params?.limit != null) qs.set("limit", String(params.limit));
    if (params?.offset != null) qs.set("offset", String(params.offset));
    return api.get<HelpArticle[]>(`/help/articles?${qs}`);
  },

  getFeatured: (limit = 10) =>
    api.get<HelpArticle[]>(`/help/articles/featured?limit=${limit}`),

  getFaqs: (limit = 20) =>
    api.get<HelpArticle[]>(`/help/articles/faqs?limit=${limit}`),

  getArticle: (slug: string) => api.get<HelpArticle>(`/help/articles/${slug}`),
};
