import type { TemplateInput } from './types';
import { formatDate, dateRange, esc, linkParts } from './utils';

/**
 * Template 5 — Creative Bold Design
 * Single-column with a dark header banner, blue accent (#2563eb) left borders
 * on sections, colored skill badges, and card-style projects.
 */
export function creativeBold(data: TemplateInput): string {
  const c = data.candidate_info;
  const r = data.resume;

  const ACCENT = '#2563eb';
  const ACCENT_LIGHT = '#dbeafe';
  const ICON_COLOR = '#94a3b8';

  const emailIcon    = `<svg class="bi" viewBox="0 0 24 24" fill="none" stroke="${ICON_COLOR}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,6 12,13 2,6"/></svg>`;
  const phoneIcon    = `<svg class="bi" viewBox="0 0 24 24" fill="${ICON_COLOR}"><path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57a1 1 0 0 0-1.02.24l-2.2 2.2a15.05 15.05 0 0 1-6.59-6.59l2.2-2.21a1 1 0 0 0 .24-1.02A11.36 11.36 0 0 1 8.5 4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1c0 9.39 7.61 17 17 17a1 1 0 0 0 1-1v-3.5a1 1 0 0 0-1-1z"/></svg>`;
  const linkedinIcon = `<svg class="bi" viewBox="0 0 24 24" fill="${ICON_COLOR}"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45C23.2 24 24 23.23 24 22.28V1.72C24 .77 23.2 0 22.22 0z"/></svg>`;
  const githubIcon   = `<svg class="bi" viewBox="0 0 24 24" fill="${ICON_COLOR}"><path d="M12 .5a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58v-2.02c-3.34.73-4.04-1.41-4.04-1.41-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.21.09 1.85 1.24 1.85 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.31-.54-1.53.11-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.65 1.65.24 2.87.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 12 .5z"/></svg>`;

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
      background: #0f172a; color: #f1f5f9; padding: 28px 44px 24px;
    }
    .banner h1 { font-size: 26pt; font-weight: 800; letter-spacing: -0.5px; color: #fff; margin-bottom: 8px; }
    .banner .contact { font-size: 9pt; color: #94a3b8; display: flex; flex-wrap: wrap; gap: 6px 18px; align-items: center; }
    .banner .contact a { color: #60a5fa; text-decoration: none; }
    .bi-item { display: inline-flex; align-items: center; gap: 5px; }
    .bi { width: 12px; height: 12px; flex-shrink: 0; }

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

    /* Print / PDF pagination. The on-screen design is full-bleed (dark banner
     * edge-to-edge, @page margin 0), but full-bleed can't keep consistent
     * margins across pages — page 2+ ended up flush to the paper edge and the
     * dark <html> background bled in at the bottom of the last page. For the
     * PDF we switch to uniform @page margins (every page identical) and render
     * the dark header as an inset band on a white page. */
    @media print {
      @page { size: A4; margin: 12mm 14mm; }
      /* !important is required: the template sets a dark background inline on
       * <html>, and inline styles otherwise beat this rule — which let the dark
       * page background bleed into the empty area below the content. */
      html, body { width: auto; min-height: 0; background: #fff !important; }
      .banner { padding: 22px 24px 20px; border-radius: 6px; }
      .body { padding: 14px 0 0; }
    }
  `;

  const banner = `
    <div class="banner">
      <h1>${esc(c.name)}</h1>
      <div class="contact">
        <span class="bi-item">${emailIcon}${esc(c.email)}</span>
        <span class="bi-item">${phoneIcon}${esc(c.phone)}</span>
        ${c.linkedin  ? `<span class="bi-item">${linkedinIcon}<a href="https://${esc(c.linkedin)}">${esc(c.linkedin)}</a></span>`  : ''}
        ${c.portfolio ? `<span class="bi-item">${githubIcon}<a href="https://${esc(c.portfolio)}">${esc(c.portfolio)}</a></span>` : ''}
      </div>
    </div>
  `;

  const summary = r.summary ? `
    <div class="section">
      <div class="section-title">Profile</div>
      <p class="summary-text">${esc(r.summary)}</p>
    </div>
  ` : '';

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
<html lang="en" style="margin:0;padding:0;background:#0f172a;">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head>
<body style="margin:0;padding:0;background:#ffffff;">${banner}<div class="body">${summary}${experience}${projects}${education}${skills}</div></body>
</html>`;
}
