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

const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;

function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

async function waitForImages(root: ParentNode): Promise<void> {
  const images = Array.from(root.querySelectorAll("img"));
  await Promise.all(
    images.map(async (image) => {
      if (image.complete && image.naturalWidth > 0) return;
      await new Promise<void>((resolve) => {
        image.addEventListener("load", () => resolve(), { once: true });
        image.addEventListener("error", () => resolve(), { once: true });
      });
      await image.decode?.().catch(() => undefined);
    }),
  );
}

async function createResumeRenderFrame(html: string): Promise<HTMLIFrameElement> {
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText = [
    "position:fixed",
    "left:-10000px",
    "top:0",
    `width:${A4_WIDTH_PX}px`,
    `height:${A4_HEIGHT_PX}px`,
    "border:0",
    "background:#fff",
    "pointer-events:none",
    "z-index:-1",
  ].join(";");

  document.body.appendChild(frame);
  const doc = frame.contentDocument;
  if (!doc) {
    frame.remove();
    throw new Error("Could not create resume PDF render frame.");
  }

  doc.open();
  doc.write(html);
  doc.close();

  const exportReset = doc.createElement("style");
  exportReset.textContent = "html,body{margin:0;padding:0;width:794px;min-height:1123px;background:#fff;}";
  doc.head.appendChild(exportReset);

  await nextFrame();
  await nextFrame();
  await doc.fonts?.ready.catch(() => undefined);
  await waitForImages(doc);
  await nextFrame();

  return frame;
}

export async function downloadResumeHtmlAsPdf(html: string, filename: string): Promise<void> {
  const frame = await createResumeRenderFrame(html);

  try {
    const doc = frame.contentDocument;
    if (!doc) throw new Error("Could not find resume document for PDF export.");

    await nextFrame();
    await waitForImages(doc);
    await nextFrame();

    const resumeRoot = doc.querySelector<HTMLElement>(".resume-root");
    const renderedHeight = Math.max(
      resumeRoot?.scrollHeight ?? 0,
      resumeRoot?.offsetHeight ?? 0,
      resumeRoot?.getBoundingClientRect().height ?? 0,
      doc.body.scrollHeight,
      doc.documentElement.scrollHeight,
    );
    const expectedPages = Math.max(1, Math.ceil((renderedHeight - 1) / A4_HEIGHT_PX));

    const options: Record<string, unknown> = {
      margin: 0,
      filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        windowWidth: A4_WIDTH_PX,
        windowHeight: Math.max(A4_HEIGHT_PX, Math.ceil(renderedHeight)),
        allowTaint: true,
        useCORS: true,
        backgroundColor: "#ffffff",
        imageTimeout: 30000,
        scrollX: 0,
        scrollY: 0,
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["css", "legacy"], avoid: [".exp-block", ".proj-block", ".edu-block"] },
    };

    const worker = html2pdf()
      .set(options)
      .from(doc.documentElement)
      .toPdf();
    const pdf = await worker.get("pdf");
    const totalPages =
      typeof pdf.getNumberOfPages === "function"
        ? pdf.getNumberOfPages()
        : pdf.internal?.getNumberOfPages?.() ?? expectedPages;

    for (let page = totalPages; page > expectedPages; page -= 1) {
      pdf.deletePage(page);
    }

    pdf.save(filename);
  } finally {
    frame.remove();
  }
}
