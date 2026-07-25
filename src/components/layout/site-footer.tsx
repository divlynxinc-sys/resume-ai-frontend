import { Link } from "react-router-dom";
import lightLogo from "../../assets/Logo-02.png";
import darkLogo from "../../assets/Logo-05.png";
import { useTheme } from "@/contexts/ThemeContext";

function Brand() {
  const { theme } = useTheme();

  return (
    <div className="min-w-0 col-span-2 sm:col-span-3 lg:col-span-1">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 lg:block">
        <Link
          to="/"
          aria-label="Jobsynk AI — go to home"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/60 rounded-md w-fit"
        >
          <span
            className="relative block h-[3.375rem] w-[7.5rem] shrink-0 overflow-hidden sm:h-[5.25rem] sm:w-44"
            aria-hidden="true"
          >
            <img
              src={theme === "dark" ? darkLogo : lightLogo}
              alt=""
              className="pointer-events-none absolute -left-0.5 -top-[2.05rem] w-[7.7rem] max-w-none select-none sm:-left-1 sm:-top-12 sm:w-[11.25rem]"
            />
          </span>
        </Link>

        <div className="lg:mt-3">
          <div className="text-[11px] font-semibold text-[var(--app-fg-soft)] tracking-[0.14em]">
            CONTACT US
          </div>
          <a
            href="mailto:info@divlynx.com"
            className="mt-1.5 inline-block text-[var(--app-fg-muted)] hover:text-[var(--app-fg)] text-sm transition-colors sm:mt-2"
          >
            info@divlynx.com
          </a>
        </div>
      </div>

      <div className="mt-8 border-t border-[var(--app-border)] lg:hidden" />
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
      <div className="text-[11px] font-semibold text-[var(--app-fg-soft)] tracking-[0.12em]">
        {title}
      </div>
      <ul className="mt-3 space-y-1.5 sm:mt-4 sm:space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              to={l.to}
              className="inline-block py-0.5 text-[var(--app-fg-muted)] hover:text-[var(--app-fg)] text-sm leading-6 transition-colors"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function SiteFooter({ publicOnly = false }: { publicOnly?: boolean }) {
  const columns = [
    {
      title: "PRODUCT",
      links: publicOnly
        ? [{ label: "Features", to: "/#features" }, { label: "Pricing", to: "/#pricing" }]
        : [{ label: "Features", to: "/#features" }, { label: "Pricing", to: "/#pricing" }, { label: "Templates", to: "/templates" }, { label: "Dashboard", to: "/dashboard" }],
    },
    {
      title: "RESOURCES",
      links: [{ label: "Blog", to: "/blog" }, { label: "ATS Resume Format", to: "/blog/ats-resume-format" }, { label: "Tailoring Guide", to: "/blog/tailor-resume-to-job-description" }, { label: "Resume Keywords", to: "/blog/resume-keywords-that-matter" }],
    },
    {
      title: "LEGAL",
      links: [{ label: "Privacy Policy", to: "/privacy" }, { label: "Terms of Service", to: "/terms" }, { label: "Cookie Policy", to: "/cookie-policy" }, { label: "Security", to: "/security" }],
    },
    {
      title: "FREE TOOLS",
      links: publicOnly
        ? [{ label: "ATS Resume Checker", to: "/ats-checker" }]
        : [{ label: "ATS Resume Checker", to: "/ats-checker" }, { label: "Resume Templates", to: "/templates" }],
    },
    {
      title: "SUPPORT",
      links: publicOnly
        ? [{ label: "FAQ", to: "/faq" }]
        : [{ label: "Help Center", to: "/help-center" }, { label: "FAQ", to: "/faq" }],
    },
  ].sort((a, b) => b.links.length - a.links.length);

  return (
    <footer className="border-t border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-fg)]">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-8 px-5 py-9 sm:grid-cols-3 sm:gap-x-8 sm:gap-y-10 sm:px-6 sm:py-12 lg:grid-cols-[1.35fr_repeat(5,minmax(0,1fr))] lg:gap-x-10 lg:gap-y-12 lg:py-14">
        <Brand />
        {columns.map((column) => (
          <Column key={column.title} title={column.title} links={column.links} />
        ))}
      </div>

      <div className="mx-auto flex max-w-7xl flex-col items-center gap-1.5 border-t border-[var(--app-border)] px-5 py-5 text-center text-xs text-[var(--app-fg-soft)] sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-6 sm:text-left sm:text-sm">
        <p>© 2026 Jobsynk AI. All rights reserved.</p>
        <p>
          Powered by{" "}
          <a
            href="https://divlynx.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--app-fg)] underline underline-offset-4 transition-colors"
          >
            divlynx.com
          </a>
        </p>
      </div>
    </footer>
  );
}
