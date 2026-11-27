import type { OtpSendResponse } from "@/services/auth";

export function deadlineAt(serverNow: string, serverDeadline: string, receivedAt: number): number {
  const delay = Date.parse(serverDeadline) - Date.parse(serverNow);
  return receivedAt + (Number.isFinite(delay) ? Math.max(0, delay) : 0);
}

export function signupDeadlines(challenge: OtpSendResponse, receivedAt = performance.now()) {
  return {
    expiresAt: deadlineAt(challenge.server_now, challenge.expires_at, receivedAt),
    resendAt: deadlineAt(challenge.server_now, challenge.resend_available_at, receivedAt),
  };
}

export function remainingSeconds(deadline: number, now: number): number {
  return Math.max(0, Math.ceil((deadline - now) / 1000));
}
