import type { TemplateInput } from './types';
import { formatDate, dateRange, esc, renderIf } from './utils';

/**
 * Template 1 — Modern Minimal
 * Single-column, full-width layout with sans-serif typography,
 * thin gray dividers, generous whitespace, and pipe-separated contact row.
 */
export function modernMinimal(data: TemplateInput): string {
  /* ── candidate_info fields ── */
  const c = data.candidate_info;
  /* ── resume fields ── */
  const r = data.resume;

  /* ── Contact line: candidate_info.email, .phone, .linkedin?, .portfolio? ── */
  const contactParts = [
    esc(c.email),
    esc(c.phone),
    renderIf(c.linkedin, v => `<a href="${esc(v)}" style="color:#555;text-decoration:none">${esc(v)}</a>`),
    renderIf(c.portfolio, v => `<a href="${esc(v)}" style="color:#555;text-decoration:none">${esc(v)}</a>`),
  ].filter(Boolean);

  /* ── Styles ── */
  const css = `
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 210mm; min-height: 297mm;
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      font-size: 10pt; line-height: 1.55; color: #222;
      -webkit-print-color-adjust: exact; print-color-adjust: exact;
    }
    .page { padding: 36px 44px; }
    /* candidate_info.name */
    h1 { font-size: 22pt; font-weight: 700; letter-spacing: -0.5px; color: #111; margin-bottom: 6px; }
    /* contact row */
    .contact { font-size: 9pt; color: #555; margin-bottom: 20px; }
    .contact span + span::before { content: ' | '; color: #bbb; }
    /* section dividers */
    .section { margin-bottom: 16px; }
    .section-title {
      font-size: 10.5pt; font-weight: 600; text-transform: uppercase;
      letter-spacing: 1.2px; color: #333; padding-bottom: 4px;
      border-bottom: 1px solid #ddd; margin-bottom: 10px;
    }
    /* resume.experiences[] */
    .exp-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2px; }
    .exp-role { font-weight: 600; font-size: 10.5pt; }
    .exp-meta { font-size: 9pt; color: #666; }
    .exp-company { font-size: 9.5pt; color: #444; margin-bottom: 3px; }
    ul { padding-left: 18px; margin: 3px 0 10px; }
    li { margin-bottom: 2px; font-size: 9.5pt; }
    /* resume.projects[] */
    .proj-title { font-weight: 600; font-size: 10pt; }
    .proj-link { font-size: 8.5pt; color: #666; text-decoration: none; margin-left: 6px; }
    /* resume.education[] */
    .edu-row { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2px; }
    .edu-degree { font-weight: 600; font-size: 10pt; }
    .edu-meta { font-size: 9pt; color: #666; }
    /* resume.skills[] */
    .skill-row { margin-bottom: 4px; font-size: 9.5pt; }
    .skill-cat { font-weight: 600; }
    /* print page break control */
    .exp-block, .edu-block, .proj-block { page-break-inside: avoid; }
  `;

  /* ── Header: candidate_info.name + contact row ── */
  const header = `
    <h1>${esc(c.name)}</h1>
    <div class="contact">${contactParts.map(p => `<span>${p}</span>`).join('')}</div>
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
          <div class="exp-header">
            <!-- resume.experiences[].role -->
            <span class="exp-role">${esc(exp.role)}</span>
            <!-- resume.experiences[].startDate, .endDate -->
            <span class="exp-meta">${dateRange(exp.startDate, exp.endDate)}</span>
          </div>
          <!-- resume.experiences[].company, .location -->
          <div class="exp-company">${esc(exp.company)}${exp.location ? ` · ${esc(exp.location)}` : ''}</div>
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

  /* ── Education: resume.education[] ── */
  const education = r.education.length ? `
    <div class="section">
      <div class="section-title">Education</div>
      ${r.education.map(edu => `
        <div class="edu-block">
          <div class="edu-row">
            <!-- resume.education[].degree, .field, .school -->
            <span class="edu-degree">${esc(edu.degree)} in ${esc(edu.field)}</span>
            <!-- resume.education[].endDate -->
            <span class="edu-meta">${formatDate(edu.endDate)}</span>
          </div>
          <!-- resume.education[].school, .location -->
          <div class="exp-company">${esc(edu.school)}${edu.location ? ` · ${esc(edu.location)}` : ''}</div>
        </div>
      `).join('')}
    </div>
  ` : '';

  /* ── Skills: resume.skills[] (category + skills array) ── */
  const skills = r.skills.length ? `
    <div class="section">
      <div class="section-title">Skills</div>
      ${r.skills.map(cat => `
        <!-- resume.skills[].category → bold label, resume.skills[].skills → comma list -->
        <div class="skill-row"><span class="skill-cat">${esc(cat.category)}:</span> ${cat.skills.map(s => esc(s)).join(', ')}</div>
      `).join('')}
    </div>
  ` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head>
<body><div class="page">${header}${summary}${experience}${projects}${education}${skills}</div></body>
</html>`;
}
