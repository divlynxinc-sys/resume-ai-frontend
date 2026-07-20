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
const CREATE_URL = SITE_URL;

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

/** Colours per check status. */
const STATUS = {
  pass: { color: C.pass, tint: C.passSoft },
  warn: { color: C.warn, tint: C.warnSoft },
  fail: { color: C.fail, tint: C.failSoft },
} as const;

/**
 * Inline SVG keeps every status mark on the same pixel grid. A text glyph moves
 * vertically when html2canvas falls back from Geist to Segoe UI, which made some
 * downloaded cards show high/low ticks even though the browser preview looked fine.
 */
function statusIcon(status: AtsReport["checks"][number]["status"]): string {
  const style = STATUS[status];
  const mark =
    status === "pass"
      ? `<path d="M7.1 12.1l3.1 3.2 6.8-7"/>`
      : status === "fail"
        ? `<path d="M8.2 8.2l7.6 7.6m0-7.6l-7.6 7.6"/>`
        : `<path d="M12 7.4v6.1m0 3.2v.1"/>`;

  return `<svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"
    style="display:block;width:24px;height:24px;overflow:visible;shape-rendering:geometricPrecision;">
    <circle cx="12" cy="12" r="12" fill="${style.tint}"/>
    <g fill="none" stroke="${style.color}" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">${mark}</g>
  </svg>`;
}

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
  if (score >= 70) return "Solid, with a few things left on the table.";
  if (score >= 50) return "It'll parse, but it's losing points.";
  return "Worth fixing before the next application.";
}

function scoreMood(score: number): { label: string; color: string; tint: string } {
  if (score >= 85) return { label: "LOOKING SHARP", color: C.pass, tint: C.passSoft };
  if (score >= 70) return { label: "STRONG START", color: C.accent, tint: C.accentSoft };
  if (score >= 50) return { label: "GETTING THERE", color: C.warn, tint: C.warnSoft };
  return { label: "ROOM TO GROW", color: C.fail, tint: C.failSoft };
}

/** A labelled, print-safe ATS meter with a score-driven needle. */
const RING = 176;
const METER_HEIGHT = 196;

