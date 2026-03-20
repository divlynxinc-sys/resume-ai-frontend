import type { TemplateInput } from './types';
import { formatDate, dateRange, esc, renderIf } from './utils';

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

  /* ── Contact parts: candidate_info.email, .phone, .linkedin?, .portfolio? ── */
  const contactParts = [
    esc(c.email),
    esc(c.phone),
    renderIf(c.linkedin, v => `<a href="${esc(v)}" style="color:#1a365d;text-decoration:none">${esc(v)}</a>`),
    renderIf(c.portfolio, v => `<a href="${esc(v)}" style="color:#1a365d;text-decoration:none">${esc(v)}</a>`),
  ].filter(Boolean);

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
    /* contact row — centered */
    .contact {
      text-align: center; font-size: 9pt; color: #444; margin-bottom: 22px;
    }
    .contact span { margin: 0 6px; }
    .contact span + span::before { content: '·'; margin-right: 12px; color: #999; }
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
  `;

  /* ── Header: candidate_info.name + contact ── */
  const header = `
    <h1>${esc(c.name)}</h1>
    <div class="name-underline"></div>
    <div class="contact">${contactParts.map(p => `<span>${p}</span>`).join('')}</div>
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
            ${proj.link ? `<a class="proj-link" href="${esc(proj.link)}">${esc(proj.link)}</a>` : ''}
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
