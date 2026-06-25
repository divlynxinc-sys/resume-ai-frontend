import type { TemplateInput } from './types';
import { formatDate, dateRange, esc, renderIf, linkParts } from './utils';

/**
 * Template 2 — Classic Professional
 * Single-column with centered header, serif typography (Georgia),
 * navy headings, all-caps section headers with double border-bottom.
 */
export function classicProfessional(data: TemplateInput): string {
  /* ── candidate_info fields ── */
  const c = data.candidate_info;
  /* ── resume fields ── */
  const r = data.resume;

  const NAVY = '#1a365d';

  const emailIcon    = `<svg class="ci" viewBox="0 0 24 24" fill="none" stroke="${NAVY}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,6 12,13 2,6"/></svg>`;
  const phoneIcon    = `<svg class="ci" viewBox="0 0 24 24" fill="${NAVY}"><path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57a1 1 0 0 0-1.02.24l-2.2 2.2a15.05 15.05 0 0 1-6.59-6.59l2.2-2.21a1 1 0 0 0 .24-1.02A11.36 11.36 0 0 1 8.5 4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1c0 9.39 7.61 17 17 17a1 1 0 0 0 1-1v-3.5a1 1 0 0 0-1-1z"/></svg>`;
  const linkedinIcon = `<svg class="ci" viewBox="0 0 24 24" fill="${NAVY}"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45C23.2 24 24 23.23 24 22.28V1.72C24 .77 23.2 0 22.22 0z"/></svg>`;
  const githubIcon   = `<svg class="ci" viewBox="0 0 24 24" fill="${NAVY}"><path d="M12 .5a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58v-2.02c-3.34.73-4.04-1.41-4.04-1.41-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.21.09 1.85 1.24 1.85 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.31-.54-1.53.11-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.65 1.65.24 2.87.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 12 .5z"/></svg>`;

  /* ── Contact items with icons ── */
  const contactParts: string[] = [];
  if (c.email)     contactParts.push(`<span class="ci-item">${emailIcon}<a href="mailto:${esc(c.email)}">${esc(c.email)}</a></span>`);
  if (c.phone)     contactParts.push(`<span class="ci-item">${phoneIcon}${esc(c.phone)}</span>`);
  if (c.linkedin)  contactParts.push(`<span class="ci-item">${linkedinIcon}<a href="https://${esc(c.linkedin)}">${esc(c.linkedin)}</a></span>`);
  if (c.portfolio) contactParts.push(`<span class="ci-item">${githubIcon}<a href="https://${esc(c.portfolio)}">${esc(c.portfolio)}</a></span>`);

  const css = `
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 210mm; min-height: 297mm;
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 10pt; line-height: 1.5; color: #1a1a1a;
      -webkit-print-color-adjust: exact; print-color-adjust: exact;
    }
    .page { padding: 40px 48px; }
    /* candidate_info.name — centered */
    h1 {
      font-size: 24pt; font-weight: 700; text-align: center;
      color: #1a365d; margin-bottom: 4px; letter-spacing: 0.5px;
    }
    .name-underline { width: 60px; height: 2px; background: #1a365d; margin: 0 auto 8px; }
    /* contact row — centered with icons */
    .contact {
      display: flex; justify-content: center; align-items: center;
      flex-wrap: wrap; gap: 4px 6px;
      font-size: 9pt; color: #444; margin-bottom: 22px;
    }
    .ci-item {
      display: inline-flex; align-items: center; gap: 4px; white-space: nowrap;
    }
    .ci-item a { color: #1a365d; text-decoration: none; }
    .ci { width: 12px; height: 12px; flex-shrink: 0; }
    .ci-sep { margin: 0 6px; color: #bbb; font-size: 10pt; line-height: 1; }
    /* section headers */
    .section { margin-bottom: 16px; }
    .section-title {
      font-size: 11pt; font-weight: 700; text-transform: uppercase;
      letter-spacing: 2px; color: #1a365d; padding-bottom: 4px;
      border-bottom: 2.5px double #1a365d; margin-bottom: 10px;
    }
    /* resume.experiences[] */
    .exp-block { page-break-inside: avoid; margin-bottom: 10px; }
    .exp-top { display: flex; justify-content: space-between; align-items: baseline; }
    .exp-role { font-weight: 700; font-size: 10.5pt; color: #1a365d; }
    .exp-dates { font-size: 9pt; color: #666; font-style: italic; }
    .exp-company { font-size: 9.5pt; color: #333; margin-bottom: 3px; }
    ul { padding-left: 20px; margin: 3px 0 0; }
    li { margin-bottom: 2px; font-size: 9.5pt; }
    /* resume.projects[] */
    .proj-block { page-break-inside: avoid; margin-bottom: 10px; }
    .proj-title { font-weight: 700; font-size: 10pt; color: #1a365d; }
    .proj-link { font-size: 8.5pt; color: #555; text-decoration: none; font-style: italic; margin-left: 6px; }
    /* resume.education[] */
    .edu-block { page-break-inside: avoid; margin-bottom: 8px; }
    .edu-top { display: flex; justify-content: space-between; align-items: baseline; }
    .edu-degree { font-weight: 700; font-size: 10pt; }
    .edu-year { font-size: 9pt; color: #666; font-style: italic; }
    .edu-school { font-size: 9.5pt; color: #333; }
    /* resume.skills[] — table-like */
    .skills-table { width: 100%; border-collapse: collapse; }
    .skills-table td { padding: 3px 0; font-size: 9.5pt; vertical-align: top; }
    .skills-table .cat { font-weight: 700; width: 120px; color: #1a365d; }

    /* Print / PDF: @page owns the margins so every page is identical; the
     * single-card padding is dropped so page 2+ isn't flush to the edge. */
    @media print {
      @page { size: A4; margin: 15mm 18mm; }
      html, body { margin: 0; padding: 0; }
      .page { width: auto; min-height: 0; padding: 0; }
    }
  `;

  /* ── Header: candidate_info.name + contact ── */
  const header = `
    <h1>${esc(c.name)}</h1>
    <div class="name-underline"></div>
    <div class="contact">${contactParts.join('<span class="ci-sep">·</span>')}</div>
  `;

  /* ── Summary: resume.summary ── */
  const summary = r.summary ? `
    <div class="section">
      <div class="section-title">Professional Summary</div>
      <p>${esc(r.summary)}</p>
    </div>
  ` : '';

  /* ── Experience: resume.experiences[] ── */
  const experience = r.experiences.length ? `
    <div class="section">
      <div class="section-title">Professional Experience</div>
      ${r.experiences.map(exp => `
        <div class="exp-block">
          <div class="exp-top">
            <!-- resume.experiences[].role -->
            <span class="exp-role">${esc(exp.role)}</span>
            <!-- resume.experiences[].startDate, .endDate -->
            <span class="exp-dates">${dateRange(exp.startDate, exp.endDate)}</span>
          </div>
          <!-- resume.experiences[].company, .location -->
          <div class="exp-company">${esc(exp.company)}${exp.location ? ', ' + esc(exp.location) : ''}</div>
          <!-- resume.experiences[].bullets[] -->
          <ul>${exp.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul>
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
          <div class="edu-top">
            <!-- resume.education[].degree, .field -->
            <span class="edu-degree">${esc(edu.degree)} in ${esc(edu.field)}</span>
            <!-- resume.education[].endDate -->
            <span class="edu-year">${formatDate(edu.endDate)}</span>
          </div>
          <!-- resume.education[].school, .location -->
          <div class="edu-school">${esc(edu.school)}${edu.location ? ', ' + esc(edu.location) : ''}</div>
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
          <div>
            <span class="proj-title">${esc(proj.title)}</span>
            ${(l => l ? `<a class="proj-link" href="${esc(l.href)}">${esc(l.text)}</a>` : '')(linkParts(proj.link))}
          </div>
          <!-- resume.projects[].bullets[] -->
          <ul>${proj.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul>
        </div>
      `).join('')}
    </div>
  ` : '';

  /* ── Skills: resume.skills[] — table layout with category + skills ── */
  const skills = r.skills.length ? `
    <div class="section">
      <div class="section-title">Skills</div>
      <table class="skills-table">
        ${r.skills.map(cat => `
          <tr>
            <!-- resume.skills[].category -->
            <td class="cat">${esc(cat.category)}</td>
            <!-- resume.skills[].skills[] -->
            <td>${cat.skills.map(s => esc(s)).join(', ')}</td>
          </tr>
        `).join('')}
      </table>
    </div>
  ` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head>
<body><div class="page">${header}${summary}${experience}${education}${projects}${skills}</div></body>
</html>`;
}
