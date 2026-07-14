// The shareable ATS score card (PDF) for /ats-checker.
//
// ─── WHY THIS IS BUILT FROM SCRATCH INSTEAD OF SCREENSHOTTING THE RESULTS UI ──
// html2pdf.js renders through html2canvas, and html2canvas CANNOT PARSE `oklch()`
// colours — it throws "Attempting to parse an unsupported color function". Our
// `index.css` uses oklch in 62 places, so pointing html2canvas at any node inside
// the app is a crash waiting to happen (and it would crash on the *user's* click,
// which is the worst place to find out).
//
// So the card is a standalone DOM node with EXPLICIT HEX COLOURS and fully inline
// styles, inheriting nothing from the app's stylesheet. Do not "simplify" this by
// reusing the results markup or a CSS variable — it will look fine in dev and break
// in the wild.
//
// ─── WHAT GOES ON THE CARD, AND WHAT DOESN'T ─────────────────────────────────
// ON:  the score, and the resume checks (pass/warn/fail with their labels).
// OFF: the job-description keyword section. Those terms come from the posting the
//      user is applying to, and people share these cards WHILE JOB HUNTING FROM A
//      CURRENT JOB. Putting "kubernetes, pci-scoped, fintech" on a public image is
//      a quiet way to out someone to their employer. Not worth it for a share asset.
// Also note the checks themselves never contain résumé text — every `detail` string
// is a count, or a phrase from our own fixed lists (see lib/ats-check.ts) — so the
// card carries no personal data at all. Keep it that way.

import type { AtsReport } from "./ats-check";
import { SITE_URL } from "./site";
import brandIcon from "../assets/Logo-03.png";

const CARD_WIDTH = 794; // A4 @ 96dpi
/**
 * A4 height is the MINIMUM, not the height. The card grows with the number of
 * checks (9 without a job description, 10 with), and a fixed 1123px page clipped
 * the closing call-to-action clean off the bottom — which is the one element the
 * whole share loop depends on. The PDF page is sized from the node's real measured
 * height at render time instead, so it can never clip regardless of content.
 */
const CARD_MIN_HEIGHT = 1123;

