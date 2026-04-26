import type { ReactNode, ChangeEvent } from "react";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { AlertCircle, CheckCircle2, Download, ChevronDown } from "lucide-react";
import html2pdf from "html2pdf.js";
import { renderTemplate, type TemplateInput } from "@/lib/resume-templates";
import SiteNavbar from "../layout/site-navbar";
import PageWithSidebar from "../layout/page-with-sidebar";
import { resumeService } from "@/services";
import type { ResumeContent } from "@/services/resume";
import { addResumeCreatedNotification } from "@/services/notifications";
import { useToast } from "@/contexts/ToastContext";


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
        <SwitchButton active={mode === 'ats'} onClick={() => setMode('ats')}>ATS Score</SwitchButton>
      </div>
    </div>
  );
}

type TabKey = "personal" | "experience" | "education" | "skills" | "summary" | "job" | "custom";

interface Experience {
  role: string;
  company: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  bullets: string[];
}

interface Education {
  school: string;
  degree?: string;
  field?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
}

interface JobDetails {
  title: string;
  company: string;
  location?: string;
  description: string;
}

interface CustomSection { title: string; content: string; }

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

interface ResumeData {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  portfolio: string;
  experiences: Experience[];
  education: Education[];
  skills: string[];
  skillCategories?: { category: string; skills: string[] }[];
  summary: string;
  job: JobDetails;
  customSections: CustomSection[];
}

