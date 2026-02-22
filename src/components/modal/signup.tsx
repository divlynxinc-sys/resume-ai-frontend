import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { ArrowLeft } from "lucide-react";
import resumeLogo from "../../assets/resume-ai-logo.png";
import { useAuth } from "@/contexts/AuthContext";

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

function SocialButton({
  icon,
  label,
  iconClass,
}: {
  icon: ReactNode;
  label: string;
  iconClass?: string;
}) {
  return (
    <button className="group flex w-full items-center gap-3 rounded-xl border border-[var(--btn-secondary-border)] bg-[var(--btn-secondary-bg)] px-4 py-3 text-sm text-[var(--btn-secondary-text)] hover:bg-[var(--btn-secondary-hover)] transition-all">
      <div className={`size-5 grid place-items-center transition-transform group-hover:scale-110 ${iconClass ?? "text-white/70"}`}>{icon}</div>
      <span className="font-medium">{label}</span>
    </button>
  );
}

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState<string>("");

  const handleSignup = async () => {
    setError("");
    if (!name.trim()) { setError("Name is required."); return; }
    if (!email.trim()) { setError("Email is required."); return; }
    if (!password) { setError("Password is required."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }

    setStatus("loading");
    try {
      await signup(name, email, password);
      navigate("/login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setStatus("idle");
    }
  };

  return (
    <div className="min-h-svh bg-[var(--app-bg)] text-white relative overflow-hidden">
      {/* Enhanced Background */}
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
                      <label className="text-xs font-medium text-white/70 ml-1">Name</label>
                      <input
                        type="text"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={status === "loading"}
                        className="w-full rounded-xl bg-[var(--btn-secondary-bg)] px-4 py-3 text-sm placeholder:text-white/30 outline-none border border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                      />
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
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-white/70 ml-1">Password</label>
                    <input
                      type="password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={status === "loading"}
                      className="w-full rounded-xl bg-[var(--btn-secondary-bg)] px-4 py-3 text-sm placeholder:text-white/30 outline-none border border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-white/70 ml-1">Confirm Password</label>
                    <input
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={status === "loading"}
                      className="w-full rounded-xl bg-[var(--btn-secondary-bg)] px-4 py-3 text-sm placeholder:text-white/30 outline-none border border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                    />
                  </div>

                  {error ? <div className="text-xs text-red-400">{error}</div> : null}

                  <div className="pt-4 flex items-center justify-between gap-4 flex-wrap">
                    <button
                      className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-3 text-white text-sm font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100"
                      onClick={handleSignup}
                      disabled={status === "loading"}
                    >
                      {status === "loading" ? "Creating account…" : "Create Account"}
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
                    <SocialButton icon={<FcGoogle />} label="Sign up with Google" iconClass="text-xl" />
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
