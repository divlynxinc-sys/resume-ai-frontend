// Minimal inline SVG art for the blog.
//
// Deliberately NOT raster images: these are ~1KB of markup each, need no CDN or
// build step, scale losslessly, and — because every colour is a CSS variable —
// they repaint automatically in dark mode. That last point is why we don't ship
// PNGs: a PNG hero would look wrong under `html.dark`.
//
// Visual language: one soft pastel field, thin strokes, one accent shape. Nothing
// decorative that doesn't carry meaning.

import type { ArtKey, CalloutTone } from "./types";

const TONE_FILL: Record<CalloutTone, string> = {
  accent: "var(--accent-soft)",
  mint: "var(--pastel-mint)",
  butter: "var(--pastel-butter)",
  rose: "var(--pastel-rose)",
  sky: "var(--pastel-sky)",
};

const LINE = "var(--app-border-strong)";
const SOFT = "var(--app-fg-soft)";
const ACCENT = "var(--accent)";
const SHEET = "var(--app-surface)";

/** A page/sheet with a scan bar sweeping it — applicant tracking systems. */
function scanner(): string {
  return `
    <rect x="132" y="34" width="136" height="172" rx="6" fill="${SHEET}" stroke="${LINE}" stroke-width="1.5"/>
    <rect x="150" y="56" width="58" height="7" rx="3.5" fill="${SOFT}" opacity="0.55"/>
    <rect x="150" y="74" width="90" height="5" rx="2.5" fill="${SOFT}" opacity="0.3"/>
    <rect x="150" y="102" width="100" height="5" rx="2.5" fill="${SOFT}" opacity="0.3"/>
    <rect x="150" y="115" width="82" height="5" rx="2.5" fill="${SOFT}" opacity="0.3"/>
    <rect x="150" y="128" width="94" height="5" rx="2.5" fill="${SOFT}" opacity="0.3"/>
    <rect x="150" y="156" width="100" height="5" rx="2.5" fill="${SOFT}" opacity="0.3"/>
    <rect x="150" y="169" width="70" height="5" rx="2.5" fill="${SOFT}" opacity="0.3"/>
    <rect x="118" y="112" width="164" height="16" rx="8" fill="${ACCENT}" opacity="0.16"/>
    <line x1="118" y1="120" x2="282" y2="120" stroke="${ACCENT}" stroke-width="2" stroke-linecap="round"/>
    <circle cx="282" cy="120" r="4.5" fill="${ACCENT}"/>
    <circle cx="118" cy="120" r="4.5" fill="${ACCENT}"/>
  `;
}

/** Rising bars with a trend line — evidence, data, "what the numbers say". */
function signal(): string {
  const bars = [
    [138, 150, 40],
    [172, 128, 62],
    [206, 142, 48],
    [240, 96, 94],
  ];
  const rects = bars
    .map(
      ([x, y, h], i) =>
        `<rect x="${x}" y="${y}" width="22" height="${h}" rx="5" fill="${
          i === 3 ? ACCENT : SOFT
        }" opacity="${i === 3 ? 0.9 : 0.28}"/>`
    )
    .join("");
  return `
    <line x1="118" y1="192" x2="282" y2="192" stroke="${LINE}" stroke-width="1.5" stroke-linecap="round"/>
    ${rects}
    <path d="M149 138 L183 116 L217 130 L251 84" fill="none" stroke="${ACCENT}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.55"/>
    <circle cx="251" cy="84" r="5" fill="${SHEET}" stroke="${ACCENT}" stroke-width="2"/>
  `;
}

/** Two overlapping fields — the resume and the job description meeting. */
function match(): string {
  return `
    <circle cx="166" cy="120" r="56" fill="${ACCENT}" opacity="0.1" stroke="${LINE}" stroke-width="1.5"/>
    <circle cx="234" cy="120" r="56" fill="${ACCENT}" opacity="0.1" stroke="${LINE}" stroke-width="1.5"/>
    <path d="M200 68 A56 56 0 0 1 200 172 A56 56 0 0 1 200 68 Z" fill="${ACCENT}" opacity="0.24"/>
    <path d="M186 120 l10 11 20 -23" fill="none" stroke="${ACCENT}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="132" cy="120" r="3" fill="${SOFT}" opacity="0.5"/>
    <circle cx="268" cy="120" r="3" fill="${SOFT}" opacity="0.5"/>
  `;
}

