import html2pdf from "html2pdf.js";
import type { ResumeContent } from "@/services/resume";
import { renderTemplate, type TemplateInput } from "@/lib/resume-templates";

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
          link: text(item.link) || undefined,
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

export async function downloadResumeHtmlAsPdf(html: string, filename: string): Promise<void> {
  const parsed = new DOMParser().parseFromString(html, "text/html");
  const styles = Array.from(parsed.head.querySelectorAll("style"))
    .map((style) => style.outerHTML)
    .join("\n");
  const bodyHtml = parsed.body.innerHTML || html;

  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  host.style.cssText = [
    "position:fixed",
    "left:-10000px",
    "top:0",
    "width:210mm",
    "min-height:297mm",
    "background:#fff",
    "color:#000",
    "overflow:visible",
    "pointer-events:none",
    "z-index:-1",
  ].join(";");
  host.innerHTML = `${styles}${bodyHtml}`;
  document.body.appendChild(host);

  try {
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    const target = host.querySelector<HTMLElement>(".resume-root") ?? host;
    const options: Record<string, unknown> = {
      margin: 0,
      filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        windowWidth: 794,
        useCORS: true,
        backgroundColor: "#ffffff",
        scrollX: 0,
        scrollY: 0,
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["css", "legacy"] },
    };

    await html2pdf()
      .set(options)
      .from(target)
      .save();
  } finally {
    host.remove();
  }
}
