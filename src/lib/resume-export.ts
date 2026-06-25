import type { ResumeContent } from "@/services/resume";
import { renderTemplate, type TemplateInput } from "@/lib/resume-templates";
import { apiRequestBlob } from "@/lib/api";

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function textList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function descriptionBullets(value: unknown): string[] {
  return text(value)
    .split("\n")
    .map((line) => line.replace(/^(-|\*|\d+\.)\s*/g, "").trim())
    .filter(Boolean);
}

/**
 * Normalize a stored project link into the `{ url, label }` shape used across
 * the PDF and Word exports (feature 1.4 — "link display mode"). Accepts:
 *   - a bare URL string (legacy)            → { url, label: url }
 *   - an object { url, label }              → passed through
 *   - a separate `link_label` field         → used as the label for a string url
 */
function normalizeLink(link: unknown, label?: unknown): { url: string; label?: string } | undefined {
  if (link && typeof link === "object" && !Array.isArray(link)) {
    const obj = link as Record<string, unknown>;
    const url = text(obj.url) || text(obj.link);
    if (!url) return undefined;
    const lbl = text(obj.label) || text(label);
    return { url, label: lbl || undefined };
  }
  const url = text(link);
  if (!url) return undefined;
  const lbl = text(label);
  return { url, label: lbl || undefined };
}

export function resumeContentToTemplateInput(content: ResumeContent, fallbackName = "Resume"): TemplateInput {
  const info = record(content.info);
  const custom = record(content.custom);
  const rawSkillCategories = Array.isArray(custom.skillCategories) ? custom.skillCategories : [];
  const skillCategories = rawSkillCategories
    .map((item) => {
      const category = record(item);
      return {
        category: text(category.category),
        skills: textList(category.skills),
      };
    })
    .filter((item) => item.category && item.skills.length);
  const flatSkills = textList(content.skills);
  const rawProjects = Array.isArray(custom.projects) ? custom.projects : [];

  return {
    candidate_info: {
      name: text(info.full_name) || fallbackName,
      email: text(info.email),
      phone: text(info.phone),
      linkedin: text(info.linkedin_url) || undefined,
      portfolio: text(info.portfolio_url) || undefined,
    },
    resume: {
      summary: text(content.summary),
      experiences: content.experience
        .map(record)
        .map((item) => ({
          role: text(item.role),
          company: text(item.company),
          location: text(item.location),
          startDate: text(item.start_date),
          endDate: text(item.end_date),
          bullets: descriptionBullets(item.description),
        }))
        .filter((item) => item.role || item.company || item.bullets.length),
      projects: rawProjects
        .map(record)
        .map((item) => ({
          title: text(item.title) || "Project",
          link: normalizeLink(item.link, item.link_label),
          bullets: textList(item.bullets).length ? textList(item.bullets) : descriptionBullets(item.description),
        }))
        .filter((item) => item.title || item.bullets.length),
      education: content.education
        .map(record)
        .map((item) => ({
          school: text(item.school),
          degree: text(item.degree),
          field: text(item.field_of_study),
          location: text(item.location),
          endDate: text(item.end_date),
        }))
        .filter((item) => item.school || item.degree || item.field),
      skills: skillCategories.length ? skillCategories : flatSkills.length ? [{ category: "Skills", skills: flatSkills }] : [],
    },
  };
}

export function resumeContentToHtml(content: ResumeContent, fallbackName = "Resume", templateSlug = "modern-minimal"): string {
  return renderTemplate(templateSlug, resumeContentToTemplateInput(content, fallbackName));
}

export function safeFileName(value: string): string {
  const name = value
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
    .replace(/\s+/g, " ")
    .replace(/\.+$/g, "");

  return name || "Resume";
}

function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/**
 * Export a resume to PDF.
 *
 * The previous implementation rasterized the resume with html2canvas and
 * sliced the resulting JPEG into pages. That produced image-only PDFs with no
 * selectable/ATS-readable text, no clickable links, and page breaks that cut
 * through content. We now POST the rendered template HTML to the backend, which
 * renders it with headless Chromium — yielding real text, real link
 * annotations, and proper CSS pagination (`@page`, `page-break-inside: avoid`).
 */
export async function downloadResumeHtmlAsPdf(html: string, filename: string): Promise<void> {
  const blob = await apiRequestBlob("/resumes/export/pdf", { html, filename });
  saveBlob(blob, filename);
}

/**
 * Export a resume to a real Word (.docx) document. The backend builds a genuine
 * OOXML file from structured content (with real hyperlinks), replacing the old
 * approach of relabelling an HTML blob as `.docx` (which Word flagged as
 * corrupt and rendered unreliably).
 */
export async function downloadTemplateInputAsDocx(templateInput: TemplateInput, filename: string): Promise<void> {
  const blob = await apiRequestBlob("/resumes/export/docx", { content: templateInput, filename });
  saveBlob(blob, filename);
}

export async function downloadResumeContentAsDocx(
  content: ResumeContent,
  filename: string,
  fallbackName = "Resume",
): Promise<void> {
  await downloadTemplateInputAsDocx(resumeContentToTemplateInput(content, fallbackName), filename);
}
