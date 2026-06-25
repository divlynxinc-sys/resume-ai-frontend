import type { TemplateInput } from './types';
import { formatDate, dateRange, esc, renderIf, linkParts } from './utils';

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
    html, body { margin: 0; padding: 0; }
    body {
      width: 100%; min-height: 297mm;
      /* Paint the two-column background at the body level so no div
         alignment gap can ever show a white line on the left edge. */
      background: linear-gradient(to right, #2d3748 30%, #ffffff 30%);
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      font-size: 10pt; line-height: 1.5; color: #222;
      -webkit-print-color-adjust: exact; print-color-adjust: exact;
    }
    .wrapper { display: flex; width: 100%; min-height: 297mm; }

    /* ── Sidebar: 30% dark ── */
    .sidebar {
      width: 30%; background: #2d3748; color: #e2e8f0;
      padding: 16px 14px; flex-shrink: 0;
    }
    .sidebar h1 { font-size: 15pt; font-weight: 700; color: #fff; margin-bottom: 2px; line-height: 1.2; }
    .sidebar .tagline { font-size: 8pt; color: #a0aec0; margin-bottom: 12px; }
    .sidebar .section-title {
      font-size: 8pt; font-weight: 700; text-transform: uppercase;
      letter-spacing: 1.5px; color: #63b3ed; margin-bottom: 5px;
      border-bottom: 1px solid #4a5568; padding-bottom: 3px;
    }
    .sidebar .section { margin-bottom: 12px; }
    .contact-item { font-size: 8pt; margin-bottom: 3px; color: #cbd5e0; word-break: break-all; }
    .contact-item a { color: #90cdf4; text-decoration: none; }
    .skill-group { margin-bottom: 6px; }
    .skill-group-label { font-size: 8pt; font-weight: 700; color: #e2e8f0; margin-bottom: 3px; }
    .pill {
      display: inline-block; background: #4a5568; color: #e2e8f0;
      padding: 1px 6px; border-radius: 3px; font-size: 7.5pt; margin: 0 3px 3px 0;
    }
    .edu-item { margin-bottom: 6px; }
    .edu-degree { font-size: 8.5pt; font-weight: 700; color: #fff; }
    .edu-school { font-size: 8pt; color: #a0aec0; }
    .edu-year { font-size: 7.5pt; color: #718096; }

    /* ── Main: 70% white ── */
    .main { width: 70%; padding: 16px 22px; background: #ffffff; }
    .main .section { margin-bottom: 10px; }
    .main .section-title {
      font-size: 9.5pt; font-weight: 700; text-transform: uppercase;
      letter-spacing: 1.2px; color: #2d3748; margin-bottom: 5px;
      border-bottom: 2px solid #e2e8f0; padding-bottom: 3px;
    }
    .exp-block { page-break-inside: avoid; margin-bottom: 8px; }
    .exp-header { display: flex; justify-content: space-between; align-items: baseline; }
    .exp-role { font-weight: 700; font-size: 9.5pt; color: #2d3748; }
    .exp-dates { font-size: 8pt; color: #718096; }
    .exp-company { font-size: 8.5pt; color: #555; margin-bottom: 2px; }
    ul { padding-left: 14px; margin: 2px 0 0; }
    li { margin-bottom: 1px; font-size: 8.5pt; line-height: 1.35; }
    .proj-block { page-break-inside: avoid; margin-bottom: 7px; }
    .proj-title { font-weight: 700; font-size: 9pt; color: #2d3748; }
    .proj-link { font-size: 7.5pt; color: #718096; text-decoration: none; margin-left: 6px; }
    p { font-size: 8.5pt; line-height: 1.4; }

    /* Print / PDF pagination. A two-column FLEX layout cannot be split across
     * printed pages — Chromium collapses it (content overlaps the sidebar). So
     * for print we repeat the sidebar on every page with position:fixed (which
     * print media paints per-page) and let the main column flow beside it. This
     * keeps a full-height dark sidebar AND consistent margins on every page. */
    @media print {
      /* Top/bottom margins come from @page so the MAIN column gets the same top
       * margin on every page (its own padding would only apply on page 1).
       * Sides are 0 so the sidebar stays edge-to-edge. */
      @page { size: A4; margin: 12mm 0; }
      html { background: #fff !important; }   /* kill the dark <html> bleed */
      .wrapper { display: block; min-height: 0; }
      /* position:fixed repeats the sidebar on every printed page; the negative
       * top + full-page height let it bleed through the @page top/bottom band. */
      .sidebar {
        position: fixed; top: -12mm; left: 0;
        width: 30%; height: 297mm;
        padding: 24mm 10mm;
      }
      .main { width: 70%; margin-left: 30%; padding: 0 12mm; }
    }
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
                ${(l => l ? `<a class="proj-link" href="${esc(l.href)}">${esc(l.text)}</a>` : '')(linkParts(proj.link))}
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
<html lang="en" style="margin:0;padding:0;background:#2d3748;">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head>
<body style="margin:0;padding:0;background:#2d3748;"><div class="wrapper">${sidebarHtml}${mainHtml}</div></body>
</html>`;
}
