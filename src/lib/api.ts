const BASE_URL = import.meta.env?.VITE_API_URL ?? "/api";

function getToken() {
  return localStorage.getItem("accessToken");
}

function getRefreshToken() {
  return localStorage.getItem("refreshToken");
}

const PUBLIC_ROUTES = new Set([
  "/",
  "/pricing",
  "/terms",
  "/privacy",
  "/cookie-policy",
  "/security",
  "/enterprise",
  "/faq",
  "/forgot-password",
  "/login",
  "/signup",
]);

function shouldRedirectToLogin() {
  if (typeof window === "undefined") return false;
  return !PUBLIC_ROUTES.has(window.location.pathname);
}

async function attemptRefresh(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!res.ok) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      return null;
    }
    const data = await res.json();
    localStorage.setItem("accessToken", data.access_token);
    localStorage.setItem("refreshToken", data.refresh_token);
    return data.access_token as string;
  } catch {
    return null;
  }
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  // Dev bypass — no network calls while DB integration is pending
  if (localStorage.getItem("accessToken") === "dev-bypass-token") {
    throw new Error("DEV_BYPASS: backend not connected");
  }

  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (!isFormData) headers["Content-Type"] = "application/json";

  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    const newToken = await attemptRefresh();
    if (newToken) {
      headers["Authorization"] = `Bearer ${newToken}`;
      res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
    } else {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      if (shouldRedirectToLogin()) {
        window.location.href = "/login";
      }
      throw new Error("Session expired. Please log in again.");
    }
  }

  if (res.status === 204) return undefined as T;

  let data: any;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw new Error(`Request failed (${res.status})`);
    return undefined as T;
  }

  if (!res.ok) {
    // 429 with our structured usage_limit_reached detail → dispatch a global event
    // so the UsageLimitModal can surface a friendly "weekly limit" message. We
    // still throw so the caller can react.
    if (
      res.status === 429 &&
      data?.detail &&
      typeof data.detail === "object" &&
      data.detail.code === "usage_limit_reached"
    ) {
      window.dispatchEvent(
        new CustomEvent("usage-limit-reached", {
          detail: {
            path,
            message: data.detail.message,
            resetsAt: data.detail.resets_at,
            feature: data.detail.feature,
          },
        }),
      );
      throw new Error(data.detail.message || "Weekly limit reached");
    }

    // 402 with our structured requires_plan detail → dispatch a global event so
    // the UpgradeModal can intercept it. We still throw so the caller can react.
    if (
      res.status === 402 &&
      data?.detail &&
      typeof data.detail === "object" &&
      data.detail.code === "requires_plan"
    ) {
      window.dispatchEvent(
        new CustomEvent("upgrade-required", {
          detail: { path, message: data.detail.message },
        }),
      );
      const err = new Error(data.detail.message || "Subscription required") as Error & {
        requiresPlan?: boolean;
      };
      err.requiresPlan = true;
      throw err;
    }

    const fallbackMessage =
      res.status === 404
        ? "API endpoint not found. Check the backend URL or deployment."
        : `Request failed (${res.status})`;
    const msg =
      typeof data?.detail === "string"
        ? data.detail
        : Array.isArray(data?.detail)
        ? data.detail[0]?.msg ?? fallbackMessage
        : fallbackMessage;
    throw new Error(msg);
  }

  return data as T;
}

/**
 * Like apiRequest, but for endpoints that return a binary file (PDF/DOCX).
 * Reuses the same auth + 401-refresh handling, but returns a Blob instead of
 * parsing JSON. On error it parses the JSON `detail` so the UI can show why.
 */
export async function apiRequestBlob(path: string, body: unknown, options: RequestInit = {}): Promise<Blob> {
  if (localStorage.getItem("accessToken") === "dev-bypass-token") {
    throw new Error("DEV_BYPASS: backend not connected");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const init: RequestInit = { method: "POST", ...options, headers, body: JSON.stringify(body) };
  let res = await fetch(`${BASE_URL}${path}`, init);

  if (res.status === 401) {
    const newToken = await attemptRefresh();
    if (newToken) {
      headers["Authorization"] = `Bearer ${newToken}`;
      res = await fetch(`${BASE_URL}${path}`, { ...init, headers });
    } else {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      if (shouldRedirectToLogin()) window.location.href = "/login";
      throw new Error("Session expired. Please log in again.");
    }
  }

  if (!res.ok) {
    let detail = `Export failed (${res.status})`;
    try {
      const data = await res.json();
      if (typeof data?.detail === "string") detail = data.detail;
      else if (data?.detail?.message) detail = data.detail.message;
    } catch {
      /* non-JSON error body */
    }
    throw new Error(detail);
  }

  return res.blob();
}

const api = {
  get: <T>(path: string) => apiRequest<T>(path),
  post: <T>(path: string, body?: unknown) =>
    apiRequest<T>(path, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  patch: <T>(path: string, body?: unknown) =>
    apiRequest<T>(path, {
      method: "PATCH",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  delete: <T>(path: string) => apiRequest<T>(path, { method: "DELETE" }),
};

export default api;
