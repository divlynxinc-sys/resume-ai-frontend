// src/lib/resume-templates/utils.ts
function esc(str) {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// src/lib/resume-templates/modern-minimal.ts
function modernMinimal(data) {
  const c = data.candidate_info;
  const r = data.resume;
  const NAVY = "#1F3A5F";
  const RULE = "#9aa3ad";
  const LINK_BLUE = "#1A4DA1";
  const META = "#3a3a3a";
  const FULL_MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];
  const fmtFullDate = (value) => {
    if (!value) return "Present";
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
  const fmtRange = (start, end, loc) => {
    const range = `${fmtFullDate(start)} - ${fmtFullDate(end)}`;
    return loc ? `${range}, ${loc}` : range;
  };
  const emailIcon = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="${META}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px;margin-right:4px"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,6 12,13 2,6"/></svg>`;
  const phoneIcon = `<svg width="11" height="11" viewBox="0 0 24 24" fill="${META}" style="vertical-align:-1px;margin-right:4px"><path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57a1 1 0 0 0-1.02.24l-2.2 2.2a15.05 15.05 0 0 1-6.59-6.59l2.2-2.21a1 1 0 0 0 .24-1.02A11.36 11.36 0 0 1 8.5 4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1c0 9.39 7.61 17 17 17a1 1 0 0 0 1-1v-3.5a1 1 0 0 0-1-1z"/></svg>`;
  const linkedinIcon = `<svg width="11" height="11" viewBox="0 0 24 24" fill="${META}" style="vertical-align:-1px;margin-right:4px"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45C23.2 24 24 23.23 24 22.28V1.72C24 .77 23.2 0 22.22 0z"/></svg>`;
  const githubIcon = `<svg width="11" height="11" viewBox="0 0 24 24" fill="${META}" style="vertical-align:-1px;margin-right:4px"><path d="M12 .5a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58v-2.02c-3.34.73-4.04-1.41-4.04-1.41-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.21.09 1.85 1.24 1.85 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.31-.54-1.53.11-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.65 1.65.24 2.87.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 12 .5z"/></svg>`;
  const contactItems = [];
  if (c.email)
    contactItems.push(`<span class="ci">${emailIcon}<a href="mailto:${esc(c.email)}">${esc(c.email)}</a></span>`);
  if (c.phone)
    contactItems.push(`<span class="ci">${phoneIcon}${esc(c.phone)}</span>`);
  if (c.linkedin)
    contactItems.push(`<span class="ci">${linkedinIcon}<a href="https://${esc(c.linkedin)}">${esc(c.linkedin)}</a></span>`);
  if (c.portfolio)
    contactItems.push(`<span class="ci">${githubIcon}<a href="https://${esc(c.portfolio)}">${esc(c.portfolio)}</a></span>`);
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

    /* \u2500\u2500 Header \u2500\u2500 */
    .resume-root .header { text-align: center; margin-bottom: 4px; }
    .resume-root h1 {
      font-size: 20pt; font-weight: 700; letter-spacing: 0.3px;
      color: ${NAVY}; margin-bottom: 3px;
    }
    .resume-root .contact-row {
      display: flex; justify-content: center; align-items: center;
      flex-wrap: wrap; gap: 12px;
      font-size: 8.5pt; color: ${META};
    }
    .resume-root .ci { display: inline-flex; align-items: center; }
    .resume-root .ci a { color: ${META}; text-decoration: none; }

    /* \u2500\u2500 Sections \u2014 navy uppercase title, thin grey rule beneath \u2500\u2500 */
    .resume-root .section { margin-top: 9px; }
    .resume-root .section-title {
      font-size: 10.5pt; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.4px;
      color: ${NAVY};
      border-bottom: 0.6pt solid ${RULE};
      padding-bottom: 1.5px;
      margin-bottom: 4px;
      display: block;
    }

    .resume-root p.summary { font-size: 9pt; line-height: 1.35; color: #222; }

    /* \u2500\u2500 Experience \u2500\u2500 */
    .resume-root .exp-block { margin-bottom: 5px; page-break-inside: avoid; }
    .resume-root .exp-role { font-weight: 700; font-size: 10pt; color: #111; display: block; margin-bottom: 0; }
    /* Table layout (not flex) \u2014 html2canvas/html2pdf is unreliable with
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

    .resume-root ul { list-style: disc; padding-left: 14px; margin: 1px 0 0; }
    .resume-root li { margin-bottom: 1px; font-size: 9pt; line-height: 1.32; color: #222; }

    /* \u2500\u2500 Projects \u2500\u2500 */
    .resume-root .proj-block { margin-bottom: 5px; page-break-inside: avoid; }
    .resume-root .proj-title { font-weight: 700; font-size: 10pt; color: #111; display: block; margin-bottom: 0; }
    .resume-root .proj-url {
      display: block; font-size: 8.5pt; color: ${LINK_BLUE};
      text-decoration: underline; margin-bottom: 1px; word-break: break-all;
    }
    .resume-root .proj-sub { font-size: 9pt; color: #222; margin-bottom: 1px; }
    .resume-root .proj-sub a { color: ${LINK_BLUE}; text-decoration: underline; }

    /* \u2500\u2500 Education \u2500\u2500 */
    .resume-root .edu-block { margin-bottom: 3px; page-break-inside: avoid; }
    .resume-root .edu-degree { font-weight: 700; font-size: 10pt; color: #111; display: block; }
    .resume-root .edu-meta { font-size: 9pt; color: #222; margin-top: 0; }

    /* \u2500\u2500 Skills \u2500\u2500 */
    .resume-root .skill-row { display: flex; align-items: baseline; margin-bottom: 2px; }
    .resume-root .skill-cat { font-weight: 700; font-size: 9pt; color: #111; min-width: 88px; margin-right: 10px; flex-shrink: 0; }
    .resume-root .skill-vals { font-size: 9pt; color: #222; flex: 1; }
  `;
  const section = (title, content) => content.trim() ? `<div class="section"><span class="section-title">${title}</span>${content}</div>` : "";
  const summaryHtml = r.summary ? `<p class="summary">${esc(r.summary)}</p>` : "";
  const experienceHtml = r.experiences.map(
    (exp) => `<div class="exp-block">
        <span class="exp-role">${esc(exp.role)}</span>
        <div class="exp-meta-row">
          <span class="exp-company">${esc(exp.company)}</span>
          <span class="exp-date">${esc(fmtRange(exp.startDate, exp.endDate, exp.location))}</span>
        </div>
        ${exp.bullets.length ? `<ul>${exp.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>` : ""}
      </div>`
  ).join("");
  const projectsHtml = r.projects.map((proj) => {
    const linkHtml = proj.link ? `<a class="proj-url" href="${esc(proj.link)}">${esc(proj.link)}</a>` : "";
    const bulletsHtml = proj.bullets.length ? `<ul>${proj.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>` : "";
    return `<div class="proj-block">
        <span class="proj-title">${esc(proj.title)}</span>
        ${linkHtml}
        ${bulletsHtml}
      </div>`;
  }).join("");
  const educationHtml = r.education.map((edu) => {
    const degreeText = (edu.degree || "").trim();
    const fieldText = (edu.field || "").trim();
    const fullDegree = !fieldText ? degreeText : !degreeText ? fieldText : degreeText.toLowerCase().includes(fieldText.toLowerCase()) ? degreeText : `${degreeText} in ${fieldText}`;
    const metaParts = [
      esc((edu.school ?? "").trim()),
      (edu.location ?? "").trim() ? esc(edu.location.trim()) : "",
      (edu.endDate ?? "").trim() ? esc(fmtFullDate(edu.endDate.trim())) : ""
    ].filter(Boolean);
    return `<div class="edu-block">
        <span class="edu-degree">${esc(fullDegree)}</span>
        <div class="edu-meta">${metaParts.join(" &bull; ")}</div>
      </div>`;
  }).join("");
  const skillsHtml = r.skills.map(
    (cat) => `<div class="skill-row">
        <span class="skill-cat">${esc(cat.category)}</span>
        <span class="skill-vals">${cat.skills.map((s) => esc(s)).join(", ")}</span>
      </div>`
  ).join("");
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
      <div class="contact-row">${contactItems.join("")}</div>
    </div>
    ${section("Summary", summaryHtml)}
    ${section("Experience", experienceHtml)}
    ${section("Project", projectsHtml)}
    ${section("Education", educationHtml)}
    ${section("Skills", skillsHtml)}
  </div>
</div>
</body>
</html>`;
}
export {
  modernMinimal
};
