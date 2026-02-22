import { useState } from "react";
import type { FormEvent } from "react";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle");
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    setError("");
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setStatus("loading");
    // Simulate request to send reset link
    await new Promise((res) => setTimeout(res, 800));
    setStatus("sent");
  };

  return (
    <div className="min-h-screen w-full bg-[var(--app-bg)] text-white flex items-center justify-center px-4">
      <div className="relative">
        {/* Soft glow */}
        <div className="absolute -inset-8 rounded-[32px] bg-gradient-to-b from-blue-500/10 to-indigo-600/10 blur-2xl" aria-hidden />

        <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0F1629]/80 backdrop-blur-xl shadow-xl">
          <form onSubmit={handleSubmit} className="p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-2">Forgot Password</h1>
            <p className="text-sm text-white/60 mb-6">No problem. We’ll send you a reset link.</p>

            {status === "sent" ? (
              <div className="mb-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
                If an account exists for <span className="font-medium text-emerald-200">{email}</span>, a reset link has been sent.
              </div>
            ) : null}

            <label htmlFor="email" className="sr-only">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full rounded-lg border border-white/15 bg-[#0C1426] px-4 py-3 text-sm outline-none ring-0 placeholder:text-white/40 focus:border-white/25"
              disabled={status === "loading"}
            />

            {error ? (
              <div className="mt-2 text-xs text-red-400">{error}</div>
            ) : null}

            <button
              type="submit"
              onClick={() => handleSubmit()}
              disabled={status === "loading" || !isValidEmail(email)}
              className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600"
            >
              {status === "loading" ? "Sending…" : "Send Reset Link"}
            </button>

            <div className="mt-4 text-center text-xs text-white/60">
              Remember your password?{' '}
              <a href="#" className="text-blue-400 hover:text-blue-300 underline-offset-2 hover:underline">Return to Login</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}