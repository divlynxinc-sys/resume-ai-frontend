import type { ReactNode, ChangeEvent } from "react";
import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Wand2, AlertCircle, CheckCircle2 } from "lucide-react";
import SiteNavbar from "../layout/site-navbar";
import PageWithSidebar from "../layout/page-with-sidebar";
import { resumeService } from "@/services";
import type { ResumeContent } from "@/services/resume";


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
  summary: string;
  job: JobDetails;
  customSections: CustomSection[];
}

const emptyResume: ResumeData = {
  name: "",
  email: "",
  phone: "",
  location: "",
  linkedin: "",
  portfolio: "",
  experiences: [{ role: "", company: "", location: "", startDate: "", endDate: "", bullets: [] }],
  education: [{ school: "", degree: "", field: "", startDate: "", endDate: "", location: "" }],
  skills: [],
  summary: "",
  job: { title: "", company: "", location: "", description: "" },
  customSections: [],
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
            content: bullets.map((b) => String(b)).join("\n"),
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
    { key: "personal", label: "Personal Info" },
    { key: "experience", label: "Experience" },
    { key: "education", label: "Education" },
    { key: "skills", label: "Skills" },
    { key: "summary", label: "Summary" },
    { key: "job", label: "Job Description" },
    { key: "custom", label: "Custom" },
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

function TextInput({ placeholder = "", value, onChange, type = "text" }: { placeholder?: string; value?: string; onChange?: (v: string) => void; type?: string }) {
  return (
    <input
      value={value ?? ""}
      onChange={(e) => onChange?.(e.target.value)}
      type={type}
      placeholder={placeholder}
      className="w-full rounded-lg border border-white/15 bg-[#0C1426] px-4 py-3 text-sm outline-none ring-0 placeholder:text-white/40 focus:border-white/25"
    />
  );
}

function TextArea({ placeholder = "", value, onChange, rows = 4 }: { placeholder?: string; value?: string; onChange?: (v: string) => void; rows?: number }) {
  return (
    <textarea
      value={value ?? ""}
      onChange={(e) => onChange?.(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      className="w-full rounded-lg border border-white/15 bg-[#0C1426] px-4 py-3 text-sm outline-none ring-0 placeholder:text-white/40 focus:border-white/25"
    />
  );
}

function PersonalInfoForm({ resume, setResume }: { resume: ResumeData; setResume: (r: ResumeData) => void }) {
  return (
    <div className="rounded-xl border border-white/10 p-4 bg-white/[0.04]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>Full Name</Label>
          <TextInput value={resume.name} onChange={(v) => setResume({ ...resume, name: v })} />
        </div>
        <div>
          <Label>Email</Label>
          <TextInput value={resume.email} onChange={(v) => setResume({ ...resume, email: v })} />
        </div>
        <div>
          <Label>Phone</Label>
          <TextInput value={resume.phone} onChange={(v) => setResume({ ...resume, phone: v })} />
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

function EducationForm({ resume, setResume }: { resume: ResumeData; setResume: (r: ResumeData) => void }) {
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
      {resume.education.map((ed, idx) => (
        <div key={idx} className="rounded-xl border border-white/10 p-4 bg-white/[0.04]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>School</Label>
              <TextInput value={ed.school} onChange={(v) => updateEd(idx, { school: v })} />
            </div>
            <div>
              <Label>Degree</Label>
              <TextInput value={ed.degree ?? ""} onChange={(v) => updateEd(idx, { degree: v })} />
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
                <TextInput value={ed.startDate ?? ""} onChange={(v) => updateEd(idx, { startDate: v })} placeholder="Aug 2019" />
              </div>
              <div>
                <Label>End Date</Label>
                <TextInput value={ed.endDate ?? ""} onChange={(v) => updateEd(idx, { endDate: v })} placeholder="May 2023" />
              </div>
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <button className="text-sm rounded-md border border-white/20 px-3 py-1 hover:bg-white/[0.06]" onClick={() => removeEd(idx)}>Remove</button>
          </div>
        </div>
      ))}
      <button className="rounded-lg bg-[oklch(0.488_0.243_264.376)] px-4 py-2 text-sm text-white" onClick={addEd}>Add Education</button>
    </div>
  );
}

function SkillsForm({ resume, setResume }: { resume: ResumeData; setResume: (r: ResumeData) => void }) {
  const [input, setInput] = useState<string>("");
  const addSkill = () => {
    const s = input.trim();
    if (!s) return;
    setResume({ ...resume, skills: [...resume.skills, s] });
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

function JobDescriptionForm({ resume, setResume }: { resume: ResumeData; setResume: (r: ResumeData) => void }) {
  const updateJob = (patch: Partial<JobDetails>) => {
    setResume({ ...resume, job: { ...resume.job, ...patch } });
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <Label>Job Title</Label>
        <TextInput value={resume.job.title} onChange={(v) => updateJob({ title: v })} placeholder="e.g., Frontend Engineer" />
      </div>
      <div>
        <Label>Company</Label>
        <TextInput value={resume.job.company} onChange={(v) => updateJob({ company: v })} placeholder="e.g., Acme Corp" />
      </div>
      <div>
        <Label>Location</Label>
        <TextInput value={resume.job.location ?? ""} onChange={(v) => updateJob({ location: v })} placeholder="City, Country or Remote" />
      </div>
      <div className="md:col-span-2">
        <Label>Job Description / Key Requirements</Label>
        <TextArea value={resume.job.description} onChange={(v) => updateJob({ description: v })} rows={8} placeholder="Paste the job description here." />
      </div>
    </div>
  );
}

function CustomSectionsForm({ resume, setResume }: { resume: ResumeData; setResume: (r: ResumeData) => void }) {
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
              <Label>Section Title</Label>
              <TextInput value={sec.title} onChange={(v) => updateSection(idx, { title: v })} />
            </div>
            <div>
              <Label>Content</Label>
              <TextArea value={sec.content} onChange={(v) => updateSection(idx, { content: v })} rows={6} />
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <button className="text-sm rounded-md border border-white/20 px-3 py-1 hover:bg-white/[0.06]" onClick={() => removeSection(idx)}>Remove</button>
          </div>
        </div>
      ))}
      <button className="rounded-lg bg-[oklch(0.488_0.243_264.376)] px-4 py-2 text-sm text-white" onClick={addSection}>Add Section</button>
    </div>
  );
}

function AIAssistantCard() {
  return (
    <div className="relative rounded-2xl bg-white/5 border border-white/10 p-6">
      <span className="absolute -top-2 -right-2 rounded-full bg-blue-600/20 text-blue-300 text-[10px] font-semibold px-2 py-1 border border-blue-500/60 shadow-[0_0_20px_rgba(59,130,246,0.6)]">FEATURED</span>
      <div className="flex items-center gap-2">
        <Wand2 className="size-4 text-white/80" />
        <div className="font-semibold">AI Assistant</div>
      </div>
      <p className="text-sm text-white/60 mt-2">Get personalized suggestions and generate content with AI.</p>
      <Link to="/ai-chat" className="mt-4 w-full rounded-lg border border-blue-500/30 bg-transparent px-4 py-2 text-sm text-blue-100 shadow-[0_0_10px_rgba(59,130,246,0.1)] transition-all hover:bg-blue-500/10 hover:border-blue-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] inline-flex items-center justify-center">Generate with Juno AI</Link>
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

function ResumePreview({
  mode,
  resume,
  ats,
}: {
  mode: "preview" | "ats";
  resume: ResumeData;
  ats: AtsOptimizeSummary | null;
}) {
  const score = typeof ats?.final_ats_score === "number" ? ats.final_ats_score : null;
  const keywordsFound = Array.isArray(ats?.keywords_found) ? ats.keywords_found : [];
  const keywordsMissing = Array.isArray(ats?.keywords_missing) ? ats.keywords_missing : [];
  const circumference = 2 * Math.PI * 42;
  const pct = score != null ? Math.min(100, Math.max(0, score)) : 0;
  const dashOffset = circumference - (pct / 100) * circumference;

  return (
    <div>
      <div className="font-semibold mb-4">{mode === "preview" ? "Resume Preview" : "ATS Score"}</div>

      {mode === "preview" ? (
        <div className="rounded-2xl bg-[#0f162a] border border-white/10 p-4">
          {!hasResumeContent(resume) ? (
            <div className="text-sm text-white/50 text-center py-12 px-4">
              Fill the form or use <strong className="text-white/70">Save &amp; Next</strong> on the last tab to run AI optimize — your resume will show here.
            </div>
          ) : (
            <div className="max-h-[480px] overflow-y-auto rounded-xl bg-[#e9c5a6] p-3 shadow-inner">
              <div className="bg-white rounded-sm shadow-xl text-[11px] text-gray-900 leading-snug p-4 min-h-[300px]">
                <div className="text-base font-bold text-gray-900 border-b border-gray-200 pb-2 mb-2">
                  {resume.name || "Your name"}
                </div>
                <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[9px] text-gray-600 mb-3">
                  {[resume.email, resume.phone, resume.location, resume.linkedin, resume.portfolio]
                    .filter(Boolean)
                    .map((bit, i) => (
                      <span key={i}>{bit}</span>
                    ))}
                </div>
                {resume.summary ? (
                  <>
                    <div className="text-[10px] font-bold uppercase tracking-wide text-gray-700 mb-1">Summary</div>
                    <p className="text-gray-800 mb-3 whitespace-pre-wrap">{resume.summary}</p>
                  </>
                ) : null}
                {resume.experiences.some((e) => e.role || e.company || e.bullets.length) ? (
                  <>
                    <div className="text-[10px] font-bold uppercase tracking-wide text-gray-700 mb-1">Experience</div>
                    <div className="space-y-2 mb-3">
                      {resume.experiences
                        .filter((e) => e.role || e.company || e.bullets.length)
                        .map((e, idx) => (
                          <div key={idx}>
                            <div className="font-semibold text-gray-900">
                              {e.role}
                              {e.company ? ` — ${e.company}` : ""}
                            </div>
                            {(e.startDate || e.endDate) && (
                              <div className="text-[9px] text-gray-500">
                                {[e.startDate, e.endDate].filter(Boolean).join(" – ")}
                              </div>
                            )}
                            {e.bullets.length > 0 && (
                              <ul className="list-disc pl-4 mt-0.5 text-gray-800 space-y-0.5">
                                {e.bullets.map((b, j) => (
                                  <li key={j}>{b}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                    </div>
                  </>
                ) : null}
                {resume.education.some((e) => e.school || e.degree) ? (
                  <>
                    <div className="text-[10px] font-bold uppercase tracking-wide text-gray-700 mb-1">Education</div>
                    <div className="space-y-1 mb-3">
                      {resume.education
                        .filter((e) => e.school || e.degree)
                        .map((e, idx) => (
                          <div key={idx}>
                            <div className="font-semibold">{e.school}</div>
                            <div className="text-[9px] text-gray-600">
                              {[e.degree, e.field].filter(Boolean).join(" · ")}
                              {(e.startDate || e.endDate) && ` · ${[e.startDate, e.endDate].filter(Boolean).join(" – ")}`}
                            </div>
                          </div>
                        ))}
                    </div>
                  </>
                ) : null}
                {resume.skills.length > 0 ? (
                  <>
                    <div className="text-[10px] font-bold uppercase tracking-wide text-gray-700 mb-1">Skills</div>
                    <p className="text-gray-800">{resume.skills.join(", ")}</p>
                  </>
                ) : null}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl bg-[#0f162a] border border-white/10 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-blue-500/10 blur-[60px] rounded-full pointer-events-none" />
          {score == null ? (
            <div className="relative z-10 text-sm text-white/50 py-6">
              Run <strong className="text-white/70">Save &amp; Next</strong> on the Custom tab to optimize with AI — your ATS score from the pipeline will appear here.
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
              {keywordsFound.length > 0 && (
                <div className="relative z-10 mb-4">
                  <div className="text-xs font-semibold text-white/80 mb-2">Keywords found</div>
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
                    Gaps (missing keywords)
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

  const [activeTab, setActiveTab] = useState<TabKey>('personal');
  const [previewMode, setPreviewMode] = useState<'preview' | 'ats'>('preview');

  // Always start blank — data is loaded via API only
  const [resume, setResume] = useState<ResumeData>(emptyResume);
  const [resumeId, setResumeId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
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

  /** Start from scratch: create a new blank resume on the backend */
  const handleStartScratch = async () => {
    setStartModalOpen(false);
    setResume(emptyResume);
    localStorage.removeItem('resumeData');
    try {
      const r = await resumeService.create({ title: "New Resume", template_id: null });
      setResumeId(r.id);
    } catch {
      // resume still usable locally even if API fails
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
    } catch (err: unknown) {
      setUploadError((err as Error).message || "Failed to parse resume. Try a different file.");
    } finally {
      setUploading(false);
    }
  };

  const order: TabKey[] = ['personal', 'experience', 'education', 'skills', 'summary', 'job', 'custom'];

  /** Save current section then advance */
  const goNext = async () => {
    const idx = order.indexOf(activeTab);

    if (resumeId !== null) {
      const mapped = localToApiSection(activeTab, resume);

      // "Save & Next" on the final tab triggers AI optimization/generation.
      setSaving(true);
      try {
        if (mapped) {
          await resumeService.patchContent(resumeId, mapped.section, mapped.body);
        }

        if (activeTab === "custom") {
          const optimized = await resumeService.optimizeWithAi(resumeId);
          if (optimized?.resume) {
            setResume(mapContentToLocal(optimized.resume));
            const rawAts = optimized.ats;
            if (rawAts && typeof rawAts === "object" && !Array.isArray(rawAts)) {
              setAtsFromOptimize(rawAts as AtsOptimizeSummary);
            }
            setPreviewMode("ats");
          }
        }
      } catch (err) {
        // fail silently — user still has local edits
        console.error(err);
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
      case 'personal':   return <PersonalInfoForm resume={resume} setResume={setResume} />;
      case 'experience': return <ExperienceForm resume={resume} setResume={setResume} />;
      case 'education':  return <EducationForm resume={resume} setResume={setResume} />;
      case 'skills':     return <SkillsForm resume={resume} setResume={setResume} />;
      case 'summary':    return <SummaryForm resume={resume} setResume={setResume} />;
      case 'job':        return <JobDescriptionForm resume={resume} setResume={setResume} />;
      case 'custom':     return <CustomSectionsForm resume={resume} setResume={setResume} />;
      default:           return null;
    }
  };

  return (
    <div className="min-h-svh bg-[var(--app-bg)] text-white">
      <SiteNavbar />
      <PageWithSidebar activeRoute="my-resumes" mainClassName="max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left (main form) */}
        <div className="lg:col-span-2">
          <PageHeader mode={previewMode} setMode={setPreviewMode} />
          <Tabs active={activeTab} onChange={setActiveTab} />

          <div className="mt-6">
            {renderForm()}
          </div>

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

        {/* Right side */}
        <div className="space-y-8">
          <AIAssistantCard />
          <ResumePreview mode={previewMode} resume={resume} ats={atsFromOptimize} />
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
