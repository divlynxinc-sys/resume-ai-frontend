import type { TemplateInput } from './types';
import { formatDate, dateRange, esc, renderIf, linkParts } from './utils';

/**
 * Template 4 — Compact Single-Column
 * Space-efficient layout with small fonts, tight spacing,
 * right-aligned dates, designed to fit maximum content on one A4 page.
 */
export function compactSingleColumn(data: TemplateInput): string {
  /* ── candidate_info fields ── */
  const c = data.candidate_info;
  /* ── resume fields ── */
  const r = data.resume;

  /* ── Contact parts: candidate_info.email, .phone, .linkedin?, .portfolio? ── */
  const contactParts = [
    esc(c.email),
    esc(c.phone),
    renderIf(c.linkedin, v => esc(v)),
    renderIf(c.portfolio, v => esc(v)),
  ].filter(Boolean);

  const css = `
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 210mm; min-height: 297mm;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 9pt; line-height: 1.3; color: #1a1a1a;
      -webkit-print-color-adjust: exact; print-color-adjust: exact;
    }
    .page { padding: 24px 32px; }
    /* candidate_info.name — inline with contact */
    .header { margin-bottom: 10px; border-bottom: 1.5px solid #111; padding-bottom: 8px; }
    h1 { font-size: 16pt; font-weight: 700; margin-bottom: 2px; }
    .contact { font-size: 8pt; color: #444; }
    .contact span + span::before { content: ' | '; color: #999; }
    /* sections */
    .section { margin-bottom: 8px; }
    .section-title {
      font-size: 9pt; font-weight: 700; text-transform: uppercase;
      letter-spacing: 1px; color: #000; margin-bottom: 4px;
      border-bottom: 0.5px solid #999; padding-bottom: 2px;
    }
    /* resume.experiences[] — compact */
    .exp-block { page-break-inside: avoid; margin-bottom: 6px; }
    .exp-line { display: flex; justify-content: space-between; align-items: baseline; }
    .exp-role { font-weight: 700; font-size: 9pt; }
    .exp-dates { font-size: 8pt; color: #555; white-space: nowrap; }
    .exp-company { font-size: 8.5pt; color: #333; }
    ul { padding-left: 14px; margin: 1px 0 3px; }
    li { margin-bottom: 1px; font-size: 8.5pt; }
    /* resume.projects[] */
    .proj-block { page-break-inside: avoid; margin-bottom: 5px; }
    .proj-title { font-weight: 700; font-size: 9pt; }
    .proj-link { font-size: 7.5pt; color: #555; text-decoration: none; margin-left: 4px; }
    /* resume.education[] */
    .edu-block { page-break-inside: avoid; margin-bottom: 4px; }
    .edu-line { display: flex; justify-content: space-between; align-items: baseline; }
    .edu-degree { font-weight: 700; font-size: 9pt; }
    .edu-year { font-size: 8pt; color: #555; }
    .edu-school { font-size: 8.5pt; color: #333; }
    /* resume.skills[] — single-line per category */
    .skill-line { font-size: 8.5pt; margin-bottom: 2px; }
    .skill-cat { font-weight: 700; }
    p { font-size: 8.5pt; }

    /* Print / PDF: @page owns the margins so every page is identical; the
     * single-card padding is dropped so page 2+ isn't flush to the edge. */
    @media print {
      @page { size: A4; margin: 9mm 12mm; }
      html, body { margin: 0; padding: 0; }
      .page { width: auto; min-height: 0; padding: 0; }
    }
  `;

  /* ── Header: candidate_info.name + compact contact ── */
  const header = `
    <div class="header">
      <h1>${esc(c.name)}</h1>
      <div class="contact">${contactParts.map(p => `<span>${p}</span>`).join('')}</div>
    </div>
  `;

  /* ── Summary: resume.summary ── */
  const summary = r.summary ? `
    <div class="section">
      <div class="section-title">Summary</div>
      <p>${esc(r.summary)}</p>
    </div>
  ` : '';

  /* ── Experience: resume.experiences[] ── */
  const experience = r.experiences.length ? `
    <div class="section">
      <div class="section-title">Experience</div>
      ${r.experiences.map(exp => `
        <div class="exp-block">
          <div class="exp-line">
            <!-- resume.experiences[].role, .company -->
            <span><span class="exp-role">${esc(exp.role)}</span> <span class="exp-company">— ${esc(exp.company)}${exp.location ? ', ' + esc(exp.location) : ''}</span></span>
            <!-- resume.experiences[].startDate, .endDate -->
            <span class="exp-dates">${dateRange(exp.startDate, exp.endDate)}</span>
          </div>
          <!-- resume.experiences[].bullets[] -->
          <ul>${exp.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul>
        </div>
      `).join('')}
    </div>
  ` : '';

  /* ── Projects: resume.projects[] ── */
  const projects = r.projects.length ? `
    <div class="section">
      <div class="section-title">Projects</div>
      ${r.projects.map(proj => `
        <div class="proj-block">
          <!-- resume.projects[].title, .link -->
          <span class="proj-title">${esc(proj.title)}</span>
          ${(l => l ? `<a class="proj-link" href="${esc(l.href)}">${esc(l.text)}</a>` : '')(linkParts(proj.link))}
          <!-- resume.projects[].bullets[] -->
          <ul>${proj.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul>
        </div>
      `).join('')}
    </div>
  ` : '';

  /* ── Education: resume.education[] ── */
  const education = r.education.length ? `
    <div class="section">
      <div class="section-title">Education</div>
      ${r.education.map(edu => `
        <div class="edu-block">
          <div class="edu-line">
            <!-- resume.education[].degree, .field, .school -->
            <span><span class="edu-degree">${esc(edu.degree)} in ${esc(edu.field)}</span> <span class="edu-school">— ${esc(edu.school)}${edu.location ? ', ' + esc(edu.location) : ''}</span></span>
            <!-- resume.education[].endDate -->
            <span class="edu-year">${formatDate(edu.endDate)}</span>
          </div>
        </div>
      `).join('')}
    </div>
  ` : '';

  /* ── Skills: resume.skills[] — one line per category ── */
  const skills = r.skills.length ? `
    <div class="section">
      <div class="section-title">Skills</div>
      ${r.skills.map(cat => `
        <!-- resume.skills[].category + resume.skills[].skills[] -->
        <div class="skill-line"><span class="skill-cat">${esc(cat.category)}:</span> ${cat.skills.map(s => esc(s)).join(', ')}</div>
      `).join('')}
    </div>
  ` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head>
<body><div class="page">${header}${summary}${experience}${projects}${education}${skills}</div></body>
</html>`;
}
