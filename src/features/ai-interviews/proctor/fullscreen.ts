type FsDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
};
type FsElement = HTMLElement & { webkitRequestFullscreen?: () => Promise<void> | void };

export function isFullscreen(): boolean {
  const d = document as FsDocument;
  return Boolean(d.fullscreenElement ?? d.webkitFullscreenElement);
}

/** Must run inside a user gesture (the Start click) — browsers refuse it otherwise. Rejects when blocked. */
export async function enterFullscreen(): Promise<void> {
  if (isFullscreen()) return;
  const el = document.documentElement as FsElement;
  if (el.requestFullscreen) await el.requestFullscreen({ navigationUI: "hide" });
  else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
  else throw new Error("Fullscreen is not supported in this browser.");
  if (!isFullscreen()) throw new Error("The browser did not enter fullscreen.");
}

export async function exitFullscreen(): Promise<void> {
  if (!isFullscreen()) return;
  const d = document as FsDocument;
  try {
    if (document.exitFullscreen) await document.exitFullscreen();
    else await d.webkitExitFullscreen?.();
  } catch {
    /* already out */
  }
}

export function watchFullscreenExit(onExit: () => void): () => void {
  const handler = () => {
    if (!isFullscreen()) onExit();
  };
  document.addEventListener("fullscreenchange", handler);
  document.addEventListener("webkitfullscreenchange", handler);
  return () => {
    document.removeEventListener("fullscreenchange", handler);
    document.removeEventListener("webkitfullscreenchange", handler);
  };
}

export function watchTabHidden(onHidden: () => void): () => void {
  const handler = () => {
    if (document.visibilityState === "hidden") onHidden();
  };
  document.addEventListener("visibilitychange", handler);
  return () => document.removeEventListener("visibilitychange", handler);
}

export function watchPageLeave(onLeave: () => void): () => void {
  window.addEventListener("pagehide", onLeave);
  return () => window.removeEventListener("pagehide", onLeave);
}
