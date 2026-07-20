import { Link } from "react-router-dom";
import lightLogo from "../../assets/Logo-02.png";
import darkLogo from "../../assets/Logo-05.png";
import { useTheme } from "@/contexts/ThemeContext";

function Brand() {
  const { theme } = useTheme();

  return (
    <div>
      <Link
        to="/"
        aria-label="Jobsynk AI — go to home"
        className="flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 rounded-md w-fit"
      >
        <span className="relative h-[5.25rem] w-44 shrink-0 overflow-hidden" aria-hidden="true">
          <img
            src={theme === "dark" ? darkLogo : lightLogo}
            alt=""
            className="pointer-events-none absolute -left-1 -top-12 w-[11.25rem] max-w-none select-none"
          />
        </span>
      </Link>

      <p className="text-white/60 text-sm mt-4 max-w-[280px] leading-relaxed">
        Create professional, ATS-friendly, and industry-accepted resumes in minutes
        with our AI-powered builder.
      </p>

      <div className="mt-6">
        <div className="text-xs font-semibold text-white/60 tracking-wide">
          CONTACT US
        </div>
        <a
          href="mailto:info@divlynx.com"
          className="mt-3 inline-block text-white/70 hover:text-white text-sm"
        >
          info@divlynx.com
        </a>
      </div>
    </div>
  );
}

function Column({
  title,
  links,
}: {
  title: string;
  links: { label: string; to: string }[];
}) {
  return (
    <div>
      <div className="text-xs font-semibold text-white/60 tracking-wide">
        {title}
      </div>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              to={l.to}
              className="text-white/70 hover:text-white text-sm"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function SiteFooter() {
  return (
    <footer className="text-white border-t border-white/10 bg-[var(--app-bg)]">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10">
        <Brand />

        <Column
          title="PRODUCT"
          links={[
            { label: "Features", to: "/#features" },
            { label: "Pricing", to: "/#pricing" },
            { label: "Templates", to: "/templates" },
            { label: "Dashboard", to: "/dashboard" },
          ]}
        />

        <Column
          title="FREE TOOLS"
          links={[
            { label: "ATS Resume Checker", to: "/ats-checker" },
            { label: "Resume Templates", to: "/templates" },
          ]}
        />

        <Column
          title="RESOURCES"
          links={[
            { label: "Blog", to: "/blog" },
            { label: "ATS Resume Format", to: "/blog/ats-resume-format" },
            { label: "Tailoring Guide", to: "/blog/tailor-resume-to-job-description" },
            { label: "Resume Keywords", to: "/blog/resume-keywords-that-matter" },
          ]}
        />

        <Column
          title="SUPPORT"
          links={[
            { label: "Help Center", to: "/help-center" },
            { label: "FAQ", to: "/faq" },
          ]}
        />

        <Column
          title="LEGAL"
          links={[
            { label: "Privacy Policy", to: "/privacy" },
            { label: "Terms of Service", to: "/terms" },
            { label: "Cookie Policy", to: "/cookie-policy" },
            { label: "Security", to: "/security" },
          ]}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 border-t border-white/5 py-8 text-center text-sm text-white/40">
        <p>© 2025 Jobsynk AI. All rights reserved.</p>
        <p className="mt-2">
          Powered by{" "}
          <a
            href="https://divlynx.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white/70 underline underline-offset-4"
          >
            divlynx.com
          </a>
        </p>
      </div>
    </footer>
  );
}
