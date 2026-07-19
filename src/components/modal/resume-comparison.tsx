import type { ReactNode } from "react";
import { FiHome, FiFileText, FiMail, FiLayers, FiSettings, FiCheckCircle, FiXCircle } from "react-icons/fi";

function Sidebar() {
  return (
    <aside className="hidden md:flex h-screen flex-col justify-between bg-[#0A111D] px-4 py-4 border-r border-white/10">
      <div>
        <div className="flex items-center gap-2 px-2">
          <span className="size-2 rounded-full bg-emerald-400" />
          <span className="text-white font-semibold">Jobsynk AI</span>
        </div>
        <nav className="mt-6 space-y-1">
          <a href="#" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-white/75 hover:bg-white/5">
            <FiHome className="text-white/70" />
            Dashboard
          </a>
          <a href="#" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm bg-[#142035] text-white">
            <span className="inline-flex size-2 rounded-full bg-blue-400" />
            <FiFileText className="text-white" />
            <span className="font-medium">My Resumes</span>
          </a>
          <a href="#" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-white/75 hover:bg-white/5">
            <FiMail className="text-white/70" />
            Cover Letters
          </a>
          <a href="#" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-white/75 hover:bg-white/5">
            <FiLayers className="text-white/70" />
            Templates
          </a>
        </nav>
      </div>
      <a href="#" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-white/75 hover:bg-white/5">
        <FiSettings className="text-white/70" />
        Settings
      </a>
    </aside>
  );
}

function SectionHeader({ icon, label, accent }: { icon: ReactNode; label: string; accent: "red" | "green" }) {
  const accentColor = accent === "green" ? "text-emerald-400" : "text-rose-400";
  return (
    <div className="flex items-center gap-2">
      <span className={accentColor}>{icon}</span>
      <span className="text-white font-semibold">{label}</span>
    </div>
  );
}

function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block rounded-md bg-white/10 px-2 py-0.5 text-xs text-white/80">{children}</span>
  );
}

function CompareCard({ variant }: { variant: "before" | "after" }) {
  const isAfter = variant === "after";
  return (
    <div className={`relative rounded-[20px] ${isAfter ? "p-1 bg-gradient-to-b from-emerald-500/40 to-sky-500/40" : ""}`}>
      <div className={`rounded-[18px] border border-white/10 ${isAfter ? "bg-[#0F1629] shadow-[0_0_40px_0_rgba(56,189,248,0.25)]" : "bg-[#0F1629]"}`}>
        <div className="p-6">
          {isAfter ? (
            <SectionHeader icon={<FiCheckCircle />} label="After (AI Optimized)" accent="green" />
          ) : (
            <SectionHeader icon={<FiXCircle />} label="Before" accent="red" />
          )}

          <div className="mt-6">
            <div className="text-white font-semibold">John Doe</div>
            <div className="text-white/60 text-sm">{isAfter ? "Senior Software Engineer" : "Software Engineer"}</div>
            <div className="my-4 h-px bg-white/10" />

            <div className="text-white font-semibold">Summary</div>
            <div className="mt-2 text-sm leading-relaxed text-white/80">
              {isAfter ? (
                <>
                  Results-driven Senior Software Engineer with 5+ years of experience in designing, developing, and deploying scalable web applications. Proficient in Python, JavaScript, and cloud technologies. Seeking to leverage expertise in a challenging role to drive innovation and product success. <Pill>Enhanced</Pill>
                </>
              ) : (
                <>I am a software engineer. I have experience with several programming languages and frameworks. I am looking for a new job.</>
              )}
            </div>

            <div className="mt-6 text-white font-semibold">Experience</div>
            <div className="mt-2 text-sm leading-relaxed text-white/80">
              {isAfter ? (
                <>
                  <span className="font-semibold text-white">Senior Software Developer at Innovate Solutions Inc.</span> (2020–Present)
                  <br />Engineered and maintained robust web applications using Django and React, resulting in a 25% increase in user engagement.
                  <br /><span className="text-white/85">Quantified Impact</span>
                  <br />Led the migration of a monolithic application to a microservices architecture on AWS, improving system scalability and reducing downtime by 40%.
                  <br /><span className="text-white/85">Leadership & Technical Skill</span>
                  <br />Collaborated in an Agile environment to deliver
                </>
              ) : (
                <>
                  <span className="font-semibold text-white">Software Developer at Tech Corp</span> (2020–Present)
                  <br />Wrote code for web applications.
                  <br />Fixed bugs and issues.
                  <br />Worked with a team.
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResumeComparisonScreen() {
  return (
    <div className="min-h-screen w-full bg-[var(--app-bg)] text-white">
      <div className="grid grid-cols-12">
        <div className="col-span-12 md:col-span-3 lg:col-span-2">
          <Sidebar />
        </div>
        <div className="col-span-12 md:col-span-9 lg:col-span-10">
          <main className="px-6 py-8">
            <div className="max-w-6xl">
              <h1 className="text-3xl font-semibold">Resume Comparison</h1>
              <p className="mt-2 text-white/70">Review the AI-powered enhancements to your resume.</p>

              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <CompareCard variant="before" />
                <CompareCard variant="after" />
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button className="rounded-lg border border-white/12 bg-[#0F1629] px-4 py-2 text-sm text-white/85 hover:bg-[#111B30]">Download PDF</button>
                <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500">Apply Changes</button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
