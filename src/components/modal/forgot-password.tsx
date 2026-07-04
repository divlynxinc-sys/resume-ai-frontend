import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Mail } from "lucide-react";
import lightLogo from "../../assets/Logo-02.png";
import darkLogo from "../../assets/Logo-05.png";
import { useTheme } from "@/contexts/ThemeContext";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function ForgotPasswordScreen() {
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    // Simulate a reset-link request until the password reset API is connected.
    await new Promise((resolve) => setTimeout(resolve, 800));
    setStatus("sent");
  };

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
              Reset your <span className="italic">password</span>
            </h1>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-[var(--app-fg-muted)]">
              Enter the email associated with your account and we’ll send you a secure reset link.
            </p>
          </div>

          <section className="rounded-2xl border border-white/10 bg-[var(--app-surface)] p-6 shadow-[0_8px_40px_rgba(0,0,0,0.18)] backdrop-blur-xl sm:p-7">
            <form onSubmit={handleSubmit} className="space-y-5">
              {status === "sent" && (
                <div className="flex gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
                  <p>
                    If an account exists for <span className="font-medium text-emerald-200">{email}</span>, a reset link has been sent.
                  </p>
                </div>
              )}

              <div className="space-y-2.5">
                <label htmlFor="forgot-password-email" className="ml-1 text-xs font-medium text-white/70">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/40" />
                  <input
                    id="forgot-password-email"
                    name="forgot-password-email"
                    type="email"
                    autoComplete="email"
                    spellCheck={false}
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setError("");
                      if (status === "sent") setStatus("idle");
                    }}
                    placeholder="you@example.com"
                    disabled={status === "loading"}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? "forgot-password-error" : undefined}
                    className="w-full rounded-lg border border-white/10 bg-[var(--btn-secondary-bg)] py-2.5 pl-10 pr-3.5 text-sm outline-none transition-all placeholder:text-white/30 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
                  />
                </div>
                {error && (
                  <p id="forgot-password-error" className="ml-1 text-xs text-red-400">
                    {error}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={status === "loading" || !isValidEmail(email)}
                className="flex h-10 w-full items-center justify-center rounded-lg bg-[var(--btn-primary-bg)] px-5 text-sm font-medium text-white transition-all hover:bg-[var(--btn-primary-hover)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[var(--btn-primary-bg)]"
              >
                {status === "loading" ? "Sending reset link…" : status === "sent" ? "Send another link" : "Send reset link"}
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
          </section>

          <p className="mt-5 text-center text-xs text-[var(--app-fg-muted)]">
            For your security, reset links expire after a short time.
          </p>
        </div>
      </main>
    </div>
  );
}
