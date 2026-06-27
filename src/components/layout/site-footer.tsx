import { Link } from "react-router-dom";
//import logoIcon from "../../assets/logo-icon-indigo.png";
import secondaryLogo from "../../assets/secondary.png";

function Brand() {
  return (
    <div>
      <Link
        to="/"
        aria-label="Jobsynk AI — go to home"
        className="flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 rounded-md w-fit"
      >
        {/*<span className="relative size-10 shrink-0 overflow-hidden" aria-hidden="true">
          <img
            src={logoIcon}
            alt=""
            className="absolute left-1/2 top-1/2 w-[4.75rem] max-w-none -translate-x-1/2 -translate-y-1/2"
          />
        </span>*/}
        <span className="relative h-10 w-36 overflow-hidden" aria-hidden="true">
          <img
            src={secondaryLogo}
            alt=""
            className="absolute left-1/2 top-1/2 w-48 max-w-none -translate-x-1/2 -translate-y-1/2"
          />
        </span>
      </Link>

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
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
        <Brand />

        <Column
          title="PRODUCT"
          links={[
            { label: "Features", to: "/#features" },
            { label: "Pricing", to: "/pricing" },
            { label: "Templates", to: "/templates" },
            { label: "Dashboard", to: "/dashboard" },
          ]}
        />

        <Column
          title="SUPPORT"
          links={[
            { label: "Help Center", to: "/help-center" },
            { label: "Contact Us", to: "/contact-us" },
            { label: "Documentation", to: "/documentation" },
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

      <div className="max-w-7xl mx-auto px-6 border-t border-white/5 py-8 text-white/40 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <p>© 2025 Jobsynk AI. All rights reserved.</p>
        <div className="flex items-center gap-6">
           {/* Placeholder for future bottom links if needed */}
        </div>
      </div>
    </footer>
  );
}
