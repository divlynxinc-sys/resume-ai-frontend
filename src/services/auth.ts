import api from "@/lib/api";

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  is_new_user?: boolean;
}

export interface SignupResponse {
  message: string;
  user_id: number;
}

export interface OtpSendResponse {
  message: string;
  otp_sent: boolean;
  challenge_id: string;
  expires_at: string;
  resend_available_at: string;
  server_now: string;
}

export interface OtpVerifyResponse {
  message: string;
  verified: boolean;
  signup_token: string;
  signup_expires_at: string;
  server_now: string;
}

export const authService = {
  login: (email: string, password: string, turnstile_token: string) =>
    api.post<LoginResponse>("/auth/login", { email, password, turnstile_token }),

  signup: (name: string, email: string, password: string, signup_token: string) =>
    api.post<LoginResponse>("/auth/signup", { name, email, password, signup_token }),

  signupSendOtp: (email: string, turnstile_token: string) =>
    api.post<OtpSendResponse>("/auth/signup/send-otp", { email, turnstile_token }),

  signupVerifyOtp: (email: string, challenge_id: string, otp_code: string) =>
    api.post<OtpVerifyResponse>("/auth/signup/verify-otp", { email, challenge_id, otp_code }),

  refresh: (refresh_token: string) =>
    api.post<LoginResponse>("/auth/refresh", { refresh_token }),

  logoutAll: () => api.post<{ message: string }>("/auth/logout-all"),

  googleAuth: (credential: string, turnstile_token: string) =>
    api.post<LoginResponse>("/auth/google", { credential, turnstile_token }),

  forgotPassword: (email: string, turnstile_token: string) =>
    api.post<{ message: string }>("/auth/forgot-password", { email, turnstile_token }),

  resetPassword: (token: string, new_password: string) =>
    api.post<{ message: string }>("/auth/reset-password", { token, new_password }),
};
