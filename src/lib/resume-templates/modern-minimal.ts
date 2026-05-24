import type { TemplateInput } from './types';
import { esc } from './utils';

/**
 * Pixel-faithful match to the reference resume PDF.
 *
 * Layout: A4, single-column, navy-blue name + section headers, thin grey
 * underline beneath each section title, Calibri-stack body. Header has a
 * centered name with an inline contact row (email / phone / LinkedIn / GitHub)
 * separated by small icons.
 */
export function modernMinimal(data: TemplateInput): string {
  const c = data.candidate_info;
  const r = data.resume;

  const NAVY = '#1F3A5F';
  const RULE = '#9aa3ad';
  const LINK_BLUE = '#1A4DA1';
  const META = '#3a3a3a';

  /* ── Date helpers — full month names ("December 2025") to match PDF ── */
  const FULL_MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const fmtFullDate = (value: string | undefined | null): string => {
    if (!value) return 'Present';
    const trimmed = value.trim();
    if (/^\d{4}$/.test(trimmed)) return trimmed;
    const m = trimmed.match(/^(\d{4})-(\d{2})$/);
    if (m) {
      const monthIdx = parseInt(m[2], 10) - 1;
      const monthName = FULL_MONTHS[monthIdx] ?? m[2];
      return `${monthName} ${m[1]}`;
    }
    return trimmed;
  };
  const fmtRange = (start: string, end?: string, loc?: string) => {
    const range = `${fmtFullDate(start)} - ${fmtFullDate(end)}`;
    return loc ? `${range}, ${loc}` : range;
  };

  /* ── Inline SVG icons — safe now that we use browser-native print, not html2canvas ── */
  const emailIcon    = `<svg class="mm-ci" viewBox="0 0 24 24" fill="none" stroke="${META}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,6 12,13 2,6"/></svg>`;
  const phoneIcon    = `<svg class="mm-ci" viewBox="0 0 24 24" fill="${META}"><path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57a1 1 0 0 0-1.02.24l-2.2 2.2a15.05 15.05 0 0 1-6.59-6.59l2.2-2.21a1 1 0 0 0 .24-1.02A11.36 11.36 0 0 1 8.5 4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1c0 9.39 7.61 17 17 17a1 1 0 0 0 1-1v-3.5a1 1 0 0 0-1-1z"/></svg>`;
  const linkedinIcon = `<svg class="mm-ci" viewBox="0 0 24 24" fill="${META}"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45C23.2 24 24 23.23 24 22.28V1.72C24 .77 23.2 0 22.22 0z"/></svg>`;
  const githubIcon   = `<svg class="mm-ci" viewBox="0 0 24 24" fill="${META}"><path d="M12 .5a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58v-2.02c-3.34.73-4.04-1.41-4.04-1.41-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.21.09 1.85 1.24 1.85 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.31-.54-1.53.11-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.65 1.65.24 2.87.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 12 .5z"/></svg>`;

  /* ── Build contact items with icons ── */
  const contactItems: string[] = [];
  if (c.email)
    contactItems.push(`<span class="mm-ci-item">${emailIcon}<a href="mailto:${esc(c.email)}">${esc(c.email)}</a></span>`);
  if (c.phone)
    contactItems.push(`<span class="mm-ci-item">${phoneIcon}${esc(c.phone)}</span>`);
  if (c.linkedin)
    contactItems.push(`<span class="mm-ci-item">${linkedinIcon}<a href="https://${esc(c.linkedin)}">${esc(c.linkedin)}</a></span>`);
  if (c.portfolio)
    contactItems.push(`<span class="mm-ci-item">${githubIcon}<a href="https://${esc(c.portfolio)}">${esc(c.portfolio)}</a></span>`);

  /* ── CSS ──
   * All selectors are scoped to .resume-root so this stylesheet can be safely
   * dropped into a host page (e.g. via innerHTML during PDF download) without
   * leaking onto the host's elements. The previous unscoped `*` and
   * `html, body` rules collapsed the running app's layout during export. */
  const css = `
    @page { size: A4; margin: 0; }
    .resume-root, .resume-root * { box-sizing: border-box; }
    .resume-root {
      width: 210mm; min-height: 297mm;
      margin: 0; padding: 0;
      background: #fff;
      font-family: Calibri, 'Gill Sans MT', 'Gill Sans', 'Trebuchet MS', Arial, sans-serif;
      font-size: 9.5pt; line-height: 1.32; color: #222;
      -webkit-print-color-adjust: exact; print-color-adjust: exact;
    }
    .resume-root * { margin: 0; padding: 0; }
    .resume-root .page { padding: 11mm 14mm 11mm; }

    /* ── Header ── */
    .resume-root .header { text-align: center; margin-bottom: 4px; }
    .resume-root h1 {
      font-size: 20pt; font-weight: 700; letter-spacing: 0.3px;
      color: ${NAVY}; margin-bottom: 3px;
    }
    .resume-root .contact-row {
      display: flex; justify-content: center; align-items: center;
      flex-wrap: wrap; gap: 4px 10px;
      font-size: 8.5pt; color: ${META};
    }
    .resume-root .contact-row a { color: ${META}; text-decoration: none; }
    .resume-root .contact-sep { margin: 0 4px; color: #bbb; }
    .resume-root .mm-ci-item { display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; }
    .resume-root .mm-ci { width: 11px; height: 11px; flex-shrink: 0; }

    /* ── Sections — navy uppercase title, rule below heading ── */
    .resume-root .section { margin-top: 9px; }
    .resume-root .section-title {
      display: block;
      font-size: 10.5pt; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.4px;
      color: ${NAVY};
      margin-bottom: 4px;
      line-height: 1;
    }
    .resume-root .section-title span { display: block; }
    .resume-root .section-title i {
      display: block;
      width: 100%;
      height: 1px;
      margin-top: 2px;
      background: ${RULE};
    }

    .resume-root p.summary { font-size: 9pt; line-height: 1.35; color: #222; }

    /* ── Experience ── */
    .resume-root .exp-block { margin-bottom: 5px; page-break-inside: avoid; }
    .resume-root .exp-role { font-weight: 700; font-size: 10pt; color: #111; display: block; margin-bottom: 0; }
    /* Table layout (not flex) — html2canvas/html2pdf is unreliable with
     * justify-content: space-between when one cell is long. Tables render
     * deterministically, keeping company on the left and date right-aligned
     * on the same line. */
    .resume-root .exp-meta-row {
      display: table; width: 100%;
      margin-bottom: 2px;
    }
    .resume-root .exp-company {
      display: table-cell; text-align: left;
      font-weight: 700; font-size: 9.5pt; color: #111;
      padding-right: 8px; vertical-align: baseline;
    }
    .resume-root .exp-date {
      display: table-cell; text-align: right;
      font-weight: 700; font-size: 9pt; color: #111;
      vertical-align: baseline; white-space: nowrap;
    }

    /* Hanging-indent bullets: display:block + text-indent so html2canvas
     * renders the glyph inline with the first line and wraps subsequent
     * lines correctly. display:table broke page-break-inside:avoid on
     * exp-block/proj-block, causing cuts through bullet text. */
    .resume-root .bullets { margin: 2px 0 0; padding: 0; }
    .resume-root .bullet-row {
      display: block;
      padding-left: 14px;
      text-indent: -9px;
      margin-bottom: 2px;
      font-size: 9pt; line-height: 1.32; color: #222;
    }

    /* ── Projects ── */
    .resume-root .proj-block { margin-bottom: 5px; page-break-inside: avoid; }
    .resume-root .proj-title { font-weight: 700; font-size: 10pt; color: #111; display: block; margin-bottom: 0; }
    .resume-root .proj-url {
      display: block; font-size: 8.5pt; color: ${LINK_BLUE};
      text-decoration: underline; margin-bottom: 1px; word-break: break-all;
    }
    .resume-root .proj-sub { font-size: 9pt; color: #222; margin-bottom: 1px; }
    .resume-root .proj-sub a { color: ${LINK_BLUE}; text-decoration: underline; }

    /* ── Education ── */
    .resume-root .edu-block { margin-bottom: 3px; page-break-inside: avoid; }
    .resume-root .edu-degree { font-weight: 700; font-size: 10pt; color: #111; display: block; }
    .resume-root .edu-meta { font-size: 9pt; color: #222; margin-top: 0; }

    /* ── Skills ── */
    .resume-root .skill-row { display: flex; align-items: baseline; margin-bottom: 2px; }
    .resume-root .skill-cat { font-weight: 700; font-size: 9pt; color: #111; min-width: 88px; margin-right: 10px; flex-shrink: 0; }
    .resume-root .skill-vals { font-size: 9pt; color: #222; flex: 1; }

    @media print {
      html, body { margin: 0; padding: 0; background: #fff; }
      .resume-root { margin: 0 auto; }
    }
  `;

  /* ── Section wrapper ── */
  const section = (title: string, content: string) =>
    content.trim()
      ? `<div class="section"><div class="section-title"><span>${title}</span><i></i></div>${content}</div>`
      : '';

  /* ── Summary ── */
  const summaryHtml = r.summary
    ? `<p class="summary">${esc(r.summary)}</p>`
    : '';

  /* ── Bullet helper: hanging-indent block, glyph as inline text ── */
  const bulletList = (bullets: string[]) =>
    `<div class="bullets">${bullets
      .map(b => `<div class="bullet-row">&bull; ${esc(b)}</div>`)
      .join('')}</div>`;

  /* ── Experience ── */
  const experienceHtml = r.experiences
    .map(
      exp => `<div class="exp-block">
        <span class="exp-role">${esc(exp.role)}</span>
        <div class="exp-meta-row">
          <span class="exp-company">${esc(exp.company)}</span>
          <span class="exp-date">${esc(fmtRange(exp.startDate, exp.endDate, exp.location))}</span>
        </div>
        ${exp.bullets.length ? bulletList(exp.bullets) : ''}
      </div>`
    )
    .join('');

  /* ── Projects ── */
  const projectsHtml = r.projects
    .map(proj => {
      const linkHtml = proj.link
        ? `<a class="proj-url" href="${esc(proj.link)}">${esc(proj.link)}</a>`
        : '';
      const bulletsHtml = proj.bullets.length ? bulletList(proj.bullets) : '';
      return `<div class="proj-block">
        <span class="proj-title">${esc(proj.title)}</span>
        ${linkHtml}
        ${bulletsHtml}
      </div>`;
    })
    .join('');

  /* ── Education ── */
  const educationHtml = r.education
    .map(edu => {
      const degreeText = (edu.degree || '').trim();
      const fieldText = (edu.field || '').trim();
      const fullDegree = !fieldText
        ? degreeText
        : !degreeText
          ? fieldText
          : degreeText.toLowerCase().includes(fieldText.toLowerCase())
            ? degreeText
            : `${degreeText} in ${fieldText}`;
      const metaParts = [
        esc((edu.school ?? '').trim()),
        (edu.location ?? '').trim() ? esc(edu.location!.trim()) : '',
        (edu.endDate ?? '').trim() ? esc(fmtFullDate(edu.endDate!.trim())) : '',
      ].filter(Boolean);
      return `<div class="edu-block">
        <span class="edu-degree">${esc(fullDegree)}</span>
        <div class="edu-meta">${metaParts.join(' &bull; ')}</div>
      </div>`;
    })
    .join('');

  /* ── Skills ── */
  const skillsHtml = r.skills
    .map(
      cat => `<div class="skill-row">
        <span class="skill-cat">${esc(cat.category)}</span>
        <span class="skill-vals">${cat.skills.map(s => esc(s)).join(', ')}</span>
      </div>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>${css}</style>
</head>
<body>
<div class="resume-root">
  <div class="page">
    <div class="header">
      <h1>${esc(c.name)}</h1>
      <div class="contact-row">${contactItems.join('<span class="contact-sep">|</span>')}</div>
    </div>
    ${section('Summary', summaryHtml)}
    ${section('Experience', experienceHtml)}
    ${section('Project', projectsHtml)}
    ${section('Education', educationHtml)}
    ${section('Skills', skillsHtml)}
  </div>
</div>
</body>
</html>`;
}