const emptyResume: ResumeData = {
  name: "Abdullah Tahir",
  email: "ababdullah216@gmail.com",
  phone: "+923187070410",
  location: "Islamabad, Pakistan",
  linkedin: "linkedin.com/in/ababdullah216",
  portfolio: "github.com/ABAbdulah",
  experiences: [
    {
      role: "Associate Software Engineer",
      company: "Beaj",
      location: "Remote",
      startDate: "Dec 2025",
      endDate: "Present",
      bullets: [
        "Shipped a full CMS (React/TypeScript) for managing 3,428 learning activities across 57 courses, including a detailed editor, completeness heatmap, and filtered export pipeline",
        "Designed a unified Activity CRUD REST API handling 21 WhatsApp activity types (MCQ, speaking, conversational, media) with multi-file upload",
        "Built a Google Drive to Azure Blob sync service using BullMQ background workers, automating media management at scale",
        "Developed a bulk student enrollment tool (CSV preview + batch assignment) serving a 32,000+ user base",
        "Implemented a Dropout Risk dashboard segmenting learners into Critical / At Risk / Watch / On Track, enabling data-driven retention actions",
        "Refactored WhatsApp message delivery across 20+ flow files, centralizing queue pacing via BullMQ, improving reliability across 74,000+ messages",
      ],
    },
    {
      role: "Associate Software Engineer",
      company: "MicroAgility APAC",
      location: "Islamabad, Pakistan",
      startDate: "Jun 2025",
      endDate: "Dec 2025",
      bullets: [
        "Built and delivered client-facing portals using React/TypeScript, Tailwind CSS, and ShadCN, translating design specs into fully responsive, production-ready UIs across multiple client projects",
        "Integrated RESTful APIs end-to-end with Zod validation schemas, enforcing data integrity across all data-entry flows",
      ],
    },
    {
      role: "Software Engineer Intern",
      company: "FAIR (Football and AI Research)",
      location: "London, UK",
      startDate: "Nov 2024",
      endDate: "Apr 2025",
      bullets: [
        "Migrated 2GB+ of player and match data across 5 major football leagues in MongoDB with zero downtime, including schema normalization and integrity validation",
        "Scraped, cleaned, and mapped structured data for 10,000+ players from a third-party platform to internal API models, enabling downstream analytics features",
      ],
    },
  ],
  education: [
    {
      school: "National University of Computer and Emerging Sciences - FAST",
      degree: "Bachelor's in Computer Science",
      field: "Computer Science",
      startDate: "2021",
      endDate: "2025",
      location: "Islamabad, Pakistan",
    },
  ],
  skills: [
    "JavaScript (ES6+)", "TypeScript", "Python", "SQL",
    "Node.js", "Express.js", "FastAPI", "REST APIs", "BullMQ", "Sequelize", "Microservices",
    "React.js", "Next.js", "Tailwind CSS", "ShadCN", "Webpack/Vite", "HTML5/CSS3",
    "PostgreSQL", "MongoDB", "Redis", "MySQL", "Vector Databases", "Azure", "AWS (basic)", "Docker", "GitHub Actions", "Linux",
    "RAG", "Prompt Engineering", "Fine-tuning (Llama 3)", "LangChain", "Pandas", "Agile/Scrum", "Jest/Unit Testing",
  ],
  skillCategories: [
    { category: "Languages", skills: ["JavaScript (ES6+)", "TypeScript", "Python", "SQL"] },
    { category: "Backend", skills: ["Node.js", "Express.js", "FastAPI", "REST APIs", "BullMQ", "Sequelize", "Microservices"] },
    { category: "Frontend", skills: ["React.js", "Next.js", "Tailwind CSS", "ShadCN", "Webpack/Vite", "HTML5/CSS3"] },
    { category: "Data & Cloud", skills: ["PostgreSQL", "MongoDB", "Redis", "MySQL", "Vector Databases", "Azure", "AWS (basic)", "Docker", "GitHub Actions", "Linux"] },
    { category: "AI / ML", skills: ["RAG", "Prompt Engineering", "Fine-tuning (Llama 3)", "LangChain", "Pandas", "Agile/Scrum", "Jest/Unit Testing"] },
  ],
  summary:
    "Software Engineer with production experience building and deploying AI systems, fine-tuned Llama 3 with RAG, vector databases, and FastAPI inference. Full-stack background in Node.js/Python, React/TypeScript, and Azure, with AI-integrated features delivered at scale to 32,000+ users. Open to remote AI SWE roles with Australian teams.",
  job: { title: "", company: "", location: "", description: "" },
  customSections: [
    {
      title: "SerenityBot - Chatbot",
      content:
        "Fine-tuned Llama 3 on a HuggingFace mental health dataset with a custom RAG pipeline, enabling domain-specific context-aware responses beyond the base model's capability\nBuilt full-stack platform: React, FastAPI inference server, vector database for semantic retrieval, and conversation analytics",
    },
    {
      title: "ARCH360 – AR-powered Visualization Platform (Unity, C#, ARCore/ARKit)",
      content:
        "Built and shipped a cross-platform AR app in Unity (C#) for Android/iOS as a solo final year project at FAST NUCES\nIntegrated an AI-driven real-time customization engine, applying ML concepts to a production-style interactive system",
    },
  ],
};

