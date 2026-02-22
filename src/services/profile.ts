import api from "@/lib/api";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  location: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  credits_remaining: number;
}

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  location?: string;
  linkedin_url?: string;
  portfolio_url?: string;
}

export interface ChangePasswordPayload {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

export const profileService = {
  getMe: () => api.get<UserProfile>("/profile/me"),
  updateMe: (data: UpdateProfilePayload) => api.patch<UserProfile>("/profile/me", data),
  changePassword: (data: ChangePasswordPayload) =>
    api.post<UserProfile>("/profile/change-password", data),
  syncFromResume: (resumeId: number) =>
    api.post<UserProfile>(`/profile/sync-from-resume/${resumeId}`),
};
