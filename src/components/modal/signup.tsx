import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { ArrowLeft, Eye, EyeOff, Check, X, Mail } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import lightLogo from "../../assets/Logo-01.png";
import lightBrandIcon from "../../assets/Logo-03.png";
import darkLogo from "../../assets/Logo-04.png";
import darkBrandIcon from "../../assets/Logo-06.png";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/contexts/ToastContext";
import { authService } from "@/services/auth";
import { getSafeRedirectPath, withNextParam } from "@/lib/navigation";
import { TurnstileWidget } from "@/components/auth/TurnstileWidget";

function BrandBar() {
  const { theme } = useTheme();

  return (
    <div className="h-16 flex items-center justify-between px-6">
      <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
        <img
          src={theme === "dark" ? darkBrandIcon : lightBrandIcon}
          alt=""
          className="pointer-events-none size-8 shrink-0 object-contain select-none"
        />
        <span className="relative h-7 w-[8.75rem] shrink-0 overflow-hidden" aria-hidden="true">
          <img
            src={theme === "dark" ? darkLogo : lightLogo}
            alt=""
            className="pointer-events-none absolute -left-[0.2rem] -top-[3.54rem] w-[8.86rem] max-w-none select-none"
          />
        </span>
      </Link>
      <Link
        to="/"
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-[var(--btn-secondary-border)] bg-[var(--btn-secondary-bg)] px-4 text-sm font-medium text-[var(--btn-secondary-text)] shadow-sm transition-colors hover:bg-[var(--btn-secondary-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/35"
      >
        <ArrowLeft className="size-4" />
        Back to Home
      </Link>
    </div>
  );
}

function GoogleSignupButton({ onSuccess, onError, disabled }: { onSuccess: (token: string) => void; onError: () => void; disabled: boolean }) {
  const googleSignup = useGoogleLogin({
    onSuccess: (tokenResponse) => onSuccess(tokenResponse.access_token),
    onError: () => onError(),
  });

  return (
    <button
      type="button"
      onClick={() => googleSignup()}
      disabled={disabled}
      className="group flex w-full items-center justify-center gap-3 rounded-lg border border-[var(--btn-secondary-border)] bg-[var(--btn-secondary-bg)] px-4 py-2.5 text-sm text-[var(--btn-secondary-text)] hover:bg-[var(--btn-secondary-hover)] transition-all"
    >
      <div className="size-5 grid place-items-center transition-transform group-hover:scale-110 text-xl"><FcGoogle /></div>
      <span className="font-medium">Sign up with Google</span>
    </button>
  );
}

const passwordRules = [
  { key: "length", label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { key: "uppercase", label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { key: "lowercase", label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { key: "number", label: "One number", test: (p: string) => /\d/.test(p) },
  { key: "special", label: "One special character (!@#$...)", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

const OTP_COOLDOWN_SECONDS = 5 * 60;

function getErrorMessage(err: unknown, fallback: string) {
  if (typeof err !== "object" || err === null) return fallback;

  const response = "response" in err
    ? (err as { response?: { data?: { detail?: unknown } } }).response
    : undefined;
  if (typeof response?.data?.detail === "string") return response.data.detail;

  const message = "message" in err ? (err as { message?: unknown }).message : undefined;
  return typeof message === "string" ? message : fallback;
}

function PasswordInput({
  label,
  placeholder,
  value,
  onChange,
  disabled,
  readOnly,
  onFocus,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  disabled: boolean;
  readOnly?: boolean;
  onFocus?: () => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-2.5">
      <label className="text-xs font-medium text-white/70 ml-1">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          name={`signup-${label.toLowerCase().replace(/\s+/g, "-")}`}
          autoComplete="new-password"
          spellCheck={false}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          readOnly={readOnly}
          disabled={disabled}
          className="signup-password-input w-full rounded-lg bg-[var(--btn-secondary-bg)] px-3.5 py-2.5 pr-10 text-sm placeholder:text-white/30 outline-none border border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </div>
  );
}

function PasswordChecklist({ password }: { password: string }) {
  if (!password) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 pl-1">
      {passwordRules.map((rule) => {
        const passed = rule.test(password);
        return (
          <div key={rule.key} className="flex items-center gap-2 text-xs">
            {passed ? (
              <Check className="size-3.5 text-green-400" />
            ) : (
              <X className="size-3.5 text-white/30" />
            )}
            <span className={passed ? "text-green-400" : "text-white/40"}>
              {rule.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function OtpVerification({
  email,
  onVerified,
  onBack,
}: {
  email: string;
  onVerified: () => void;
  onBack: () => void;
}) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "verifying">("idle");
  const [timer, setTimer] = useState(OTP_COOLDOWN_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = [...otp];
    for (let i = 0; i < 6; i++) {
      next[i] = pasted[i] || "";
    }
    setOtp(next);
    const focusIdx = Math.min(pasted.length, 5);
    inputRefs.current[focusIdx]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      setError("Please enter the full 6-digit code.");
      return;
    }
    setError("");
    setStatus("verifying");
    try {
      await authService.signupVerifyOtp(email, code);
      onVerified();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Verification failed."));
    } finally {
      setStatus("idle");
    }
  };

  const handleResend = async () => {
    setError("");
    setCanResend(false);
    setTimer(OTP_COOLDOWN_SECONDS);
    setOtp(["", "", "", "", "", ""]);
    try {
      await authService.signupSendOtp(email);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to resend OTP."));
      setCanResend(true);
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="min-h-svh bg-[var(--app-bg)] text-[var(--app-fg)] relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 size-96 rounded-full bg-[var(--pastel-lavender)] blur-3xl opacity-50" />
        <div className="absolute -bottom-32 -right-32 size-96 rounded-full bg-[var(--pastel-peach)] blur-3xl opacity-40" />
      </div>

      <div className="relative z-10">
        <BrandBar />

        <main className="max-w-5xl mx-auto px-6 pb-10 flex flex-col items-center justify-center min-h-[calc(100svh-4rem)]">
          <div className="w-full max-w-md">
            <section className="rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)] p-8 md:p-10 shadow-[var(--shadow-pop)]">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="size-16 rounded-2xl bg-[var(--accent-soft)] grid place-items-center">
                  <Mail className="size-8 text-[var(--accent-text)]" />
                </div>
                <h1 className="font-display text-2xl md:text-3xl font-light text-[var(--app-fg)] tracking-tight">Check your <span className="italic">email</span></h1>
                <p className="text-[var(--app-fg-muted)] text-sm leading-relaxed">
                  We've sent a 6-digit verification code to<br />
                  <span className="text-[var(--app-fg)] font-medium">{email}</span>
                </p>
              </div>

              <div className="mt-8 flex justify-center gap-2" onPaste={handlePaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    disabled={status === "verifying"}
                    className="w-12 h-14 rounded-xl bg-[var(--btn-secondary-bg)] text-center text-xl font-bold outline-none border border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                  />
                ))}
              </div>

              <div className="mt-4 text-center">
                {timer > 0 ? (
                  <p className="text-xs text-white/40">
                    Code expires in <span className="text-white/70 font-medium">{formatTime(timer)}</span>
                  </p>
                ) : (
                  <p className="text-xs text-red-400">Code expired</p>
                )}
              </div>

              {error && <div className="mt-3 text-xs text-red-400 text-center">{error}</div>}

              <button
                onClick={handleVerify}
                disabled={status === "verifying" || otp.join("").length !== 6}
                className="mt-6 w-full rounded-xl bg-[var(--accent)] px-6 py-3 text-white text-sm font-medium hover:bg-[var(--accent-hover)] active:scale-[0.99] transition-all disabled:opacity-50 disabled:hover:bg-[var(--accent)]"
              >
                {status === "verifying" ? "Verifying…" : "Verify Email"}
              </button>

              <div className="mt-4 flex items-center justify-between text-xs">
                <button
                  onClick={onBack}
                  className="text-white/50 hover:text-white transition-colors flex items-center gap-1"
                >
                  <ArrowLeft className="size-3" /> Back
                </button>
                <button
                  onClick={handleResend}
                  disabled={!canResend}
                  className="text-[var(--accent-text)] hover:text-[var(--accent-hover)] transition-colors disabled:text-white/30 disabled:cursor-not-allowed"
                >
                  Resend code
                </button>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function Signup() {
  const { signup, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const requestedNextPath = getSafeRedirectPath(searchParams.get("next"), "");
  const authSuccessPath = requestedNextPath || "/dashboard";

  const handleGoogleSuccess = async (accessToken: string) => {
    setError("");
    if (!turnstileToken) {
      setError("Please complete the security verification.");
      return;
    }
    setStatus("loading");
    try {
      const { is_new_user } = await googleLogin(accessToken, turnstileToken);
      showToast(is_new_user ? "Account created successfully!" : "Logged in successfully!");
      navigate(authSuccessPath);
    } catch (err: unknown) {
      const msg = getErrorMessage(err, "Google signup failed.");
      showToast(msg, "error");
      setError(msg);
      setTurnstileToken(null);
      setTurnstileKey((key) => key + 1);
    } finally {
      setStatus("idle");
    }
  };

  const [firstName, setFirstName] = useState("Alex");
  const [lastName, setLastName] = useState("Morgan");
  const [email, setEmail] = useState("alex.morgan@example.com");
  const [password, setPassword] = useState("Demo@1234");
  const [confirmPassword, setConfirmPassword] = useState("Demo@1234");
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState("");
  const [step, setStep] = useState<"form" | "otp" | "completing">("form");
  const [credentialFieldsUnlocked, setCredentialFieldsUnlocked] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileKey, setTurnstileKey] = useState(0);

  const allPasswordRulesPassed = passwordRules.every((r) => r.test(password));
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSendOtp = async () => {
    setError("");
    if (!firstName.trim()) { setError("First name is required."); return; }
    if (!lastName.trim()) { setError("Last name is required."); return; }
    if (!email.trim()) { setError("Email is required."); return; }
    if (!emailRegex.test(email)) { setError("Please enter a valid email address."); return; }
    if (!password) { setError("Password is required."); return; }
    if (!allPasswordRulesPassed) { setError("Password does not meet all requirements."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    if (!turnstileToken) { setError("Please complete the security verification."); return; }

    setStatus("loading");
    try {
      await authService.signupSendOtp(email, turnstileToken);
      setStep("otp");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to send verification code."));
      setTurnstileToken(null);
      setTurnstileKey((key) => key + 1);
    } finally {
      setStatus("idle");
    }
  };

  const handleOtpVerified = async () => {
    setStep("completing");
    setError("");
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      await signup(fullName, email, password);
      showToast("Account created successfully!");
      navigate(authSuccessPath);
    } catch (err: unknown) {
      const msg = getErrorMessage(err, "Signup failed.");
      showToast(msg, "error");
      setError(msg);
      setStep("form");
    }
  };

  if (step === "otp") {
    return (
      <OtpVerification
        email={email}
        onVerified={handleOtpVerified}
        onBack={() => setStep("form")}
      />
    );
  }

  if (step === "completing") {
    return (
      <div className="min-h-svh bg-[var(--app-bg)] text-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="size-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white/60 text-sm">Creating your account…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-svh bg-[var(--app-bg)] text-[var(--app-fg)] relative overflow-hidden">
      {/* Soft pastel ambient */}
      <div className="absolute inset-0 z-0 pointer-events-none">
         <div className="absolute -top-32 -left-32 size-96 rounded-full bg-[var(--pastel-lavender)] blur-3xl opacity-50" />
         <div className="absolute -top-20 -right-32 size-96 rounded-full bg-[var(--pastel-peach)] blur-3xl opacity-40" />
         <div className="absolute -bottom-32 left-1/3 size-96 rounded-full bg-[var(--pastel-mint)] blur-3xl opacity-40" />
      </div>

      <div className="relative z-10">
        <BrandBar />

        <main className="max-w-4xl mx-auto px-6 pb-8 flex flex-col items-center justify-center min-h-[calc(100svh-4rem)]">
          <div className="w-full max-w-3xl">
            <div className="mb-6">
              <div className="text-center space-y-2">
                <h1 className="font-display text-3xl md:text-4xl font-light text-[var(--app-fg)] tracking-tight">
                  Create your <span className="italic">account</span>
                </h1>
                <p className="text-[var(--app-fg-muted)] text-sm">Build a polished, job-ready resume in minutes.</p>
              </div>
            </div>

            <section className="rounded-2xl border border-white/10 bg-[var(--app-surface)] backdrop-blur-xl p-6 md:p-7 shadow-[0_8px_40px_rgba(0,0,0,0.18)]">
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_1px_17rem] gap-7 lg:gap-8">
                {/* Left: Form */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2.5">
                      <label className="text-xs font-medium text-white/70 ml-1">First Name</label>
                      <input
                        type="text"
                        name="signup-first-name"
                        autoComplete="given-name"
                        placeholder="Enter your first name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        disabled={status === "loading"}
                        className="w-full rounded-lg bg-[var(--btn-secondary-bg)] px-3.5 py-2.5 text-sm placeholder:text-white/30 outline-none border border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                    <div className="space-y-2.5">
                      <label className="text-xs font-medium text-white/70 ml-1">Last Name</label>
                      <input
                        type="text"
                        name="signup-last-name"
                        autoComplete="family-name"
                        placeholder="Enter your last name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        disabled={status === "loading"}
                        className="w-full rounded-lg bg-[var(--btn-secondary-bg)] px-3.5 py-2.5 text-sm placeholder:text-white/30 outline-none border border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <label className="text-xs font-medium text-white/70 ml-1">Email address</label>
                    <input
                      type="email"
                      name="signup-email-address"
                      autoComplete="off"
                      spellCheck={false}
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setCredentialFieldsUnlocked(true)}
                      readOnly={!credentialFieldsUnlocked}
                      disabled={status === "loading" || !turnstileToken}
                      className="w-full rounded-lg bg-[var(--btn-secondary-bg)] px-3.5 py-2.5 text-sm placeholder:text-white/30 outline-none border border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                    />
                  </div>

                  <PasswordInput
                    label="Password"
                    placeholder="Create a password"
                    value={password}
                    onChange={setPassword}
                    onFocus={() => setCredentialFieldsUnlocked(true)}
                    readOnly={!credentialFieldsUnlocked}
                    disabled={status === "loading"}
                  />

                  <PasswordChecklist password={password} />

                  <PasswordInput
                    label="Confirm Password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    onFocus={() => setCredentialFieldsUnlocked(true)}
                    readOnly={!credentialFieldsUnlocked}
                    disabled={status === "loading"}
                  />

                  {confirmPassword && password !== confirmPassword && (
                    <div className="flex items-center gap-2 text-xs text-red-400 pl-1">
                      <X className="size-3.5" />
                      <span>Passwords do not match</span>
                    </div>
                  )}

                  <TurnstileWidget
                    key={turnstileKey}
                    action="signup"
                    onVerify={setTurnstileToken}
                    onError={setError}
                  />

                  {error ? <div className="text-xs text-red-400">{error}</div> : null}

                  <div className="pt-2 flex items-center justify-between gap-4 flex-wrap">
                    <button
                      className="h-9 shrink-0 rounded-lg bg-[var(--btn-primary-bg)] px-5 text-sm font-medium text-white transition-all hover:bg-[var(--btn-primary-hover)] active:scale-[0.99] disabled:opacity-50 disabled:hover:bg-[var(--btn-primary-bg)]"
                      onClick={handleSendOtp}
                      disabled={status === "loading" || !turnstileToken}
                    >
                      {status === "loading" ? "Sending verification code…" : "Create Account"}
                    </button>
                    <Link
                      to={requestedNextPath ? withNextParam("/login", requestedNextPath) : "/login"}
                      className="px-4 py-2 text-sm text-blue-400 underline decoration-blue-400/60 underline-offset-4 transition-colors hover:text-blue-300"
                    >
                      Already have an account?
                    </Link>
                  </div>
                </div>

                {/* Divider */}
                <div className="hidden lg:block w-px bg-gradient-to-b from-transparent via-[var(--btn-secondary-border)] to-transparent" />

                {/* Right: Social/SSO */}
                <aside className="flex flex-col justify-start space-y-4 pt-1 lg:pt-6">
                  <div className="text-center lg:text-left">
                    <div className="text-sm font-medium text-white/90">Or sign up with</div>
                    <div className="text-xs text-white/50 mt-1">Quick access with your existing accounts</div>
                  </div>
                  <div className="space-y-3">
                    <GoogleSignupButton
                      onSuccess={handleGoogleSuccess}
                      onError={() => setError("Google signup failed")}
                      disabled={status === "loading"}
                    />
                  </div>
                  <div className="text-xs text-white/30 text-center px-4 leading-relaxed">
                    By clicking continue, you agree to our <Link to="/terms" className="underline hover:text-white/50">Terms of Service</Link> and <a href="#" className="underline hover:text-white/50">Privacy Policy</a>.
                  </div>
                </aside>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