/** A field of tags, three of them lit — keyword selection. */
function keywords(): string {
  const pills: Array<[number, number, number, boolean]> = [
    [118, 70, 54, false],
    [180, 70, 40, true],
    [228, 70, 58, false],
    [118, 100, 44, true],
    [170, 100, 62, false],
    [240, 100, 44, false],
    [118, 130, 64, false],
    [190, 130, 38, true],
    [236, 130, 48, false],
    [140, 160, 52, false],
    [200, 160, 60, false],
  ];
  return pills
    .map(
      ([x, y, w, lit]) =>
        `<rect x="${x}" y="${y}" width="${w}" height="20" rx="10" fill="${
          lit ? ACCENT : SOFT
        }" opacity="${lit ? 0.85 : 0.16}" ${
          lit ? "" : `stroke="${LINE}" stroke-width="1"`
        }/>`
    )
    .join("");
}

/** A flat line becoming a steep one — task turned into measured impact. */
function impact(): string {
  return `
    <line x1="118" y1="186" x2="282" y2="186" stroke="${LINE}" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M124 156 L164 152 L204 158 L244 150" fill="none" stroke="${SOFT}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.35" stroke-dasharray="4 5"/>
    <path d="M124 156 L164 132 L204 100 L262 58" fill="none" stroke="${ACCENT}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M246 58 L264 56 L262 74" fill="none" stroke="${ACCENT}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="164" cy="132" r="4" fill="${SHEET}" stroke="${ACCENT}" stroke-width="2"/>
    <circle cx="204" cy="100" r="4" fill="${SHEET}" stroke="${ACCENT}" stroke-width="2"/>
  `;
}

/** Quote mark over a waveform — tone of voice, sounding human. */
function voice(): string {
  const bars = [138, 152, 166, 180, 194, 208, 222, 236, 250, 264];
  const heights = [16, 30, 48, 26, 60, 38, 54, 22, 34, 14];
  const waves = bars
    .map(
      (x, i) =>
        `<rect x="${x}" y="${168 - heights[i] / 2}" width="6" height="${
          heights[i]
        }" rx="3" fill="${i % 3 === 1 ? ACCENT : SOFT}" opacity="${
          i % 3 === 1 ? 0.8 : 0.25
        }"/>`
    )
    .join("");
  return `
    <path d="M156 92 q0 -26 24 -30 v10 q-13 3 -13 14 h13 v26 h-24 z" fill="${ACCENT}" opacity="0.75"/>
    <path d="M204 92 q0 -26 24 -30 v10 q-13 3 -13 14 h13 v26 h-24 z" fill="${ACCENT}" opacity="0.35"/>
    ${waves}
  `;
}

/** Applications narrowing to interviews. */
function funnel(): string {
  return `
    <path d="M124 58 H276 L226 128 V184 L174 200 V128 Z" fill="${ACCENT}" opacity="0.12" stroke="${LINE}" stroke-width="1.5" stroke-linejoin="round"/>
    <line x1="146" y1="82" x2="254" y2="82" stroke="${SOFT}" stroke-width="1.5" opacity="0.4" stroke-linecap="round"/>
    <line x1="168" y1="106" x2="232" y2="106" stroke="${SOFT}" stroke-width="1.5" opacity="0.4" stroke-linecap="round"/>
    <circle cx="200" cy="164" r="13" fill="${ACCENT}" opacity="0.9"/>
    <path d="M194 164 l4 4 8 -9" fill="none" stroke="${SHEET}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `;
}

/** Dot grid with one cell resolved — generic "structure". */
function grid(): string {
  const dots: string[] = [];
  for (let r = 0; r < 5; r += 1) {
    for (let c = 0; c < 8; c += 1) {
      const x = 132 + c * 20;
      const y = 76 + r * 20;
      const lit = r === 2 && c === 4;
      dots.push(
        `<circle cx="${x}" cy="${y}" r="${lit ? 6 : 3}" fill="${
          lit ? ACCENT : SOFT
        }" opacity="${lit ? 0.9 : 0.22}"/>`
      );
    }
  }
  return `
    ${dots.join("")}
    <rect x="200" y="100" width="52" height="52" rx="12" fill="none" stroke="${ACCENT}" stroke-width="1.5" opacity="0.5"/>
  `;
}

/** Stacked sheets — one resume, many tailored versions. */
function layers(): string {
  return `
    <rect x="126" y="74" width="118" height="140" rx="6" fill="${SHEET}" stroke="${LINE}" stroke-width="1.5" opacity="0.5" transform="rotate(-6 185 144)"/>
    <rect x="146" y="62" width="118" height="140" rx="6" fill="${SHEET}" stroke="${LINE}" stroke-width="1.5" opacity="0.75" transform="rotate(-1 205 132)"/>
    <rect x="164" y="50" width="118" height="140" rx="6" fill="${SHEET}" stroke="${LINE}" stroke-width="1.5"/>
    <rect x="180" y="70" width="52" height="6" rx="3" fill="${ACCENT}" opacity="0.8"/>
    <rect x="180" y="86" width="80" height="4" rx="2" fill="${SOFT}" opacity="0.3"/>
    <rect x="180" y="98" width="66" height="4" rx="2" fill="${SOFT}" opacity="0.3"/>
    <rect x="180" y="120" width="84" height="4" rx="2" fill="${SOFT}" opacity="0.3"/>
    <rect x="180" y="132" width="72" height="4" rx="2" fill="${SOFT}" opacity="0.3"/>
    <rect x="180" y="144" width="80" height="4" rx="2" fill="${SOFT}" opacity="0.3"/>
    <rect x="180" y="166" width="58" height="4" rx="2" fill="${SOFT}" opacity="0.3"/>
  `;
}

