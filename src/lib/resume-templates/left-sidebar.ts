import type { TemplateInput } from './types';
import { formatDate, dateRange, esc, renderIf } from './utils';

/**
 * Template 3 — Left Sidebar Layout
 * Two-column flexbox: 30% dark sidebar (contact, skills, education)
 * + 70% white main area (summary, experience, projects).
 */
export function leftSidebar(data: TemplateInput): string {
  /* ── candidate_info fields ── */
  const c = data.candidate_info;
  /* ── resume fields ── */
  const r = data.resume;

  const css = `
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 210mm; min-height: 297mm;
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      font-size: 10pt; line-height: 1.5; color: #222;
      -webkit-print-color-adjust: exact; print-color-adjust: exact;
    }
    .wrapper { display: flex; min-height: 297mm; }

    /* ── Sidebar: 30% dark ── */
    .sidebar {
      width: 30%; background: #2d3748; color: #e2e8f0;
      padding: 36px 20px; flex-shrink: 0;
    }
    .sidebar h1 { font-size: 18pt; font-weight: 700; color: #fff; margin-bottom: 4px; line-height: 1.2; }
    .sidebar .tagline { font-size: 9pt; color: #a0aec0; margin-bottom: 20px; }
    .sidebar .section-title {
      font-size: 9pt; font-weight: 700; text-transform: uppercase;
      letter-spacing: 1.5px; color: #63b3ed; margin-bottom: 8px;
      border-bottom: 1px solid #4a5568; padding-bottom: 4px;
    }
    .sidebar .section { margin-bottom: 18px; }
    /* candidate_info contact details */
    .contact-item { font-size: 8.5pt; margin-bottom: 5px; color: #cbd5e0; word-break: break-all; }
    .contact-item a { color: #90cdf4; text-decoration: none; }
    /* resume.skills[] as pills */
    .skill-group { margin-bottom: 10px; }
    .skill-group-label { font-size: 8.5pt; font-weight: 700; color: #e2e8f0; margin-bottom: 4px; }
    .pill {
      display: inline-block; background: #4a5568; color: #e2e8f0;
      padding: 2px 8px; border-radius: 3px; font-size: 8pt; margin: 0 4px 4px 0;
    }
    /* resume.education[] in sidebar */
    .edu-item { margin-bottom: 10px; }
    .edu-degree { font-size: 9pt; font-weight: 700; color: #fff; }
    .edu-school { font-size: 8.5pt; color: #a0aec0; }
    .edu-year { font-size: 8pt; color: #718096; }

    /* ── Main: 70% white ── */
    .main { width: 70%; padding: 36px 32px; }
    .main .section { margin-bottom: 18px; }
    .main .section-title {
      font-size: 11pt; font-weight: 700; text-transform: uppercase;
      letter-spacing: 1.2px; color: #2d3748; margin-bottom: 8px;
      border-bottom: 2px solid #e2e8f0; padding-bottom: 4px;
    }
    /* resume.experiences[] */
    .exp-block { page-break-inside: avoid; margin-bottom: 12px; }
    .exp-header { display: flex; justify-content: space-between; align-items: baseline; }
    .exp-role { font-weight: 700; font-size: 10.5pt; color: #2d3748; }
    .exp-dates { font-size: 8.5pt; color: #718096; }
    .exp-company { font-size: 9pt; color: #555; margin-bottom: 3px; }
    ul { padding-left: 16px; margin: 3px 0 0; }
    li { margin-bottom: 2px; font-size: 9.5pt; }
    /* resume.projects[] */
    .proj-block { page-break-inside: avoid; margin-bottom: 10px; }
    .proj-title { font-weight: 700; font-size: 10pt; color: #2d3748; }
    .proj-link { font-size: 8pt; color: #718096; text-decoration: none; margin-left: 6px; }
    p { font-size: 9.5pt; }
  `;

  /* ── Sidebar content ── */
  const sidebarHtml = `
    <div class="sidebar">
      <!-- candidate_info.name -->
      <h1>${esc(c.name)}</h1>
      <div class="tagline">Resume</div>

      <!-- Contact: candidate_info.email, .phone, .linkedin?, .portfolio? -->
      <div class="section">
        <div class="section-title">Contact</div>
        <div class="contact-item">${esc(c.email)}</div>
        <div class="contact-item">${esc(c.phone)}</div>
        ${renderIf(c.linkedin, v => `<div class="contact-item"><a href="${esc(v)}">${esc(v)}</a></div>`)}
        ${renderIf(c.portfolio, v => `<div class="contact-item"><a href="${esc(v)}">${esc(v)}</a></div>`)}
      </div>

      <!-- Skills: resume.skills[] (category + skills array as pills) -->
      ${r.skills.length ? `
        <div class="section">
          <div class="section-title">Skills</div>
          ${r.skills.map(cat => `
            <div class="skill-group">
              <!-- resume.skills[].category -->
              <div class="skill-group-label">${esc(cat.category)}</div>
              <!-- resume.skills[].skills[] -->
              ${cat.skills.map(s => `<span class="pill">${esc(s)}</span>`).join('')}
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- Education: resume.education[] -->
      ${r.education.length ? `
        <div class="section">
          <div class="section-title">Education</div>
          ${r.education.map(edu => `
            <div class="edu-item">
              <!-- resume.education[].degree, .field -->
              <div class="edu-degree">${esc(edu.degree)} in ${esc(edu.field)}</div>
              <!-- resume.education[].school -->
              <div class="edu-school">${esc(edu.school)}</div>
              <!-- resume.education[].endDate -->
              <div class="edu-year">${formatDate(edu.endDate)}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;

  /* ── Main content ── */
  const mainHtml = `
    <div class="main">
      <!-- Summary: resume.summary -->
      ${r.summary ? `
        <div class="section">
          <div class="section-title">Profile</div>
          <p>${esc(r.summary)}</p>
        </div>
      ` : ''}

      <!-- Experience: resume.experiences[] -->
      ${r.experiences.length ? `
        <div class="section">
          <div class="section-title">Experience</div>
          ${r.experiences.map(exp => `
            <div class="exp-block">
              <div class="exp-header">
                <!-- resume.experiences[].role -->
                <span class="exp-role">${esc(exp.role)}</span>
                <!-- resume.experiences[].startDate, .endDate -->
                <span class="exp-dates">${dateRange(exp.startDate, exp.endDate)}</span>
              </div>
              <!-- resume.experiences[].company, .location -->
              <div class="exp-company">${esc(exp.company)}${exp.location ? ' · ' + esc(exp.location) : ''}</div>
              <!-- resume.experiences[].bullets[] -->
              <ul>${exp.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- Projects: resume.projects[] -->
      ${r.projects.length ? `
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
      ` : ''}
    </div>
  `;

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head>
<body><div class="wrapper">${sidebarHtml}${mainHtml}</div></body>
</html>`;
}
