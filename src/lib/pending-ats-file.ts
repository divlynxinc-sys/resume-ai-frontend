/**
 * Hand-off slot for a resume file dropped on the landing-page hero.
 *
 * The hero can't run the checker itself (it lives on /ats-checker), and a
 * File object can't ride along in navigation state or sessionStorage — so the
 * hero stashes it here and navigates, and the checker consumes it on mount.
 * Module state is safe here: both routes live in the same SPA session, and
 * `take` clears the slot so a stale file can never re-trigger a check.
 */
let pendingFile: File | null = null;

export function setPendingAtsFile(file: File): void {
  pendingFile = file;
}

export function takePendingAtsFile(): File | null {
  const file = pendingFile;
  pendingFile = null;
  return file;
}
