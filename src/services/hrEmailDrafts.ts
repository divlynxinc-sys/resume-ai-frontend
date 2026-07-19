const BASE_URL = import.meta.env?.VITE_API_URL ?? "/api";

export interface HREmailDraftsRequest {
  resume_id?: number;
  resume_text?: string;
  job_description?: string;
  tone?: "professional" | "enthusiastic" | "concise" | "warm";
  company?: string;
  role?: string;
  email_type?:
    | "application"
    | "follow_up"
    | "thank_you"
    | "scheduling"
    | "referral_request"
    | "offer_clarification"
    | "negotiation";
  recipient_name?: string;
  job_link?: string;
  date_applied?: string;
  availability?: string;
  extra_context?: string;
  drafts?: number;
}

interface StreamHandlers {
  onToken: (chunk: string) => void;
  onDone?: () => void;
  onError?: (err: Error) => void;
  signal?: AbortSignal;
}

export const hrEmailDraftsService = {
  async generate(req: HREmailDraftsRequest, handlers: StreamHandlers): Promise<string> {
    const token = localStorage.getItem("accessToken");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}/hr-email-drafts/generate`, {
      method: "POST",
      headers,
      body: JSON.stringify(req),
      signal: handlers.signal,
    });

    if (!res.ok || !res.body) {
      let detail = `Request failed (${res.status})`;
      try {
        const data = await res.json();
        if (
          res.status === 429 &&
          data?.detail &&
          typeof data.detail === "object" &&
          data.detail.code === "usage_limit_reached"
        ) {
          detail = data.detail.message || "Weekly limit reached";
          window.dispatchEvent(
            new CustomEvent("usage-limit-reached", {
              detail: {
                path: "/hr-email-drafts/generate",
                message: detail,
                resetsAt: data.detail.resets_at,
                feature: data.detail.feature,
              },
            }),
          );
        } else {
          detail = typeof data.detail === "string" ? data.detail : detail;
        }
      } catch {
        /* non-JSON error body */
      }
      const err = new Error(detail);
      handlers.onError?.(err);
      throw err;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let full = "";

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (chunk) {
          full += chunk;
          handlers.onToken(chunk);
        }
      }
      handlers.onDone?.();
      return full;
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      handlers.onError?.(err);
      throw err;
    }
  },
};
