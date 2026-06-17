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

export function safeFileName(value: string): string {
  const name = value
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
    .replace(/\s+/g, " ")
    .replace(/\.+$/g, "");

  return name || "Resume";
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
  const minInkPixels = Math.max(80, Math.floor((width * safeHeight) / 60000));
  let inkPixels = 0;

  for (let y = 0; y < safeHeight; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      if (data[index + 3] > 16 && (data[index] < 245 || data[index + 1] < 245 || data[index + 2] < 245)) {
        inkPixels += 1;
      }

      if (inkPixels >= minInkPixels) {
        return false;
      }
    }
  }

  return true;
}

function getCanvasContentBottom(canvas: HTMLCanvasElement): number {
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return canvas.height;

  const { width, height } = canvas;
  const data = context.getImageData(0, 0, width, height).data;
  const minRowInkPixels = Math.max(4, Math.floor(width / 350));

  for (let y = height - 1; y >= 0; y -= 1) {
    let rowInkPixels = 0;

    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      if (data[index + 3] > 16 && (data[index] < 245 || data[index + 1] < 245 || data[index + 2] < 245)) {
        rowInkPixels += 1;
      }

      if (rowInkPixels >= minRowInkPixels) {
        return y + 1;
      }
    }
  }

  return 0;
}

function getCanvasContentTop(canvas: HTMLCanvasElement): number {
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return 0;

  const { width, height } = canvas;
  const data = context.getImageData(0, 0, width, height).data;
  const minRowInkPixels = Math.max(4, Math.floor(width / 350));

  for (let y = 0; y < height; y += 1) {
    let rowInkPixels = 0;

    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      if (data[index + 3] > 16 && (data[index] < 245 || data[index + 1] < 245 || data[index + 2] < 245)) {
        rowInkPixels += 1;
      }

      if (rowInkPixels >= minRowInkPixels) {
        return y;
      }
    }
  }

  return 0;
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
  if (resumeRoot.querySelector(".section-rule")) {
    resumeRoot.classList.add("resume-export-modern-minimal");
  }
  if (resumeRoot.querySelector(".wrapper .sidebar")) {
    resumeRoot.classList.add("resume-export-left-sidebar");
  }
  if (resumeRoot.querySelector(".name-underline") && resumeRoot.querySelector(".contact .ci")) {
    resumeRoot.classList.add("resume-export-classic-professional");
  }
  if (
    resumeRoot.querySelector(".page > .header") &&
    resumeRoot.querySelector(".exp-line") &&
    !resumeRoot.classList.contains("resume-export-modern-minimal") &&
    !resumeRoot.classList.contains("resume-export-left-sidebar") &&
    !resumeRoot.classList.contains("resume-export-classic-professional")
  ) {
    resumeRoot.classList.add("resume-export-compact-single-column");
  }
  if (resumeRoot.querySelector(".banner .bi") && resumeRoot.querySelector(".badge")) {
    resumeRoot.classList.add("resume-export-creative-bold");
  }

  const pdfLayoutFixes = doc.createElement("style");
  pdfLayoutFixes.setAttribute("data-resume-pdf-layout-fixes", "true");
  pdfLayoutFixes.textContent = `
    .resume-root.resume-export-modern-minimal .contact-row {
      align-items: center !important;
      line-height: 1.8 !important;
      overflow: visible !important;
    }

    .resume-root.resume-export-modern-minimal .contact-row .mm-ci-item {
      align-items: center !important;
      line-height: 1.8 !important;
      overflow: visible !important;
    }

    .resume-root.resume-export-modern-minimal .contact-row .mm-ci {
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

    .resume-root.resume-export-modern-minimal .contact-row .mm-ci * {
      overflow: visible !important;
    }

    .resume-root.resume-export-modern-minimal .section-title {
      padding-bottom: 0 !important;
      margin-bottom: 8px !important;
      line-height: 1 !important;
    }

    .resume-root.resume-export-modern-minimal .section-label {
      display: block !important;
      line-height: 1 !important;
      margin-bottom: 0 !important;
    }

    .resume-root.resume-export-modern-minimal .section-rule {
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

    .resume-root.resume-export-left-sidebar .wrapper {
      display: flex !important;
      align-items: stretch !important;
      width: 100% !important;
      min-height: 297mm !important;
      background: linear-gradient(to right, #2d3748 30%, #ffffff 30%) !important;
    }

    .resume-root.resume-export-left-sidebar .sidebar {
      width: 30% !important;
      flex: 0 0 30% !important;
      min-height: 297mm !important;
    }

    .resume-root.resume-export-left-sidebar .main {
      width: 70% !important;
      flex: 0 0 70% !important;
      min-height: 297mm !important;
    }

    .resume-root.resume-export-left-sidebar .main .section-title,
    .resume-root.resume-export-left-sidebar .sidebar .section-title {
      display: block !important;
      line-height: 1.15 !important;
      padding-bottom: 11px !important;
      margin-bottom: 9px !important;
      border-bottom-style: solid !important;
      background: transparent !important;
    }

    .resume-root.resume-export-left-sidebar .main .section-title {
      border-bottom-width: 2px !important;
      border-bottom-color: #e2e8f0 !important;
    }

    .resume-root.resume-export-left-sidebar .sidebar .section-title {
      border-bottom-width: 1px !important;
      border-bottom-color: #4a5568 !important;
    }

    .resume-root.resume-export-left-sidebar .pill {
      display: inline-block !important;
      box-sizing: border-box !important;
      min-height: 0 !important;
      height: 16px !important;
      line-height: 16px !important;
      padding: 0 6px !important;
      margin: 0 3px 3px 0 !important;
      border-radius: 3px !important;
      font-size: 7.5pt !important;
      text-align: center !important;
      background: #4a5568 !important;
      color: #e2e8f0 !important;
      white-space: nowrap !important;
      overflow: visible !important;
      vertical-align: middle !important;
    }

    .resume-root.resume-export-left-sidebar .pill-text {
      display: inline-block !important;
      position: relative !important;
      top: -7px !important;
      line-height: 1.05 !important;
    }

    .resume-root.resume-export-left-sidebar .skill-group {
      line-height: 1.5 !important;
      overflow: visible !important;
    }

    .resume-root.resume-export-left-sidebar .main ul {
      list-style: none !important;
      padding-left: 14px !important;
      margin: 2px 0 0 !important;
    }

    .resume-root.resume-export-left-sidebar .main li {
      position: relative !important;
      list-style: none !important;
      padding-left: 0 !important;
    }

    .resume-root.resume-export-left-sidebar .main li::before {
      content: "•" !important;
      position: absolute !important;
      left: -11px !important;
      top: 2px !important;
      line-height: 1 !important;
      font-size: 8.5pt !important;
      color: #222 !important;
    }

    .resume-root.resume-export-classic-professional .name-underline {
      display: block !important;
      width: 60px !important;
      height: 2px !important;
      margin: 10px auto 10px !important;
      background: #1a365d !important;
      line-height: 0 !important;
      font-size: 0 !important;
    }

    .resume-root.resume-export-classic-professional .contact {
      align-items: center !important;
      line-height: 1.7 !important;
      overflow: visible !important;
    }

    .resume-root.resume-export-classic-professional .ci-item {
      align-items: center !important;
      line-height: 1.7 !important;
      overflow: visible !important;
    }

    .resume-root.resume-export-classic-professional .ci {
      box-sizing: content-box !important;
      position: relative !important;
      top: 4px !important;
      width: 15px !important;
      height: 15px !important;
      flex: 0 0 15px !important;
      margin: 0 -1px 0 0 !important;
      overflow: visible !important;
      transform: none !important;
    }

    .resume-root.resume-export-classic-professional .ci * {
      overflow: visible !important;
    }

    .resume-root.resume-export-classic-professional .section-title {
      display: block !important;
      line-height: 1.1 !important;
      padding-bottom: 16px !important;
      margin-bottom: 13px !important;
      border-bottom: 2.5px double #1a365d !important;
      background: transparent !important;
    }

    .resume-root.resume-export-classic-professional ul {
      list-style: none !important;
      padding-left: 20px !important;
      margin: 3px 0 0 !important;
    }

    .resume-root.resume-export-classic-professional li {
      position: relative !important;
      list-style: none !important;
      padding-left: 0 !important;
    }

    .resume-root.resume-export-classic-professional li::before {
      content: "\\2022" !important;
      position: absolute !important;
      left: -13px !important;
      top: 2px !important;
      line-height: 1 !important;
      font-size: 9.5pt !important;
      color: #1a1a1a !important;
    }

    .resume-root.resume-export-compact-single-column .section-title {
      display: block !important;
      line-height: 1.1 !important;
      padding-bottom: 8px !important;
      margin-bottom: 7px !important;
      border-bottom: 0.5px solid #999 !important;
      background: transparent !important;
    }

    .resume-root.resume-export-compact-single-column ul {
      list-style: none !important;
      padding-left: 14px !important;
      margin: 1px 0 3px !important;
    }

    .resume-root.resume-export-compact-single-column li {
      position: relative !important;
      list-style: none !important;
      padding-left: 0 !important;
      margin-bottom: 1px !important;
    }

    .resume-root.resume-export-compact-single-column li::before {
      content: "\\2022" !important;
      position: absolute !important;
      left: -11px !important;
      top: 2px !important;
      line-height: 1 !important;
      font-size: 8.5pt !important;
      color: #1a1a1a !important;
    }

    .resume-root.resume-export-creative-bold {
      background: #ffffff !important;
      min-height: 297mm !important;
    }

    .resume-root.resume-export-creative-bold .banner {
      margin-top: 0 !important;
      padding-top: 28px !important;
      overflow: visible !important;
    }

    .resume-root.resume-export-creative-bold .banner .contact {
      align-items: center !important;
      line-height: 1.7 !important;
      overflow: visible !important;
    }

    .resume-root.resume-export-creative-bold .bi-item {
      align-items: center !important;
      line-height: 1.7 !important;
      overflow: visible !important;
    }

    .resume-root.resume-export-creative-bold .bi {
      box-sizing: content-box !important;
      position: relative !important;
      top: 3px !important;
      width: 12px !important;
      height: 12px !important;
      flex: 0 0 12px !important;
      overflow: visible !important;
      transform: none !important;
    }

    .resume-root.resume-export-creative-bold .bi * {
      overflow: visible !important;
    }

    .resume-root.resume-export-creative-bold .section-title {
      display: block !important;
      line-height: 1.1 !important;
      padding-top: 1px !important;
      padding-bottom: 2px !important;
      border-left: 4px solid #2563eb !important;
      background: transparent !important;
    }

    .resume-root.resume-export-creative-bold ul {
      list-style: none !important;
      padding-left: 18px !important;
      margin: 3px 0 0 !important;
    }

    .resume-root.resume-export-creative-bold li {
      position: relative !important;
      list-style: none !important;
      padding-left: 0 !important;
      margin-bottom: 2px !important;
    }

    .resume-root.resume-export-creative-bold li::before {
      content: "\\2022" !important;
      position: absolute !important;
      left: -13px !important;
      top: 2px !important;
      line-height: 1 !important;
      font-size: 9.5pt !important;
      color: #1e293b !important;
    }

    .resume-root.resume-export-creative-bold .exp-dates {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      box-sizing: border-box !important;
      min-height: 0 !important;
      height: 18px !important;
      line-height: 18px !important;
      padding: 0 8px !important;
      overflow: visible !important;
      vertical-align: middle !important;
    }

    .resume-root.resume-export-creative-bold .date-text {
      display: inline-block !important;
      position: relative !important;
      top: -5px !important;
      line-height: 1.05 !important;
    }

    .resume-root.resume-export-creative-bold .badge {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      box-sizing: border-box !important;
      min-height: 0 !important;
      height: 17px !important;
      line-height: 17px !important;
      padding: 0 10px !important;
      margin: 0 4px 4px 0 !important;
      overflow: visible !important;
      vertical-align: middle !important;
    }

    .resume-root.resume-export-creative-bold .badge-text {
      display: inline-block !important;
      position: relative !important;
      top: -5px !important;
      line-height: 1.05 !important;
    }
  `;
  resumeRoot.prepend(pdfLayoutFixes);

  if (resumeRoot.classList.contains("resume-export-modern-minimal")) {
    resumeRoot.querySelectorAll<SVGElement>(".contact-row .mm-ci").forEach((icon) => {
      const viewBox = icon.getAttribute("viewBox");
      if (viewBox === "0 0 24 24") {
        icon.setAttribute("viewBox", "-5 -5 34 34");
        icon.setAttribute("preserveAspectRatio", "xMidYMid meet");
      }
    });
  }
  if (resumeRoot.classList.contains("resume-export-classic-professional")) {
    resumeRoot.querySelectorAll<SVGElement>(".contact .ci").forEach((icon) => {
      const viewBox = icon.getAttribute("viewBox");
      if (viewBox === "0 0 24 24") {
        icon.setAttribute("viewBox", "-5 -5 34 34");
        icon.setAttribute("preserveAspectRatio", "xMidYMid meet");
      }
    });
  }
  if (resumeRoot.classList.contains("resume-export-left-sidebar")) {
    resumeRoot.querySelectorAll<HTMLElement>(".pill").forEach((pill) => {
      if (pill.querySelector(".pill-text")) return;
      const textNode = doc.createElement("span");
      textNode.className = "pill-text";
      textNode.textContent = pill.textContent ?? "";
      pill.textContent = "";
      pill.appendChild(textNode);
    });
  }
  if (resumeRoot.classList.contains("resume-export-creative-bold")) {
    resumeRoot.querySelectorAll<SVGElement>(".banner .bi").forEach((icon) => {
      const viewBox = icon.getAttribute("viewBox");
      if (viewBox === "0 0 24 24") {
        icon.setAttribute("viewBox", "-5 -5 34 34");
        icon.setAttribute("preserveAspectRatio", "xMidYMid meet");
      }
    });
    resumeRoot.querySelectorAll<HTMLElement>(".badge").forEach((badge) => {
      if (badge.querySelector(".badge-text")) return;
      const textNode = doc.createElement("span");
      textNode.className = "badge-text";
      textNode.textContent = badge.textContent ?? "";
      badge.textContent = "";
      badge.appendChild(textNode);
    });
    resumeRoot.querySelectorAll<HTMLElement>(".exp-dates").forEach((dateChip) => {
      if (dateChip.querySelector(".date-text")) return;
      const textNode = doc.createElement("span");
      textNode.className = "date-text";
      textNode.textContent = dateChip.textContent ?? "";
      dateChip.textContent = "";
      dateChip.appendChild(textNode);
    });
  }

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
    const shouldAnchorToTop = resumeRoot.classList.contains("resume-export-creative-bold");

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
    const contentBottom = getCanvasContentBottom(canvas);
    const contentTop = getCanvasContentTop(canvas);
    const singlePageFitOverflowPx = Math.floor(pageHeightPx * 0.08);
    const effectiveCanvasHeight = Math.min(canvas.height, Math.max(contentBottom + 8, pageHeightPx));

    if (contentBottom <= pageHeightPx + singlePageFitOverflowPx) {
      const sourcePadding = 4;
      const sourceY = Math.max(0, contentTop - sourcePadding);
      const sourceBottom = Math.min(canvas.height, Math.max(contentBottom + sourcePadding, sourceY + 1));
      const sourceHeight = sourceBottom - sourceY;
      const targetHeight = pageHeightPx;
      const fitScale = Math.min(1, targetHeight / sourceHeight);
      const fittedWidth = Math.floor(canvas.width * fitScale);
      const fittedHeight = Math.floor(sourceHeight * fitScale);
      const fittedX = Math.floor((canvas.width - fittedWidth) / 2);
      const fittedY = shouldAnchorToTop ? 0 : Math.floor((pageHeightPx - fittedHeight) / 2);

      pageContext.fillStyle = "#ffffff";
      pageContext.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      pageContext.drawImage(
        canvas,
        0,
        sourceY,
        canvas.width,
        sourceHeight,
        fittedX,
        fittedY,
        fittedWidth,
        fittedHeight,
      );

      pages.push(isCanvasBlank(pageCanvas, pageCanvas.height) ? "" : pageCanvas.toDataURL("image/jpeg", 0.98));
    } else {
      for (let y = 0; y < effectiveCanvasHeight; y += pageHeightPx) {
        const sliceHeight = Math.min(pageHeightPx, effectiveCanvasHeight - y);
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

export function downloadResumeHtmlAsDocx(html: string, filename: string): void {
  const docxHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${filename}</title>
      </head>
      <body>${html}</body>
    </html>
  `;
  const blob = new Blob([docxHtml], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
