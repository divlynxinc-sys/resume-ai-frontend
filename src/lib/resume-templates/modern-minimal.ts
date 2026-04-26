import type { TemplateInput } from './types';
import { esc } from './utils';

/**
 * Template — pixel-faithful match to the reference PDF.
 *
 * Section headers: bold UPPERCASE text with a border-bottom that extends the
 * full content width (same visual row as the text, not a separate HR).
 * Contact icons: CSS-only inline elements (no external SVG paths that collapse).
 * Layout: single-column, Calibri-stack, A4.
 */
export function modernMinimal(data: TemplateInput): string {
  const c = data.candidate_info;
  const r = data.resume;

  /* ── Date helpers ── */
  const fmtDate = (d: string | undefined | null) => d || 'Present';
  const fmtRange = (start: string, end?: string, loc?: string) => {
    const range = `${fmtDate(start)} - ${fmtDate(end)}`;
    return loc ? `${range},  ${loc}` : range;
  };

  /* ── Contact icons — pure CSS, renders in every browser / PDF engine ── */
  // Envelope: two rectangles + diagonal lines via CSS border trick
  const emailIcon = `<span style="display:inline-block;width:13px;height:10px;border:1.2px solid #555;border-radius:1px;position:relative;vertical-align:middle;margin-right:2px"><span style="display:block;border-left:6.5px solid transparent;border-right:6.5px solid transparent;border-top:5px solid #555;position:absolute;top:0;left:0"></span></span>`;

  // Phone handset: Unicode ✆ scaled down
  const phoneIcon = `<span style="font-size:11pt;line-height:1;vertical-align:middle;color:#555;margin-right:2px">✆</span>`;

  // LinkedIn — blue rounded rect with "in"
  const linkedinIcon = `<span style="display:inline-flex;align-items:center;justify-content:center;width:13px;height:13px;background:#0a66c2;border-radius:2px;color:#fff;font-size:7.5pt;font-weight:900;line-height:1;vertical-align:middle;margin-right:2px">in</span>`;

  // GitHub — dark circle with "gh"
  const githubIcon = `<span style="display:inline-flex;align-items:center;justify-content:center;width:13px;height:13px;background:#1b1f24;border-radius:50%;color:#fff;font-size:5.5pt;font-weight:700;line-height:1;vertical-align:middle;margin-right:2px;letter-spacing:-0.2px">gh</span>`;

  /* ── Build contact items ── */
  const contactItems: string[] = [];
  if (c.email)
    contactItems.push(`<span class="ci">${emailIcon}<a href="mailto:${esc(c.email)}">${esc(c.email)}</a></span>`);
  if (c.phone)
    contactItems.push(`<span class="ci">${phoneIcon}${esc(c.phone)}</span>`);
  if (c.linkedin)
    contactItems.push(`<span class="ci">${linkedinIcon}<a href="https://${esc(c.linkedin)}">${esc(c.linkedin)}</a></span>`);
  if (c.portfolio)
    contactItems.push(`<span class="ci">${githubIcon}<a href="https://${esc(c.portfolio)}">${esc(c.portfolio)}</a></span>`);

  /* ── CSS ── */
  const css = `
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 210mm; min-height: 297mm;
      font-family: Calibri, 'Gill Sans MT', 'Gill Sans', 'Trebuchet MS', Arial, sans-serif;
      font-size: 10.5pt; line-height: 1.45; color: #000;
      -webkit-print-color-adjust: exact; print-color-adjust: exact;
    }
    .page { padding: 14mm 18mm 14mm; }

    /* ── Header ── */
    .header { text-align: center; margin-bottom: 10px; }
    h1 { font-size: 24pt; font-weight: 700; letter-spacing: 0.3px; margin-bottom: 5px; }
    .contact-row {
      display: flex; justify-content: center; align-items: center;
      flex-wrap: wrap; gap: 14px; font-size: 9pt; color: #444;
    }
    .ci { display: inline-flex; align-items: center; gap: 0; }
    .ci a { color: #444; text-decoration: none; }

    /* ── Sections ──
       The section-title div is a full-width block. Its border-bottom therefore
       extends the full content width — the same visual row as the title text,
       giving the "TITLE___________" appearance of the reference PDF.          */
    .section { margin-bottom: 10px; }
    .section-title {
      font-size: 11pt; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.2px;
      border-bottom: 1.5px solid #000;
      padding-bottom: 2px;
      margin-bottom: 7px;
      display: block;
    }

    /* ── Experience ── */
    .exp-block { margin-bottom: 8px; page-break-inside: avoid; }
    .exp-role { font-weight: 700; font-size: 10.5pt; display: block; margin-bottom: 1px; }
    .exp-meta-row {
      display: flex; justify-content: space-between; align-items: baseline;
      margin-bottom: 3px;
    }
    .exp-company { font-weight: 700; font-size: 10pt; }
    .exp-date { font-weight: 700; font-size: 9.5pt; }
    ul { list-style: disc; padding-left: 16px; margin: 2px 0 0; }
    li { margin-bottom: 2px; font-size: 9.5pt; line-height: 1.4; }

    /* ── Projects ── */
    .proj-block { margin-bottom: 8px; page-break-inside: avoid; }
    .proj-title { font-weight: 700; font-size: 10.5pt; display: block; margin-bottom: 1px; }
    .proj-url { display: block; font-size: 9pt; color: #1155CC; text-decoration: none; margin-bottom: 2px; }

    /* ── Education ── */
    .edu-block { margin-bottom: 6px; page-break-inside: avoid; }
    .edu-degree { font-weight: 700; font-size: 10.5pt; display: block; }
    .edu-meta { font-size: 9.5pt; margin-top: 1px; }

    /* ── Skills ── */
    .skill-row { display: flex; align-items: baseline; margin-bottom: 3px; }
    .skill-cat { font-weight: 700; font-size: 9.5pt; min-width: 90px; margin-right: 12px; flex-shrink: 0; }
    .skill-vals { font-size: 9.5pt; }
  `;

  /* ── Section wrapper ── */
  const section = (title: string, content: string) =>
    content.trim()
      ? `<div class="section"><span class="section-title">${title}</span>${content}</div>`
      : '';

  /* ── Summary ── */
  const summaryHtml = r.summary
    ? `<p style="font-size:9.5pt;line-height:1.45">${esc(r.summary)}</p>`
    : '';

  /* ── Experience ── */
  const experienceHtml = r.experiences
    .map(
      exp => `<div class="exp-block">
        <span class="exp-role">${esc(exp.role)}</span>
        <div class="exp-meta-row">
          <span class="exp-company">${esc(exp.company)}</span>
          <span class="exp-date">${esc(fmtRange(exp.startDate, exp.endDate, exp.location))}</span>
        </div>
        ${exp.bullets.length ? `<ul>${exp.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}
      </div>`
    )
    .join('');

  /* ── Projects ── */
  const projectsHtml = r.projects
    .map(
      proj => `<div class="proj-block">
        <span class="proj-title">${esc(proj.title)}</span>
        ${proj.link ? `<a class="proj-url" href="${esc(proj.link)}">${esc(proj.link)}</a>` : ''}
        ${proj.bullets.length ? `<ul>${proj.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}
      </div>`
    )
    .join('');

  /* ── Education ── */
  const educationHtml = r.education
    .map(edu => {
      const metaParts = [
        esc(edu.school),
        edu.location ? esc(edu.location) : '',
        edu.endDate ? esc(edu.endDate) : '',
      ].filter(Boolean);
      return `<div class="edu-block">
        <span class="edu-degree">${esc(edu.degree)}</span>
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
<div class="page">
  <div class="header">
    <h1>${esc(c.name)}</h1>
    <div class="contact-row">${contactItems.join('')}</div>
  </div>
  ${section('Summary', summaryHtml)}
  ${section('Experience', experienceHtml)}
  ${section('Project', projectsHtml)}
  ${section('Education', educationHtml)}
  ${section('Skills', skillsHtml)}
</div>
</body>
</html>`;
}
