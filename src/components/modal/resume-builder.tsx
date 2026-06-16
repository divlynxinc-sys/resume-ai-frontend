import type { ReactNode, ChangeEvent } from "react";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { AlertCircle, CheckCircle2, Download, ChevronDown, X } from "lucide-react";
import { renderTemplate } from "@/lib/resume-templates";
import { downloadResumeHtmlAsPdf } from "@/lib/resume-export";
import SiteNavbar from "../layout/site-navbar";
import PageWithSidebar from "../layout/page-with-sidebar";
import { resumeService } from "@/services";
import { addResumeCreatedNotification } from "@/services/notifications";
import { useToast } from "@/contexts/ToastContext";
import {
  mapContentToLocal as mapContentToLocalImpl,
  toTemplateInput,
  readResumeDraft,
  writeResumeDraft,
  type ResumeData,
  type Experience,
  type Education,
  type JobDetails,
  type CustomSection,
} from "./resume-builder.helpers";


function PageHeader({ mode, setMode }: { mode: 'preview' | 'ats'; setMode: (m: 'preview' | 'ats') => void }) {
  const SwitchButton = ({ active, children, onClick }: { active: boolean; children: ReactNode; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
        active
          ? 'bg-[oklch(0.488_0.243_264.376)] text-white shadow-lg shadow-blue-500/20'
          : 'bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Magic Builder</h1>
        <p className="text-white/60 mt-2">Build your resume in minutes with our AI-powered tools.</p>
      </div>

      <div className="flex items-center gap-2 bg-[#0f162a] p-1.5 rounded-xl border border-white/10 self-start md:self-center">
        <SwitchButton active={mode === 'preview'} onClick={() => setMode('preview')}>Resume Preview</SwitchButton>
        <SwitchButton active={mode === 'ats'} onClick={() => setMode('ats')}>Score Analysis</SwitchButton>
      </div>
    </div>
  );
}

type TabKey = "personal" | "experience" | "education" | "skills" | "summary" | "job" | "custom";

// Re-export types for any other module importing from this file
export type { Experience, Education, JobDetails, CustomSection, ResumeData };

/** Shape returned from `POST /resumes/:id/ai/optimize` → `ats` */
interface AtsOptimizeSummary {
  final_ats_score?: number;
  keywords_found?: string[];
  keywords_missing?: string[];
  iterations_needed?: number;
  /** Pre-optimization score on the user's raw resume (the honest "before"). */
  initial_ats_score?: number | null;
  initial_keywords_found?: string[];
  initial_keywords_missing?: string[];
}

interface LiveAtsEstimate {
  score: number;
  completedChecks: number;
  totalChecks: number;
  suggestions: string[];
}

function AtsScoreProgress({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, score));
  const segments = [
    { label: "0", color: "bg-rose-400/70" },
    { label: "20", color: "bg-orange-400/70" },
    { label: "40", color: "bg-amber-300/70" },
    { label: "60", color: "bg-sky-400/70" },
    { label: "80", color: "bg-emerald-400/70" },
  ];
  const status = pct >= 80 ? "Strong" : pct >= 60 ? "Good" : pct >= 40 ? "Fair" : "Needs work";

  return (
    <div className="mb-4 rounded-xl border border-white/10 bg-white/[0.035] p-3 shadow-sm">
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/45">ATS Score</div>
          <div className="mt-0.5 text-xs text-white/55">Live resume readiness</div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-white/90">{pct}%</div>
          <div className="text-[10px] text-white/45">{status}</div>
        </div>
      </div>

      <div className="relative pt-2">
        <div className="relative h-2 overflow-visible rounded-full bg-white/7">
          <div className="absolute inset-0 overflow-hidden rounded-full">
            <div className="flex h-full opacity-25">
              {segments.map((segment) => (
                <div key={segment.label} className={`h-full flex-1 ${segment.color}`} />
              ))}
            </div>
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-rose-400/80 via-amber-300/80 to-emerald-400/80"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div
            className="absolute top-1/2 grid h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white bg-[var(--app-surface)] shadow-sm ring-2 ring-emerald-400/15"
            style={{ left: `${pct}%` }}
            aria-hidden="true"
          >
            <span className="size-1.5 rounded-full bg-emerald-400" />
          </div>
        </div>

        <div className="mt-1.5 grid grid-cols-6 text-[10px] text-white/35">
          {[0, 20, 40, 60, 80, 100].map((mark) => (
            <div key={mark} className={mark === 100 ? "text-right" : mark === 0 ? "text-left" : "text-center"}>
              {mark}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function calculateLiveAtsEstimate(resume: ResumeData): LiveAtsEstimate {
  const experiences = resume.experiences.filter((item) =>
    Boolean(item.role.trim() || item.company.trim() || item.bullets.some((bullet) => bullet.trim()))
  );
  const projects = resume.customSections.filter((item) =>
    Boolean(item.title.trim() || item.content.trim())
  );
  const bullets = [
    ...experiences.flatMap((item) => item.bullets),
    ...projects.flatMap((item) => item.content.split("\n")),
  ].map((bullet) => bullet.trim()).filter(Boolean);
  const quantifiedBullets = bullets.filter((bullet) =>
    /\d|%|\b(increased|reduced|improved|optimized|saved|automated|delivered|boosted|streamlined|resolved)\b/i.test(bullet)
  );
  const checks = [
    { points: 10, done: Boolean(resume.job.title.trim() && resume.job.company.trim()), suggestion: "Add the target job title and company." },
    { points: 15, done: resume.job.description.trim().length >= 80, suggestion: "Paste a detailed job description so the final AI score can match keywords accurately." },
    { points: 10, done: Boolean(resume.name.trim() && EMAIL_REGEX.test(resume.email.trim()) && resume.phone.trim()), suggestion: "Complete your name, valid email, and phone number." },
    { points: 15, done: experiences.length > 0 && experiences.every((item) => item.role.trim() && item.company.trim() && item.bullets.length > 0), suggestion: "Add at least one experience with a role, company, and highlights." },
    { points: 10, done: resume.education.some((item) => item.school.trim() && item.degree?.trim()), suggestion: "Add your education details." },
    { points: 15, done: resume.skills.length >= 5, suggestion: "Add at least five relevant skills." },
    { points: 10, done: resume.summary.trim().split(/\s+/).filter(Boolean).length >= 25, suggestion: "Write a professional summary of at least 25 words." },
    { points: 5, done: projects.length > 0 && projects.every((item) => item.title.trim() && item.content.trim()), suggestion: "Add at least one project with meaningful details." },
    { points: 10, done: bullets.length > 0 && quantifiedBullets.length / bullets.length >= 0.4, suggestion: "Strengthen highlights with metrics or impact-focused outcomes." },
  ];

  return {
    score: checks.reduce((total, check) => total + (check.done ? check.points : 0), 0),
    completedChecks: checks.filter((check) => check.done).length,
    totalChecks: checks.length,
    suggestions: checks.filter((check) => !check.done).map((check) => check.suggestion),
  };
}

const blankResume: ResumeData = {
  name: "",
  email: "",
  phone: "",
  location: "",
  linkedin: "",
  portfolio: "",
  experiences: [],
  education: [],
  skills: [],
  skillCategories: [],
  summary: "",
  job: { title: "", company: "", location: "", description: "" },
  customSections: [],
};

/** Map API ResumeContent → local ResumeData (delegates to helpers module so
 * test scripts can reuse the same logic without bundling React). */
function mapContentToLocal(content: import("@/services/resume").ResumeContent): ResumeData {
  return mapContentToLocalImpl(content, blankResume);
}

/** Map local ResumeData section → API payload */
function localToApiSection(tab: TabKey, resume: ResumeData): { section: string; body: unknown } | null {
  switch (tab) {
    case "personal":
      return {
        section: "info",
        body: {
          full_name: resume.name,
          email: resume.email,
          phone: resume.phone,
          location: resume.location,
          linkedin_url: resume.linkedin,
          portfolio_url: resume.portfolio,
        },
      };
    case "experience":
      return {
        section: "experience",
        body: resume.experiences.map((e) => ({
          role: e.role,
          company: e.company,
          start_date: e.startDate ?? "",
          end_date: e.endDate ?? "",
          location: e.location ?? "",
          description: e.bullets.join("\n"),
        })),
      };
    case "education":
      return {
        section: "education",
        body: resume.education.map((e) => ({
          school: e.school,
          degree: e.degree ?? "",
          start_date: e.startDate ?? "",
          end_date: e.endDate ?? "",
          location: e.location ?? "",
          field_of_study: e.field ?? "",
        })),
      };
    case "skills":
      return { section: "skills", body: resume.skills };
    case "summary":
      return { section: "summary", body: resume.summary };
    case "job":
      return {
        section: "job_description",
        body: {
          job_title: resume.job.title,
          company: resume.job.company,
          description: resume.job.description,
          location: resume.job.location ?? "",
        },
      };
    case "custom": {
      // Backend AI adapter currently reads `custom.projects` (array of {title, link, bullets}).
      // We treat any custom section whose title includes "project" as a project input for AI.
      const sections = resume.customSections ?? [];
      const projects = sections
        .filter((sec) => (sec.title ?? "").toLowerCase().includes("project"))
        .map((sec) => {
          const bullets = (sec.content ?? "")
            .split("\n")
            .map((line) => line.replace(/^(\-|\*|•|\d+\.)\s*/g, "").trim())
            .filter(Boolean);

          return {
            title: sec.title || "Project",
            link: "",
            bullets,
          };
        });

      return {
        section: "custom",
        body: {
          projects,
          sections, // keep the raw structure for later features
          // Round-trip skill categories: the dedicated /skills endpoint only
          // accepts a flat string[], so we persist categories alongside custom.
          skillCategories: resume.skillCategories ?? [],
        },
      };
    }
    default:
      return null;
  }
}

function Tabs({ active, onChange }: { active: TabKey; onChange: (t: TabKey) => void }) {
  const items: { key: TabKey; label: string }[] = [
    { key: "job", label: "Job Description" },
    { key: "personal", label: "Personal Info" },
    { key: "experience", label: "Experience" },
    { key: "education", label: "Education" },
    { key: "skills", label: "Skills" },
    { key: "summary", label: "Summary" },
    { key: "custom", label: "Projects" },
  ];
  return (
    <div className="mt-6">
      <div className="flex items-center gap-6 text-sm">
        {items.map((it) => (
          <button
            key={it.key}
            type="button"
            onClick={() => onChange(it.key)}
            className={`relative ${active === it.key ? "text-white" : "text-white/80 hover:text-white"}`}
          >
            {it.label}
            {active === it.key && (
              <span className="absolute -bottom-[10px] left-0 h-[2px] w-full bg-[oklch(0.488_0.243_264.376)]" />
            )}
          </button>
        ))}
      </div>
      <div className="mt-3 h-px bg-white/10" />
    </div>
  );
}

function Label({ children }: { children: ReactNode }) {
  return <div className="text-xs text-white/60 mb-2">{children}</div>;
}

function TextInput({ placeholder = "", value, onChange, type = "text", error = false }: { placeholder?: string; value?: string; onChange?: (v: string) => void; type?: string; error?: boolean }) {
  return (
    <input
      value={value ?? ""}
      onChange={(e) => onChange?.(e.target.value)}
      type={type}
      placeholder={placeholder}
      aria-invalid={error || undefined}
      className={`w-full rounded-lg border bg-[#0C1426] px-4 py-3 text-sm outline-none placeholder:text-white/40 transition-colors ${
        error
          ? "border-red-500/70 ring-1 ring-red-500/40 focus:border-red-500"
          : "border-white/15 ring-0 focus:border-white/25"
      }`}
    />
  );
}

function TextArea({ placeholder = "", value, onChange, rows = 4, error = false }: { placeholder?: string; value?: string; onChange?: (v: string) => void; rows?: number; error?: boolean }) {
  return (
    <textarea
      value={value ?? ""}
      onChange={(e) => onChange?.(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      aria-invalid={error || undefined}
      className={`w-full rounded-lg border bg-[#0C1426] px-4 py-3 text-sm outline-none placeholder:text-white/40 transition-colors ${
        error
          ? "border-red-500/70 ring-1 ring-red-500/40 focus:border-red-500"
          : "border-white/15 ring-0 focus:border-white/25"
      }`}
    />
  );
}

type PersonalErrors = { name?: boolean; email?: boolean; emailFormat?: boolean; phone?: boolean };
type EducationItemErrors = { school?: boolean; degree?: boolean; startDate?: boolean; endDate?: boolean };
type JobErrors = { title?: boolean; company?: boolean; description?: boolean };
interface SectionErrors {
  personal?: PersonalErrors;
  education?: EducationItemErrors[];
  job?: JobErrors;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateSection(tab: TabKey, resume: ResumeData): SectionErrors | null {
  if (tab === "personal") {
    const e: PersonalErrors = {};
    if (!resume.name.trim()) e.name = true;
    if (!resume.email.trim()) e.email = true;
    else if (!EMAIL_REGEX.test(resume.email.trim())) e.emailFormat = true;
    if (!resume.phone.trim()) e.phone = true;
    return Object.keys(e).length ? { personal: e } : null;
  }
  if (tab === "education") {
    const items = resume.education.map<EducationItemErrors>((ed) => ({
      school: !ed.school?.trim(),
      degree: !ed.degree?.trim(),
      startDate: !ed.startDate?.trim(),
      endDate: !ed.endDate?.trim(),
    }));
    const hasErr = items.some((e) => e.school || e.degree || e.startDate || e.endDate);
    return hasErr ? { education: items } : null;
  }
  if (tab === "job") {
    const e: JobErrors = {};
    if (!resume.job.title.trim()) e.title = true;
    if (!resume.job.company.trim()) e.company = true;
    if (!resume.job.description.trim()) e.description = true;
    return Object.keys(e).length ? { job: e } : null;
  }
  return null;
}

function sectionHasErrors(errs: SectionErrors): boolean {
  return Boolean(
    (errs.personal && Object.keys(errs.personal).length) ||
      (errs.education && errs.education.some((e) => e.school || e.degree || e.startDate || e.endDate)) ||
      (errs.job && Object.keys(errs.job).length)
  );
}

function PersonalInfoForm({ resume, setResume, errors }: { resume: ResumeData; setResume: (r: ResumeData) => void; errors?: PersonalErrors }) {
  return (
    <div className="rounded-xl border border-white/10 p-4 bg-white/[0.04]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>Full Name</Label>
          <TextInput value={resume.name} onChange={(v) => setResume({ ...resume, name: v })} error={errors?.name} />
          {errors?.name && <div className="mt-1 text-xs text-red-400">Full name is required</div>}
        </div>
        <div>
          <Label>Email</Label>
          <TextInput value={resume.email} onChange={(v) => setResume({ ...resume, email: v })} error={errors?.email || errors?.emailFormat} />
          {errors?.email && <div className="mt-1 text-xs text-red-400">Email is required</div>}
          {!errors?.email && errors?.emailFormat && <div className="mt-1 text-xs text-red-400">Enter a valid email address</div>}
        </div>
        <div>
          <Label>Phone</Label>
          <TextInput value={resume.phone} onChange={(v) => setResume({ ...resume, phone: v })} error={errors?.phone} />
          {errors?.phone && <div className="mt-1 text-xs text-red-400">Phone is required</div>}
        </div>
        <div>
          <Label>Location</Label>
          <TextInput value={resume.location} onChange={(v) => setResume({ ...resume, location: v })} />
        </div>
        <div className="md:col-span-2">
          <Label>LinkedIn Profile URL</Label>
          <TextInput value={resume.linkedin} onChange={(v) => setResume({ ...resume, linkedin: v })} />
        </div>
        <div className="md:col-span-2">
          <Label>Portfolio URL</Label>
          <TextInput value={resume.portfolio} onChange={(v) => setResume({ ...resume, portfolio: v })} />
        </div>
      </div>
    </div>
  );
}

function ExperienceForm({ resume, setResume }: { resume: ResumeData; setResume: (r: ResumeData) => void }) {
  const updateExp = (idx: number, patch: Partial<Experience>) => {
    const list = [...resume.experiences];
    list[idx] = { ...list[idx], ...patch };
    setResume({ ...resume, experiences: list });
  };
  const addExp = () => {
    setResume({
      ...resume,
      experiences: [...resume.experiences, { role: "", company: "", location: "", startDate: "", endDate: "", bullets: [] }],
    });
  };
  const removeExp = (idx: number) => {
    setResume({ ...resume, experiences: resume.experiences.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-6">
      {resume.experiences.map((exp, idx) => (
        <div key={idx} className="rounded-xl border border-white/10 p-4 bg-white/[0.04]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Role</Label>
              <TextInput value={exp.role} onChange={(v) => updateExp(idx, { role: v })} />
            </div>
            <div>
              <Label>Company</Label>
              <TextInput value={exp.company} onChange={(v) => updateExp(idx, { company: v })} />
            </div>
            <div>
              <Label>Location</Label>
              <TextInput value={exp.location ?? ""} onChange={(v) => updateExp(idx, { location: v })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <TextInput value={exp.startDate ?? ""} onChange={(v) => updateExp(idx, { startDate: v })} placeholder="Jan 2023" />
              </div>
              <div>
                <Label>End Date</Label>
                <TextInput value={exp.endDate ?? ""} onChange={(v) => updateExp(idx, { endDate: v })} placeholder="Present" />
              </div>
            </div>
            <div className="md:col-span-2">
              <Label>Highlights (one per line)</Label>
              <TextArea
                value={exp.bullets.join("\n")}
                onChange={(v) => updateExp(idx, { bullets: v.split("\n").map((t) => t.trim()).filter(Boolean) })}
                rows={5}
              />
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <button className="text-sm rounded-md border border-white/20 px-3 py-1 hover:bg-white/[0.06]" onClick={() => removeExp(idx)}>Remove</button>
          </div>
        </div>
      ))}
      <button className="rounded-lg bg-[oklch(0.488_0.243_264.376)] px-4 py-2 text-sm text-white" onClick={addExp}>Add Experience</button>
    </div>
  );
}

function EducationForm({ resume, setResume, errors }: { resume: ResumeData; setResume: (r: ResumeData) => void; errors?: EducationItemErrors[] }) {
  const updateEd = (idx: number, patch: Partial<Education>) => {
    const list = [...resume.education];
    list[idx] = { ...list[idx], ...patch };
    setResume({ ...resume, education: list });
  };
  const addEd = () => {
    setResume({
      ...resume,
      education: [...resume.education, { school: "", degree: "", field: "", startDate: "", endDate: "", location: "" }],
    });
  };
  const removeEd = (idx: number) => {
    setResume({ ...resume, education: resume.education.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-6">
      {resume.education.map((ed, idx) => {
        const itemErr = errors?.[idx];
        return (
        <div key={idx} className="rounded-xl border border-white/10 p-4 bg-white/[0.04]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>School</Label>
              <TextInput value={ed.school} onChange={(v) => updateEd(idx, { school: v })} error={itemErr?.school} />
              {itemErr?.school && <div className="mt-1 text-xs text-red-400">School is required</div>}
            </div>
            <div>
              <Label>Degree</Label>
              <TextInput value={ed.degree ?? ""} onChange={(v) => updateEd(idx, { degree: v })} error={itemErr?.degree} />
              {itemErr?.degree && <div className="mt-1 text-xs text-red-400">Degree is required</div>}
            </div>
            <div>
              <Label>Field of Study</Label>
              <TextInput value={ed.field ?? ""} onChange={(v) => updateEd(idx, { field: v })} />
            </div>
            <div>
              <Label>Location</Label>
              <TextInput value={ed.location ?? ""} onChange={(v) => updateEd(idx, { location: v })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <TextInput value={ed.startDate ?? ""} onChange={(v) => updateEd(idx, { startDate: v })} placeholder="Aug 2019" error={itemErr?.startDate} />
                {itemErr?.startDate && <div className="mt-1 text-xs text-red-400">Start date is required</div>}
              </div>
              <div>
                <Label>End Date</Label>
                <TextInput value={ed.endDate ?? ""} onChange={(v) => updateEd(idx, { endDate: v })} placeholder="May 2023" error={itemErr?.endDate} />
                {itemErr?.endDate && <div className="mt-1 text-xs text-red-400">End date is required</div>}
              </div>
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <button className="text-sm rounded-md border border-white/20 px-3 py-1 hover:bg-white/[0.06]" onClick={() => removeEd(idx)}>Remove</button>
          </div>
        </div>
        );
      })}
      <button className="rounded-lg bg-[oklch(0.488_0.243_264.376)] px-4 py-2 text-sm text-white" onClick={addEd}>Add Education</button>
    </div>
  );
}

function SkillsForm({ resume, setResume }: { resume: ResumeData; setResume: (r: ResumeData) => void }) {
  const [input, setInput] = useState<string>("");
  const addSkill = () => {
    const newSkills = input
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s && !resume.skills.includes(s));
    if (!newSkills.length) return;
    setResume({ ...resume, skills: [...resume.skills, ...newSkills] });
    setInput("");
  };
  const removeSkill = (idx: number) => {
    setResume({ ...resume, skills: resume.skills.filter((_, i) => i !== idx) });
  };

  return (
    <div>
      <Label>Add Skill</Label>
      <div className="flex gap-2">
        <TextInput value={input} onChange={setInput} placeholder="e.g., React, Node.js, Leadership" />
        <button className="rounded-lg bg-[oklch(0.488_0.243_264.376)] px-4 py-2 text-sm text-white" onClick={addSkill}>Add</button>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {resume.skills.map((s, i) => (
          <span key={i} className="inline-flex items-center gap-2 rounded-md border border-white/15 px-3 py-1 text-sm">
            {s}
            <button className="text-white/60 hover:text-white" onClick={() => removeSkill(i)}>×</button>
          </span>
        ))}
      </div>
    </div>
  );
}

function SummaryForm({ resume, setResume }: { resume: ResumeData; setResume: (r: ResumeData) => void }) {
  return (
    <div>
      <Label>Professional Summary</Label>
      <TextArea value={resume.summary} onChange={(v) => setResume({ ...resume, summary: v })} rows={8} />
    </div>
  );
}

function JobDescriptionForm({ resume, setResume, errors }: { resume: ResumeData; setResume: (r: ResumeData) => void; errors?: JobErrors }) {
  const updateJob = (patch: Partial<JobDetails>) => {
    setResume({ ...resume, job: { ...resume.job, ...patch } });
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <Label>Job Title</Label>
        <TextInput value={resume.job.title} onChange={(v) => updateJob({ title: v })} placeholder="e.g., Frontend Engineer" error={errors?.title} />
        {errors?.title && <div className="mt-1 text-xs text-red-400">Job title is required</div>}
      </div>
      <div>
        <Label>Company</Label>
        <TextInput value={resume.job.company} onChange={(v) => updateJob({ company: v })} placeholder="e.g., Acme Corp" error={errors?.company} />
        {errors?.company && <div className="mt-1 text-xs text-red-400">Company is required</div>}
      </div>
      <div>
        <Label>Location</Label>
        <TextInput value={resume.job.location ?? ""} onChange={(v) => updateJob({ location: v })} placeholder="City, Country or Remote" />
      </div>
      <div className="md:col-span-2">
        <Label>Job Description / Key Requirements</Label>
        <TextArea value={resume.job.description} onChange={(v) => updateJob({ description: v })} rows={8} placeholder="Paste the job description here." error={errors?.description} />
        {errors?.description && <div className="mt-1 text-xs text-red-400">Job description is required</div>}
      </div>
    </div>
  );
}

function ProjectsForm({ resume, setResume }: { resume: ResumeData; setResume: (r: ResumeData) => void }) {
  const addSection = () => {
    setResume({ ...resume, customSections: [...resume.customSections, { title: "", content: "" }] });
  };
  const updateSection = (idx: number, patch: Partial<CustomSection>) => {
    const list = [...resume.customSections];
    list[idx] = { ...list[idx], ...patch } as CustomSection;
    setResume({ ...resume, customSections: list });
  };
  const removeSection = (idx: number) => {
    setResume({ ...resume, customSections: resume.customSections.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-6">
      {resume.customSections.map((sec, idx) => (
        <div key={idx} className="rounded-xl border border-white/10 p-4 bg-white/[0.04]">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label>Project Title</Label>
              <TextInput value={sec.title} onChange={(v) => updateSection(idx, { title: v })} placeholder="e.g., Portfolio Website" />
            </div>
            <div>
              <Label>Project Details</Label>
              <TextArea value={sec.content} onChange={(v) => updateSection(idx, { content: v })} rows={6} placeholder="Describe your role, tools, and measurable outcomes." />
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <button className="text-sm rounded-md border border-white/20 px-3 py-1 hover:bg-white/[0.06]" onClick={() => removeSection(idx)}>Remove</button>
          </div>
        </div>
      ))}
      <button className="rounded-lg bg-[oklch(0.488_0.243_264.376)] px-4 py-2 text-sm text-white" onClick={addSection}>Add Project</button>
    </div>
  );
}


function hasResumeContent(r: ResumeData): boolean {
  const hasExp = r.experiences.some(
    (e) => (e.role || e.company || (e.bullets && e.bullets.length > 0))
  );
  const hasEdu = r.education.some((e) => e.school || e.degree);
  return Boolean(
    r.name ||
      r.email ||
      r.summary ||
      (r.skills && r.skills.length) ||
      hasExp ||
      hasEdu
  );
}

/** Build resume HTML using the selected template */
function buildResumeHtmlForPdf(resume: ResumeData, templateSlug = 'modern-minimal'): string {
  return renderTemplate(templateSlug, toTemplateInput(resume));
}

function resolvedResumeFileName(fileName: string, resume: ResumeData): string {
  return (fileName.trim() || resume.name || "Untitled").replace(/[^a-zA-Z0-9 ]/g, "").trim() || "Untitled";
}

async function downloadResumePdf(resume: ResumeData, fileName: string, templateSlug: string): Promise<void> {
  const html = buildResumeHtmlForPdf(resume, templateSlug);
  await downloadResumeHtmlAsPdf(html, `${resolvedResumeFileName(fileName, resume)}.pdf`);
}

function downloadResumeDocx(resume: ResumeData, fileName: string, templateSlug: string): void {
  const html = buildResumeHtmlForPdf(resume, templateSlug);
  const headContent = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i)?.[1] ?? "";
  const bodyContent = html.replace(/^[\s\S]*?<body[^>]*>/i, "").replace(/<\/body>[\s\S]*$/i, "");
  const wordHtml =
    '<html xmlns:o="urn:schemas-microsoft-com:office:office" ' +
    'xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">' +
    '<head><meta charset="utf-8"><meta http-equiv="Content-Type" content="text/html; charset=utf-8">' +
    "<title>Resume</title>" +
    headContent +
    "<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom>" +
    "<w:DoNotOptimizeForBrowser/></w:WordDocument></xml><![endif]-->" +
    "</head><body>" +
    bodyContent +
    "</body></html>";

  const blob = new Blob(["\uFEFF", wordHtml], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${resolvedResumeFileName(fileName, resume)}.doc`;
  a.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function CompletedResumeModal({
  resume,
  fileName,
  templateSlug,
  onClose,
}: {
  resume: ResumeData;
  fileName: string;
  templateSlug: string;
  onClose: () => void;
}) {
  const handlePdf = async () => {
    await downloadResumePdf(resume, fileName, templateSlug);
  };

  const handleDocx = () => {
    downloadResumeDocx(resume, fileName, templateSlug);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]">
      <div className="relative w-full max-w-md rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-[var(--shadow-pop)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-[var(--app-fg-soft)] transition-colors hover:bg-[var(--app-surface-2)] hover:text-[var(--app-fg)]"
          aria-label="Close completed resume dialog"
        >
          <X className="size-4" />
        </button>
        <div className="font-display text-2xl font-light text-[var(--app-fg)]">
          Resume <span className="italic">complete</span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-[var(--app-fg-muted)]">
          Your resume has been saved. Download it in your preferred format.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={handlePdf}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-3 text-sm font-medium text-white transition-opacity"
          >
            <Download className="size-4" />
            Download PDF
          </button>
          <button
            type="button"
            onClick={handleDocx}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--app-border-strong)] bg-[var(--app-surface)] px-4 py-3 text-sm font-medium text-[var(--app-fg)] transition-colors hover:bg-[var(--app-surface-2)]"
          >
            <Download className="size-4" />
            Download DOCX
          </button>
        </div>
      </div>
    </div>
  );
}

function ResumePreview({
  mode,
  resume,
  ats,
  liveAts,
  fileName,
  templateSlug = 'modern-minimal',
}: {
  mode: "preview" | "ats";
  resume: ResumeData;
  ats: AtsOptimizeSummary | null;
  liveAts: LiveAtsEstimate;
  fileName: string;
  templateSlug?: string;
}) {
  const score = typeof ats?.final_ats_score === "number" ? ats.final_ats_score : null;
  const displayedScore = score ?? liveAts.score;
  const initialScore = typeof ats?.initial_ats_score === "number" ? ats.initial_ats_score : null;
  const keywordsFound = Array.isArray(ats?.keywords_found) ? ats.keywords_found : [];
  const keywordsMissing = Array.isArray(ats?.keywords_missing) ? ats.keywords_missing : [];
  const initialKeywordsMissing = Array.isArray(ats?.initial_keywords_missing) ? ats.initial_keywords_missing : [];
  const circumference = 2 * Math.PI * 42;
  const pct = Math.min(100, Math.max(0, displayedScore));
  const dashOffset = circumference - (pct / 100) * circumference;
  const lift = score != null && initialScore != null ? score - initialScore : null;
  const [downloadOpen, setDownloadOpen] = useState(false);
  const previewIframeRef = useRef<HTMLIFrameElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Write template HTML into the iframe and scale to fit container
  const previewHtml = hasResumeContent(resume) ? buildResumeHtmlForPdf(resume, templateSlug) : '';
  useEffect(() => {
    if (mode !== 'preview') return;
    const iframe = previewIframeRef.current;
    const container = previewContainerRef.current;
    if (!iframe || !previewHtml || !container) return;
    const doc = iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(previewHtml);
      doc.close();
      // Suppress the iframe document's own scrollbars — the outer container
      // is what crops to the A4 aspect ratio.
      const noScroll = doc.createElement("style");
      noScroll.textContent = "html,body{overflow:hidden!important;margin:0;padding:0;}";
      doc.head.appendChild(noScroll);
    }
    const scale = container.clientWidth / 794;
    iframe.style.transform = `scale(${scale})`;
  }, [previewHtml, mode]);

  const handleDownloadPdf = async () => {
    setDownloadOpen(false);
    await downloadResumePdf(resume, fileName, templateSlug);
  };

  const handleDownloadDocx = async () => {
    setDownloadOpen(false);
    downloadResumeDocx(resume, fileName, templateSlug);
  };

  return (
    <div>
      {mode === "preview" && <AtsScoreProgress score={displayedScore} />}

      <div className="flex items-center justify-between mb-4">
        <div className="font-semibold">{mode === "preview" ? "Resume Preview" : "ATS Score"}</div>
        {mode === "preview" && hasResumeContent(resume) && (
          <div className="relative">
            <button
              onClick={() => setDownloadOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500 transition-colors"
            >
              <Download className="size-3.5" />
              Download
              <ChevronDown className={`size-3 transition-transform ${downloadOpen ? "rotate-180" : ""}`} />
            </button>
            {downloadOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setDownloadOpen(false)} />
                <div className="absolute right-0 top-full mt-1 z-20 w-44 rounded-lg border border-white/10 bg-[#0C1426] shadow-xl overflow-hidden">
                  <button onClick={handleDownloadPdf} className="w-full text-left px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors">
                    Download as PDF
                  </button>
                  <button onClick={handleDownloadDocx} className="w-full text-left px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors border-t border-white/5">
                    Download as DOCX
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {mode === "preview" ? (
        <div className="rounded-2xl bg-[#0f162a] border border-white/10 p-4">
          {!hasResumeContent(resume) ? (
            <div className="text-sm text-white/50 text-center py-12 px-4">
              Fill the form to build your resume preview. Use <strong className="text-white/70">Complete Resume</strong> on the Projects tab when you are finished.
            </div>
          ) : (
            /* A4 page preview — rendered in an iframe scaled to fit container */
            <div
              ref={previewContainerRef}
              className="relative w-full overflow-hidden rounded-lg shadow-2xl"
              style={{ aspectRatio: "210 / 297" }}
            >
              <iframe
                ref={previewIframeRef}
                title="Resume preview"
                scrolling="no"
                className="absolute top-0 left-0 origin-top-left border-none"
                style={{ width: 794, height: 1123 }}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl bg-[#0f162a] border border-white/10 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-blue-500/10 blur-[60px] rounded-full pointer-events-none" />
          {score == null ? (
            <div className="relative z-10">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-medium text-white/60">Live ATS readiness</div>
                  <div className="mt-2 text-4xl font-bold text-white">{liveAts.score}/100</div>
                  <div className="mt-2 text-xs text-white/50">
                    Updates as you complete the builder.
                  </div>
                </div>
                <div className="relative size-24 shrink-0">
                  <svg className="size-full -rotate-90" viewBox="0 0 96 96">
                    <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                    <circle
                      cx="48"
                      cy="48"
                      r="42"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={circumference}
                      strokeDashoffset={dashOffset}
                      strokeLinecap="round"
                      className="text-blue-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white">{liveAts.score}%</div>
                </div>
              </div>
              <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs text-white/60">
                {liveAts.completedChecks} of {liveAts.totalChecks} ATS readiness checks completed
              </div>
              {liveAts.suggestions.length > 0 && (
                <div className="mt-5">
                  <div className="mb-2 text-xs font-semibold text-white/80">Improve your live score</div>
                  <ul className="space-y-2">
                    {liveAts.suggestions.slice(0, 5).map((suggestion) => (
                      <li key={suggestion} className="flex items-start gap-2 text-xs text-white/60">
                        <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-amber-400" />
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="mt-5 text-xs text-white/40">
              Use <strong className="text-white/70">Complete Resume</strong> on the Projects tab when you are ready to download your resume.
            </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div>
                  <div className="text-sm font-medium text-white/60">Overall ATS Score</div>
                  <div className="text-4xl font-bold mt-2">
                    {score}/100
                  </div>
                  <div className="text-xs text-emerald-400 mt-2 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5" />
                    <span>{score >= 80 ? "Strong match" : score >= 60 ? "Good progress" : "Room to improve"}</span>
                  </div>
                </div>
                <div className="relative size-24 shrink-0">
                  <svg className="size-full -rotate-90" viewBox="0 0 96 96">
                    <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                    <circle
                      cx="48"
                      cy="48"
                      r="42"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={circumference}
                      strokeDashoffset={dashOffset}
                      strokeLinecap="round"
                      className="text-blue-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white">{score}%</div>
                </div>
              </div>
              {initialScore != null && (
                <div className="relative z-10 mb-5 grid grid-cols-3 gap-3">
                  <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                    <div className="text-[10px] uppercase tracking-wide text-white/50">Your resume</div>
                    <div className="mt-1 text-2xl font-bold text-white">{initialScore}<span className="text-sm text-white/40">/100</span></div>
                    <div className="text-[10px] text-white/40 mt-0.5">Before optimization</div>
                  </div>
                  <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
                    <div className="text-[10px] uppercase tracking-wide text-blue-200/80">After AI optimize</div>
                    <div className="mt-1 text-2xl font-bold text-white">{score}<span className="text-sm text-white/40">/100</span></div>
                    <div className="text-[10px] text-blue-200/70 mt-0.5">Rewritten resume</div>
                  </div>
                  <div className={`rounded-lg border p-3 ${lift != null && lift > 0 ? "border-emerald-500/30 bg-emerald-500/10" : "border-white/10 bg-white/[0.03]"}`}>
                    <div className="text-[10px] uppercase tracking-wide text-white/50">Lift</div>
                    <div className={`mt-1 text-2xl font-bold ${lift != null && lift > 0 ? "text-emerald-300" : "text-white"}`}>
                      {lift != null ? (lift > 0 ? `+${lift}` : `${lift}`) : "—"}
                    </div>
                    <div className="text-[10px] text-white/40 mt-0.5">Points gained</div>
                  </div>
                </div>
              )}
              {initialScore != null && initialKeywordsMissing.length > 0 && (
                <div className="relative z-10 mb-4">
                  <div className="text-xs font-semibold text-white/80 mb-2 flex items-center gap-2">
                    <AlertCircle className="size-3.5 text-amber-400" />
                    Originally missing from your resume
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {initialKeywordsMissing.slice(0, 24).map((k) => (
                      <span key={`init-${k}`} className="rounded-md bg-amber-500/10 text-amber-100/80 text-[10px] px-2 py-0.5 border border-amber-500/20">
                        {k}
                      </span>
                    ))}
                    {initialKeywordsMissing.length > 24 && (
                      <span className="text-[10px] text-white/40">+{initialKeywordsMissing.length - 24} more</span>
                    )}
                  </div>
                  <div className="mt-1.5 text-[10px] text-white/40">
                    These were absent before AI optimization. The optimized resume integrates them where appropriate.
                  </div>
                </div>
              )}
              {keywordsFound.length > 0 && (
                <div className="relative z-10 mb-4">
                  <div className="text-xs font-semibold text-white/80 mb-2">
                    Keywords matched {initialScore != null && <span className="text-white/40 font-normal">(in optimized resume)</span>}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {keywordsFound.slice(0, 24).map((k) => (
                      <span key={k} className="rounded-md bg-emerald-500/20 text-emerald-200 text-[10px] px-2 py-0.5 border border-emerald-500/30">
                        {k}
                      </span>
                    ))}
                    {keywordsFound.length > 24 && (
                      <span className="text-[10px] text-white/40">+{keywordsFound.length - 24} more</span>
                    )}
                  </div>
                </div>
              )}
              {keywordsMissing.length > 0 && (
                <div className="relative z-10 mb-4">
                  <div className="text-xs font-semibold text-white/80 mb-2 flex items-center gap-2">
                    <AlertCircle className="size-3.5 text-amber-400" />
                    Still missing after optimization
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {keywordsMissing.slice(0, 20).map((k) => (
                      <span key={k} className="rounded-md bg-amber-500/15 text-amber-100 text-[10px] px-2 py-0.5 border border-amber-500/25">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {typeof ats?.iterations_needed === "number" && (
                <div className="text-[10px] text-white/40 relative z-10">
                  Optimization passes: {ats.iterations_needed}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function ResumeBuilderScreen() {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");
  const initialTemplate = searchParams.get("template") || 'modern-minimal';
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<TabKey>('job');
  const [previewMode, setPreviewMode] = useState<'preview' | 'ats'>('preview');
  const [templateSlug, setTemplateSlug] = useState(initialTemplate);

  // Always start blank — data is loaded via API only
  const [resume, setResume] = useState<ResumeData>(blankResume);
  const [resumeId, setResumeId] = useState<number | null>(null);
  const [resumeFileName, setResumeFileName] = useState("");
  const [saving, setSaving] = useState(false);
  const [completedModalOpen, setCompletedModalOpen] = useState(false);
  const [errors, setErrors] = useState<SectionErrors>({});
  const liveAts = calculateLiveAtsEstimate(resume);

  // Modal states — hide start modal when editing an existing resume
  const [startModalOpen, setStartModalOpen] = useState(!editId);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Load existing resume when editing
  useEffect(() => {
    if (!editId) return;
    const id = Number(editId);
    if (Number.isNaN(id)) return;
    resumeService.get(id)
      .then((r) => {
        setResumeId(r.id);
        if (r.title) setResumeFileName(r.title);
        if (r.content) setResume(mapContentToLocal(r.content));
        // Restore any unsaved local edits + the chosen template for this resume so
        // the user sees it "as they left it" (the server only has sections that were
        // explicitly saved via "Save & Next").
        const draft = readResumeDraft(r.id);
        if (draft?.resume) setResume(draft.resume);
        if (draft?.templateSlug) setTemplateSlug(draft.templateSlug);
      })
      .catch(() => {
        setStartModalOpen(true);
      });
    // Persisted AI optimization reports are intentionally not loaded here.
    // The builder now presents the live ATS readiness score only.
  }, [editId]);

  // Persist mid-session edits (and the chosen template) per-resume so they survive
  // navigation / refresh and are restored on the next visit.
  useEffect(() => {
    if (resumeId !== null) {
      writeResumeDraft(resumeId, { resume, templateSlug });
    }
  }, [resume, templateSlug, resumeId]);

  // Sync title to backend when resumeFileName changes
  useEffect(() => {
    if (resumeId === null) return;
    const timer = setTimeout(() => {
      resumeService.update(resumeId, { title: resumeFileName || resume.name || "Untitled" }).catch(() => {});
    }, 600);
    return () => clearTimeout(timer);
  }, [resumeFileName]);

  // AI optimization is intentionally disabled in the builder completion flow.
  // The previous implementation called resumeService.optimizeWithAi(...) here.
  // Keep the backend endpoint available for a future opt-in optimization feature.

  // Clear validation errors whenever the user switches tabs.
  useEffect(() => {
    setErrors({});
  }, [activeTab]);

  // Once a Save & Next attempt has flagged errors, re-validate live so red borders
  // disappear as the user fills the missing fields.
  useEffect(() => {
    if (!sectionHasErrors(errors)) return;
    const next = validateSection(activeTab, resume);
    setErrors(next ?? {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resume]);

  /** Start from scratch: create a new blank resume on the backend */
  const handleStartScratch = async () => {
    setStartModalOpen(false);
    setResume(blankResume);
    localStorage.removeItem('resumeData');
    try {
      const r = await resumeService.create({ title: "New Resume", template_id: null });
      setResumeId(r.id);
      addResumeCreatedNotification("blank");
      showToast("Resume created successfully!");
    } catch {
      showToast("Failed to create resume on server.", "error");
    }
  };

  const onFileSelected = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setUploadError(null);
    if (!file) return;
    const ext = file.name.toLowerCase().split('.').pop();
    if (ext !== 'pdf' && ext !== 'docx') {
      setUploadError('Please upload a PDF or DOCX file.');
    }
  };

  /** Build upon existing: upload file → parse → fill form */
  const handleUploadContinue = async () => {
    if (!selectedFile || uploadError) return;
    setUploading(true);
    setUploadError(null);
    try {
      // fromUpload creates the resume AND returns parsed content in one call
      const r = await resumeService.fromUpload(selectedFile, "Uploaded Resume");
      setResumeId(r.id);
      setResume(mapContentToLocal(r.content));
      setUploadModalOpen(false);
      setSelectedFile(null);
      addResumeCreatedNotification("complete");
      showToast("Resume uploaded and parsed successfully!");
    } catch (err: unknown) {
      const msg = (err as Error).message || "Failed to parse resume. Try a different file.";
      setUploadError(msg);
      showToast(msg, "error");
    } finally {
      setUploading(false);
    }
  };

  const order: TabKey[] = ['job', 'personal', 'experience', 'education', 'skills', 'summary', 'custom'];

  /** Save current section then advance */
  const goNext = async () => {
    const idx = order.indexOf(activeTab);

    const validation = validateSection(activeTab, resume);
    if (validation) {
      setErrors(validation);
      showToast("Please fill in all required fields.", "error");
      return;
    }
    setErrors({});

    if (resumeId !== null) {
      const mapped = localToApiSection(activeTab, resume);
      setSaving(true);
      try {
        if (mapped) {
          await resumeService.patchContent(resumeId, mapped.section, mapped.body);
          if (activeTab !== "custom") {
            showToast("Section saved successfully!");
          }
        }
        // The /skills endpoint accepts only a flat string[]. Mirror the
        // categorized list into the `custom` payload so it survives reload.
        if (activeTab === "skills" && resume.skillCategories?.length) {
          const customMapped = localToApiSection("custom", resume);
          if (customMapped) {
            await resumeService.patchContent(resumeId, customMapped.section, customMapped.body);
          }
        }

        if (activeTab === "custom") {
          setPreviewMode("preview");
          setCompletedModalOpen(true);
          showToast("Resume completed successfully!");
          return;
        }
      } catch (err) {
        console.error(err);
        showToast("Failed to save section.", "error");
      } finally {
        setSaving(false);
      }
    }
    if (idx < order.length - 1) setActiveTab(order[idx + 1]);
  };

  const goPrev = () => {
    const idx = order.indexOf(activeTab);
    if (idx > 0) setActiveTab(order[idx - 1]);
  };

  const renderForm = () => {
    switch (activeTab) {
      case 'personal':   return <PersonalInfoForm resume={resume} setResume={setResume} errors={errors.personal} />;
      case 'experience': return <ExperienceForm resume={resume} setResume={setResume} />;
      case 'education':  return <EducationForm resume={resume} setResume={setResume} errors={errors.education} />;
      case 'skills':     return <SkillsForm resume={resume} setResume={setResume} />;
      case 'summary':    return <SummaryForm resume={resume} setResume={setResume} />;
      case 'job':        return <JobDescriptionForm resume={resume} setResume={setResume} errors={errors.job} />;
      case 'custom':     return <ProjectsForm resume={resume} setResume={setResume} />;
      default:           return null;
    }
  };

  return (
    <div className="min-h-svh bg-[var(--app-bg)] text-white">
      <SiteNavbar />
      <PageWithSidebar
        activeRoute="my-resumes"
        defaultOpen={false}
        mainClassName="max-w-[1400px] mx-auto grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-8"
      >
        {/* Left (main form) */}
        <div>
          <PageHeader mode={previewMode} setMode={setPreviewMode} />

          <div className="mt-4 mb-2">
            <input
              type="text"
              value={resumeFileName}
              onChange={(e) => setResumeFileName(e.target.value)}
              placeholder={resume.name || "Untitled"}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-white/25 focus:bg-white/[0.07] transition-colors"
            />
          </div>

          <Tabs active={activeTab} onChange={setActiveTab} />

          <div className="mt-6">
            {renderForm()}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button className="rounded-lg border border-white/15 px-5 py-2 text-sm text-white/80 hover:bg-white/[0.06]" onClick={goPrev}>Back</button>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                className="rounded-lg bg-[oklch(0.488_0.243_264.376)] px-5 py-2 text-sm text-white disabled:opacity-60"
                onClick={goNext}
                disabled={saving}
              >
                {saving ? "Saving…" : activeTab === "custom" ? "Complete Resume" : "Save & Next"}
              </button>
            </div>
          </div>
        </div>

        {/* Right side — Preview */}
        <div className="xl:sticky xl:top-[80px] xl:self-start xl:pt-4">
          <ResumePreview mode={previewMode} resume={resume} ats={null} liveAts={liveAts} fileName={resumeFileName} templateSlug={templateSlug} />
        </div>
      </PageWithSidebar>

      {/* Start choice modal */}
      {startModalOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div role="dialog" aria-modal="true" className="w-[520px] max-w-[92vw] rounded-2xl bg-[#0f162a] border border-white/12 p-6">
            <div className="text-lg font-semibold">How would you like to start?</div>
            <p className="text-white/60 mt-1 text-sm">Choose an option to proceed.</p>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                className="rounded-xl border border-white/12 bg-white/5 px-4 py-3 text-white hover:bg-white/10"
                onClick={handleStartScratch}
              >
                Start from scratch
              </button>
              <button
                className="rounded-xl bg-[oklch(0.488_0.243_264.376)] px-4 py-3 text-white hover:brightness-110"
                onClick={() => { setStartModalOpen(false); setUploadModalOpen(true); }}
              >
                Build upon existing
              </button>
            </div>
          </div>
        </div>
      )}

      {completedModalOpen && (
        <CompletedResumeModal
          resume={resume}
          fileName={resumeFileName}
          templateSlug={templateSlug}
          onClose={() => setCompletedModalOpen(false)}
        />
      )}

      {/* Upload modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-[rgba(26,26,26,0.35)] backdrop-blur-[2px]">
          <div
            role="dialog"
            aria-modal="true"
            className="w-[560px] max-w-[92vw] rounded-2xl p-7"
            style={{
              backgroundColor: "var(--app-surface)",
              border: "1px solid var(--app-border)",
              boxShadow: "var(--shadow-pop)",
              color: "var(--app-fg)",
            }}
          >
            <div className="font-display text-2xl font-light tracking-tight" style={{ color: "var(--app-fg)" }}>
              Upload your <span className="italic">resume</span>
            </div>
            <p className="mt-2 text-sm" style={{ color: "var(--app-fg-muted)" }}>
              We support PDF and DOCX formats. Your data will be extracted automatically.
            </p>
            <div
              className="mt-5 rounded-xl p-4"
              style={{
                backgroundColor: "var(--app-surface-2)",
                border: "1px dashed var(--app-border-strong)",
              }}
            >
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={onFileSelected}
                className="w-full text-sm file:mr-3 file:rounded-md file:px-3 file:py-2 file:border-0 file:cursor-pointer file:font-medium"
                style={{ color: "var(--app-fg-muted)" }}
              />
              <style>{`
                input[type="file"]::file-selector-button {
                  background-color: var(--accent-soft);
                  color: var(--accent-text);
                }
              `}</style>
              {uploadError && (
                <div className="mt-2 text-xs" style={{ color: "#B85273" }}>
                  {uploadError}
                </div>
              )}
              {selectedFile && !uploadError && (
                <div className="mt-2 text-xs" style={{ color: "var(--app-fg-muted)" }}>
                  Selected: {selectedFile.name}
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: "var(--app-surface)",
                  color: "var(--app-fg-muted)",
                  border: "1px solid var(--app-border-strong)",
                }}
                onClick={() => { setUploadModalOpen(false); setSelectedFile(null); setUploadError(null); handleStartScratch(); }}
              >
                Cancel
              </button>
              <button
                disabled={!selectedFile || !!uploadError || uploading}
                className="rounded-lg px-5 py-2 text-sm font-medium disabled:opacity-50 min-w-[110px] transition-colors"
                style={{ backgroundColor: "var(--accent)", color: "#ffffff" }}
                onClick={handleUploadContinue}
              >
                {uploading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <span className="h-3.5 w-3.5 rounded-full border-2 animate-spin" style={{ borderColor: "#ffffff", borderTopColor: "transparent" }} />
                    Parsing…
                  </span>
                ) : "Continue"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
