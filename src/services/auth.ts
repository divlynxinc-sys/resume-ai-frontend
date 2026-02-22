import api from "@/lib/api";

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface SignupResponse {
  message: string;
  user_id: number;
}

export const authService = {
  login: (email: string, password: string) =>
    api.post<LoginResponse>("/auth/login", { email, password }),

  signup: (name: string, email: string, password: string) =>
    api.post<SignupResponse>("/auth/signup", { name, email, password }),

  refresh: (refresh_token: string) =>
    api.post<LoginResponse>("/auth/refresh", { refresh_token }),

  logoutAll: () => api.post<{ message: string }>("/auth/logout-all"),
};
