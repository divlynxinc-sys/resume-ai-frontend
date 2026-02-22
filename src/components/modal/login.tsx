import { useState } from "react";
import type { ReactNode, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import resumeLogo from "../../assets/resume-ai-logo.png";
import { useAuth } from "@/contexts/AuthContext";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function TopLogo() {
  return (
    <div className="flex flex-col items-center">
      <img src={resumeLogo} alt="Jobsynk AI Logo" className="h-12 w-12 rounded-lg mb-4" />
      <h1 className="text-3xl font-semibold text-white">Log in to your account</h1>
      <p className="mt-2 text-white/60">Welcome back to Jobsynk AI</p>
    </div>
  );
}

function DividerLabel({ children }: { children: ReactNode }) {
  return (
    <div className="relative my-5">
      <div className="h-px bg-white/10" />
      <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-1/2 bg-[var(--app-surface)] px-2 text-xs text-white/60">
        {children}
      </span>
    </div>
  );
}

function SocialButton({ icon, label, iconClass }: { icon: ReactNode; label: string; iconClass?: string }) {
  return (
    <button className="flex items-center justify-center gap-2 w-full h-10 rounded-lg bg-[var(--btn-secondary-bg)] border border-[var(--btn-secondary-border)] text-[var(--btn-secondary-text)] hover:bg-[var(--btn-secondary-hover)]">
      <span className={`text-base ${iconClass ?? ""}`}>{icon}</span>
      <span className="text-sm">{label}</span>
    </button>
  );
}

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");

  const { login, refreshUser } = useAuth();
  const navigate = useNavigate();

  const validateEmailField = (value: string) => {
    if (!value.trim()) return "Email is required.";
    if (!isValidEmail(value)) return "Please enter a valid email address.";
    return "";
  };

  const validatePasswordField = (value: string) => {
    if (!value) return "Password is required.";
    if (value.length < 8) return "Password must be at least 8 characters.";
    return "";
  };

  const onSubmit = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    setError("");
    const eErr = validateEmailField(email);
    const pErr = validatePasswordField(password);
    setEmailError(eErr);
    setPasswordError(pErr);
    if (eErr || pErr) {
      setError("Please fix the errors above.");
      return;
    }
    setStatus("loading");
    try {
      // Temporary dev bypass — remove once DB integration is live
      if (email === "admin@divlynx.com" && password === "Pass@123") {
        localStorage.setItem("accessToken", "dev-bypass-token");
        localStorage.setItem("refreshToken", "dev-bypass-refresh");
        await refreshUser();
        const firstShown = localStorage.getItem("firstLoginShown");
        navigate(firstShown ? "/dashboard" : "/onboarding");
        return;
      }
      await login(email, password);
      const firstShown = localStorage.getItem("firstLoginShown");
      navigate(firstShown ? "/dashboard" : "/onboarding");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setStatus("idle");
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[var(--app-bg)] text-white flex items-center justify-center px-4 overflow-hidden">
      <div className="w-full max-w-md">
        <TopLogo />

        <div className="relative mt-6">
          {/* Soft glow */}
          <div className="absolute -inset-8 rounded-[32px] bg-gradient-to-b from-blue-500/10 to-indigo-600/10 blur-2xl" aria-hidden />

          <div className="relative rounded-2xl border border-white/10 bg-[var(--app-surface)] backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.18)]">
            <form onSubmit={onSubmit} className="p-6 sm:p-8">
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  const v = e.target.value;
                  setEmail(v);
                  if (emailError) setEmailError(validateEmailField(v));
                }}
                onBlur={() => setEmailError(validateEmailField(email))}
                placeholder="Email address"
                autoComplete="email"
                required
                aria-invalid={!!emailError}
                aria-describedby={emailError ? "email-error" : undefined}
                className={`w-full rounded-lg border bg-[var(--btn-secondary-bg)] px-4 py-3 text-sm outline-none placeholder:text-white/40 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 ${emailError ? "border-red-400 focus:border-red-400" : "border-white/15"}`}
                disabled={status === "loading"}
              />
              {emailError ? (
                <p id="email-error" className="mt-1 text-xs text-red-400">{emailError}</p>
              ) : null}

              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  const v = e.target.value;
                  setPassword(v);
                  if (passwordError) setPasswordError(validatePasswordField(v));
                }}
                onBlur={() => setPasswordError(validatePasswordField(password))}
                placeholder="Password"
                autoComplete="current-password"
                required
                minLength={8}
                aria-invalid={!!passwordError}
                aria-describedby={passwordError ? "password-error" : undefined}
                className={`mt-3 w-full rounded-lg border bg-[var(--btn-secondary-bg)] px-4 py-3 text-sm outline-none placeholder:text-white/40 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 ${passwordError ? "border-red-400 focus:border-red-400" : "border-white/15"}`}
                disabled={status === "loading"}
              />
              {passwordError ? (
                <p id="password-error" className="mt-1 text-xs text-red-400">{passwordError}</p>
              ) : null}

              <div className="mt-2 text-right">
                <Link to="/forgot-password" className="text-xs text-blue-400 hover:text-blue-300">Forgot your password?</Link>
              </div>

              {error ? <div className="mt-2 text-xs text-red-400">{error}</div> : null}

              <button
                type="submit"
                onClick={() => onSubmit()}
                disabled={
                  status === "loading" ||
                  !!validateEmailField(email) ||
                  !!validatePasswordField(password)
                }
                className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600"
              >
                {status === "loading" ? "Logging in…" : "Log in"}
              </button>

              <DividerLabel>Or continue with</DividerLabel>

              <div className="grid grid-cols-1 gap-3">
                <SocialButton icon={<FcGoogle />} label="Sign in with Google" iconClass="text-xl" />
              </div>

              <div className="mt-5 text-center text-xs text-white/60">
                Don't have an account?{' '}
                <Link to="/signup" className="text-blue-400 hover:text-blue-300">Sign up</Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Decorative resume ghosts background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* top-left resume */}
        <div className="absolute -left-16 top-24 w-64 h-40 rotate-[-6deg] rounded-2xl border border-white/10 bg-white/[0.05] shadow-[0_30px_60px_rgba(0,0,0,0.35)]">
          <div className="m-4 space-y-2">
            <div className="h-3 w-24 rounded bg-white/20" />
            <div className="h-2 w-40 rounded bg-white/12" />
            <div className="h-2 w-36 rounded bg-white/12" />
            <div className="h-16 rounded bg-white/8" />
          </div>
        </div>
        {/* top-right resume */}
        <div className="absolute -right-20 top-36 w-72 h-44 rotate-[7deg] rounded-2xl border border-white/10 bg-white/[0.05] shadow-[0_30px_60px_rgba(0,0,0,0.35)]">
          <div className="m-4 space-y-2">
            <div className="h-3 w-32 rounded bg-white/20" />
            <div className="h-2 w-44 rounded bg-white/12" />
            <div className="h-2 w-40 rounded bg-white/12" />
            <div className="h-16 rounded bg-white/8" />
          </div>
        </div>
        {/* bottom-left resume */}
        <div className="absolute left-16 bottom-24 w-60 h-40 rotate-[4deg] rounded-2xl border border-white/10 bg-white/[0.05] shadow-[0_30px_60px_rgba(0,0,0,0.35)]">
          <div className="m-4 space-y-2">
            <div className="h-3 w-28 rounded bg-white/20" />
            <div className="h-2 w-36 rounded bg-white/12" />
            <div className="h-2 w-32 rounded bg-white/12" />
            <div className="h-16 rounded bg-white/8" />
          </div>
        </div>
        {/* bottom-right resume */}
        <div className="absolute right-24 bottom-12 w-64 h-40 rotate-[-8deg] rounded-2xl border border-white/10 bg-white/[0.05] shadow-[0_30px_60px_rgba(0,0,0,0.35)]">
          <div className="m-4 space-y-2">
            <div className="h-3 w-24 rounded bg-white/20" />
            <div className="h-2 w-40 rounded bg-white/12" />
            <div className="h-2 w-36 rounded bg-white/12" />
            <div className="h-16 rounded bg-white/8" />
          </div>
        </div>
      </div>
    </div>
  );
}
