/**
 * Cover-letter service.
 *
 * The backend streams plain-text tokens from `/cover-letter/generate`, so we use
 * `fetch` directly (rather than the JSON-only `apiRequest` helper) and pipe the
 * ReadableStream through onToken callbacks for live UI updates.
 */

const BASE_URL = (import.meta as any).env?.VITE_API_URL ?? "/api";

export interface CoverLetterRequest {
  resume_id?: number;
  resume_text?: string;
  job_description: string;
  tone?: "professional" | "enthusiastic" | "concise" | "warm";
  company?: string;
  role?: string;
}

export interface StreamHandlers {
  onToken: (chunk: string) => void;
  onDone?: () => void;
  onError?: (err: Error) => void;
  signal?: AbortSignal;
}

export const coverLetterService = {
  /**
   * Generate a cover letter and stream tokens. Returns the full letter once done.
   * Throws if the request fails before any tokens arrive.
   */
  async generate(req: CoverLetterRequest, handlers: StreamHandlers): Promise<string> {
    const token = localStorage.getItem("accessToken");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}/cover-letter/generate`, {
      method: "POST",
      headers,
      body: JSON.stringify(req),
      signal: handlers.signal,
    });

    if (!res.ok || !res.body) {
      let detail = `Request failed (${res.status})`;
      try {
        const data = await res.json();
        detail = typeof data.detail === "string" ? data.detail : detail;
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
