import { Link } from "react-router-dom";
import lightLogo from "../../assets/Logo-02.png";
import darkLogo from "../../assets/Logo-05.png";
import { useTheme } from "@/contexts/ThemeContext";

function Brand() {
  const { theme } = useTheme();

  return (
    <div className="min-w-0">
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

      <div className="mt-3">
        <div className="text-[11px] font-semibold text-white/50 tracking-[0.14em]">
          CONTACT US
        </div>
        <a
          href="mailto:info@divlynx.com"
          className="mt-2 inline-block text-white/70 hover:text-white text-sm transition-colors"
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
    <div className="min-w-0">
      <div className="text-[11px] font-semibold text-white/55 tracking-[0.12em]">
        {title}
      </div>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              to={l.to}
              className="text-white/70 hover:text-white text-sm leading-6 transition-colors"
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
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-8 gap-y-12 px-6 py-12 sm:grid-cols-3 lg:grid-cols-[1.35fr_repeat(5,minmax(0,1fr))] lg:gap-x-10 lg:py-14">
        <Brand />
        <Column title="PRODUCT" links={[{ label: "Features", to: "/#features" }, { label: "Pricing", to: "/#pricing" }, { label: "Templates", to: "/templates" }, { label: "Dashboard", to: "/dashboard" }]} />
        <Column title="RESOURCES" links={[{ label: "Blog", to: "/blog" }, { label: "ATS Resume Format", to: "/blog/ats-resume-format" }, { label: "Tailoring Guide", to: "/blog/tailor-resume-to-job-description" }, { label: "Resume Keywords", to: "/blog/resume-keywords-that-matter" }]} />
        <Column title="LEGAL" links={[{ label: "Privacy Policy", to: "/privacy" }, { label: "Terms of Service", to: "/terms" }, { label: "Cookie Policy", to: "/cookie-policy" }, { label: "Security", to: "/security" }]} />
        <Column title="FREE TOOLS" links={[{ label: "ATS Resume Checker", to: "/ats-checker" }, { label: "Resume Templates", to: "/templates" }]} />
        <Column title="SUPPORT" links={[{ label: "Help Center", to: "/help-center" }, { label: "FAQ", to: "/faq" }]} />
      </div>

      <div className="max-w-7xl mx-auto px-6 border-t border-white/10 py-6 text-center text-sm text-white/40 sm:flex sm:items-center sm:justify-between sm:text-left">
        <p>© 2025 Jobsynk AI. All rights reserved.</p>
        <p className="mt-2 sm:mt-0">
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