function scoreRing(score: number): string {
  const clamped = Math.min(Math.max(score, 0), 100);
  const tone = score >= 75 ? C.pass : score >= 50 ? C.warn : C.fail;
  const centerX = 88;
  const centerY = 111;
  const needleAngle = Math.PI - (clamped / 100) * Math.PI;
  const needleX = centerX + 55 * Math.cos(needleAngle);
  const needleY = centerY - 55 * Math.sin(needleAngle);

  return `
    <div style="display:block;width:${RING}px;text-align:center;">
      <div style="position:relative;width:${RING}px;height:${METER_HEIGHT}px;overflow:visible;">
        <svg width="${RING}" height="${METER_HEIGHT}" viewBox="0 0 ${RING} ${METER_HEIGHT}"
             style="position:absolute;inset:0;display:block;width:${RING}px;height:${METER_HEIGHT}px;overflow:visible;shape-rendering:geometricPrecision;">
          <defs>
            <radialGradient id="score-center" cx="42%" cy="34%" r="72%">
              <stop offset="0%" stop-color="#FFFFFF"/>
              <stop offset="100%" stop-color="#F3F5FD"/>
            </radialGradient>
          </defs>
          <!-- Three labelled performance zones: needs work, solid and strong. -->
          <path d="M18 111 A70 70 0 0 1 88 41" fill="none" stroke="#E8A0B4" stroke-width="13" stroke-linecap="round"/>
          <path d="M88 41 A70 70 0 0 1 137.5 61.5" fill="none" stroke="#E8C66B" stroke-width="13" stroke-linecap="butt"/>
          <path d="M137.5 61.5 A70 70 0 0 1 158 111" fill="none" stroke="#69B889" stroke-width="13" stroke-linecap="round"/>
          <path d="M18 111 A70 70 0 0 1 158 111" fill="none" stroke="#FFFFFF" stroke-width="1.5" opacity="0.62"/>
          <path d="M27 96 A62 62 0 0 1 149 96" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="2 8" stroke-linecap="round" opacity="0.8"/>
          <line x1="88" y1="34" x2="88" y2="48" stroke="#FFFFFF" stroke-width="3"/>
          <line x1="137.5" y1="55" x2="132" y2="67" stroke="#FFFFFF" stroke-width="3"/>
          <line x1="38.5" y1="56" x2="46" y2="68" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" opacity="0.85"/>
          <line x1="120" y1="44" x2="116" y2="57" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" opacity="0.85"/>
          <path d="M20 33l2.2 5 5 2.2-5 2.2-2.2 5-2.2-5-5-2.2 5-2.2z" fill="#A78BFA"/>
          <circle cx="157" cy="39" r="4" fill="#FBBF24"/><circle cx="166" cy="48" r="2" fill="#5B6CDB"/>

          <!-- Needle shadow, needle and pivot. -->
          <line x1="${centerX}" y1="${centerY}" x2="${needleX}" y2="${needleY}" stroke="${tone}" stroke-width="8" stroke-linecap="round" opacity="0.16"/>
          <line x1="${centerX}" y1="${centerY}" x2="${needleX}" y2="${needleY}" stroke="${tone}" stroke-width="3.5" stroke-linecap="round"/>
          <circle cx="${needleX}" cy="${needleY}" r="7" fill="${tone}" opacity="0.15"/>
          <circle cx="${needleX}" cy="${needleY}" r="3.5" fill="${tone}" stroke="#FFFFFF" stroke-width="1.5"/>
          <circle cx="${centerX}" cy="${centerY}" r="14" fill="${tone}" opacity="0.1"/>
          <circle cx="${centerX}" cy="${centerY}" r="9" fill="#FFFFFF" stroke="${tone}" stroke-width="4"/>
          <circle cx="${centerX}" cy="${centerY}" r="3" fill="${tone}"/>

          <!-- Numeric markers and plain-language labels. -->
          <text x="16" y="128" text-anchor="middle" fill="${C.fail}" font-family="Arial,Helvetica,sans-serif" font-size="8" font-weight="700">0</text>
          <text x="88" y="31" text-anchor="middle" fill="${C.warn}" font-family="Arial,Helvetica,sans-serif" font-size="8" font-weight="700">50</text>
          <text x="160" y="128" text-anchor="middle" fill="${C.pass}" font-family="Arial,Helvetica,sans-serif" font-size="8" font-weight="700">100</text>

          <!-- Digital score readout sits below the pivot, outside the needle sweep. -->
          <rect x="52" y="130" width="72" height="40" rx="20" fill="url(#score-center)" stroke="#DDE1FA" stroke-width="1.5"/>
          <text x="88" y="140" text-anchor="middle" dominant-baseline="central" fill="${C.soft}" font-family="Arial,Helvetica,sans-serif" font-size="6.5" font-weight="700" letter-spacing="1.15">ATS SCORE</text>
          <text x="88" y="157" text-anchor="middle" dominant-baseline="central" fill="${C.fg}" font-family="Arial,Helvetica,sans-serif" font-size="27" font-weight="700" letter-spacing="-0.7">${score}</text>

          <circle cx="9" cy="187" r="3" fill="${C.fail}"/><text x="15" y="190" fill="${C.soft}" font-family="Arial,Helvetica,sans-serif" font-size="7" font-weight="700">NEEDS WORK</text>
          <circle cx="73" cy="187" r="3" fill="${C.warn}"/><text x="79" y="190" fill="${C.soft}" font-family="Arial,Helvetica,sans-serif" font-size="7" font-weight="700">SOLID</text>
          <circle cx="119" cy="187" r="3" fill="${C.pass}"/><text x="125" y="190" fill="${C.soft}" font-family="Arial,Helvetica,sans-serif" font-size="7" font-weight="700">STRONG</text>
        </svg>
      </div>
    </div>`;
}

/**
 * Builds the card as a detached node. Caller must append it to the document before
 * handing it to html2pdf — html2canvas cannot rasterise a node that isn't laid out.
 */
