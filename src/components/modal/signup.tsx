import { useState, useEffect, useRef, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { ArrowLeft, Eye, EyeOff, Check, X, Mail } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import resumeLogo from "../../assets/resume-ai-logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { authService } from "@/services/auth";

function BrandBar() {
  return (
    <div className="h-16 flex items-center justify-between px-6">
      <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
        <img src={resumeLogo} alt="Jobsynk AI Logo" className="h-8 w-8 rounded-md" />
        <span className="text-white text-xl font-black tracking-tight">Jobsynk AI</span>
      </Link>
      <Link
        to="/"
        className="text-sm font-medium text-white/60 hover:text-white transition-colors flex items-center gap-2"
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
      className="group flex w-full items-center gap-3 rounded-xl border border-[var(--btn-secondary-border)] bg-[var(--btn-secondary-bg)] px-4 py-3 text-sm text-[var(--btn-secondary-text)] hover:bg-[var(--btn-secondary-hover)] transition-all"
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

function PasswordInput({
  label,
  placeholder,
  value,
  onChange,
  disabled,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  disabled: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-white/70 ml-1">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full rounded-xl bg-[var(--btn-secondary-bg)] px-4 py-3 pr-11 text-sm placeholder:text-white/30 outline-none border border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
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
    <div className="space-y-1.5 pl-1">
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
  const [timer, setTimer] = useState(60);
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
    } catch (err: any) {
      setError(err?.response?.data?.detail || err.message || "Verification failed.");
    } finally {
      setStatus("idle");
    }
  };

  const handleResend = async () => {
    setError("");
    setCanResend(false);
    setTimer(60);
    setOtp(["", "", "", "", "", ""]);
    try {
      await authService.signupSendOtp(email);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err.message || "Failed to resend OTP.");
      setCanResend(true);
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="min-h-svh bg-[var(--app-bg)] text-white relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/10 via-[var(--app-bg)] to-[var(--app-bg)]" />
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-500/5 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-purple-500/5 blur-[100px]" />
      </div>

      <div className="relative z-10">
        <BrandBar />

        <main className="max-w-5xl mx-auto px-6 pb-10 flex flex-col items-center justify-center min-h-[calc(100svh-4rem)]">
          <div className="w-full max-w-md">
            <section className="rounded-3xl border border-white/10 bg-[var(--app-surface)] backdrop-blur-xl p-8 md:p-10 shadow-[0_8px_40px_rgba(0,0,0,0.18)]">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="size-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 grid place-items-center">
                  <Mail className="size-8 text-blue-400" />
                </div>
                <h1 className="text-2xl font-bold text-white">Check your email</h1>
                <p className="text-white/60 text-sm leading-relaxed">
                  We've sent a 6-digit verification code to<br />
                  <span className="text-white font-medium">{email}</span>
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
                className="mt-6 w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-3 text-white text-sm font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100"
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
                  className="text-blue-400 hover:text-blue-300 transition-colors disabled:text-white/30 disabled:cursor-not-allowed"
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
  const { showToast } = useToast();

  const handleGoogleSuccess = async (accessToken: string) => {
    setError("");
    setStatus("loading");
    try {
      await googleLogin(accessToken);
      showToast("Account created successfully!");
      navigate("/dashboard");
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err.message || "Google signup failed.";
      showToast(msg, "error");
      setError(msg);
    } finally {
      setStatus("idle");
    }
  };

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState("");
  const [step, setStep] = useState<"form" | "otp" | "completing">("form");

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

    setStatus("loading");
    try {
      await authService.signupSendOtp(email);
      setStep("otp");
    } catch (err: any) {
      setError(err?.response?.data?.detail || err.message || "Failed to send verification code.");
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
      navigate("/dashboard");
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err.message || "Signup failed.";
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
    <div className="min-h-svh bg-[var(--app-bg)] text-white relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/10 via-[var(--app-bg)] to-[var(--app-bg)]" />
         <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-500/5 blur-[120px]" />
         <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-purple-500/5 blur-[100px]" />
      </div>

      <div className="relative z-10">
        <BrandBar />

        <main className="max-w-5xl mx-auto px-6 pb-10 flex flex-col items-center justify-center min-h-[calc(100svh-4rem)]">
          <div className="w-full max-w-4xl">
            <div className="mb-8">
              <div className="text-center space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  Create Your Account
                </h1>
                <p className="text-white/60 text-lg">Get started with our AI-powered resume builder.</p>
              </div>
            </div>

            <section className="rounded-3xl border border-white/10 bg-[var(--app-surface)] backdrop-blur-xl p-8 md:p-10 shadow-[0_8px_40px_rgba(0,0,0,0.18)]">
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_1px_20rem] gap-10">
                {/* Left: Form */}
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-white/70 ml-1">First Name</label>
                      <input
                        type="text"
                        placeholder="Enter your first name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        disabled={status === "loading"}
                        className="w-full rounded-xl bg-[var(--btn-secondary-bg)] px-4 py-3 text-sm placeholder:text-white/30 outline-none border border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-white/70 ml-1">Last Name</label>
                      <input
                        type="text"
                        placeholder="Enter your last name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        disabled={status === "loading"}
                        className="w-full rounded-xl bg-[var(--btn-secondary-bg)] px-4 py-3 text-sm placeholder:text-white/30 outline-none border border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-white/70 ml-1">Email address</label>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={status === "loading"}
                      className="w-full rounded-xl bg-[var(--btn-secondary-bg)] px-4 py-3 text-sm placeholder:text-white/30 outline-none border border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                    />
                  </div>

                  <PasswordInput
                    label="Password"
                    placeholder="Create a password"
                    value={password}
                    onChange={setPassword}
                    disabled={status === "loading"}
                  />

                  <PasswordChecklist password={password} />

                  <PasswordInput
                    label="Confirm Password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    disabled={status === "loading"}
                  />

                  {confirmPassword && password !== confirmPassword && (
                    <div className="flex items-center gap-2 text-xs text-red-400 pl-1">
                      <X className="size-3.5" />
                      <span>Passwords do not match</span>
                    </div>
                  )}

                  {error ? <div className="text-xs text-red-400">{error}</div> : null}

                  <div className="pt-4 flex items-center justify-between gap-4 flex-wrap">
                    <button
                      className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-3 text-white text-sm font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100"
                      onClick={handleSendOtp}
                      disabled={status === "loading"}
                    >
                      {status === "loading" ? "Sending verification code…" : "Create Account"}
                    </button>
                    <Link
                      to="/login"
                      className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors"
                    >
                      Already have an account?
                    </Link>
                  </div>
                </div>

                {/* Divider */}
                <div className="hidden lg:block w-px bg-gradient-to-b from-transparent via-[var(--btn-secondary-border)] to-transparent" />

                {/* Right: Social/SSO */}
                <aside className="flex flex-col justify-center space-y-6">
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
