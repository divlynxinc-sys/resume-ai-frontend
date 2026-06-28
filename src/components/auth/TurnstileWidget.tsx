import { useEffect, useRef } from "react";

type TurnstileOptions = {
  sitekey: string;
  theme: "auto" | "light" | "dark";
  size: "flexible";
  action: string;
  callback: (token: string) => void;
  "expired-callback": () => void;
  "error-callback": () => void;
};

type TurnstileApi = {
  render: (container: HTMLElement, options: TurnstileOptions) => string;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const TURNSTILE_SCRIPT_ID = "cloudflare-turnstile-script";
const TEST_SITE_KEY = "1x00000000000000000000AA";
let scriptPromise: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(TURNSTILE_SCRIPT_ID) as HTMLScriptElement | null;
    const script = existing ?? document.createElement("script");

    const handleLoad = () => resolve();
    const handleError = () => reject(new Error("Unable to load Cloudflare Turnstile."));
    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });

    if (!existing) {
      script.id = TURNSTILE_SCRIPT_ID;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }).catch((error) => {
    scriptPromise = null;
    throw error;
  });

  return scriptPromise!;
}

export function TurnstileWidget({
  action,
  onVerify,
  onError,
}: {
  action: "login" | "signup";
  onVerify: (token: string | null) => void;
  onError?: (message: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let disposed = false;
    let widgetId: string | null = null;
    const configuredSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
    const sitekey = configuredSiteKey || (import.meta.env.DEV ? TEST_SITE_KEY : "");

    if (!sitekey) {
      onVerify(null);
      onError?.("Security verification is not configured.");
      return;
    }

    loadTurnstileScript()
      .then(() => {
        if (disposed || !containerRef.current || !window.turnstile) return;
        widgetId = window.turnstile.render(containerRef.current, {
          sitekey,
          theme: "auto",
          size: "flexible",
          action,
          callback: (token) => onVerify(token),
          "expired-callback": () => onVerify(null),
          "error-callback": () => {
            onVerify(null);
            onError?.("Security verification failed. Please try again.");
          },
        });
      })
      .catch(() => {
        onVerify(null);
        onError?.("Unable to load security verification. Please refresh the page.");
      });

    return () => {
      disposed = true;
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
    };
  }, [action, onError, onVerify]);

  return (
    <div className="min-h-[65px] w-full overflow-hidden rounded-md">
      <div ref={containerRef} className="w-full" />
    </div>
  );
}
