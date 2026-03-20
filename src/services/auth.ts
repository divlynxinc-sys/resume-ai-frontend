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

export interface OtpSendResponse {
  message: string;
  otp_sent: boolean;
}

export interface OtpVerifyResponse {
  message: string;
  verified: boolean;
}

export const authService = {
  login: (email: string, password: string) =>
    api.post<LoginResponse>("/auth/login", { email, password }),

  signup: (name: string, email: string, password: string) =>
    api.post<LoginResponse>("/auth/signup", { name, email, password }),

  signupSendOtp: (email: string) =>
    api.post<OtpSendResponse>("/auth/signup/send-otp", { email }),

  signupVerifyOtp: (email: string, otp_code: string) =>
    api.post<OtpVerifyResponse>("/auth/signup/verify-otp", { email, otp_code }),

  refresh: (refresh_token: string) =>
    api.post<LoginResponse>("/auth/refresh", { refresh_token }),

  logoutAll: () => api.post<{ message: string }>("/auth/logout-all"),
};
