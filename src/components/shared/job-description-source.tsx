import { Link2, LoaderCircle, PenLine } from "lucide-react";

/**
 * Presentational pieces for the "paste or add a link" job-description pattern
 * (see `useJobDescriptionImport`). Every caller supplies its own Tailwind
 * classes so the toggle/panel matches that page's existing visual language
 * instead of a one-size-fits-all style.
 */

export function JobDescriptionModeToggle({
  mode,
  onChange,
  activeClassName,
  inactiveClassName,
  borderClassName = "border-[var(--app-border)]",
}: {
  mode: "paste" | "link";
  onChange: (mode: "paste" | "link") => void;
  activeClassName: string;
  inactiveClassName: string;
  borderClassName?: string;
}) {
  return (
    <div className={`flex overflow-hidden rounded-lg border ${borderClassName} text-xs`}>
      <button
        type="button"
        onClick={() => onChange("paste")}
        className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors ${mode === "paste" ? activeClassName : inactiveClassName}`}
      >
        <PenLine className="size-3.5" />Paste
      </button>
      <button
        type="button"
        onClick={() => onChange("link")}
        className={`flex items-center gap-1.5 border-l ${borderClassName} px-3 py-1.5 transition-colors ${mode === "link" ? activeClassName : inactiveClassName}`}
      >
        <Link2 className="size-3.5" />Add a link
      </button>
    </div>
  );
}

export function JobDescriptionLinkPanel({
  url,
  onUrlChange,
  fetching,
  error,
  onFetch,
  inputClassName,
  buttonClassName,
  helperClassName = "text-xs text-[var(--app-fg-soft)]",
  errorClassName = "text-xs text-red-600",
}: {
  url: string;
  onUrlChange: (value: string) => void;
  fetching: boolean;
  error: string;
  onFetch: () => void;
  inputClassName: string;
  buttonClassName: string;
  helperClassName?: string;
  errorClassName?: string;
}) {
  return (
    <div>
      <div className="flex gap-2">
        <input
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onFetch(); } }}
          placeholder="Paste the job posting URL…"
          inputMode="url"
          className={inputClassName}
        />
        <button type="button" onClick={onFetch} disabled={fetching || !url.trim()} className={buttonClassName}>
          {fetching ? <LoaderCircle className="size-4 animate-spin" /> : "Fetch"}
        </button>
      </div>
      <p className={`mt-2 ${helperClassName}`}>
        Works best with a company careers page or job board. Some sites (e.g. LinkedIn) block this — paste the text instead if it fails.
      </p>
      {error && <p className={`mt-2 ${errorClassName}`}>{error}</p>}
    </div>
  );
}
