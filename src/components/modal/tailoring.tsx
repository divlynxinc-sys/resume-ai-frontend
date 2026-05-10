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
    <div className="size-11 grid place-items-center mx-auto rounded-xl bg-[var(--accent-soft)] text-[var(--accent-text)]">
      {children}
    </div>
  );
}

function NumberBadge({ n }: { n: number }) {
  return (
    <div className="absolute -top-3 left-1/2 -translate-x-1/2 size-7 grid place-items-center rounded-full bg-[var(--accent)] text-[#fff] text-xs font-semibold">
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
    <div className="relative rounded-2xl bg-[var(--app-surface)] border border-[var(--app-border)] p-6 text-[var(--app-fg)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-[var(--app-border-strong)] hover:shadow-[var(--shadow-soft)]">
      <NumberBadge n={n} />
      <div className="space-y-3">
        <IconWrap>{icon}</IconWrap>
        <h3 className="text-base font-medium tracking-tight text-center text-[var(--app-fg)]">{title}</h3>
        <p className="text-[var(--app-fg-muted)] text-sm leading-relaxed text-center">{desc}</p>
      </div>
    </div>
  );
}

function InfoPanel({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="relative rounded-2xl bg-[var(--app-surface)] border border-[var(--app-border)] p-7 text-[var(--app-fg)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-[var(--app-border-strong)] hover:shadow-[var(--shadow-soft)]">
      <h3 className="font-display text-xl font-light tracking-tight text-[var(--app-fg)]">{title}</h3>
      <ul className="mt-5 space-y-3">
        {items.map((it, idx) => (
          <li key={idx} className="flex items-start gap-3 text-[var(--app-fg-muted)]">
            <CheckCircle2 className="mt-0.5 size-5 text-[var(--accent)] shrink-0" />
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
      <div className="max-w-[1100px] mx-auto px-6 pt-14 text-center">
        <div className="text-xs font-medium tracking-[0.18em] uppercase text-[var(--accent-text)] mb-3">How it works</div>
        <h1 className="font-display text-3xl md:text-4xl font-light tracking-tight text-[var(--app-fg)] leading-tight">
          Tailoring, <span className="italic">simplified.</span>
        </h1>
        <p className="text-[var(--app-fg-muted)] mt-4 max-w-2xl mx-auto leading-relaxed">
          Our AI analyzes the job description and optimizes your resume for each application,
          highlighting the most relevant skills and experiences.
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
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <StepCard
            n={1}
            title="Upload your resume"
            desc="Upload your current resume in PDF or DOCX format."
            icon={<Upload className="size-5" />}
          />
          <StepCard
            n={2}
            title="Paste job description"
            desc="Paste the job description for the position you're applying for."
            icon={<FileText className="size-5" />}
          />
          <StepCard
            n={3}
            title="AI tailoring"
            desc="Our AI analyzes the job and tailors your resume accordingly."
            icon={<Sparkles className="size-5" />}
          />
          <StepCard
            n={4}
            title="Review & download"
            desc="Review the tailored resume and download it in your preferred format."
            icon={<Download className="size-5" />}
          />
        </div>

        {/* Info Panels */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-5">
          <InfoPanel
            title="Why tailoring matters"
            items={[
              "Significantly increases your chances of getting noticed by recruiters.",
              "Highlights your most relevant skills and experiences.",
              "Demonstrates your understanding of the job and suitability for the position.",
            ]}
          />
          <InfoPanel
            title="AI-powered intelligence"
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
    <div className="min-h-svh bg-[var(--app-bg)] text-[var(--app-fg)]">
      <SiteNavbar />
      <PageWithSidebar activeRoute="tailoring">
        <TailoringSection />
      </PageWithSidebar>
    </div>
  );
}
