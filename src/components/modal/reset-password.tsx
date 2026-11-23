import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Lock, XCircle } from "lucide-react";
import lightLogo from "../../assets/Logo-02.png";
import darkLogo from "../../assets/Logo-05.png";
import { useTheme } from "@/contexts/ThemeContext";
import { authService } from "@/services/auth";

// Same error for a missing, malformed, expired or already-used token -- never
// reveal which case it is, same reasoning as the backend's identical
// forgot-password response.
const GENERIC_LINK_ERROR = "This link is invalid or has expired. Request a new one.";

export default function ResetPasswordScreen() {
  const { theme } = useTheme();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState<string | null>(null);
  const [linkChecked, setLinkChecked] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState("");

  // Read the token once, then strip it from the URL so it doesn't linger in
  // the address bar, browser history, or get accidentally shared via a
  // screenshot/copied link after the page has loaded.
  useEffect(() => {
    const raw = searchParams.get("token");
    setToken(raw);
    setLinkChecked(true);
    if (raw) {
      window.history.replaceState({}, "", window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validate = () => {
    if (newPassword.length < 8 || newPassword.length > 128) {
      return "Password must be between 8 and 128 characters.";
    }
    if (newPassword !== confirmPassword) {
      return "Passwords do not match.";
    }
    return "";
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!token) {
      setError(GENERIC_LINK_ERROR);
      return;
    }
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setStatus("loading");
    try {
      await authService.resetPassword(token, newPassword);
      setStatus("done");
    } catch {
      setError(GENERIC_LINK_ERROR);
      setStatus("idle");
    }
  };

  const showMissingTokenError = linkChecked && !token;

  return (
    <div className="relative min-h-svh overflow-hidden bg-[var(--app-bg)] text-[var(--app-fg)]">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -left-32 -top-32 size-96 rounded-full bg-[var(--pastel-lavender)] opacity-50 blur-3xl" />
        <div className="absolute -right-32 -top-20 size-96 rounded-full bg-[var(--pastel-peach)] opacity-40 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 size-96 rounded-full bg-[var(--pastel-mint)] opacity-40 blur-3xl" />
      </div>

      <main className="relative z-10 flex min-h-svh items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <div className="mb-6 flex flex-col items-center text-center">
            <Link
              to="/"
              aria-label="Jobsynk AI — go to home"
              className="rounded-lg transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60"
            >
              <span className="relative block h-[5.25rem] w-44 overflow-hidden" aria-hidden="true">
                <img
                  src={theme === "dark" ? darkLogo : lightLogo}
                  alt=""
                  className="pointer-events-none absolute -left-1 -top-12 w-[11.25rem] max-w-none select-none"
                />
              </span>
            </Link>

            <h1 className="mt-4 font-display text-3xl font-light tracking-tight text-[var(--app-fg)] sm:text-4xl">
              Choose a new <span className="italic">password</span>
            </h1>
          </div>

          <section className="rounded-2xl border border-white/10 bg-[var(--app-surface)] p-6 shadow-[0_8px_40px_rgba(0,0,0,0.18)] backdrop-blur-xl sm:p-7">
            {status === "done" ? (
              <div className="space-y-5 text-center">
                <div className="flex items-center justify-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
                  <CheckCircle2 className="size-5 shrink-0" />
                  <p>Your password has been reset. All other sessions have been signed out.</p>
                </div>
                <Link
                  to="/login"
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[var(--btn-primary-bg)] px-5 text-sm font-medium text-white transition-all hover:bg-[var(--btn-primary-hover)]"
                >
                  Go to Login
                </Link>
              </div>
            ) : showMissingTokenError ? (
              <div className="space-y-5 text-center">
                <div className="flex items-center justify-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                  <XCircle className="size-5 shrink-0" />
                  <p>{GENERIC_LINK_ERROR}</p>
                </div>
                <Link
                  to="/forgot-password"
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[var(--btn-primary-bg)] px-5 text-sm font-medium text-white transition-all hover:bg-[var(--btn-primary-hover)]"
                >
                  Request a new link
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2.5">
                  <label htmlFor="reset-new-password" className="ml-1 text-xs font-medium text-white/70">
                    New password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/40" />
                    <input
                      id="reset-new-password"
                      name="new-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(event) => {
                        setNewPassword(event.target.value);
                        setError("");
                      }}
                      placeholder="At least 8 characters"
                      disabled={status === "loading"}
                      className="w-full rounded-lg border border-white/10 bg-[var(--btn-secondary-bg)] py-2.5 pl-10 pr-10 text-sm outline-none transition-all placeholder:text-white/30 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label htmlFor="reset-confirm-password" className="ml-1 text-xs font-medium text-white/70">
                    Confirm new password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/40" />
                    <input
                      id="reset-confirm-password"
                      name="confirm-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(event) => {
                        setConfirmPassword(event.target.value);
                        setError("");
                      }}
                      placeholder="Re-enter your new password"
                      disabled={status === "loading"}
                      className="w-full rounded-lg border border-white/10 bg-[var(--btn-secondary-bg)] py-2.5 pl-10 pr-3.5 text-sm outline-none transition-all placeholder:text-white/30 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                {error && (
                  <p className="ml-1 text-xs text-red-400">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={status === "loading" || !newPassword || !confirmPassword}
                  className="flex h-10 w-full items-center justify-center rounded-lg bg-[var(--btn-primary-bg)] px-5 text-sm font-medium text-white transition-all hover:bg-[var(--btn-primary-hover)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[var(--btn-primary-bg)]"
                >
                  {status === "loading" ? "Resetting…" : "Reset password"}
                </button>

                <div className="border-t border-white/10 pt-5 text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-sm text-blue-400 underline decoration-blue-400/60 underline-offset-4 transition-colors hover:text-blue-300"
                  >
                    <ArrowLeft className="size-4" />
                    Return to Login
                  </Link>
                </div>
              </form>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