export async function buildScoreCard(report: AtsReport): Promise<HTMLElement> {
  const logo = await logoDataUri();
  const passed = report.checks.filter((check) => check.status === "pass").length;
  const mood = scoreMood(report.score);
  const toReview = report.checks.length - passed;

  const rows = report.checks
    .map((check) => {
      return `
        <div style="display:table;width:100%;box-sizing:border-box;min-height:50px;padding:9px 0;border-bottom:1px solid ${C.border};break-inside:avoid;page-break-inside:avoid;">
          <div style="display:table-cell;width:38px;vertical-align:middle;">
            <div style="width:24px;height:24px;">${statusIcon(check.status)}</div>
          </div>
          <div style="display:table-cell;vertical-align:middle;">
            <div style="font-size:14px;font-weight:600;line-height:18px;color:${C.fg};">${escapeHtml(check.label)}</div>
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
      <div style="position:relative;width:100%;height:42px;">
        <div style="position:absolute;left:0;top:0;width:250px;height:42px;overflow:visible;">
          ${logo ? `<img src="${logo}" alt="" style="position:absolute;left:0;top:1px;width:40px;height:40px;object-fit:contain;display:block;"/>` : ""}
          <svg width="250" height="42" viewBox="0 0 250 42" aria-label="JobsynkAI, ${DOMAIN}"
               style="position:absolute;left:0;top:0;display:block;width:250px;height:42px;overflow:visible;">
            <text x="${logo ? 54 : 0}" y="13" dominant-baseline="central" fill="${C.fg}"
                  font-family="Arial,Helvetica,sans-serif" font-size="21" font-weight="700" letter-spacing="-0.4">Jobsynk<tspan fill="${C.accent}">AI</tspan></text>
            <text x="${logo ? 54 : 0}" y="32" dominant-baseline="central" fill="${C.accent}"
                  font-family="Arial,Helvetica,sans-serif" font-size="10.5" font-weight="500" letter-spacing="0.2">${DOMAIN}</text>
          </svg>
        </div>
        <svg width="158" height="28" viewBox="0 0 158 28" aria-label="Free ATS Checker"
             style="position:absolute;right:0;top:5px;display:block;width:158px;height:28px;overflow:visible;">
          <rect x="0" y="0" width="158" height="28" rx="14" fill="${C.accentSoft}"/>
          <text x="79" y="14" text-anchor="middle" dominant-baseline="central" fill="${C.accent}"
                font-family="Arial,Helvetica,sans-serif" font-size="11" font-weight="700" letter-spacing="1.4">FREE ATS CHECKER</text>
        </svg>
      </div>

      <!-- Score -->
      <div style="position:relative;margin-top:36px;overflow:hidden;background:linear-gradient(135deg,#FFFFFF 0%,#F7F8FE 66%,#F0F3FF 100%);border:1px solid #DDE1FA;border-radius:22px;
                  padding:34px 36px;box-shadow:0 12px 30px rgba(91,108,219,0.08);">
        <!-- Print-safe personality: bubbles, a sparkle and a tiny squiggle. -->
        <svg width="188" height="138" viewBox="0 0 188 138" aria-hidden="true"
             style="position:absolute;right:-28px;top:-30px;display:block;width:188px;height:138px;overflow:visible;">
          <circle cx="132" cy="24" r="72" fill="#E8EBFC"/>
          <circle cx="168" cy="105" r="12" fill="#E3F3E9"/>
          <circle cx="88" cy="20" r="5" fill="#FBBF24"/>
          <path d="M98 48l4 9 9 4-9 4-4 9-4-9-9-4 9-4z" fill="#A78BFA"/>
          <path d="M121 93c10-9 20 9 30 0s20 9 30 0" fill="none" stroke="#5B6CDB" stroke-width="3" stroke-linecap="round" opacity="0.5"/>
        </svg>
        <div style="position:relative;z-index:1;display:table;width:100%;table-layout:fixed;">
          <div style="display:table-cell;width:${RING + 38}px;vertical-align:middle;">${scoreRing(report.score)}</div>
          <div style="display:table-cell;padding-left:2px;vertical-align:middle;text-align:left;">
            <svg width="132" height="28" viewBox="0 0 132 28" aria-label="${mood.label}"
                 style="display:block;width:132px;height:28px;overflow:visible;">
              <rect x="0.5" y="0.5" width="131" height="27" rx="13.5" fill="${mood.tint}" stroke="${mood.color}" stroke-opacity="0.28"/>
              <text x="66" y="14" text-anchor="middle" dominant-baseline="central" fill="${mood.color}"
                    font-family="Arial,Helvetica,sans-serif" font-size="10" font-weight="700" letter-spacing="1.2">${mood.label}</text>
            </svg>
            <div style="margin-top:13px;font-size:12px;font-weight:700;line-height:17px;letter-spacing:1.5px;text-transform:uppercase;color:${C.soft};">My resume scored</div>
            <div style="margin-top:7px;max-width:420px;font-size:30px;font-weight:700;line-height:1.16;letter-spacing:-0.6px;color:${C.fg};">${verdict(report.score)}</div>
            <div style="margin-top:16px;height:30px;white-space:nowrap;">
              <svg width="126" height="30" viewBox="0 0 126 30" aria-label="${passed} checks passed" style="display:inline-block;width:126px;height:30px;margin-right:7px;overflow:visible;vertical-align:middle;">
                <rect x="0.5" y="0.5" width="125" height="29" rx="14.5" fill="#FFFFFF" stroke="#CDE7D6"/>
                <text x="63" y="15" text-anchor="middle" dominant-baseline="central" fill="${C.pass}" font-family="Arial,Helvetica,sans-serif" font-size="10.5" font-weight="600">${passed} checks passed</text>
              </svg>
              <svg width="94" height="30" viewBox="0 0 94 30" aria-label="${toReview} to review" style="display:inline-block;width:94px;height:30px;margin-right:7px;overflow:visible;vertical-align:middle;">
                <rect x="0.5" y="0.5" width="93" height="29" rx="14.5" fill="#FFFFFF" stroke="${C.border}"/>
                <text x="47" y="15" text-anchor="middle" dominant-baseline="central" fill="${C.muted}" font-family="Arial,Helvetica,sans-serif" font-size="10.5" font-weight="600">${toReview} to review</text>
              </svg>
              <svg width="90" height="30" viewBox="0 0 90 30" aria-label="${report.wordCount} words" style="display:inline-block;width:90px;height:30px;overflow:visible;vertical-align:middle;">
                <rect x="0.5" y="0.5" width="89" height="29" rx="14.5" fill="#FFFFFF" stroke="${C.border}"/>
                <text x="45" y="15" text-anchor="middle" dominant-baseline="central" fill="${C.muted}" font-family="Arial,Helvetica,sans-serif" font-size="10.5" font-weight="600">${report.wordCount} words</text>
              </svg>
            </div>
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

      <!-- The hooks. html2pdf maps both anchors to real jsPDF link annotations
           (see enableLinks in downloadScoreCard), so these remain clickable in the
           downloaded PDF rather than becoming pictures of buttons. -->
      <div style="display:block;margin-top:16px;border:1px solid #DDE1FA;background:${C.accentSoft};border-radius:18px;
                  padding:20px 24px;color:${C.fg};">
        <div style="display:table;width:100%;table-layout:fixed;">
          <div style="display:table-cell;padding-right:24px;vertical-align:middle;">
            <div style="font-size:21px;font-weight:700;letter-spacing:-0.3px;line-height:27px;color:${C.fg};">
              Think your resume scores higher?
            </div>
            <div style="margin-top:5px;font-size:13px;line-height:19px;color:${C.muted};">
              Check yours free. No signup, and your file never leaves your browser.
            </div>
            <div style="margin-top:6px;font-size:11px;font-weight:500;line-height:16px;color:${C.accent};">
              ${DOMAIN}/ats-checker
            </div>
          </div>
          <div style="display:table-cell;width:190px;vertical-align:middle;text-align:right;">
            <a href="${SHARE_URL}" style="display:block;width:190px;height:42px;text-decoration:none;">
              <svg width="190" height="42" viewBox="0 0 190 42" aria-label="Check my resume" style="display:block;width:190px;height:42px;overflow:visible;">
                <rect x="0.5" y="0.5" width="189" height="41" rx="11" fill="#FFFFFF" stroke="#CDD4F5"/>
                <text x="16" y="21" dominant-baseline="central" fill="${C.accent}" font-family="Arial,Helvetica,sans-serif" font-size="13" font-weight="700">Check my resume</text>
                <circle cx="169" cy="21" r="11" fill="${C.accent}"/>
                <path d="M165 21h8m-3-3 3 3-3 3" fill="none" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </a>
            <a href="${CREATE_URL}" style="display:block;width:190px;height:42px;margin-top:8px;text-decoration:none;">
              <svg width="190" height="42" viewBox="0 0 190 42" aria-label="Create resume" style="display:block;width:190px;height:42px;overflow:visible;">
                <rect width="190" height="42" rx="11" fill="${C.accent}"/>
                <text x="16" y="21" dominant-baseline="central" fill="#FFFFFF" font-family="Arial,Helvetica,sans-serif" font-size="13" font-weight="700">Create resume</text>
                <circle cx="169" cy="21" r="11" fill="#FFFFFF" fill-opacity="0.18"/>
                <path d="M165 21h8m-3-3 3 3-3 3" fill="none" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
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

    // html2canvas clones the card into an iframe. Waiting here makes its font
    // metrics deterministic and prevents headings/numbers shifting between clicks.
    if (document.fonts?.ready) await document.fonts.ready;

    // Measure AFTER layout. Sizing the PDF page to the card's real height is what
    // guarantees the closing CTA is never clipped and nothing spills onto a phantom
    // second page — a fixed A4 page cut it off once already.
    const height = Math.max(Math.ceil(card.getBoundingClientRect().height), CARD_MIN_HEIGHT);

    await html2pdf()
      .set({
        margin: 0,
        filename: `jobsynk-ats-score-${report.score}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          width: CARD_WIDTH,
          height,
          windowWidth: CARD_WIDTH,
          windowHeight: height,
          scrollX: 0,
          scrollY: 0,
          backgroundColor: C.bg,
          useCORS: true,
          logging: false,
        },
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
