// src/lib/resume-templates/utils.ts
var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function formatDate(value) {
  if (!value) return "Present";
  const trimmed = value.trim();
  if (/^\d{4}$/.test(trimmed)) return trimmed;
  const match = trimmed.match(/^(\d{4})-(\d{2})$/);
  if (match) {
    const monthIdx = parseInt(match[2], 10) - 1;
    const monthName = MONTHS[monthIdx] ?? match[2];
    return `${monthName} ${match[1]}`;
  }
  return trimmed;
}
function dateRange(startDate, endDate) {
  return `${formatDate(startDate)} \u2013 ${formatDate(endDate)}`;
}
function esc(str) {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function renderIf(value, htmlFn) {
  return value ? htmlFn(value) : "";
}
function scopeCssToResumeRoot(css) {
  const rules = [];
  let i = 0;
  const len = css.length;
  while (i < len) {
    while (i < len && /\s/.test(css[i])) i++;
    if (i + 1 < len && css[i] === "/" && css[i + 1] === "*") {
      const end = css.indexOf("*/", i + 2);
      i = end === -1 ? len : end + 2;
      continue;
    }
    if (i >= len) break;
    if (css[i] === "@") {
      const start = i;
      while (i < len && css[i] !== "{" && css[i] !== ";") i++;
      if (i >= len) {
        rules.push(css.slice(start));
        break;
      }
      if (css[i] === ";") {
        i++;
        rules.push(css.slice(start, i));
      } else {
        let depth2 = 1;
        i++;
        while (i < len && depth2 > 0) {
          if (css[i] === "{") depth2++;
          else if (css[i] === "}") depth2--;
          i++;
        }
        rules.push(css.slice(start, i));
      }
      continue;
    }
    const sStart = i;
    while (i < len && css[i] !== "{" && css[i] !== "}") i++;
    if (i >= len || css[i] === "}") break;
    const selectors = css.slice(sStart, i).trim();
    let depth = 1;
    i++;
    const bStart = i;
    while (i < len && depth > 0) {
      if (css[i] === "{") depth++;
      else if (css[i] === "}") depth--;
      i++;
    }
    const body = css.slice(bStart, i - 1);
    const scopedList = selectors.split(",").map((sRaw) => {
      const s = sRaw.trim();
      if (!s) return "";
      if (s.startsWith(".resume-root")) return s;
      if (s === "*") return ".resume-root, .resume-root *";
      const m = /^(html|body)(\b[^,]*)?$/.exec(s);
      if (m) return ".resume-root" + (m[2] ?? "");
      return ".resume-root " + s;
    }).filter(Boolean);
    const seen = /* @__PURE__ */ new Set();
    const scoped = scopedList.flatMap((s) => s.split(",").map((p) => p.trim()).filter(Boolean)).filter((s) => seen.has(s) ? false : (seen.add(s), true)).join(", ");
    rules.push(`${scoped} {${body}}`);
  }
  return rules.join("\n");
}
function wrapBodyInResumeRoot(html) {
  if (/class="resume-root"/.test(html)) return html;
  return html.replace(
    /<body([^>]*)>([\s\S]*?)<\/body>/i,
    '<body$1><div class="resume-root">$2</div></body>'
  );
}
function applyResumeRootScoping(html) {
  return wrapBodyInResumeRoot(
    html.replace(/<style([^>]*)>([\s\S]*?)<\/style>/gi, (_m, attrs, css) => `<style${attrs}>${scopeCssToResumeRoot(css)}</style>`)
  );
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

// src/lib/resume-templates/classic-professional.ts
function classicProfessional(data) {
  const c = data.candidate_info;
  const r = data.resume;
  const contactParts = [
    esc(c.email),
    esc(c.phone),
    renderIf(c.linkedin, (v) => `<a href="${esc(v)}" style="color:#1a365d;text-decoration:none">${esc(v)}</a>`),
    renderIf(c.portfolio, (v) => `<a href="${esc(v)}" style="color:#1a365d;text-decoration:none">${esc(v)}</a>`)
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
    /* candidate_info.name \u2014 centered */
    h1 {
      font-size: 24pt; font-weight: 700; text-align: center;
      color: #1a365d; margin-bottom: 4px; letter-spacing: 0.5px;
    }
    .name-underline { width: 60px; height: 2px; background: #1a365d; margin: 0 auto 8px; }
    /* contact row \u2014 centered */
    .contact {
      text-align: center; font-size: 9pt; color: #444; margin-bottom: 22px;
    }
    .contact span { margin: 0 6px; }
    .contact span + span::before { content: '\xB7'; margin-right: 12px; color: #999; }
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
    /* resume.skills[] \u2014 table-like */
    .skills-table { width: 100%; border-collapse: collapse; }
    .skills-table td { padding: 3px 0; font-size: 9.5pt; vertical-align: top; }
    .skills-table .cat { font-weight: 700; width: 120px; color: #1a365d; }
  `;
  const header = `
    <h1>${esc(c.name)}</h1>
    <div class="name-underline"></div>
    <div class="contact">${contactParts.map((p) => `<span>${p}</span>`).join("")}</div>
  `;
  const summary = r.summary ? `
    <div class="section">
      <div class="section-title">Professional Summary</div>
      <p>${esc(r.summary)}</p>
    </div>
  ` : "";
  const experience = r.experiences.length ? `
    <div class="section">
      <div class="section-title">Professional Experience</div>
      ${r.experiences.map((exp) => `
        <div class="exp-block">
          <div class="exp-top">
            <!-- resume.experiences[].role -->
            <span class="exp-role">${esc(exp.role)}</span>
            <!-- resume.experiences[].startDate, .endDate -->
            <span class="exp-dates">${dateRange(exp.startDate, exp.endDate)}</span>
          </div>
          <!-- resume.experiences[].company, .location -->
          <div class="exp-company">${esc(exp.company)}${exp.location ? ", " + esc(exp.location) : ""}</div>
          <!-- resume.experiences[].bullets[] -->
          <ul>${exp.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
        </div>
      `).join("")}
    </div>
  ` : "";
  const education = r.education.length ? `
    <div class="section">
      <div class="section-title">Education</div>
      ${r.education.map((edu) => `
        <div class="edu-block">
          <div class="edu-top">
            <!-- resume.education[].degree, .field -->
            <span class="edu-degree">${esc(edu.degree)} in ${esc(edu.field)}</span>
            <!-- resume.education[].endDate -->
            <span class="edu-year">${formatDate(edu.endDate)}</span>
          </div>
          <!-- resume.education[].school, .location -->
          <div class="edu-school">${esc(edu.school)}${edu.location ? ", " + esc(edu.location) : ""}</div>
        </div>
      `).join("")}
    </div>
  ` : "";
  const projects = r.projects.length ? `
    <div class="section">
      <div class="section-title">Projects</div>
      ${r.projects.map((proj) => `
        <div class="proj-block">
          <!-- resume.projects[].title, .link -->
          <div>
            <span class="proj-title">${esc(proj.title)}</span>
            ${proj.link ? `<a class="proj-link" href="${esc(proj.link)}">${esc(proj.link)}</a>` : ""}
          </div>
          <!-- resume.projects[].bullets[] -->
          <ul>${proj.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
        </div>
      `).join("")}
    </div>
  ` : "";
  const skills = r.skills.length ? `
    <div class="section">
      <div class="section-title">Skills</div>
      <table class="skills-table">
        ${r.skills.map((cat) => `
          <tr>
            <!-- resume.skills[].category -->
            <td class="cat">${esc(cat.category)}</td>
            <!-- resume.skills[].skills[] -->
            <td>${cat.skills.map((s) => esc(s)).join(", ")}</td>
          </tr>
        `).join("")}
      </table>
    </div>
  ` : "";
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head>
<body><div class="page">${header}${summary}${experience}${education}${projects}${skills}</div></body>
</html>`;
}

// src/lib/resume-templates/left-sidebar.ts
function leftSidebar(data) {
  const c = data.candidate_info;
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

    /* \u2500\u2500 Sidebar: 30% dark \u2500\u2500 */
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

    /* \u2500\u2500 Main: 70% white \u2500\u2500 */
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
        ${renderIf(c.linkedin, (v) => `<div class="contact-item"><a href="${esc(v)}">${esc(v)}</a></div>`)}
        ${renderIf(c.portfolio, (v) => `<div class="contact-item"><a href="${esc(v)}">${esc(v)}</a></div>`)}
      </div>

      <!-- Skills: resume.skills[] (category + skills array as pills) -->
      ${r.skills.length ? `
        <div class="section">
          <div class="section-title">Skills</div>
          ${r.skills.map((cat) => `
            <div class="skill-group">
              <!-- resume.skills[].category -->
              <div class="skill-group-label">${esc(cat.category)}</div>
              <!-- resume.skills[].skills[] -->
              ${cat.skills.map((s) => `<span class="pill">${esc(s)}</span>`).join("")}
            </div>
          `).join("")}
        </div>
      ` : ""}

      <!-- Education: resume.education[] -->
      ${r.education.length ? `
        <div class="section">
          <div class="section-title">Education</div>
          ${r.education.map((edu) => `
            <div class="edu-item">
              <!-- resume.education[].degree, .field -->
              <div class="edu-degree">${esc(edu.degree)} in ${esc(edu.field)}</div>
              <!-- resume.education[].school -->
              <div class="edu-school">${esc(edu.school)}</div>
              <!-- resume.education[].endDate -->
              <div class="edu-year">${formatDate(edu.endDate)}</div>
            </div>
          `).join("")}
        </div>
      ` : ""}
    </div>
  `;
  const mainHtml = `
    <div class="main">
      <!-- Summary: resume.summary -->
      ${r.summary ? `
        <div class="section">
          <div class="section-title">Profile</div>
          <p>${esc(r.summary)}</p>
        </div>
      ` : ""}

      <!-- Experience: resume.experiences[] -->
      ${r.experiences.length ? `
        <div class="section">
          <div class="section-title">Experience</div>
          ${r.experiences.map((exp) => `
            <div class="exp-block">
              <div class="exp-header">
                <!-- resume.experiences[].role -->
                <span class="exp-role">${esc(exp.role)}</span>
                <!-- resume.experiences[].startDate, .endDate -->
                <span class="exp-dates">${dateRange(exp.startDate, exp.endDate)}</span>
              </div>
              <!-- resume.experiences[].company, .location -->
              <div class="exp-company">${esc(exp.company)}${exp.location ? " \xB7 " + esc(exp.location) : ""}</div>
              <!-- resume.experiences[].bullets[] -->
              <ul>${exp.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
            </div>
          `).join("")}
        </div>
      ` : ""}

      <!-- Projects: resume.projects[] -->
      ${r.projects.length ? `
        <div class="section">
          <div class="section-title">Projects</div>
          ${r.projects.map((proj) => `
            <div class="proj-block">
              <!-- resume.projects[].title, .link -->
              <div>
                <span class="proj-title">${esc(proj.title)}</span>
                ${proj.link ? `<a class="proj-link" href="${esc(proj.link)}">${esc(proj.link)}</a>` : ""}
              </div>
              <!-- resume.projects[].bullets[] -->
              <ul>${proj.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
            </div>
          `).join("")}
        </div>
      ` : ""}
    </div>
  `;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head>
<body><div class="wrapper">${sidebarHtml}${mainHtml}</div></body>
</html>`;
}

// src/lib/resume-templates/compact-single-column.ts
function compactSingleColumn(data) {
  const c = data.candidate_info;
  const r = data.resume;
  const contactParts = [
    esc(c.email),
    esc(c.phone),
    renderIf(c.linkedin, (v) => esc(v)),
    renderIf(c.portfolio, (v) => esc(v))
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
    /* candidate_info.name \u2014 inline with contact */
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
    /* resume.experiences[] \u2014 compact */
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
    /* resume.skills[] \u2014 single-line per category */
    .skill-line { font-size: 8.5pt; margin-bottom: 2px; }
    .skill-cat { font-weight: 700; }
    p { font-size: 8.5pt; }
  `;
  const header = `
    <div class="header">
      <h1>${esc(c.name)}</h1>
      <div class="contact">${contactParts.map((p) => `<span>${p}</span>`).join("")}</div>
    </div>
  `;
  const summary = r.summary ? `
    <div class="section">
      <div class="section-title">Summary</div>
      <p>${esc(r.summary)}</p>
    </div>
  ` : "";
  const experience = r.experiences.length ? `
    <div class="section">
      <div class="section-title">Experience</div>
      ${r.experiences.map((exp) => `
        <div class="exp-block">
          <div class="exp-line">
            <!-- resume.experiences[].role, .company -->
            <span><span class="exp-role">${esc(exp.role)}</span> <span class="exp-company">\u2014 ${esc(exp.company)}${exp.location ? ", " + esc(exp.location) : ""}</span></span>
            <!-- resume.experiences[].startDate, .endDate -->
            <span class="exp-dates">${dateRange(exp.startDate, exp.endDate)}</span>
          </div>
          <!-- resume.experiences[].bullets[] -->
          <ul>${exp.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
        </div>
      `).join("")}
    </div>
  ` : "";
  const projects = r.projects.length ? `
    <div class="section">
      <div class="section-title">Projects</div>
      ${r.projects.map((proj) => `
        <div class="proj-block">
          <!-- resume.projects[].title, .link -->
          <span class="proj-title">${esc(proj.title)}</span>
          ${proj.link ? `<a class="proj-link" href="${esc(proj.link)}">${esc(proj.link)}</a>` : ""}
          <!-- resume.projects[].bullets[] -->
          <ul>${proj.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
        </div>
      `).join("")}
    </div>
  ` : "";
  const education = r.education.length ? `
    <div class="section">
      <div class="section-title">Education</div>
      ${r.education.map((edu) => `
        <div class="edu-block">
          <div class="edu-line">
            <!-- resume.education[].degree, .field, .school -->
            <span><span class="edu-degree">${esc(edu.degree)} in ${esc(edu.field)}</span> <span class="edu-school">\u2014 ${esc(edu.school)}${edu.location ? ", " + esc(edu.location) : ""}</span></span>
            <!-- resume.education[].endDate -->
            <span class="edu-year">${formatDate(edu.endDate)}</span>
          </div>
        </div>
      `).join("")}
    </div>
  ` : "";
  const skills = r.skills.length ? `
    <div class="section">
      <div class="section-title">Skills</div>
      ${r.skills.map((cat) => `
        <!-- resume.skills[].category + resume.skills[].skills[] -->
        <div class="skill-line"><span class="skill-cat">${esc(cat.category)}:</span> ${cat.skills.map((s) => esc(s)).join(", ")}</div>
      `).join("")}
    </div>
  ` : "";
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head>
<body><div class="page">${header}${summary}${experience}${projects}${education}${skills}</div></body>
</html>`;
}

// src/lib/resume-templates/creative-bold.ts
function creativeBold(data) {
  const c = data.candidate_info;
  const r = data.resume;
  const ACCENT = "#2563eb";
  const ACCENT_LIGHT = "#dbeafe";
  const css = `
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 210mm; min-height: 297mm;
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      font-size: 10pt; line-height: 1.5; color: #1e293b;
      -webkit-print-color-adjust: exact; print-color-adjust: exact;
    }

    /* \u2500\u2500 Dark header banner: candidate_info \u2500\u2500 */
    .banner {
      background: #0f172a; color: #f1f5f9; padding: 32px 44px 28px;
    }
    .banner h1 { font-size: 26pt; font-weight: 800; letter-spacing: -0.5px; color: #fff; margin-bottom: 6px; }
    .banner .contact { font-size: 9pt; color: #94a3b8; display: flex; flex-wrap: wrap; gap: 14px; }
    .banner .contact a { color: ${ACCENT}; text-decoration: none; }

    .body { padding: 28px 44px 36px; }

    /* \u2500\u2500 Section headers with accent left border \u2500\u2500 */
    .section { margin-bottom: 18px; }
    .section-title {
      font-size: 11pt; font-weight: 700; text-transform: uppercase;
      letter-spacing: 1.5px; color: ${ACCENT};
      padding-left: 12px; border-left: 4px solid ${ACCENT};
      margin-bottom: 10px;
    }

    /* \u2500\u2500 Summary \u2500\u2500 */
    .summary-text { font-size: 10pt; color: #334155; }

    /* \u2500\u2500 Experience \u2500\u2500 */
    .exp-block { page-break-inside: avoid; margin-bottom: 12px; }
    .exp-header { display: flex; justify-content: space-between; align-items: baseline; }
    .exp-role { font-weight: 700; font-size: 10.5pt; color: #0f172a; }
    .exp-dates { font-size: 8.5pt; color: #64748b; background: ${ACCENT_LIGHT}; padding: 1px 8px; border-radius: 3px; }
    .exp-company { font-size: 9.5pt; color: #475569; margin-bottom: 3px; }
    ul { padding-left: 18px; margin: 3px 0 0; }
    li { margin-bottom: 2px; font-size: 9.5pt; }

    /* \u2500\u2500 Projects as cards \u2500\u2500 */
    .proj-block {
      page-break-inside: avoid; margin-bottom: 10px;
      border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 14px;
    }
    .proj-title { font-weight: 700; font-size: 10pt; color: #0f172a; }
    .proj-link { font-size: 8pt; color: ${ACCENT}; text-decoration: none; margin-left: 6px; }

    /* \u2500\u2500 Education \u2500\u2500 */
    .edu-block { page-break-inside: avoid; margin-bottom: 8px; }
    .edu-header { display: flex; justify-content: space-between; align-items: baseline; }
    .edu-degree { font-weight: 700; font-size: 10pt; color: #0f172a; }
    .edu-year { font-size: 8.5pt; color: #64748b; }
    .edu-school { font-size: 9pt; color: #475569; }

    /* \u2500\u2500 Skills as colored badges \u2500\u2500 */
    .skill-group { margin-bottom: 8px; }
    .skill-group-label { font-size: 9pt; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
    .badge {
      display: inline-block; background: ${ACCENT_LIGHT}; color: ${ACCENT};
      font-size: 8.5pt; font-weight: 600; padding: 2px 10px; border-radius: 12px;
      margin: 0 4px 4px 0;
    }
  `;
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
        ${renderIf(c.linkedin, (v) => `<a href="${esc(v)}">${esc(v)}</a>`)}
        <!-- candidate_info.portfolio (optional) -->
        ${renderIf(c.portfolio, (v) => `<a href="${esc(v)}">${esc(v)}</a>`)}
      </div>
    </div>
  `;
  const summary = r.summary ? `
    <div class="section">
      <div class="section-title">Profile</div>
      <p class="summary-text">${esc(r.summary)}</p>
    </div>
  ` : "";
  const experience = r.experiences.length ? `
    <div class="section">
      <div class="section-title">Experience</div>
      ${r.experiences.map((exp) => `
        <div class="exp-block">
          <div class="exp-header">
            <!-- resume.experiences[].role -->
            <span class="exp-role">${esc(exp.role)}</span>
            <!-- resume.experiences[].startDate, .endDate -->
            <span class="exp-dates">${dateRange(exp.startDate, exp.endDate)}</span>
          </div>
          <!-- resume.experiences[].company, .location -->
          <div class="exp-company">${esc(exp.company)}${exp.location ? " \xB7 " + esc(exp.location) : ""}</div>
          <!-- resume.experiences[].bullets[] -->
          <ul>${exp.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
        </div>
      `).join("")}
    </div>
  ` : "";
  const projects = r.projects.length ? `
    <div class="section">
      <div class="section-title">Projects</div>
      ${r.projects.map((proj) => `
        <div class="proj-block">
          <!-- resume.projects[].title, .link -->
          <div>
            <span class="proj-title">${esc(proj.title)}</span>
            ${proj.link ? `<a class="proj-link" href="${esc(proj.link)}">${esc(proj.link)}</a>` : ""}
          </div>
          <!-- resume.projects[].bullets[] -->
          <ul>${proj.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
        </div>
      `).join("")}
    </div>
  ` : "";
  const education = r.education.length ? `
    <div class="section">
      <div class="section-title">Education</div>
      ${r.education.map((edu) => `
        <div class="edu-block">
          <div class="edu-header">
            <!-- resume.education[].degree, .field -->
            <span class="edu-degree">${esc(edu.degree)} in ${esc(edu.field)}</span>
            <!-- resume.education[].endDate -->
            <span class="edu-year">${formatDate(edu.endDate)}</span>
          </div>
          <!-- resume.education[].school, .location -->
          <div class="edu-school">${esc(edu.school)}${edu.location ? ", " + esc(edu.location) : ""}</div>
        </div>
      `).join("")}
    </div>
  ` : "";
  const skills = r.skills.length ? `
    <div class="section">
      <div class="section-title">Skills</div>
      ${r.skills.map((cat) => `
        <div class="skill-group">
          <!-- resume.skills[].category -->
          <div class="skill-group-label">${esc(cat.category)}</div>
          <!-- resume.skills[].skills[] as badges -->
          ${cat.skills.map((s) => `<span class="badge">${esc(s)}</span>`).join("")}
        </div>
      `).join("")}
    </div>
  ` : "";
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head>
<body>${banner}<div class="body">${summary}${experience}${projects}${education}${skills}</div></body>
</html>`;
}

// src/lib/resume-templates/index.ts
var TEMPLATES = {
  "modern-minimal": { name: "Modern Minimal", slug: "modern-minimal", render: modernMinimal },
  "classic-professional": { name: "Classic Professional", slug: "classic-professional", render: classicProfessional },
  "left-sidebar": { name: "Left Sidebar Layout", slug: "left-sidebar", render: leftSidebar },
  "compact-single-column": { name: "Compact Single-Column", slug: "compact-single-column", render: compactSingleColumn },
  "creative-bold": { name: "Creative Bold Design", slug: "creative-bold", render: creativeBold }
};
function renderTemplate(slug, data) {
  const tpl = TEMPLATES[slug];
  if (!tpl) throw new Error(`Unknown template: ${slug}`);
  return applyResumeRootScoping(tpl.render(data));
}
export {
  TEMPLATES,
  renderTemplate
};
