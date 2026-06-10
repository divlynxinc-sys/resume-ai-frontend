import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
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
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

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

function isCanvasBlank(canvas: HTMLCanvasElement, height: number): boolean {
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return false;

  const width = canvas.width;
  const safeHeight = Math.max(1, Math.min(height, canvas.height));
  const data = context.getImageData(0, 0, width, safeHeight).data;
  const step = 32;

  for (let y = 0; y < safeHeight; y += step) {
    for (let x = 0; x < width; x += step) {
      const index = (y * width + x) * 4;
      if (data[index] < 248 || data[index + 1] < 248 || data[index + 2] < 248) {
        return false;
      }
    }
  }

  return true;
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
    "opacity:0",
    "pointer-events:none",
    "z-index:-2147483648",
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

  const resumeRoot = doc.querySelector<HTMLElement>(".resume-root");
  if (!resumeRoot) {
    frame.remove();
    throw new Error("Could not find resume root for PDF export.");
  }

  const rootExportStyles = doc.createElement("style");
  rootExportStyles.setAttribute("data-resume-export-styles", "true");
  rootExportStyles.textContent = Array.from(doc.head.querySelectorAll("style"))
    .map((style) => style.textContent ?? "")
    .filter(Boolean)
    .join("\n");
  resumeRoot.prepend(rootExportStyles);

  const pdfLayoutFixes = doc.createElement("style");
  pdfLayoutFixes.setAttribute("data-resume-pdf-layout-fixes", "true");
  pdfLayoutFixes.textContent = `
    .resume-root .contact-row {
      align-items: center !important;
      line-height: 1.8 !important;
      overflow: visible !important;
    }

    .resume-root .contact-row .mm-ci-item {
      align-items: center !important;
      line-height: 1.8 !important;
      overflow: visible !important;
    }

    .resume-root .contact-row .mm-ci {
      box-sizing: content-box !important;
      position: relative !important;
      top: 3px !important;
      width: 18px !important;
      height: 18px !important;
      flex: 0 0 18px !important;
      padding: 0 !important;
      margin: 0 -1px 0 0 !important;
      overflow: visible !important;
      transform: none !important;
      transform-origin: center center !important;
    }

    .resume-root .contact-row .mm-ci * {
      overflow: visible !important;
    }

    .resume-root .section-title {
      padding-bottom: 0 !important;
      margin-bottom: 8px !important;
      line-height: 1 !important;
    }

    .resume-root .section-label {
      display: block !important;
      line-height: 1 !important;
      margin-bottom: 0 !important;
    }

    .resume-root .section-rule {
      position: static !important;
      display: block !important;
      width: 100% !important;
      height: 0 !important;
      margin-top: 15px !important;
      border-top: 1px solid #9aa3ad !important;
      background: transparent !important;
      line-height: 0 !important;
      font-size: 0 !important;
      clear: both !important;
    }
  `;
  resumeRoot.prepend(pdfLayoutFixes);

  resumeRoot.querySelectorAll<SVGElement>(".contact-row .mm-ci").forEach((icon) => {
    const viewBox = icon.getAttribute("viewBox");
    if (viewBox === "0 0 24 24") {
      icon.setAttribute("viewBox", "-5 -5 34 34");
      icon.setAttribute("preserveAspectRatio", "xMidYMid meet");
    }
  });

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
    if (!resumeRoot) throw new Error("Could not find resume root for PDF export.");

    const renderedHeight = Math.max(
      resumeRoot.scrollHeight,
      resumeRoot.offsetHeight,
      resumeRoot.getBoundingClientRect().height,
      doc.body.scrollHeight,
      doc.documentElement.scrollHeight,
    );
    const canvas = await html2canvas(resumeRoot, {
      scale: 2,
      windowWidth: A4_WIDTH_PX,
      windowHeight: Math.max(A4_HEIGHT_PX, Math.ceil(renderedHeight)),
      allowTaint: true,
      useCORS: true,
      backgroundColor: "#ffffff",
      imageTimeout: 30000,
      scrollX: 0,
      scrollY: 0,
      removeContainer: true,
      logging: false,
    });

    const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
    const pageHeightPx = Math.floor((canvas.width * A4_HEIGHT_MM) / A4_WIDTH_MM);
    const pageCanvas = document.createElement("canvas");
    const pageContext = pageCanvas.getContext("2d");
    if (!pageContext) throw new Error("Could not create resume PDF page canvas.");

    pageCanvas.width = canvas.width;
    pageCanvas.height = pageHeightPx;

    const pages: string[] = [];

    for (let y = 0; y < canvas.height; y += pageHeightPx) {
      const sliceHeight = Math.min(pageHeightPx, canvas.height - y);
      pageContext.fillStyle = "#ffffff";
      pageContext.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      pageContext.drawImage(
        canvas,
        0,
        y,
        canvas.width,
        sliceHeight,
        0,
        0,
        canvas.width,
        sliceHeight,
      );

      pages.push(isCanvasBlank(pageCanvas, sliceHeight) ? "" : pageCanvas.toDataURL("image/jpeg", 0.98));
    }

    while (pages.length > 1 && !pages[pages.length - 1]) {
      pages.pop();
    }

    pages.forEach((pageImage, pageIndex) => {
      if (pageIndex > 0) pdf.addPage();
      if (pageImage) {
        pdf.addImage(pageImage, "JPEG", 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM);
      }
    });

    if (pages.length === 0) {
      pdf.addPage();
    }

    pdf.save(filename);
  } finally {
    frame.remove();
  }
}
