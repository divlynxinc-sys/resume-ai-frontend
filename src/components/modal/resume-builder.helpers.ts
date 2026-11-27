/**
 * Pure helpers used by the resume-builder. Lives in its own module so
 * Node-side test scripts can import these directly via esbuild without
 * trying to bundle the React component tree.
 */

import type { ResumeContent } from "@/services/resume";
import { linkParts } from "@/lib/resume-templates/utils";
import type { ProjectItem } from "@/lib/resume-templates/types";

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
  /** Optional explicit project link (feature 1.4 — "link display mode"). */
  link?: string;
  /** Optional custom display text for the link; falls back to the raw URL. */
  linkLabel?: string;
}

/**
 * Resolve a custom section's project link + bullets. Prefers the explicit
 * `link`/`linkLabel` fields (feature 1.4); falls back to sniffing a URL out of
 * the content lines for resumes authored before those fields existed.
 */
export function resolveProjectFromSection(s: CustomSection): { url: string; label: string; bullets: string[] } {
  const lines = (s.content ?? "").split("\n").map((line) => line.trim()).filter(Boolean);
  let url = linkParts(s.link)?.href ?? "";
  const bullets: string[] = [];
  for (const line of lines) {
    const legacyUrl = s.link === undefined && !url && /^(https?:\/\/|www\.|github\.com\/)/i.test(line)
      ? linkParts(line)?.href
      : undefined;
    if (legacyUrl) {
      url = legacyUrl;
    } else {
      const bullet = projectBullet(line);
      if (bullet) bullets.push(bullet);
    }
  }
  return { url, label: (s.linkLabel ?? "").trim(), bullets };
}

function projectBullet(line: string): string {
  return line.trim().replace(/^(?:[-*•]|\d+\.)\s+/, "").trim();
}

function optionalText(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function records(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value)
    ? value.filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object" && !Array.isArray(item)))
    : [];
}

function structuredProjectToSection(project: Record<string, unknown>): CustomSection {
  const details = Array.isArray(project.bullets)
    ? project.bullets.filter((bullet): bullet is string => typeof bullet === "string").join("\n")
    : optionalText(project.bullets);
  const link = project.link && typeof project.link === "object"
    ? project.link as Record<string, unknown>
    : {};
  return {
    title: optionalText(project.title) ?? optionalText(project.name) ?? "",
    content: details?.trim() ? details : optionalText(project.description) ?? "",
    link: optionalText(project.link) ?? optionalText(link.url) ?? optionalText(link.link) ?? optionalText(project.url),
    linkLabel: optionalText(link.label) ?? optionalText(project.link_label),
  };
}

function projectTitle(section: CustomSection): string {
  return section.title?.trim() || "Project";
}

function hasProjectContent(section: CustomSection): boolean {
  const { url, bullets } = resolveProjectFromSection(section);
  return Boolean(section.title?.trim() || url || bullets.length);
}

export function readProjectSections(custom: ResumeContent["custom"]): CustomSection[] {
  const sections = records(custom.sections).map((section): CustomSection => ({
    title: optionalText(section.title) ?? "",
    content: optionalText(section.content) ?? "",
    link: optionalText(section.link),
    linkLabel: optionalText(section.linkLabel),
  })).filter(hasProjectContent);
  const projects = records(custom.projects).map(structuredProjectToSection).filter(hasProjectContent);
  const used = new Set<CustomSection>();
  const merged = sections.map((section) => {
    const title = projectTitle(section).toLowerCase();
    const original = resolveProjectFromSection(section);
    const candidates = projects.filter((project) =>
      !used.has(project) && projectTitle(project).toLowerCase() === title);
    const match = candidates.find((project) => resolveProjectFromSection(project).url === original.url)
      ?? (candidates.length === 1 && (!original.url || !resolveProjectFromSection(candidates[0]).url)
        ? candidates[0]
        : undefined);
    if (!match) return section;

    used.add(match);
    const mirrored = resolveProjectFromSection(match);
    const bullets = new Set(original.bullets);
    const extra = mirrored.bullets.filter((bullet) => !bullets.has(bullet));
    return {
      ...section,
      content: extra.length ? [section.content, ...extra].filter(Boolean).join("\n") : section.content,
      link: section.link ?? (original.url ? undefined : match.link),
      linkLabel: section.linkLabel ?? match.linkLabel,
    };
  });
  return [...merged, ...projects.filter((project) => !used.has(project))];
}

export function toTemplateProjects(sections: CustomSection[]): ProjectItem[] {
  return sections.filter(hasProjectContent).map((section) => {
    const { url, label, bullets } = resolveProjectFromSection(section);
    return { title: projectTitle(section), link: url ? { url, label: label || undefined } : undefined, bullets };
  });
}

export function projectSectionsToApi(sections: CustomSection[]) {
  const meaningful = sections.filter(hasProjectContent);
  return {
    sections: meaningful,
    projects: meaningful.map((section) => {
      const { url, label, bullets } = resolveProjectFromSection(section);
      return { title: projectTitle(section), link: url, link_label: label || undefined, bullets };
    }),
  };
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

  const customSections = readProjectSections(custom);

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

export const blankResume: ResumeData = {
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

/** Flatten a ResumeData to plain text, for tools (the ATS checker) that score raw text rather than a template. */
export function resumeDataToPlainText(r: ResumeData): string {
  const lines: string[] = [];
  if (r.name) lines.push(r.name);
  const contact = [r.email, r.phone, r.location].filter(Boolean).join(" | ");
  if (contact) lines.push(contact);
  if (r.summary) lines.push("", "Summary", r.summary);
  if (r.experiences.length) {
    lines.push("", "Experience");
    for (const e of r.experiences) {
      lines.push(`${e.role} — ${e.company}${e.location ? `, ${e.location}` : ""} (${e.startDate || "?"} – ${e.endDate || "Present"})`);
      lines.push(...e.bullets.map((b) => `• ${b}`));
    }
  }
  if (r.education.length) {
    lines.push("", "Education");
    for (const ed of r.education) lines.push(`${ed.degree ? `${ed.degree}, ` : ""}${ed.school}${ed.endDate ? ` (${ed.endDate})` : ""}`);
  }
  const skillsList = r.skillCategories?.length ? r.skillCategories.flatMap((c) => c.skills) : r.skills;
  if (skillsList.length) lines.push("", "Skills", skillsList.join(", "));
  return lines.join("\n");
}

// --- Per-resume local draft persistence ---------------------------------------
// Shared by the builder (which writes drafts) and the My Resumes previews (which
// read them) so the card preview reflects the latest local edits AND the chosen
// template — keyed by resume id so one resume's edits never leak into another.
const DRAFT_PREFIX = "resume-draft:";

export interface ResumeDraft {
  resume?: ResumeData;
  templateSlug?: string;
}

export function readResumeDraft(id: number): ResumeDraft | null {
  try {
    const raw = localStorage.getItem(`${DRAFT_PREFIX}${id}`);
    return raw ? (JSON.parse(raw) as ResumeDraft) : null;
  } catch {
    return null;
  }
}

export function writeResumeDraft(id: number, data: { resume: ResumeData; templateSlug: string }) {
  try {
    localStorage.setItem(`${DRAFT_PREFIX}${id}`, JSON.stringify(data));
  } catch {
    /* quota / serialization errors are non-fatal */
  }
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
      projects: toTemplateProjects(resume.customSections),
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
