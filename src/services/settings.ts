import api from "@/lib/api";

export interface UserPreferences {
  theme: string;
  email_notifications: boolean;
  two_factor_enabled: boolean;
}

export interface AccountSummary {
  current_plan: string | null;
  credits_remaining: number;
}

export const settingsService = {
  getPreferences: () => api.get<UserPreferences>("/settings/preferences"),

  updatePreferences: (data: Partial<UserPreferences>) =>
    api.patch<UserPreferences>("/settings/preferences", data),

  getAccountSummary: () => api.get<AccountSummary>("/settings/account/summary"),

  exportData: async () => {
    const token = localStorage.getItem("accessToken");
    const res = await fetch(
      `${import.meta.env?.VITE_API_URL ?? "https://resumeai-api-0df7.onrender.com"}/settings/account/export`,
      { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    );
    if (!res.ok) throw new Error("Export failed");
    return res.blob();
  },

  deleteAccount: () => api.delete<void>("/settings/account"),
};