/** e.g. "jobsynk.co" — shown under the wordmark and on the button. */
const DOMAIN = SITE_URL.replace(/^https?:\/\//, "");
const SHARE_URL = `${SITE_URL}/ats-checker`;

// The app palette, hardcoded. html2canvas can't read our CSS variables (they resolve
// to oklch), so these are the light-theme values written out as plain hex.
const C = {
  bg: "#FAF9F6",
  surface: "#FFFFFF",
  border: "#E7E4DD",
  fg: "#1F1D1A",
  muted: "#6B665E",
  soft: "#9A948A",
  accent: "#5B6CDB",
  accentSoft: "#EEF0FC",
  pass: "#3F8E5C",
  passSoft: "#E3F3E9",
  warn: "#A07820",
  warnSoft: "#FBF3DC",
  fail: "#B85273",
  failSoft: "#FBE7ED",
};

/** Colour + glyph per check status. Plain characters — html2canvas renders text reliably; icon fonts it does not. */
const STATUS = {
  pass: { color: C.pass, tint: C.passSoft, glyph: "✓" },
  warn: { color: C.warn, tint: C.warnSoft, glyph: "!" },
  fail: { color: C.fail, tint: C.failSoft, glyph: "✕" },
} as const;

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/**
 * Inlines the logo as a data URI.
 *
 * html2canvas captures whatever is painted at that instant — a <img src="/assets/…">
 * that hasn't finished loading captures as a blank box, and it's a race you lose
 * intermittently. A data URI removes the race entirely.
 */
async function logoDataUri(): Promise<string> {
  try {
    const response = await fetch(brandIcon);
    const blob = await response.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return ""; // Card still renders, just without the mark. Never block the share on this.
  }
}

function verdict(score: number): string {
  if (score >= 85) return "This one parses cleanly.";
  if (score >= 70) return "Solid — with a few things left on the table.";
  if (score >= 50) return "It'll parse, but it's losing points.";
  return "Worth fixing before the next application.";
}

/**
 * The score ring.
 *
 * 🔴 ONLY THE NUMBER GOES INSIDE THE RING. The "out of 100" caption lives BELOW it,
 * outside the circle. Do not move it back in.
 *
 * It used to sit inside, and it collided with the ring's inner edge. The tempting fix
 * is to compute the clearance — `sqrt(innerRadius² − dy²) − halfLabelWidth` — and
 * tune the radius until it fits. That was tried twice and looked fine on paper both
 * times, because the model can't be trusted: html2canvas rasterises into a cloned
 * iframe where the web font (Geist) may not resolve, so the label renders in a wider
 * fallback face and is *measurably a different width* than in the live DOM. Any
 * geometry that only just fits will therefore break in the actual PDF and nowhere
 * else — which is a miserable bug to chase.
 *
 * Putting the caption outside makes the collision impossible at any font, any size.
 */
const RING = 176;
const RING_R = 71;
const RING_STROKE = 11;

function scoreRing(score: number): string {
  const circumference = 2 * Math.PI * RING_R;
  const clamped = Math.min(Math.max(score, 0), 100);
  const offset = circumference * (1 - clamped / 100);
  const tone = score >= 75 ? C.pass : score >= 50 ? C.warn : C.fail;
  const c = RING / 2;

  return `
    <div style="display:flex;flex-direction:column;align-items:center;flex:0 0 auto;">
      <div style="position:relative;width:${RING}px;height:${RING}px;">
        <svg width="${RING}" height="${RING}" viewBox="0 0 ${RING} ${RING}" style="transform:rotate(-90deg);display:block;">
          <circle cx="${c}" cy="${c}" r="${RING_R}" fill="none" stroke="${C.border}" stroke-width="${RING_STROKE}"/>
          <circle cx="${c}" cy="${c}" r="${RING_R}" fill="none" stroke="${tone}" stroke-width="${RING_STROKE}"
                  stroke-linecap="round" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"/>
        </svg>
        <div style="position:absolute;top:0;left:0;width:${RING}px;height:${RING}px;display:flex;align-items:center;justify-content:center;">
          <span style="font-size:56px;font-weight:700;line-height:1;letter-spacing:-1.5px;color:${C.fg};">${score}</span>
        </div>
      </div>
      <div style="margin-top:9px;font-size:10px;font-weight:600;letter-spacing:1.2px;text-transform:uppercase;color:${C.soft};">out of 100</div>
    </div>`;
}

/**
 * Builds the card as a detached node. Caller must append it to the document before
 * handing it to html2pdf — html2canvas cannot rasterise a node that isn't laid out.
 */
export async function buildScoreCard(report: AtsReport): Promise<HTMLElement> {
  const logo = await logoDataUri();
  const passed = report.checks.filter((check) => check.status === "pass").length;

  const rows = report.checks
    .map((check) => {
      const style = STATUS[check.status];
      return `
        <div style="display:flex;align-items:flex-start;gap:12px;padding:11px 0;border-bottom:1px solid ${C.border};">
          <div style="flex:0 0 auto;width:22px;height:22px;border-radius:11px;background:${style.tint};color:${style.color};font-size:12px;font-weight:700;line-height:22px;text-align:center;">${style.glyph}</div>
          <div style="flex:1 1 auto;min-width:0;">
            <div style="font-size:14px;font-weight:600;color:${C.fg};">${escapeHtml(check.label)}</div>
            <div style="margin-top:2px;font-size:12px;line-height:18px;color:${C.muted};">${escapeHtml(check.detail)}</div>
          </div>
        </div>`;
    })
    .join("");

  const node = document.createElement("div");
  // Off-screen but laid out. `display:none` would make html2canvas capture nothing.
  node.style.cssText = `position:fixed;left:-10000px;top:0;width:${CARD_WIDTH}px;`;

  node.innerHTML = `
    <div style="width:${CARD_WIDTH}px;min-height:${CARD_MIN_HEIGHT}px;box-sizing:border-box;background:${C.bg};
                font-family:Geist,-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;color:${C.fg};
                padding:42px 52px;display:flex;flex-direction:column;">

      <!-- Brand. The domain sits under the wordmark so the card carries the URL even
           when it's screenshotted and cropped — which is how most of these travel. -->
      <div style="display:flex;align-items:flex-start;justify-content:space-between;">
        <div style="display:flex;align-items:center;gap:11px;">
          ${logo ? `<img src="${logo}" alt="" style="width:36px;height:36px;object-fit:contain;display:block;"/>` : ""}
          <div>
            <div style="font-size:21px;font-weight:700;letter-spacing:-0.4px;line-height:1.15;color:${C.fg};">Jobsynk<span style="color:${C.accent};">AI</span></div>
            <a href="${SHARE_URL}" style="display:block;margin-top:2px;font-size:12px;font-weight:500;letter-spacing:0.2px;color:${C.accent};text-decoration:none;">${DOMAIN}</a>
          </div>
        </div>
        <div style="font-size:11px;font-weight:600;letter-spacing:1.4px;text-transform:uppercase;color:${C.accent};
                    background:${C.accentSoft};padding:7px 13px;border-radius:999px;">Free ATS Checker</div>
      </div>

      <!-- Score -->
      <div style="margin-top:36px;background:${C.surface};border:1px solid ${C.border};border-radius:20px;
                  padding:32px 34px;display:flex;align-items:center;gap:32px;">
        ${scoreRing(report.score)}
        <div style="flex:1 1 auto;">
          <div style="font-size:13px;font-weight:600;letter-spacing:1.4px;text-transform:uppercase;color:${C.soft};">My resume scored</div>
          <div style="margin-top:9px;font-size:31px;font-weight:700;line-height:1.15;letter-spacing:-0.6px;color:${C.fg};">${verdict(report.score)}</div>
          <div style="margin-top:12px;font-size:14px;color:${C.muted};">
            ${passed} of ${report.checks.length} checks passed · ${report.wordCount} words
          </div>
        </div>
      </div>

      <!-- Checks -->
      <div style="margin-top:22px;background:${C.surface};border:1px solid ${C.border};border-radius:20px;padding:6px 28px 12px;flex:1 1 auto;">
        <div style="padding:14px 0 2px;font-size:11px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:${C.soft};">
          What the checker found
        </div>
        ${rows}
      </div>

      <!-- The honest note. We say this in the app; we say it here too. -->
      <div style="margin-top:16px;font-size:11px;line-height:17px;color:${C.soft};">
        <strong style="color:${C.muted};font-weight:600;">Straight up:</strong>
        no applicant tracking system gives your resume an official score, and no tool can show you one — including this one.
        This is a readability and parse-readiness estimate against the things that actually break parsers.
      </div>

      <!-- The hook. The whole panel is an anchor, so a click anywhere on the block
           opens the tool. html2pdf maps every anchor in the source node to a real
           jsPDF link annotation (see enableLinks in downloadScoreCard) — without
           that, html2canvas rasterises the button into a dead picture of a button,
           which is exactly what it was before. -->
      <a href="${SHARE_URL}" style="display:block;margin-top:16px;background:${C.accent};border-radius:20px;
                padding:24px 30px;color:#FFFFFF;text-decoration:none;">
        <div style="font-size:23px;font-weight:700;letter-spacing:-0.3px;line-height:1.3;color:#FFFFFF;">
          Think your resume scores higher? Prove it.
        </div>
        <div style="margin-top:9px;font-size:14px;line-height:21px;color:#DDE1FA;">
          Free, no signup, and your file never leaves your browser. Takes about ten seconds.
        </div>
        <span style="margin-top:17px;display:inline-block;background:#FFFFFF;color:${C.accent};
                     font-size:15px;font-weight:700;padding:12px 22px;border-radius:10px;
                     box-shadow:0 2px 8px rgba(31,29,26,0.16);">
          Check my resume free →
        </span>
        <div style="margin-top:11px;font-size:12px;font-weight:500;color:#DDE1FA;">
          ${DOMAIN}/ats-checker
        </div>
      </a>
    </div>`;

  return node;
}

/** Renders the card and triggers a PDF download. */
export async function downloadScoreCard(report: AtsReport): Promise<void> {
  // Lazy — html2pdf.js is ~1MB. Nobody who doesn't click Share should pay for it.
  const [{ default: html2pdf }, node] = await Promise.all([
    import("html2pdf.js"),
    buildScoreCard(report),
  ]);

  document.body.appendChild(node);
  try {
    const card = node.firstElementChild as HTMLElement;

    // Measure AFTER layout. Sizing the PDF page to the card's real height is what
    // guarantees the closing CTA is never clipped and nothing spills onto a phantom
    // second page — a fixed A4 page cut it off once already.
    const height = Math.max(Math.ceil(card.getBoundingClientRect().height), CARD_MIN_HEIGHT);

    await html2pdf()
      .set({
        margin: 0,
        filename: `jobsynk-ats-score-${report.score}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, backgroundColor: C.bg, useCORS: true, logging: false },
        // px units + an explicit page size keeps the PDF 1:1 with the DOM.
        jsPDF: { unit: "px", format: [CARD_WIDTH, height], orientation: "portrait" },
        // THE bit that makes the CTA a real link. html2canvas rasterises the DOM to a
        // flat image, so an <a> would otherwise become a *picture* of a button — it
        // looks clickable and does nothing. `enableLinks` walks the source node and
        // lays a jsPDF link annotation over each <a> at its measured position.
        enableLinks: true,
      })
      .from(card)
      .save();
  } finally {
    node.remove();
  }
}

/** The text that rides along with a link share. */
export function shareText(report: AtsReport): string {
  return `My resume scored ${report.score}/100 on Jobsynk's free ATS checker. Think yours does better? ${SITE_URL}/ats-checker — free, no signup.`;
}