/** Map API ResumeContent → local ResumeData */
function mapContentToLocal(content: ResumeContent): ResumeData {
  const info = (content.info ?? {}) as Record<string, string>;
  const experiences = (content.experience ?? []) as Record<string, string>[];
  const education = (content.education ?? []) as Record<string, string>[];
  const skills = (content.skills ?? []) as string[];
  const summary = typeof content.summary === "string" ? content.summary : "";
  const job = (content.job_description ?? {}) as Record<string, string>;
  const custom = (content.custom ?? {}) as Record<string, unknown>;

  // Backend stores AI-relevant inputs under `custom.projects`, and we also store the raw UI structure under `custom.sections`.
  const backendSections = custom.sections;
  const backendProjects = (custom as any).projects;

  const customSectionsFromBackend =
    Array.isArray(backendSections)
      ? (backendSections as any[]).map((s) => ({
          title: typeof s?.title === "string" ? s.title : "",
          content: typeof s?.content === "string" ? s.content : "",
        }))
      : [];

  const customSectionsFromProjects =
    Array.isArray(backendProjects) && customSectionsFromBackend.length === 0
      ? (backendProjects as any[]).map((p) => {
          const bullets = Array.isArray(p?.bullets) ? p.bullets : typeof p?.bullets === "string" ? [p.bullets] : [];
          return {
            title: typeof p?.title === "string" ? p.title : "Project",
            content: bullets.map((b: unknown) => String(b)).join("\n"),
          };
        })
      : [];

  const customSections = customSectionsFromBackend.length > 0 ? customSectionsFromBackend : customSectionsFromProjects;

  return {
    name: info.full_name ?? "",
    email: info.email ?? "",
    phone: info.phone ?? "",
    location: info.location ?? "",
    linkedin: info.linkedin_url ?? "",
    portfolio: info.portfolio_url ?? "",
    experiences: experiences.length > 0
      ? experiences.map((e) => ({
          role: e.role ?? "",
          company: e.company ?? "",
          location: e.location ?? "",
          startDate: e.start_date ?? "",
          endDate: e.end_date ?? "",
          bullets: e.description ? e.description.split("\n").filter(Boolean) : [],
        }))
      : emptyResume.experiences,
    education: education.length > 0
      ? education.map((e) => ({
          school: e.school ?? "",
          degree: e.degree ?? "",
          field: e.field_of_study ?? "",
          startDate: e.start_date ?? "",
          endDate: e.end_date ?? "",
          location: e.location ?? "",
        }))
      : emptyResume.education,
    skills,
    summary,
    job: {
      title: job.job_title ?? "",
      company: job.company ?? "",
      location: job.location ?? "",
      description: job.description ?? "",
    },
    customSections,
  };
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

/** Convert the builder's flat ResumeData → TemplateInput shape for template rendering */
function toTemplateInput(resume: ResumeData): TemplateInput {
  return {
    candidate_info: {
      name: resume.name,
      email: resume.email,
      phone: resume.phone,
      linkedin: resume.linkedin || undefined,
      portfolio: resume.portfolio || undefined,
    },
    resume: {
      summary: resume.summary,
      experiences: resume.experiences
        .filter(e => e.role || e.company || e.bullets.length)
        .map(e => ({
          role: e.role,
          company: e.company,
          location: e.location,
          startDate: e.startDate ?? '',
          endDate: e.endDate,
          bullets: e.bullets,
        })),
      projects: resume.customSections
        .filter(s => s.title || s.content)
        .map(s => ({
          title: s.title,
          bullets: s.content.split('\n').filter(Boolean),
        })),
      education: resume.education
        .filter(e => e.school || e.degree)
        .map(e => ({
          school: e.school,
          degree: e.degree ?? '',
          field: e.field ?? '',
          location: e.location,
          endDate: e.endDate ?? '',
        })),
      skills: resume.skillCategories?.length
        ? resume.skillCategories
        : resume.skills.length
          ? [{ category: 'Skills', skills: resume.skills }]
          : [],
    },
  };
}

/** Build resume HTML using the selected template */
function buildResumeHtmlForPdf(resume: ResumeData, templateSlug = 'modern-minimal'): string {
  return renderTemplate(templateSlug, toTemplateInput(resume));
}

function ResumePreview({
  mode,
  resume,
  ats,
  fileName,
  templateSlug = 'modern-minimal',
}: {
  mode: "preview" | "ats";
  resume: ResumeData;
  ats: AtsOptimizeSummary | null;
  fileName: string;
  templateSlug?: string;
}) {
  const score = typeof ats?.final_ats_score === "number" ? ats.final_ats_score : null;
  const initialScore = typeof ats?.initial_ats_score === "number" ? ats.initial_ats_score : null;
  const keywordsFound = Array.isArray(ats?.keywords_found) ? ats.keywords_found : [];
  const keywordsMissing = Array.isArray(ats?.keywords_missing) ? ats.keywords_missing : [];
  const initialKeywordsMissing = Array.isArray(ats?.initial_keywords_missing) ? ats.initial_keywords_missing : [];
  const circumference = 2 * Math.PI * 42;
  const pct = score != null ? Math.min(100, Math.max(0, score)) : 0;
  const dashOffset = circumference - (pct / 100) * circumference;
  const lift = score != null && initialScore != null ? score - initialScore : null;
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const previewIframeRef = useRef<HTMLIFrameElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Write template HTML into the iframe and scale to fit container
  const previewHtml = hasResumeContent(resume) ? buildResumeHtmlForPdf(resume, templateSlug) : '';
  useEffect(() => {
    const iframe = previewIframeRef.current;
    const container = previewContainerRef.current;
    if (!iframe || !previewHtml || !container) return;
    const doc = iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(previewHtml);
      doc.close();
    }
    const scale = container.clientWidth / 794;
    iframe.style.transform = `scale(${scale})`;
  }, [previewHtml]);

  const handleDownloadPdf = async () => {
    setDownloadOpen(false);
    setDownloading(true);
    try {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = buildResumeHtmlForPdf(resume, templateSlug);
      const resolvedName = (fileName.trim() || resume.name || "Untitled").replace(/[^a-zA-Z0-9 ]/g, "").trim();
      await html2pdf()
        .set({
          margin: [10, 10, 10, 10],
          filename: `${resolvedName}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(wrapper)
        .save();
    } catch {
      /* silently fail */
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="font-semibold">{mode === "preview" ? "Resume Preview" : "ATS Score"}</div>
        {mode === "preview" && hasResumeContent(resume) && (
          <div className="relative">
            <button
              onClick={() => setDownloadOpen((v) => !v)}
              disabled={downloading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
            >
              <Download className="size-3.5" />
              {downloading ? "Downloading…" : "Download"}
              <ChevronDown className={`size-3 transition-transform ${downloadOpen ? "rotate-180" : ""}`} />
            </button>
            {downloadOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setDownloadOpen(false)} />
                <div className="absolute right-0 top-full mt-1 z-20 w-44 rounded-lg border border-white/10 bg-[#0C1426] shadow-xl overflow-hidden">
                  <button onClick={handleDownloadPdf} className="w-full text-left px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors">
                    Download as PDF
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
              Fill the form or use <strong className="text-white/70">Save &amp; Next</strong> on the last tab to run AI optimize — your resume will show here.
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
            <div className="relative z-10 text-sm text-white/50 py-6">
              Run <strong className="text-white/70">Save &amp; Next</strong> on the Projects tab to optimize with AI — your ATS score from the pipeline will appear here.
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
  const [templateSlug, _setTemplateSlug] = useState(initialTemplate);

  // Always start blank — data is loaded via API only
  const [resume, setResume] = useState<ResumeData>(emptyResume);
  const [resumeId, setResumeId] = useState<number | null>(null);
  const [resumeFileName, setResumeFileName] = useState("");
  const [saving, setSaving] = useState(false);
  const [optimizeError, setOptimizeError] = useState<string | null>(null);
  const [errors, setErrors] = useState<SectionErrors>({});
  /** Last ATS summary from `ai/optimize` (drives ATS tab + real scores). */
  const [atsFromOptimize, setAtsFromOptimize] = useState<AtsOptimizeSummary | null>(null);

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
      })
      .catch(() => {
        // If load fails, fall back to new resume flow
        setStartModalOpen(true);
      });
  }, [editId]);

  // Persist mid-session edits to localStorage (not on initial load)
  useEffect(() => {
    if (resumeId !== null) {
      try { localStorage.setItem('resumeData', JSON.stringify(resume)); } catch {}
    }
  }, [resume, resumeId]);

  // Sync title to backend when resumeFileName changes
  useEffect(() => {
    if (resumeId === null) return;
    const timer = setTimeout(() => {
      resumeService.update(resumeId, { title: resumeFileName || resume.name || "Untitled" }).catch(() => {});
    }, 600);
    return () => clearTimeout(timer);
  }, [resumeFileName]);

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
    setResume(emptyResume);
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

    // Frontend validation — if required fields are missing, mark them red
    // and don't bother the API.
    const validation = validateSection(activeTab, resume);
    if (validation) {
      setErrors(validation);
      showToast("Please fill in all required fields.", "error");
      return;
    }
    setErrors({});

    if (resumeId !== null) {
      const mapped = localToApiSection(activeTab, resume);

      // "Save & Next" on the final tab triggers AI optimization/generation.
      setSaving(true);
      setOptimizeError(null);
      try {
        if (mapped) {
          await resumeService.patchContent(resumeId, mapped.section, mapped.body);
          if (activeTab !== "custom") {
            showToast("Section saved successfully!");
          }
        }

        if (activeTab === "custom") {
          if (!resume.job.description.trim()) {
            setOptimizeError("Please fill in the Job Description before generating your optimized resume.");
            setSaving(false);
            return;
          }
          const optimized = await resumeService.optimizeWithAi(resumeId);
          if (optimized?.resume) {
            setResume(mapContentToLocal(optimized.resume));
            const rawAts = optimized.ats;
            if (rawAts && typeof rawAts === "object" && !Array.isArray(rawAts)) {
              setAtsFromOptimize(rawAts as AtsOptimizeSummary);
            }
            setPreviewMode("ats");
            showToast("Resume optimized and generated successfully!");
          }
        }
      } catch (err) {
        console.error(err);
        if (activeTab === "custom") {
          const msg = (err as Error).message || "Failed to optimize resume. Please try again.";
          setOptimizeError(msg);
          showToast(msg, "error");
        } else {
          showToast("Failed to save section.", "error");
        }
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

          {optimizeError && (
            <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {optimizeError}
            </div>
          )}

          <div className="mt-6 flex justify-between items-center">
            <button className="rounded-lg border border-white/15 px-5 py-2 text-sm text-white/80 hover:bg-white/[0.06]" onClick={goPrev}>Back</button>
            <button
              className="rounded-lg bg-[oklch(0.488_0.243_264.376)] px-5 py-2 text-sm text-white disabled:opacity-60"
              onClick={goNext}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save & Next"}
            </button>
          </div>
        </div>

        {/* Right side — Preview */}
        <div className="xl:sticky xl:top-[80px] xl:self-start">
          <ResumePreview mode={previewMode} resume={resume} ats={atsFromOptimize} fileName={resumeFileName} templateSlug={templateSlug} />
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
            <button className="mt-4 text-xs text-white/60 hover:text-white" onClick={handleStartScratch}>Skip</button>
          </div>
        </div>
      )}

      {/* Upload modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div role="dialog" aria-modal="true" className="w-[560px] max-w-[92vw] rounded-2xl bg-[#0f162a] border border-white/12 p-6">
            <div className="text-lg font-semibold">Upload your resume</div>
            <p className="text-white/60 mt-1 text-sm">We support PDF and DOCX formats. Your data will be extracted automatically.</p>
            <div className="mt-4 rounded-xl bg-white/[0.03] border border-white/10 p-4">
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={onFileSelected}
                className="w-full text-sm file:mr-3 file:rounded-md file:bg-white/10 file:text-white file:px-3 file:py-2 file:border file:border-white/20"
              />
              {uploadError && <div className="mt-2 text-xs text-red-400">{uploadError}</div>}
              {selectedFile && !uploadError && <div className="mt-2 text-xs text-white/70">Selected: {selectedFile.name}</div>}
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <button
                className="rounded-lg px-4 py-2 text-sm bg-white/6 border border-white/12 text-white/80 hover:text-white"
                onClick={() => { setUploadModalOpen(false); setSelectedFile(null); setUploadError(null); handleStartScratch(); }}
              >
                Cancel
              </button>
              <button
                disabled={!selectedFile || !!uploadError || uploading}
                className="rounded-lg px-4 py-2 text-sm bg-[oklch(0.488_0.243_264.376)] text-white disabled:opacity-50 min-w-[90px]"
                onClick={handleUploadContinue}
              >
                {uploading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
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
