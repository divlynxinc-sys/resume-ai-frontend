import resumeLogo from "../../assets/resume-ai-logo.png";

function Brand() {
  return (
    <div>
      <div className="flex items-center gap-3">
        <img
          src={resumeLogo}
          alt="ResumeCraft AI Logo"
          className="h-10 w-10 rounded-md"
        />
        <span className="text-white text-2xl font-black tracking-tight">Jobsynk AI</span>
      </div>

      <p className="text-white/60 text-sm mt-4 max-w-[280px] leading-relaxed">
        Create professional, ATS-friendly, and industry-accepted resumes in minutes
        with our AI-powered builder.
      </p>
    </div>
  );
}

function Column({
  title,
  links,
}: {
  title: string;
  links: { label: string; href?: string }[];
}) {
  return (
    <div>
      <div className="text-xs font-semibold text-white/60 tracking-wide">
        {title}
      </div>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l.label}>
            <a
              href={l.href ?? "#"}
              onClick={() =>
                window.scrollTo({
                  top: 0,
                  behavior: "auto",
                })
              }
              className="text-white/70 hover:text-white text-sm"
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function SiteFooter() {
  return (
    <footer className="text-white border-t border-white/10 bg-[var(--app-bg)]">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
        <Brand />

        <Column
          title="PRODUCT"
          links={[
            { label: "Features", href: "#home" },
            { label: "Pricing", href: "#pricing" },
            { label: "Templates", href: "#templates" },
            { label: "Dashboard", href: "#dashboard" },
          ]}
        />

        <Column
          title="SUPPORT"
          links={[
            { label: "Help Center", href: "#help-center" },
            { label: "Contact Us", href: "#contact-us" },
            { label: "Documentation", href: "#documentation" },
            { label: "FAQ", href: "#faq" },
          ]}
        />

        <Column
          title="LEGAL"
          links={[
            { label: "Privacy Policy", href: "#privacy" },
            { label: "Terms of Service", href: "#terms" },
            { label: "Cookie Policy", href: "#cookie-policy" },
            { label: "Security", href: "#security" },
          ]}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 border-t border-white/5 py-8 text-white/40 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <p>© 2025 Jobsynk AI. All rights reserved.</p>
        <div className="flex items-center gap-6">
           {/* Placeholder for future bottom links if needed */}
        </div>
      </div>
    </footer>
  );
}
