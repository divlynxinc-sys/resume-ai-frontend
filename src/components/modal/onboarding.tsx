import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import SiteNavbar from "../layout/site-navbar";

export default function OnboardingScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const proceed = () => {
    localStorage.setItem("firstLoginShown", "true");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-svh bg-[var(--app-bg)] text-white">
      <SiteNavbar />

      <main className="max-w-[960px] mx-auto px-6 py-12">
        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
          <div className="flex items-start gap-6">
            <div className="size-12 rounded-xl bg-[oklch(0.488_0.243_264.376)]/20 border border-[oklch(0.488_0.243_264.376)]/35 grid place-items-center">
              <span className="text-2xl">✨</span>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold">Welcome to Jobsynk AI</h1>
              <p className="mt-2 text-white/70">Let's get you set up. Here are a few quick tips to help you make the most of the app.</p>
              <ul className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white/80">
                <li className="rounded-xl border border-white/10 bg-white/[0.03] p-4">Use AI Tailoring to align your resume to job postings.</li>
                <li className="rounded-xl border border-white/10 bg-white/[0.03] p-4">Browse Templates to pick a design that fits your style.</li>
                <li className="rounded-xl border border-white/10 bg-white/[0.03] p-4">Track credits and manage your plan under Pricing.</li>
                <li className="rounded-xl border border-white/10 bg-white/[0.03] p-4">Visit the Help Center for tutorials and FAQs.</li>
              </ul>
              <div className="mt-8 flex items-center gap-3">
                <button onClick={proceed} className="rounded-xl bg-[oklch(0.488_0.243_264.376)] px-5 py-2 text-white font-medium hover:bg-[oklch(0.488_0.243_264.376)/90]">Continue to Dashboard</button>
                <button onClick={proceed} className="rounded-xl border border-white/10 px-5 py-2 text-white/80 hover:text-white hover:bg-white/[0.06]">Skip for now</button>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <div className="text-white/80 text-sm">Prefer a guided setup? Explore <Link to="/user-details" className="text-cyan-300 hover:text-white">User Details</Link> to fill profile info.</div>
        </section>
      </main>
    </div>
  );
}
