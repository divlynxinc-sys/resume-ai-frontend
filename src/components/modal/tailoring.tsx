import type { ReactNode } from "react";
import {
  Upload,
  FileText,
  Sparkles,
  Download,
  CheckCircle2,
} from "lucide-react";
import SiteNavbar from "../layout/site-navbar";
import PageWithSidebar from "../layout/page-with-sidebar";


function IconWrap({ children }: { children: ReactNode }) {
  return (
    <div className="size-9 grid place-items-center mx-auto text-blue-300">
      {children}
    </div>
  );
}

function NumberBadge({ n }: { n: number }) {
  return (
    <div className="absolute -top-3 left-1/2 -translate-x-1/2 size-7 grid place-items-center rounded-full bg-blue-600/25 text-blue-200 text-xs font-bold border border-blue-500/40 shadow-[0_0_30px_rgba(59,130,246,0.35)]">
      {n}
    </div>
  );
}

function StepCard({
  n,
  title,
  desc,
  icon,
}: {
  n: number;
  title: string;
  desc: string;
  icon: ReactNode;
}) {
  return (
    <div className="relative rounded-2xl bg-white/[0.035] border border-white/10 p-6 text-white shadow-[0_20px_60px_rgba(0,0,0,0.45)] ring-1 ring-blue-500/10 transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-[0_24px_60px_rgba(59,130,246,0.35)] hover:ring-blue-400/25">
      <NumberBadge n={n} />
      <div className="space-y-3">
        <IconWrap>{icon}</IconWrap>
        <h3 className="text-base font-semibold tracking-tight text-center">{title}</h3>
        <p className="text-white/70 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function AccentBar() {
  return (
    <div className="absolute -top-px left-1/2 -translate-x-1/2 h-1 w-28 rounded-full bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500" />
  );
}

function InfoPanel({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="relative rounded-2xl bg-white/[0.035] border border-white/10 p-6 text-white shadow-[0_20px_60px_rgba(0,0,0,0.45)] transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-[0_24px_60px_rgba(59,130,246,0.35)]">
      <AccentBar />
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <ul className="mt-4 space-y-3">
        {items.map((it, idx) => (
          <li key={idx} className="flex items-start gap-3 text-white/80">
            <CheckCircle2 className="mt-0.5 size-5 text-blue-400" />
            <span className="text-sm leading-relaxed">{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-6 -translate-x-1/2 size-[540px] rounded-full bg-[radial-gradient(closest-side,rgba(59,130,246,0.20),transparent_70%)]" />
      </div>

      <div className="max-w-[1100px] mx-auto px-6 pt-14 text-center">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">How Resume Tailoring Works</h1>
        <div className="h-[3px] w-28 bg-blue-500/80 mx-auto mt-4 rounded-full" />
        <p className="text-white/70 mt-4 max-w-2xl mx-auto">
          Our AI-powered system analyzes job descriptions and optimizes your resume for each application,
          ensuring you highlight the most relevant skills and experiences.
        </p>
      </div>
    </section>
  );
}

export function TailoringSection() {
  return (
    <>
      <Hero />
      <div className="mx-auto max-w-[1100px] px-6 pb-16">
        {/* Steps */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <StepCard
            n={1}
            title="Upload Your Resume"
            desc="Upload your current resume in PDF or DOCX format."
            icon={<Upload className="size-7" />}
          />
          <StepCard
            n={2}
            title="Paste Job Description"
            desc="Paste the job description for the position you're applying for."
            icon={<FileText className="size-7" />}
          />
          <StepCard
            n={3}
            title="AI Tailoring"
            desc="Our AI analyzes the job and tailors your resume accordingly."
            icon={<Sparkles className="size-7" />}
          />
          <StepCard
            n={4}
            title="Review & Download"
            desc="Review the tailored resume and download it in your preferred format."
            icon={<Download className="size-7" />}
          />
        </div>

        {/* Info Panels */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <InfoPanel
            title="Why Tailoring Matters"
            items={[
              "Significantly increases your chances of getting noticed by recruiters.",
              "Highlights your most relevant skills and experiences.",
              "Demonstrates your understanding of the job and suitability for the position.",
            ]}
          />
          <InfoPanel
            title="AI-Powered Intelligence"
            items={[
              "Intelligently analyzes job descriptions for key skills and keywords.",
              "Optimizes resume content, structure, and formatting.",
              "Maximizes your chances of landing an interview.",
            ]}
          />
        </div>
      </div>
    </>
  );
}

export default function TailoringScreen() {
  return (
    <div className="min-h-svh bg-[var(--app-bg)] text-white">
      <SiteNavbar />
      <PageWithSidebar activeRoute="tailoring">
        <TailoringSection />
      </PageWithSidebar>
    </div>
  );
}