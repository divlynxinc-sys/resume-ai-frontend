import type { TemplateInput } from './types';
import { formatDate, dateRange, esc, renderIf } from './utils';

/**
 * Template 5 — Creative Bold Design
 * Single-column with a dark header banner, blue accent (#2563eb) left borders
 * on sections, colored skill badges, and card-style projects.
 */
export function creativeBold(data: TemplateInput): string {
  /* ── candidate_info fields ── */
  const c = data.candidate_info;
  /* ── resume fields ── */
  const r = data.resume;

  const ACCENT = '#2563eb';
  const ACCENT_LIGHT = '#dbeafe';

  const css = `
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 210mm; min-height: 297mm;
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      font-size: 10pt; line-height: 1.5; color: #1e293b;
      -webkit-print-color-adjust: exact; print-color-adjust: exact;
    }

    /* ── Dark header banner: candidate_info ── */
    .banner {
      background: #0f172a; color: #f1f5f9; padding: 32px 44px 28px;
    }
    .banner h1 { font-size: 26pt; font-weight: 800; letter-spacing: -0.5px; color: #fff; margin-bottom: 6px; }
    .banner .contact { font-size: 9pt; color: #94a3b8; display: flex; flex-wrap: wrap; gap: 14px; }
    .banner .contact a { color: ${ACCENT}; text-decoration: none; }

    .body { padding: 28px 44px 36px; }

    /* ── Section headers with accent left border ── */
    .section { margin-bottom: 18px; }
    .section-title {
      font-size: 11pt; font-weight: 700; text-transform: uppercase;
      letter-spacing: 1.5px; color: ${ACCENT};
      padding-left: 12px; border-left: 4px solid ${ACCENT};
      margin-bottom: 10px;
    }

    /* ── Summary ── */
    .summary-text { font-size: 10pt; color: #334155; }

    /* ── Experience ── */
    .exp-block { page-break-inside: avoid; margin-bottom: 12px; }
    .exp-header { display: flex; justify-content: space-between; align-items: baseline; }
    .exp-role { font-weight: 700; font-size: 10.5pt; color: #0f172a; }
    .exp-dates { font-size: 8.5pt; color: #64748b; background: ${ACCENT_LIGHT}; padding: 1px 8px; border-radius: 3px; }
    .exp-company { font-size: 9.5pt; color: #475569; margin-bottom: 3px; }
    ul { padding-left: 18px; margin: 3px 0 0; }
    li { margin-bottom: 2px; font-size: 9.5pt; }

    /* ── Projects as cards ── */
    .proj-block {
      page-break-inside: avoid; margin-bottom: 10px;
      border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 14px;
    }
    .proj-title { font-weight: 700; font-size: 10pt; color: #0f172a; }
    .proj-link { font-size: 8pt; color: ${ACCENT}; text-decoration: none; margin-left: 6px; }

    /* ── Education ── */
    .edu-block { page-break-inside: avoid; margin-bottom: 8px; }
    .edu-header { display: flex; justify-content: space-between; align-items: baseline; }
    .edu-degree { font-weight: 700; font-size: 10pt; color: #0f172a; }
    .edu-year { font-size: 8.5pt; color: #64748b; }
    .edu-school { font-size: 9pt; color: #475569; }

    /* ── Skills as colored badges ── */
    .skill-group { margin-bottom: 8px; }
    .skill-group-label { font-size: 9pt; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
    .badge {
      display: inline-block; background: ${ACCENT_LIGHT}; color: ${ACCENT};
      font-size: 8.5pt; font-weight: 600; padding: 2px 10px; border-radius: 12px;
      margin: 0 4px 4px 0;
    }
  `;

  /* ── Banner: candidate_info.name + contact ── */
  const banner = `
    <div class="banner">
      <!-- candidate_info.name -->
      <h1>${esc(c.name)}</h1>
      <div class="contact">
        <!-- candidate_info.email -->
        <span>${esc(c.email)}</span>
        <!-- candidate_info.phone -->
        <span>${esc(c.phone)}</span>
        <!-- candidate_info.linkedin (optional) -->
        ${renderIf(c.linkedin, v => `<a href="${esc(v)}">${esc(v)}</a>`)}
        <!-- candidate_info.portfolio (optional) -->
        ${renderIf(c.portfolio, v => `<a href="${esc(v)}">${esc(v)}</a>`)}
      </div>
    </div>
  `;

  /* ── Summary: resume.summary ── */
  const summary = r.summary ? `
    <div class="section">
      <div class="section-title">Profile</div>
      <p class="summary-text">${esc(r.summary)}</p>
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
            <span class="exp-dates">${dateRange(exp.startDate, exp.endDate)}</span>
          </div>
          <!-- resume.experiences[].company, .location -->
          <div class="exp-company">${esc(exp.company)}${exp.location ? ' · ' + esc(exp.location) : ''}</div>
          <!-- resume.experiences[].bullets[] -->
          <ul>${exp.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul>
        </div>
      `).join('')}
    </div>
  ` : '';

  /* ── Projects: resume.projects[] as cards ── */
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
          <div class="edu-header">
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

  /* ── Skills: resume.skills[] as colored badges ── */
  const skills = r.skills.length ? `
    <div class="section">
      <div class="section-title">Skills</div>
      ${r.skills.map(cat => `
        <div class="skill-group">
          <!-- resume.skills[].category -->
          <div class="skill-group-label">${esc(cat.category)}</div>
          <!-- resume.skills[].skills[] as badges -->
          ${cat.skills.map(s => `<span class="badge">${esc(s)}</span>`).join('')}
        </div>
      `).join('')}
    </div>
  ` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head>
<body>${banner}<div class="body">${summary}${experience}${projects}${education}${skills}</div></body>
</html>`;
}
