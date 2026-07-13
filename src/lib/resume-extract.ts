// Pull plain text out of an uploaded resume — PDF, DOCX or TXT — IN THE BROWSER.
//
// ─── THE RULE THIS FILE EXISTS TO PROTECT ────────────────────────────────────
// Nothing is uploaded. The file never leaves the user's device. That is not a
// nice-to-have: it is the reason /ats-checker can be free and ungated (no backend,
// no storage, no cost per check, nothing to breach) and it is a claim we make in
// the UI, so it must stay literally true. Do NOT "simplify" this by POSTing the
// file to the backend.
//
// ─── EVERYTHING IS DYNAMICALLY IMPORTED ──────────────────────────────────────
// pdfjs-dist and mammoth are heavy and browser-only. They are imported INSIDE the
// functions, never at module scope, for two reasons:
//   1. They stay out of the main bundle — only someone who actually uploads a PDF
//      on /ats-checker ever downloads the parser.
//   2. scripts/prerender.mjs server-renders this page with react-dom/server. A
//      top-level `import * as pdfjs` would execute in Node, touch DOM globals and
//      break the build. (prerender.mjs also marks both packages `external`.)

export interface ExtractResult {
  text: string;
  /** A non-fatal note to show the user, e.g. a scanned-PDF warning. */
  warning?: string;
}

export class ExtractError extends Error {
  /** Actionable next step shown under the error. */
  hint?: string;
  constructor(message: string, hint?: string) {
    super(message);
    this.name = "ExtractError";
    this.hint = hint;
  }
}

export const ACCEPTED_TYPES = ".pdf,.docx,.txt";
const MAX_BYTES = 10 * 1024 * 1024;

function extensionOf(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot + 1).toLowerCase();
}

async function extractPdf(file: File): Promise<ExtractResult> {
  const [pdfjs, worker] = await Promise.all([
    import("pdfjs-dist"),
    import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
  ]);
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;

  const buffer = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buffer }).promise;

  const pages: string[] = [];
  for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber += 1) {
    const page = await doc.getPage(pageNumber);
    const content = await page.getTextContent();
    // Rebuild lines from the text layer. pdf.js hands back positioned runs, not
    // lines, so we re-break on the EOL flag it sets — without this the whole
    // resume collapses into one line and every line-based check below is useless.
    let line = "";
    const lines: string[] = [];
    for (const item of content.items) {
      if (!("str" in item)) continue;
      line += item.str;
      if (item.hasEOL) {
        lines.push(line.trim());
        line = "";
      }
    }
    if (line.trim()) lines.push(line.trim());
    pages.push(lines.join("\n"));
  }

  const text = pages.join("\n").trim();

  // THE MOST VALUABLE THING THIS TOOL DOES.
  // A PDF with pages but no extractable text is a scanned image (or type outlined
  // by a design tool). Every ATS parser gets exactly what we just got: nothing.
  // This is the single most fatal resume mistake there is, and the upload catches
  // it for free — so we do NOT treat it as a boring error. We tell them they just
  // found the bug.
  if (text.split(/\s+/).filter(Boolean).length < 30) {
    throw new ExtractError(
      "This PDF contains no selectable text — it's an image.",
      "That's the single most fatal ATS mistake there is: a parser reads exactly what we just read, which is nothing. Your resume is invisible to every applicant tracking system. Re-export it from the original document as a real text PDF (not a scan, not flattened, not with the type converted to outlines) and try again.",
    );
  }

  return { text };
}

async function extractDocx(file: File): Promise<ExtractResult> {
  const mammoth = await import("mammoth");
  const buffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  const text = result.value.trim();

  if (text.split(/\s+/).filter(Boolean).length < 30) {
    throw new ExtractError(
      "We couldn't read any text out of that .docx.",
      "If your resume is built out of text boxes or images, Word stores them outside the document body — which is also where an ATS parser won't look. Try re-saving it as a plain PDF, or paste the text instead.",
    );
  }

  return { text };
}

/**
 * Extracts resume text from an uploaded file. Throws `ExtractError` with a
 * user-facing message + hint on anything unusable.
 */
export async function extractResumeText(file: File): Promise<ExtractResult> {
  if (file.size > MAX_BYTES) {
    throw new ExtractError(
      "That file is over 10 MB.",
      "A text resume is almost never this large — yours is probably a scan or full of images, which an ATS can't read either.",
    );
  }
  if (file.size === 0) {
    throw new ExtractError("That file is empty.");
  }

  const ext = extensionOf(file.name);

  try {
    if (ext === "pdf") return await extractPdf(file);
    if (ext === "docx") return await extractDocx(file);
    if (ext === "txt" || ext === "md") return { text: (await file.text()).trim() };
  } catch (error) {
    if (error instanceof ExtractError) throw error;
    throw new ExtractError(
      "We couldn't read that file.",
      "It may be password-protected or corrupted. Try re-exporting it, or paste the text instead.",
    );
  }

  if (ext === "doc") {
    throw new ExtractError(
      "Legacy .doc files aren't supported.",
      "Open it in Word and save as .docx or PDF. (Plenty of applicant tracking systems struggle with .doc too, so this is worth fixing anyway.)",
    );
  }

  throw new ExtractError(
    `We can't read .${ext || "that"} files.`,
    "Upload a PDF, DOCX or TXT — or paste the text instead.",
  );
}
