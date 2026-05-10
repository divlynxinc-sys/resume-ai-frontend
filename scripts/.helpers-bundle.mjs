// src/components/modal/resume-builder.helpers.ts
function extractEmbeddedProjects(experiences) {
  const HEADER = /^\s*(PROJECTS?|PROJEKTS?)\s*$/i;
  const URL_LINE = /^(https?:\/\/|www\.|github\.com\/)\S+$/i;
  const URL_INLINE = /(https?:\/\/\S+|github\.com\/\S+)/i;
  const STRAY_HEADER = /^(EDUCATION|SKILLS|EXPERIENCE|SUMMARY)\s*$/i;
  const out = [];
  const extracted = [];
  for (const exp of experiences) {
    const headerIdx = exp.bullets.findIndex((b) => HEADER.test(b));
    if (headerIdx === -1) {
      out.push(exp);
      continue;
    }
    out.push({ ...exp, bullets: exp.bullets.slice(0, headerIdx) });
    const post = exp.bullets.slice(headerIdx + 1).map((s) => s.trim()).filter(Boolean);
    let current = null;
    const flushCurrent = () => {
      if (current) extracted.push(serializeProject(current));
    };
    for (let i = 0; i < post.length; i++) {
      const line = post[i];
      if (STRAY_HEADER.test(line)) continue;
      if (URL_LINE.test(line)) {
        if (current) current.link = current.link || line;
        else current = { title: "Project", link: line, bullets: [] };
        continue;
      }
      if (/^[a-z]/.test(line)) {
        if (current && current.bullets.length) {
          current.bullets[current.bullets.length - 1] += " " + line;
        } else {
          if (!current) current = { title: "Project", link: "", bullets: [] };
          current.bullets.push(line);
        }
        continue;
      }
      const inline = URL_INLINE.exec(line);
      if (inline) {
        if (current && !current.link) current.link = inline[0];
        else if (!current) current = { title: "Project", link: inline[0], bullets: [] };
        continue;
      }
      let nextHasUrl = false;
      if (i + 1 < post.length) {
        const next = post[i + 1];
        if (URL_LINE.test(next) || URL_INLINE.test(next)) nextHasUrl = true;
      }
      if (nextHasUrl && line.length < 150) {
        flushCurrent();
        current = { title: line, link: "", bullets: [] };
      } else {
        if (!current) current = { title: "Project", link: "", bullets: [] };
        current.bullets.push(line);
      }
    }
    flushCurrent();
  }
  return { experiences: out, extracted };
}
function serializeProject(p) {
  const lines = [];
  if (p.link) lines.push(p.link);
  lines.push(...p.bullets);
  return { title: p.title, content: lines.join("\n") };
}
function mapContentToLocal(content, emptyResume) {
  const info = content.info ?? {};
  const experiences = content.experience ?? [];
  const education = content.education ?? [];
  const skills = content.skills ?? [];
  const summary = typeof content.summary === "string" ? content.summary : "";
  const job = content.job_description ?? {};
  const custom = content.custom ?? {};
  const backendSections = custom.sections;
  const backendProjects = custom.projects;
  const customSectionsFromBackend = Array.isArray(backendSections) ? backendSections.map((s) => ({
    title: typeof s?.title === "string" ? s.title : "",
    content: typeof s?.content === "string" ? s.content : ""
  })) : [];
  const customSectionsFromProjects = Array.isArray(backendProjects) && customSectionsFromBackend.length === 0 ? backendProjects.map((p) => {
    const bullets = Array.isArray(p?.bullets) ? p.bullets : typeof p?.bullets === "string" ? [p.bullets] : [];
    return {
      title: typeof p?.title === "string" ? p.title : "Project",
      content: bullets.map((b) => String(b)).join("\n")
    };
  }) : [];
  const customSections = customSectionsFromBackend.length > 0 ? customSectionsFromBackend : customSectionsFromProjects;
  const backendSkillCategories = custom.skillCategories;
  const skillCategories = Array.isArray(backendSkillCategories) ? backendSkillCategories.filter((c) => c && typeof c.category === "string" && Array.isArray(c.skills)).map((c) => ({ category: c.category, skills: c.skills.map(String) })) : void 0;
  const rawExperiences = experiences.length > 0 ? experiences.map((e) => ({
    role: e.role ?? "",
    company: e.company ?? "",
    location: e.location ?? "",
    startDate: e.start_date ?? "",
    endDate: e.end_date ?? "",
    bullets: e.description ? e.description.split("\n").filter(Boolean) : []
  })) : emptyResume.experiences;
  const { experiences: cleanExperiences, extracted: extractedProjects } = extractEmbeddedProjects(rawExperiences);
  const finalCustomSections = customSections.length === 0 && extractedProjects.length > 0 ? extractedProjects : customSections;
  return {
    name: info.full_name ?? "",
    email: info.email ?? "",
    phone: info.phone ?? "",
    location: info.location ?? "",
    linkedin: info.linkedin_url ?? "",
    portfolio: info.portfolio_url ?? "",
    experiences: cleanExperiences,
    education: education.length > 0 ? education.map((e) => ({
      school: e.school ?? "",
      degree: e.degree ?? "",
      field: e.field_of_study ?? "",
      startDate: e.start_date ?? "",
      endDate: e.end_date ?? "",
      location: e.location ?? ""
    })) : emptyResume.education,
    skills,
    skillCategories: skillCategories?.length ? skillCategories : void 0,
    summary,
    job: {
      title: job.job_title ?? "",
      company: job.company ?? "",
      location: job.location ?? "",
      description: job.description ?? ""
    },
    customSections: finalCustomSections
  };
}
function toTemplateInput(resume) {
  return {
    candidate_info: {
      name: resume.name,
      email: resume.email,
      phone: resume.phone,
      linkedin: resume.linkedin || void 0,
      portfolio: resume.portfolio || void 0
    },
    resume: {
      summary: resume.summary,
      experiences: resume.experiences.filter((e) => e.role || e.company || e.bullets.length).map((e) => ({
        role: e.role,
        company: e.company,
        location: e.location,
        startDate: e.startDate ?? "",
        endDate: e.endDate,
        bullets: e.bullets
      })),
      projects: resume.customSections.filter((s) => s.title || s.content).map((s) => {
        const lines = s.content.split("\n").map((l) => l.trim()).filter(Boolean);
        let link = "";
        const bullets = [];
        for (const line of lines) {
          if (!link && /^(https?:\/\/|www\.|github\.com\/)/i.test(line)) {
            link = line;
          } else {
            bullets.push(line);
          }
        }
        return { title: s.title, link, bullets };
      }),
      education: resume.education.filter((e) => e.school || e.degree).map((e) => ({
        school: e.school,
        degree: e.degree ?? "",
        field: e.field ?? "",
        location: e.location,
        endDate: e.endDate ?? ""
      })),
      skills: resume.skillCategories?.length ? resume.skillCategories : resume.skills.length ? [{ category: "Skills", skills: resume.skills }] : []
    }
  };
}
export {
  extractEmbeddedProjects,
  mapContentToLocal,
  toTemplateInput
};
