const BASE_URL = import.meta.env?.VITE_API_URL ?? "/api";

export interface QAAnswersRequest {
  resume_id?: number;
  resume_text?: string;
  job_description: string;
  tone?: "professional" | "enthusiastic" | "concise" | "warm";
  company?: string;
  role?: string;
  interview_type?: "screening" | "behavioral" | "technical" | "manager";
  focus?: string;
  question_count?: number;
  questions?: string[];
}

interface StreamHandlers {
  onToken: (chunk: string) => void;
  onDone?: () => void;
  onError?: (err: Error) => void;
  signal?: AbortSignal;
}

export const qaAnswersService = {
  async generate(req: QAAnswersRequest, handlers: StreamHandlers): Promise<string> {
    const token = localStorage.getItem("accessToken");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}/qa-answers/generate`, {
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
                path: "/qa-answers/generate",
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
