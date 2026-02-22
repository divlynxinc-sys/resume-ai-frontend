import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import SiteNavbar from "../layout/site-navbar";
import PageWithSidebar from "../layout/page-with-sidebar";

// Types aligned with Resume Builder persistence
interface Experience { role: string; company: string; location?: string; startDate?: string; endDate?: string; bullets: string[]; }
interface Education { school: string; degree?: string; field?: string; startDate?: string; endDate?: string; location?: string; }
interface CustomSection { title: string; content: string; }
interface ResumeData {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  portfolio: string;
  experiences: Experience[];
  education: Education[];
  skills: string[];
  summary: string;
  customSections: CustomSection[];
}

function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header>
      <h1 className="text-3xl font-semibold text-white">{title}</h1>
      {subtitle && <p className="text-white/60 mt-2">{subtitle}</p>}
    </header>
  );
}

function SectionCard({ title, children, rightAction }: { title: string; children: ReactNode; rightAction?: ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {rightAction}
      </div>
      <div className="mt-4 text-white/85 text-sm">
        {children}
      </div>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value?: ReactNode }) {
  return (
    <div className="grid grid-cols-[10rem_1fr] gap-4 py-1">
      <div className="text-white/50 text-xs sm:text-sm">{label}</div>
      <div className="text-white/90 text-sm break-words">{value || <span className="text-white/40">—</span>}</div>
    </div>
  );
}

function Tag({ children }: { children: ReactNode }) {
  return <span className="inline-flex items-center rounded-md border border-white/15 bg-white/[0.03] px-2.5 py-1 text-xs text-white/80">{children}</span>;
}

export default function UserDetailsScreen() {
  const [resume, setResume] = useState<ResumeData | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("resumeData");
      setResume(raw ? (JSON.parse(raw) as ResumeData) : null);
    } catch {
      setResume(null);
    }
  }, []);

  return (
    <div className="min-h-svh bg-[var(--app-bg)] text-white">
      <SiteNavbar />
      <PageWithSidebar mainClassName="max-w-[1100px] mx-auto py-8">
        <PageHeader title="User Details" subtitle="Information saved from your AI Resume Builder." />

        {!resume ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
            <p className="text-white/70">
              No details found. Please fill your information in the AI Builder.
            </p>
            <div className="mt-4">
              <Link to="/resumes" className="inline-flex items-center rounded-lg bg-[oklch(0.488_0.243_264.376)] px-4 py-2 text-sm text-white">Go to AI Builder</Link>
            </div>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Details */}
            <div className="lg:col-span-2 space-y-6">
              <SectionCard title="Personal Info" rightAction={<Link to="/resumes" className="text-xs text-white/70 hover:text-white">Edit in Builder</Link>}>
                <InfoRow label="Full Name" value={resume.name} />
                <InfoRow label="Email" value={resume.email} />
                <InfoRow label="Phone" value={resume.phone} />
                <InfoRow label="Location" value={resume.location} />
                <InfoRow label="LinkedIn" value={resume.linkedin} />
                <InfoRow label="Portfolio" value={resume.portfolio} />
              </SectionCard>

              <SectionCard title="Experience">
                {resume.experiences?.length ? (
                  <div className="space-y-5">
                    {resume.experiences.map((exp, i) => (
                      <div key={i} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                        <div className="text-white font-medium">{exp.role || "Untitled Role"}</div>
                        <div className="text-white/70 text-sm">{[exp.company, exp.location].filter(Boolean).join(" • ")}</div>
                        <div className="text-white/60 text-xs mt-1">{[exp.startDate, exp.endDate].filter(Boolean).join(" — ")}</div>
                        {exp.bullets?.length ? (
                          <ul className="mt-3 list-disc list-inside text-white/85 text-sm space-y-1">
                            {exp.bullets.map((b, j) => (
                              <li key={j}>{b}</li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-white/60">No experience added.</div>
                )}
              </SectionCard>

              <SectionCard title="Education">
                {resume.education?.length ? (
                  <div className="space-y-5">
                    {resume.education.map((ed, i) => (
                      <div key={i} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                        <div className="text-white font-medium">{ed.school || "Untitled School"}</div>
                        <div className="text-white/70 text-sm">{[ed.degree, ed.field].filter(Boolean).join(" • ")}</div>
                        <div className="text-white/60 text-xs mt-1">{[ed.startDate, ed.endDate].filter(Boolean).join(" — ")}</div>
                        {ed.location ? <div className="text-white/70 text-xs">{ed.location}</div> : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-white/60">No education added.</div>
                )}
              </SectionCard>

              <SectionCard title="Skills">
                {resume.skills?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {resume.skills.map((s, i) => (
                      <Tag key={i}>{s}</Tag>
                    ))}
                  </div>
                ) : (
                  <div className="text-white/60">No skills added.</div>
                )}
              </SectionCard>

              <SectionCard title="Summary">
                {resume.summary ? (
                  <p className="text-white/85 text-sm leading-relaxed whitespace-pre-line">{resume.summary}</p>
                ) : (
                  <div className="text-white/60">No summary added.</div>
                )}
              </SectionCard>

              {resume.customSections?.length ? (
                <SectionCard title="Custom Sections">
                  <div className="space-y-6">
                    {resume.customSections.map((sec, i) => (
                      <div key={i} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                        <div className="text-white font-medium">{sec.title || "Untitled Section"}</div>
                        <div className="mt-2 text-white/85 text-sm whitespace-pre-line">{sec.content || ""}</div>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              ) : null}
            </div>

            {/* Right: simple overview card */}
            <div className="space-y-6">
              <section className="rounded-2xl bg-white/5 border border-white/10 p-6">
                <div className="font-semibold">Overview</div>
                <div className="mt-3 text-white/70 text-sm space-y-2">
                  <div>Sections Completed</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <span className="text-white/80">Personal Info</span>
                    <span className="text-white/60">{resume.name || resume.email || resume.phone ? "Yes" : "No"}</span>
                    <span className="text-white/80">Experience</span>
                    <span className="text-white/60">{resume.experiences?.length ? "Yes" : "No"}</span>
                    <span className="text-white/80">Education</span>
                    <span className="text-white/60">{resume.education?.length ? "Yes" : "No"}</span>
                    <span className="text-white/80">Skills</span>
                    <span className="text-white/60">{resume.skills?.length ? "Yes" : "No"}</span>
                    <span className="text-white/80">Summary</span>
                    <span className="text-white/60">{resume.summary ? "Yes" : "No"}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <Link to="/resumes" className="inline-flex items-center rounded-lg bg-[oklch(0.488_0.243_264.376)] px-4 py-2 text-sm text-white">Open Builder</Link>
                </div>
              </section>
            </div>
          </div>
        )}
      </PageWithSidebar>
    </div>
  );
}
