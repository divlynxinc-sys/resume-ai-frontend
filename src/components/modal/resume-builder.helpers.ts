/**
 * Pure helpers used by the resume-builder. Lives in its own module so
 * Node-side test scripts can import these directly via esbuild without
 * trying to bundle the React component tree.
 */

import type { ResumeContent } from "@/services/resume";

export interface Experience {
  role: string;
  company: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  bullets: string[];
}

export interface Education {
  school: string;
  degree?: string;
  field?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
}

export interface JobDetails {
  title: string;
  company: string;
  location?: string;
  description: string;
}

export interface CustomSection {
  title: string;
  content: string;
}

export interface ResumeData {
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

import type { TemplateInput } from "@/lib/resume-templates";

/**
 * Walk experience bullets looking for a "PROJECT(S)" header line. Everything
 * after that line is parsed back into discrete projects.
 *
 * The AI optimizer that produces this malformed shape ALSO splits long
 * bullets at wrap points and concatenates inline URL+subtitle lines, so
 * the parser uses two strong signals:
 *   • A line starting with lowercase = continuation, append to last bullet
 *   • A line containing an inline URL = extract the URL as the project link
 *     and discard the surrounding subtitle prose
 * Project titles are identified by look-ahead (next non-empty line is a
 * URL or contains an inline URL), which is a much more reliable signal
 * than action-verb heuristics.
 */
export function extractEmbeddedProjects(experiences: Experience[]): { experiences: Experience[]; extracted: CustomSection[] } {
  const HEADER = /^\s*(PROJECTS?|PROJEKTS?)\s*$/i;
  const URL_LINE = /^(https?:\/\/|www\.|github\.com\/)\S+$/i;
  const URL_INLINE = /(https?:\/\/\S+|github\.com\/\S+)/i;
  const STRAY_HEADER = /^(EDUCATION|SKILLS|EXPERIENCE|SUMMARY)\s*$/i;

  const out: Experience[] = [];
  const extracted: CustomSection[] = [];

  for (const exp of experiences) {
    const headerIdx = exp.bullets.findIndex((b) => HEADER.test(b));
    if (headerIdx === -1) {
      out.push(exp);
      continue;
    }

    out.push({ ...exp, bullets: exp.bullets.slice(0, headerIdx) });

    const post = exp.bullets.slice(headerIdx + 1).map((s) => s.trim()).filter(Boolean);
    let current: { title: string; link: string; bullets: string[] } | null = null;
    const flushCurrent = () => { if (current) extracted.push(serializeProject(current)); };

    for (let i = 0; i < post.length; i++) {
      const line = post[i];
      if (STRAY_HEADER.test(line)) continue;

      // Whole-line URL → assign as link for the current (or fresh) project
      if (URL_LINE.test(line)) {
        if (current) current.link = current.link || line;
        else current = { title: "Project", link: line, bullets: [] };
        continue;
      }

      // Lowercase start → continuation of the previous bullet (the AI
      // optimizer split long bullets at wrap points)
      if (/^[a-z]/.test(line)) {
        if (current && current.bullets.length) {
          current.bullets[current.bullets.length - 1] += " " + line;
        } else {
          if (!current) current = { title: "Project", link: "", bullets: [] };
          current.bullets.push(line);
        }
        continue;
      }

      // Inline URL → extract the URL as link, drop surrounding subtitle prose
      const inline = URL_INLINE.exec(line);
      if (inline) {
        if (current && !current.link) current.link = inline[0];
        else if (!current) current = { title: "Project", link: inline[0], bullets: [] };
        continue;
      }

      // Look ahead: does the next non-empty line contain a URL?
      let nextHasUrl = false;
      if (i + 1 < post.length) {
        const next = post[i + 1];
        if (URL_LINE.test(next) || URL_INLINE.test(next)) nextHasUrl = true;
      }

      if (nextHasUrl && line.length < 150) {
        // Title (followed by URL line — strongest signal we have)
        flushCurrent();
        current = { title: line, link: "", bullets: [] };
      } else {
        // Regular bullet (uppercase start, no URL, no title look-ahead)
        if (!current) current = { title: "Project", link: "", bullets: [] };
        current.bullets.push(line);
      }
    }

    flushCurrent();
  }

  return { experiences: out, extracted };
}

function serializeProject(p: { title: string; link: string; bullets: string[] }): CustomSection {
  const lines: string[] = [];
  if (p.link) lines.push(p.link);
  lines.push(...p.bullets);
  return { title: p.title, content: lines.join("\n") };
}

/** Map API ResumeContent → local ResumeData */
export function mapContentToLocal(content: ResumeContent, emptyResume: ResumeData): ResumeData {
  const info = (content.info ?? {}) as Record<string, string>;
  const experiences = (content.experience ?? []) as Record<string, string>[];
  const education = (content.education ?? []) as Record<string, string>[];
  const skills = (content.skills ?? []) as string[];
  const summary = typeof content.summary === "string" ? content.summary : "";
  const job = (content.job_description ?? {}) as Record<string, string>;
  const custom = (content.custom ?? {}) as Record<string, unknown>;

  const backendSections = custom.sections;
  const backendProjects = (custom as { projects?: unknown }).projects;

  const customSectionsFromBackend =
    Array.isArray(backendSections)
      ? (backendSections as Record<string, unknown>[]).map((s) => ({
          title: typeof s?.title === "string" ? s.title : "",
          content: typeof s?.content === "string" ? s.content : "",
        }))
      : [];

  const customSectionsFromProjects =
    Array.isArray(backendProjects) && customSectionsFromBackend.length === 0
      ? (backendProjects as Record<string, unknown>[]).map((p) => {
          const bullets = Array.isArray(p?.bullets) ? p.bullets : typeof p?.bullets === "string" ? [p.bullets] : [];
          return {
            title: typeof p?.title === "string" ? p.title : "Project",
            content: bullets.map((b) => String(b)).join("\n"),
          };
        })
      : [];

  const customSections = customSectionsFromBackend.length > 0 ? customSectionsFromBackend : customSectionsFromProjects;

  const backendSkillCategories = (custom as { skillCategories?: unknown }).skillCategories;
  const skillCategories = Array.isArray(backendSkillCategories)
    ? (backendSkillCategories as Record<string, unknown>[])
        .filter((c) => c && typeof c.category === "string" && Array.isArray(c.skills))
        .map((c) => ({ category: c.category as string, skills: (c.skills as unknown[]).map(String) }))
    : undefined;

  const rawExperiences = experiences.length > 0
    ? experiences.map((e) => ({
        role: e.role ?? "",
        company: e.company ?? "",
        location: e.location ?? "",
        startDate: e.start_date ?? "",
        endDate: e.end_date ?? "",
        bullets: e.description ? e.description.split("\n").filter(Boolean) : [],
      }))
    : emptyResume.experiences;

  const { experiences: cleanExperiences, extracted: extractedProjects } =
    extractEmbeddedProjects(rawExperiences);

  const finalCustomSections =
    customSections.length === 0 && extractedProjects.length > 0
      ? extractedProjects
      : customSections;

  return {
    name: info.full_name ?? "",
    email: info.email ?? "",
    phone: info.phone ?? "",
    location: info.location ?? "",
    linkedin: info.linkedin_url ?? "",
    portfolio: info.portfolio_url ?? "",
    experiences: cleanExperiences,
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
    skillCategories: skillCategories?.length ? skillCategories : undefined,
    summary,
    job: {
      title: job.job_title ?? "",
      company: job.company ?? "",
      location: job.location ?? "",
      description: job.description ?? "",
    },
    customSections: finalCustomSections,
  };
}

/** Convert ResumeData (form shape) → TemplateInput (template shape) */
export function toTemplateInput(resume: ResumeData): TemplateInput {
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
        .filter((e) => e.role || e.company || e.bullets.length)
        .map((e) => ({
          role: e.role,
          company: e.company,
          location: e.location,
          startDate: e.startDate ?? "",
          endDate: e.endDate,
          bullets: e.bullets,
        })),
      projects: resume.customSections
        .filter((s) => s.title || s.content)
        .map((s) => {
          const lines = s.content.split("\n").map((l) => l.trim()).filter(Boolean);
          let link = "";
          const bullets: string[] = [];
          for (const line of lines) {
            if (!link && /^(https?:\/\/|www\.|github\.com\/)/i.test(line)) {
              link = line;
            } else {
              bullets.push(line);
            }
          }
          return { title: s.title, link, bullets };
        }),
      education: resume.education
        .filter((e) => e.school || e.degree)
        .map((e) => ({
          school: e.school,
          degree: e.degree ?? "",
          field: e.field ?? "",
          location: e.location,
          endDate: e.endDate ?? "",
        })),
      skills: resume.skillCategories?.length
        ? resume.skillCategories
        : resume.skills.length
          ? [{ category: "Skills", skills: resume.skills }]
          : [],
    },
  };
}
