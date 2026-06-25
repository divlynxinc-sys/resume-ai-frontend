/** candidate_info object from AI service response */
export interface CandidateInfo {
  name: string;
  email: string;
  phone: string;
  linkedin?: string;
  portfolio?: string;
}

/** resume.experiences[] */
export interface ExperienceItem {
  role: string;
  company: string;
  location?: string;
  startDate: string;    // "YYYY-MM" format
  endDate?: string;     // "YYYY-MM" or absent → "Present"
  bullets: string[];
}

/** A displayable hyperlink: the destination plus optional custom label text. */
export interface ResumeLink {
  url: string;
  label?: string;
}

/** resume.projects[] */
export interface ProjectItem {
  title: string;
  /** Either a bare URL string (legacy) or a { url, label } object (feature 1.4). */
  link?: string | ResumeLink;
  bullets: string[];
}

/** resume.education[] */
export interface EducationItem {
  school: string;
  degree: string;
  field: string;
  location?: string;
  endDate: string;
}

/** resume.skills[] — each entry is a category with its skills */
export interface SkillCategory {
  category: string;
  skills: string[];
}

/** resume object from AI service response */
export interface ResumeSection {
  summary: string;
  experiences: ExperienceItem[];
  projects: ProjectItem[];
  education: EducationItem[];
  skills: SkillCategory[];
}

/** Top-level input to every template function */
export interface TemplateInput {
  candidate_info: CandidateInfo;
  resume: ResumeSection;
}

/** Signature for all template render functions */
export type TemplateFn = (data: TemplateInput) => string;