/** Nested brackets — a software engineer's résumé. */
function stack(): string {
  return `
    <rect x="128" y="56" width="144" height="128" rx="10" fill="${SHEET}" stroke="${LINE}" stroke-width="1.5"/>
    <path d="M118 96 L100 120 L118 144" fill="none" stroke="${ACCENT}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M282 96 L300 120 L282 144" fill="none" stroke="${ACCENT}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="146" y="76" width="56" height="7" rx="3.5" fill="${ACCENT}" opacity="0.8"/>
    <rect x="146" y="94" width="90" height="5" rx="2.5" fill="${SOFT}" opacity="0.3"/>
    <rect x="146" y="108" width="72" height="5" rx="2.5" fill="${SOFT}" opacity="0.3"/>
    <rect x="146" y="128" width="100" height="5" rx="2.5" fill="${SOFT}" opacity="0.3"/>
    <rect x="146" y="142" width="60" height="5" rx="2.5" fill="${ACCENT}" opacity="0.55"/>
    <rect x="146" y="156" width="84" height="5" rx="2.5" fill="${SOFT}" opacity="0.3"/>
    <line x1="188" y1="196" x2="212" y2="196" stroke="${ACCENT}" stroke-width="2.5" stroke-linecap="round"/>
  `;
}

/** A shoot rising from a single seed — the graduate with one line of history. */
function sprout(): string {
  return `
    <line x1="128" y1="188" x2="272" y2="188" stroke="${LINE}" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M200 188 V104" fill="none" stroke="${ACCENT}" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M200 148 q-34 -6 -40 -40 q34 4 40 40 z" fill="${ACCENT}" opacity="0.28" stroke="${ACCENT}" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M200 128 q34 -6 40 -40 q-34 4 -40 40 z" fill="${ACCENT}" opacity="0.5" stroke="${ACCENT}" stroke-width="1.5" stroke-linejoin="round"/>
    <circle cx="200" cy="96" r="7" fill="${SHEET}" stroke="${ACCENT}" stroke-width="2.5"/>
    <circle cx="152" cy="188" r="3" fill="${SOFT}" opacity="0.4"/>
    <circle cx="248" cy="188" r="3" fill="${SOFT}" opacity="0.4"/>
  `;
}

/** Planks laid across a gap — building experience when you have none. */
function bridge(): string {
  return `
    <path d="M118 92 V172 H160" fill="none" stroke="${LINE}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M282 92 V172 H240" fill="none" stroke="${LINE}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="118" y="112" width="42" height="10" rx="5" fill="${ACCENT}" opacity="0.85"/>
    <rect x="170" y="112" width="26" height="10" rx="5" fill="${ACCENT}" opacity="0.55"/>
    <rect x="206" y="112" width="26" height="10" rx="5" fill="${ACCENT}" opacity="0.35"/>
    <rect x="242" y="112" width="40" height="10" rx="5" fill="${SOFT}" opacity="0.2" stroke="${LINE}" stroke-width="1" stroke-dasharray="3 3"/>
    <circle cx="128" cy="92" r="5" fill="${ACCENT}"/>
    <circle cx="272" cy="92" r="5" fill="${SHEET}" stroke="${ACCENT}" stroke-width="2"/>
    <path d="M148 152 h104" stroke="${SOFT}" stroke-width="1.5" opacity="0.25" stroke-dasharray="5 6" stroke-linecap="round"/>
  `;
}

const ART: Record<ArtKey, () => string> = {
  scanner,
  signal,
  match,
  keywords,
  impact,
  voice,
  funnel,
  grid,
  layers,
  stack,
  sprout,
  bridge,
};

/**
 * Returns a complete, self-contained <svg> string. `aria-hidden` because every
 * caller supplies its own text context — the art is never the only carrier of
 * meaning.
 */
export function renderArt(key: ArtKey, tone: CalloutTone = "accent"): string {
  const draw = ART[key];
  return `<svg viewBox="0 0 400 240" role="img" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%;display:block">
    <rect x="0" y="0" width="400" height="240" rx="16" fill="${TONE_FILL[tone]}" opacity="0.55"/>
    ${draw()}
  </svg>`;
}
