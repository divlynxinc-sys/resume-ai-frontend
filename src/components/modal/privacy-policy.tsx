import { useEffect } from "react";
import SiteNavbar from "../layout/site-navbar";

function Sidebar() {
  const items = [
    { id: "collect", label: "Information We Collect" },
    { id: "use", label: "How We Use Your Information" },
    { id: "retention", label: "Data Retention" },
    { id: "rights", label: "User Rights" },
    { id: "contact", label: "Contact Information" },
  ];
  return (
    <aside className="rounded-xl border border-white/10 bg-[#0F1629] p-4">
      <div className="text-sm font-semibold text-white">Sections</div>
      <ul className="mt-3 space-y-2">
        {items.map((it) => (
          <li key={it.id}>
            <a
              href={`#${it.id}`}
              className="block rounded-md px-2 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5"
            >
              {it.label}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function Content() {
  return (
    <div className="relative rounded-[20px] p-px bg-gradient-to-b from-cyan-500/20 to-indigo-600/20">
      <div className="rounded-[18px] bg-[#0F1629] border border-white/10 p-6 sm:p-8 text-white/85">
        <h1 className="text-3xl sm:text-4xl font-semibold text-white">Privacy Policy</h1>
        <p className="mt-2 text-sm text-white/60">Last updated: October 26, 2023</p>

        <p className="mt-6 text-sm leading-relaxed text-white/80">
          Welcome to ResumeAI's Privacy Policy. This document outlines how we collect, use, and protect your <a href="#" className="text-sky-400 hover:text-sky-300">personal information</a>. By using our services, you agree to the terms described herein. We are committed to safeguarding your privacy and ensuring a secure experience.
        </p>

        <h2 id="collect" className="mt-8 text-xl font-semibold text-white">Information We Collect</h2>
        <p className="mt-2 text-sm leading-relaxed text-white/80">
          We collect information you provide directly, such as your name, email address, and resume content. We also gather data automatically, including your <a href="#" className="text-sky-400 hover:text-sky-300">IP address</a>, browser type, and <a href="#" className="text-sky-400 hover:text-sky-300">usage patterns</a>. This helps us improve our services and personalize your experience.
        </p>

        <h2 id="use" className="mt-8 text-xl font-semibold text-white">How We Use Your Information</h2>
        <p className="mt-2 text-sm leading-relaxed text-white/80">
          Your information is used to create and manage your resumes, provide customer support, and communicate updates. We may also use <a href="#" className="text-sky-400 hover:text-sky-300">aggregated data</a> for analytical purposes to enhance our platform's functionality and user experience.
        </p>

        <h2 id="retention" className="mt-8 text-xl font-semibold text-white">Data Retention</h2>
        <p className="mt-2 text-sm leading-relaxed text-white/80">
          We retain your personal information for as long as necessary to provide our services and comply with <a href="#" className="text-sky-400 hover:text-sky-300">legal obligations</a>. You can request the deletion of your account and data at any time, subject to our data retention policies.
        </p>

        <h2 id="rights" className="mt-8 text-xl font-semibold text-white">User Rights</h2>
        <p className="mt-2 text-sm leading-relaxed text-white/80">
          You have the right to <a href="#" className="text-sky-400 hover:text-sky-300">access, correct, or delete</a> your personal information. You can also object to or restrict certain processing activities. Please contact us to exercise these rights.
        </p>

        <h2 id="contact" className="mt-8 text-xl font-semibold text-white">Contact Information</h2>
        <p className="mt-2 text-sm leading-relaxed text-white/80">
          If you have any questions or concerns about this Privacy Policy, please contact us at <a href="mailto:privacy@resumeai.com" className="text-sky-400 hover:text-sky-300">privacy@resumeai.com</a> or call us at (555) 123-4567. Our team is dedicated to addressing your inquiries promptly and transparently.
        </p>
      </div>
    </div>
  );
}

export default function PrivacyPolicyScreen() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);
  return (
    <div className="min-h-svh bg-[var(--app-bg)] text-white">
      <SiteNavbar />
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-3">
            <Sidebar />
          </div>
          <div className="col-span-12 md:col-span-9">
            <Content />
          </div>
        </div>
      </section>
    </div>
  );
}