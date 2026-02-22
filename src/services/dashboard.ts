import api from "@/lib/api";

export interface DashboardSummary {
  welcome_name: string;
  resume_count: number;
  credits_remaining: number;
  recent: Array<{ id: number; title: string; updated_at: string }>;
  suggested_templates: Array<{
    id: number;
    name: string;
    slug: string;
    preview_url: string;
    is_premium: boolean;
  }>;
}

export interface RecentActivityItem {
  id: number;
  title: string;
  updated_at: string;
}

export const dashboardService = {
  getSummary: () => api.get<DashboardSummary>("/dashboard/summary"),
  getRecentActivity: (limit = 10) =>
    api.get<RecentActivityItem[]>(`/dashboard/recent-activity?limit=${limit}`),
};
