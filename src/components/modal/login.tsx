import { useState } from "react";
import type { ReactNode, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { Eye, EyeOff } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import resumeLogo from "../../assets/resume-ai-logo.png";
import { useAuth } from "@/contexts/AuthContext";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function TopLogo() {
  return (
    <div className="flex flex-col items-center">
      <img src={resumeLogo} alt="Jobsynk AI Logo" className="h-11 w-11 rounded-lg mb-4" />
      <h1 className="text-2xl md:text-3xl font-semibold text-white">Log in to your account</h1>
      <p className="mt-2 text-sm text-white/60">Welcome back to Jobsynk AI</p>
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

function getErrorMessage(err: unknown, fallback: string) {
  if (typeof err !== "object" || err === null) return fallback;
  const message = "message" in err ? (err as { message?: unknown }).message : undefined;
  return typeof message === "string" ? message : fallback;
}

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [credentialFieldsUnlocked, setCredentialFieldsUnlocked] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");

  const { login, googleLogin, refreshUser } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError("");
      setStatus("loading");
      try {
        await googleLogin(tokenResponse.access_token);
        const firstShown = localStorage.getItem("firstLoginShown");
        navigate(firstShown ? "/dashboard" : "/onboarding");
      } catch (err: unknown) {
        setError(getErrorMessage(err, "Google login failed"));
      } finally {
        setStatus("idle");
      }
    },
    onError: () => setError("Google login failed"),
  });

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
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Login failed."));
    } finally {
      setStatus("idle");
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[var(--app-bg)] text-white flex items-center justify-center px-4 py-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.10),transparent_34rem)]" aria-hidden />

      <div className="relative z-10 w-full max-w-md">
        <TopLogo />

        <div className="relative mt-6">
          <div className="relative rounded-2xl border border-white/10 bg-[var(--app-surface)] shadow-[0_8px_40px_rgba(0,0,0,0.18)]">
            <form onSubmit={onSubmit} className="p-6 sm:p-7">
              <label htmlFor="email" className="ml-1 text-xs font-medium text-white/70">Email address</label>
              <input
                id="email"
                type="email"
                name="login-email-address"
                value={email}
                onChange={(e) => {
                  const v = e.target.value;
                  setEmail(v);
                  if (emailError) setEmailError(validateEmailField(v));
                }}
                onBlur={() => setEmailError(validateEmailField(email))}
                placeholder="Email address"
                autoComplete="off"
                spellCheck={false}
                readOnly={!credentialFieldsUnlocked}
                onFocus={() => setCredentialFieldsUnlocked(true)}
                required
                aria-invalid={!!emailError}
                aria-describedby={emailError ? "email-error" : undefined}
                className={`mt-2.5 w-full rounded-lg border bg-[var(--btn-secondary-bg)] px-3.5 py-2.5 text-sm outline-none placeholder:text-white/40 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 ${emailError ? "border-red-400 focus:border-red-400" : "border-white/15"}`}
                disabled={status === "loading"}
              />
              {emailError ? (
                <p id="email-error" className="mt-1.5 text-xs text-red-400">{emailError}</p>
              ) : null}

              <div className="mt-4">
                <label htmlFor="password" className="ml-1 text-xs font-medium text-white/70">Password</label>
                <div className="relative mt-2.5">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="login-password"
                    value={password}
                    onChange={(e) => {
                      const v = e.target.value;
                      setPassword(v);
                      if (passwordError) setPasswordError(validatePasswordField(v));
                    }}
                    onBlur={() => setPasswordError(validatePasswordField(password))}
                    placeholder="Password"
                    autoComplete="new-password"
                    spellCheck={false}
                    readOnly={!credentialFieldsUnlocked}
                    onFocus={() => setCredentialFieldsUnlocked(true)}
                    required
                    minLength={8}
                    aria-invalid={!!passwordError}
                    aria-describedby={passwordError ? "password-error" : undefined}
                    className={`login-password-input w-full rounded-lg border bg-[var(--btn-secondary-bg)] px-3.5 py-2.5 pr-10 text-sm outline-none placeholder:text-white/40 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 ${passwordError ? "border-red-400 focus:border-red-400" : "border-white/15"}`}
                    disabled={status === "loading"}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/75 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
              {passwordError ? (
                <p id="password-error" className="mt-1.5 text-xs text-red-400">{passwordError}</p>
              ) : null}

              <div className="mt-3 text-right">
                <Link to="/forgot-password" className="text-xs text-blue-400 hover:text-blue-300">Forgot your password?</Link>
              </div>

              {error ? <div className="mt-2 text-xs text-red-400">{error}</div> : null}

              <button
                type="submit"
                disabled={
                  status === "loading" ||
                  !!validateEmailField(email) ||
                  !!validatePasswordField(password)
                }
                className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
              >
                {status === "loading" ? "Logging in…" : "Log in"}
              </button>

              <DividerLabel>Or continue with</DividerLabel>

              <div className="grid grid-cols-1 gap-3">
                <button
                  type="button"
                  onClick={() => handleGoogleLogin()}
                  disabled={status === "loading"}
                  className="flex items-center justify-center gap-2 w-full h-10 rounded-lg bg-[var(--btn-secondary-bg)] border border-[var(--btn-secondary-border)] text-[var(--btn-secondary-text)] hover:bg-[var(--btn-secondary-hover)] transition-colors"
                >
                  <span className="text-xl"><FcGoogle /></span>
                  <span className="text-sm">Sign in with Google</span>
                </button>
              </div>

              <div className="mt-5 text-center text-xs text-white/60">
                Don't have an account?{' '}
                <Link to="/signup" className="text-blue-400 hover:text-blue-300">Sign up</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
