import { useState, useEffect, useRef, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { AppButton } from "@/components/ui/AppButton";
import { createPortal } from "react-dom";
import {
  Home,
  FileText,
  LayoutGrid,
  Wand2,
  Settings,
  HelpCircle,
  MessagesSquare,
  LogOut,
  Edit2,
  Download,
  Trash,
  Coins,
  X,
  Crown,
  ChevronRight,
  Plus,
  Search,
  Mail,
} from "lucide-react";
import SiteNavbar from "../layout/site-navbar";
import PageWithSidebar from "../layout/page-with-sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { usePlan } from "@/contexts/PlanContext";
import { dashboardService } from "@/services";
import { resumeService } from "@/services/resume";
import html2pdf from "html2pdf.js";

export function Sidebar({ activeRoute }: { activeRoute?: string }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { isPaid, openUpgradeModal } = usePlan();
  const current = (activeRoute ?? (typeof window !== "undefined" ? window.location.pathname.replace(/^\//, "") : "dashboard")) || "dashboard";
  // Sidebar rotating tips
  const tips: { title: string; icon: ReactNode; points: string[]; link?: string }[] = [
    {
      title: "ATS Tips",
      icon: <FileText className="size-4" />,
      points: ["Use job keywords", "Keep layout simple", "Avoid images and tables"],
      link: "/tailoring",
    },
    {
      title: "AI Chat",
      icon: <MessagesSquare className="size-4" />,
      points: ["Ask for better wording", "Generate bullet points", "Iterate quickly in chat"],
      link: "/ai-chat",
    },
    {
      title: "Resume Builder",
      icon: <Wand2 className="size-4" />,
      points: ["Start from a template", "Fill core sections", "Export or share"],
      link: "/resumes",
    },
  ];
  const [tipIndex, setTipIndex] = useState(0);
  const nextTip = () => setTipIndex((i) => (i + 1) % tips.length);
  const currentTip = tips[tipIndex];

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const doLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <aside className="w-64 shrink-0 border-r border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-fg)] flex flex-col h-full">
      {showLogoutModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(26,26,26,0.35)] backdrop-blur-[2px] p-4">
          <div className="w-full max-w-sm rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-[var(--shadow-pop)]">
            <h3 className="font-display text-xl text-[var(--app-fg)]">Log out?</h3>
            <p className="mt-2 text-sm text-[var(--app-fg-muted)]">Are you sure you want to log out of your account?</p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-[var(--app-fg-muted)] hover:bg-[var(--app-surface-2)] hover:text-[var(--app-fg)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  doLogout();
                  setShowLogoutModal(false);
                }}
                className="rounded-lg bg-[var(--pastel-rose)] px-4 py-2 text-sm font-medium text-[#B85273] hover:opacity-80 transition-opacity"
              >
                Log out
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
      <nav className="px-3 py-5 flex flex-col gap-1">
        <NavItem icon={<Home className="size-4" />} label="Dashboard" route="dashboard" active={current === "dashboard"} />
        <NavItem icon={<FileText className="size-4" />} label="My Resumes" route="my-resumes" active={current === "my-resumes"} />
        <NavItem icon={<LayoutGrid className="size-4" />} label="Templates" route="templates" active={current === "templates"} />
        <NavItem
          icon={<Mail className="size-4" />}
          label="Cover Letter"
          route="cover-letter"
          active={current === "cover-letter"}
          premium
          locked={!isPaid}
          onLockedClick={() => openUpgradeModal("Cover letters are a Pro feature. Upgrade to generate tailored letters for every application.")}
        />
        <NavItem
          icon={<Wand2 className="size-4" />}
          label="AI Tailoring"
          route="tailoring"
          active={current === "tailoring"}
          premium
          locked={!isPaid}
          onLockedClick={() => openUpgradeModal("AI Tailoring rewrites your resume to match each job description. Upgrade to unlock it.")}
        />
        <NavItem
          icon={<MessagesSquare className="size-4" />}
          label="AI Chat"
          route="ai-chat"
          active={current === "ai-chat"}
          premium
          locked={!isPaid}
          onLockedClick={() => openUpgradeModal("AI Chat is a Pro feature. Upgrade to get an on-demand resume assistant.")}
        />
        <NavItem
          icon={<MessagesSquare className="size-4" />}
          label="AI Interviews"
          route="interview"
          active={current === "interview"}
          premium
          locked={!isPaid}
          onLockedClick={() => openUpgradeModal("AI Interview practice is a Pro feature. Upgrade to run mock interviews.")}
        />
        <NavItem icon={<Crown className="size-4" />} label="Pro Plans" route="pricing" active={current === "pricing"} />
        <NavItem icon={<Settings className="size-4" />} label="Settings" route="account" active={current === "account"} />
        <NavItem icon={<HelpCircle className="size-4" />} label="Help Center" route="help-center" active={current === "help-center"} />
        <NavItem icon={<LogOut className="size-4" />} label="Logout" route="login" onClick={() => setShowLogoutModal(true)} />
      </nav>
      <div className="mt-auto px-3 py-4">
        {/* Quick Guide */}
        <div>
          <div className="mb-2 px-1">
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--app-fg-soft)]">Quick guide</span>
          </div>

          <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-3.5 transition-colors hover:border-[var(--app-border-strong)]">
            <div className="flex items-center gap-2 mb-2.5">
              <div className="text-[var(--accent-text)]">{currentTip.icon}</div>
              <div className="text-xs font-medium text-[var(--app-fg)]">{currentTip.title}</div>
            </div>

            <ul className="space-y-1.5">
              {currentTip.points.map((p) => (
                <li key={p} className="text-[11px] text-[var(--app-fg-muted)] flex items-start gap-2 leading-snug">
                  <span className="mt-[5px] size-1 rounded-full bg-[var(--accent)]/60 shrink-0" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>

            <div className="mt-3 flex items-center justify-end">
              <button
                onClick={nextTip}
                className="flex items-center gap-1 text-[10px] text-[var(--app-fg-soft)] hover:text-[var(--app-fg)] transition-colors"
              >
                Next <ChevronRight className="size-2.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function NavItem({
  icon,
  label,
  route,
  active = false,
  onClick,
  premium = false,
  locked = false,
  onLockedClick,
}: {
  icon: ReactNode;
  label: string;
  route: string;
  active?: boolean;
  onClick?: () => void;
  /** Show a "Pro" badge in the corner. */
  premium?: boolean;
  /** If true, clicking opens onLockedClick (upgrade modal) instead of navigating. */
  locked?: boolean;
  onLockedClick?: () => void;
}) {
  const navigate = useNavigate();
  const handleClick = () => {
    if (locked) {
      onLockedClick?.();
      return;
    }
    if (onClick) onClick();
    else navigate(`/${route}`);
  };

  return (
    <button
      onClick={handleClick}
      aria-disabled={locked || undefined}
      title={locked ? "Premium AI feature — upgrade to unlock" : undefined}
      className={
        "group relative w-full text-left flex items-center gap-3 rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors " +
        (active
          ? "bg-[var(--accent-soft)] text-[var(--accent-text)] font-medium"
          : locked
            ? "text-[var(--app-fg-soft)] hover:bg-[var(--app-surface-2)]"
            : "text-[var(--app-fg-muted)] hover:bg-[var(--app-surface-2)] hover:text-[var(--app-fg)]")
      }
    >
      <span className={active ? "text-[var(--accent-text)]" : "text-[var(--app-fg-soft)]"}>{icon}</span>
      <span className={locked ? "opacity-70" : undefined}>{label}</span>
      {premium && (
        <span
          aria-label="Premium AI feature"
          className="ml-auto inline-flex items-center gap-1 rounded-full border border-indigo-400/40 bg-indigo-500/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-indigo-600 dark:text-indigo-300"
        >
          <Crown className="size-2.5" />
          Pro
        </span>
      )}
    </button>
  );
}


function HeroCard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const displayName = user?.name ?? user?.email ?? "there";
  return (
    <section className="relative overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-7 text-[var(--app-fg)]">
      <div aria-hidden className="pointer-events-none absolute -top-16 -right-16 size-56 rounded-full bg-[var(--pastel-lavender)] blur-3xl opacity-60" />
      <div aria-hidden className="pointer-events-none absolute -bottom-20 -left-10 size-48 rounded-full bg-[var(--pastel-peach)] blur-3xl opacity-50" />

      <div className="relative flex items-center justify-between gap-6 flex-wrap">
        <div>
          <p className="text-xs font-medium tracking-[0.16em] uppercase text-[var(--accent-text)]">Dashboard</p>
          <h2 className="font-display text-3xl md:text-4xl font-light text-[var(--app-fg)] tracking-tight mt-1.5">
            Welcome back, <span className="italic">{displayName}</span>.
          </h2>
          <p className="text-[var(--app-fg-muted)] mt-2 text-sm">Ready to land your dream job? Let's get started.</p>
        </div>
        <AppButton variant="primary" size="lg" onClick={() => navigate("/resumes")}>
          <Plus className="size-4" />
          Create New Resume
        </AppButton>
      </div>
    </section>
  );
}

function buildResumePrintHtml(resume: any): string {
  const c = resume.content ?? {};
  const info = c.info ?? {};
  const experiences = Array.isArray(c.experience) ? c.experience : [];
  const education = Array.isArray(c.education) ? c.education : [];
  const skills = Array.isArray(c.skills) ? c.skills : [];
  const summary = typeof c.summary === "string" ? c.summary : "";
  const name = info.full_name ?? resume.title ?? "Resume";
  const contactBits = [info.email, info.phone, info.location, info.linkedin_url, info.portfolio_url].filter(Boolean);

  let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${name} - Resume</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Georgia,serif;color:#1a1a1a;padding:40px 50px;max-width:800px;margin:0 auto;font-size:11pt;line-height:1.5}
  h1{font-size:18pt;margin-bottom:4px}
  .contact{font-size:9pt;color:#555;margin-bottom:16px;display:flex;flex-wrap:wrap;gap:8px}
  .section-title{font-size:10pt;font-weight:bold;text-transform:uppercase;letter-spacing:1px;color:#333;border-bottom:1px solid #ccc;padding-bottom:2px;margin:14px 0 6px}
  .entry-title{font-weight:bold;font-size:10.5pt}
  .entry-meta{font-size:9pt;color:#666;margin-bottom:2px}
  ul{padding-left:18px;margin:2px 0 8px}
  li{margin-bottom:2px}
  .skills{display:flex;flex-wrap:wrap;gap:6px}
  .skill{background:#f0f0f0;padding:2px 8px;border-radius:3px;font-size:9pt}
  @media print{body{padding:20px 30px}}
</style></head><body>`;

  html += `<h1>${name}</h1>`;
  if (contactBits.length) html += `<div class="contact">${contactBits.map(b => `<span>${b}</span>`).join("")}</div>`;
  if (summary) html += `<div class="section-title">Summary</div><p>${summary}</p>`;
  if (experiences.length) {
    html += `<div class="section-title">Experience</div>`;
    for (const e of experiences) {
      html += `<div class="entry-title">${e.role ?? ""}${e.company ? ` — ${e.company}` : ""}</div>`;
      const dates = [e.start_date, e.end_date].filter(Boolean).join(" – ");
      if (dates) html += `<div class="entry-meta">${dates}</div>`;
      const desc = typeof e.description === "string" ? e.description.split("\n").filter(Boolean) : [];
      if (desc.length) html += `<ul>${desc.map((d: string) => `<li>${d}</li>`).join("")}</ul>`;
    }
  }
  if (education.length) {
    html += `<div class="section-title">Education</div>`;
    for (const e of education) {
      html += `<div class="entry-title">${e.degree ?? ""}${e.field_of_study ? ` in ${e.field_of_study}` : ""}${e.school ? ` — ${e.school}` : ""}</div>`;
      const dates = [e.start_date, e.end_date].filter(Boolean).join(" – ");
      if (dates || e.location) html += `<div class="entry-meta">${[dates, e.location].filter(Boolean).join(" | ")}</div>`;
    }
  }
  if (skills.length) {
    html += `<div class="section-title">Skills</div><div class="skills">${skills.map((s: string) => `<span class="skill">${s}</span>`).join("")}</div>`;
  }
  html += `</body></html>`;
  return html;
}

function RecentActivity() {
  const navigate = useNavigate();
  const { isPaid, openUpgradeModal } = usePlan();
  const [searchQuery, setSearchQuery] = useState("");
  const [activities, setActivities] = useState<{ id: number; name: string; date: string }[]>([]);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [editingNameId, setEditingNameId] = useState<number | null>(null);
  const [editingNameValue, setEditingNameValue] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);

  const fetchActivities = () => {
    dashboardService.getRecentActivity(10)
      .then((data) =>
        setActivities(
          data.map((item) => ({
            id: item.id,
            name: item.title,
            date: new Date(item.updated_at).toLocaleDateString(),
          }))
        )
      )
      .catch(() => {});
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleDownload = async (id: number) => {
    if (!isPaid) {
      openUpgradeModal("Resume downloads are a paid feature. Upgrade to export PDFs and DOCX files.");
      return;
    }
    setDownloadingId(id);
    try {
      const resume = await resumeService.get(id);
      const html = buildResumePrintHtml(resume);
      const container = document.createElement("div");
      container.innerHTML = html;
      // Extract just the body content and apply inline styles
      const bodyContent = container.querySelector("body")?.innerHTML ?? html;
      const wrapper = document.createElement("div");
      wrapper.innerHTML = bodyContent;
      wrapper.style.fontFamily = "Georgia, serif";
      wrapper.style.color = "#1a1a1a";
      wrapper.style.padding = "40px 50px";
      wrapper.style.maxWidth = "800px";
      wrapper.style.margin = "0 auto";
      wrapper.style.fontSize = "11pt";
      wrapper.style.lineHeight = "1.5";

      const fileName = resume.title?.replace(/[^a-zA-Z0-9 ]/g, "").trim() || "Resume";
      await html2pdf()
        .set({
          margin: [10, 10, 10, 10],
          filename: `${fileName}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(wrapper)
        .save();
    } catch {
      /* silently fail */
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    try {
      await resumeService.delete(id);
      setActivities((prev) => prev.filter((a) => a.id !== id));
      setDeletingId(null);
    } catch {
      /* silently fail */
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (id: number, currentName: string) => {
    setEditingNameId(id);
    setEditingNameValue(currentName);
    setTimeout(() => nameInputRef.current?.select(), 0);
  };

  const commitRename = async () => {
    if (editingNameId === null) return;
    const trimmed = editingNameValue.trim() || "Untitled";
    setActivities((prev) => prev.map((a) => a.id === editingNameId ? { ...a, name: trimmed } : a));
    setEditingNameId(null);
    try {
      await resumeService.update(editingNameId, { title: trimmed });
    } catch { /* silently fail — local state already updated */ }
  };

  const filteredActivities = activities.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
      {/* Delete Confirmation Modal */}
      {deletingId !== null && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4">
          <div className="w-full max-w-sm rounded-xl border border-white/10 bg-[#0f1629] p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white">Delete Resume?</h3>
            <p className="mt-2 text-sm text-white/70">
              Are you sure you want to delete this resume? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                disabled={loading}
                className="rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 disabled:opacity-50 transition-colors"
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <h3 className="font-display text-xl font-light text-[var(--app-fg)] tracking-tight">Recent activity</h3>
        <div className="relative w-full sm:w-64 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="size-3.5 text-white/40 group-focus-within:text-blue-400 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search activity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full rounded-lg border border-white/10 bg-white/[0.05] pl-9 pr-3 py-1.5 text-sm text-white placeholder-white/30 focus:border-blue-500/50 focus:bg-white/[0.08] focus:ring-1 focus:ring-blue-500/20 focus:outline-none transition-all"
          />
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="grid grid-cols-[1fr_160px_160px] px-6 py-3 text-white/60 text-sm">
          <span>Name</span>
          <span className="text-right">Last Edited</span>
          <span className="text-right">Actions</span>
        </div>
        {filteredActivities.length > 0 ? (
          filteredActivities.map((row, i) => (
            <div
              key={row.id}
              className={
                "grid grid-cols-[1fr_160px_160px] items-center px-6 py-3 text-white " +
                (i % 2 === 0 ? "bg-white/[0.02]" : "")
              }
            >
              {editingNameId === row.id ? (
                <input
                  ref={nameInputRef}
                  value={editingNameValue}
                  onChange={(e) => setEditingNameValue(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitRename();
                    if (e.key === "Escape") setEditingNameId(null);
                  }}
                  className="w-full rounded border border-white/20 bg-white/10 px-2 py-0.5 text-sm text-white outline-none focus:border-blue-500/50"
                  autoFocus
                />
              ) : (
                <span
                  className="truncate cursor-default"
                  onDoubleClick={() => startEditing(row.id, row.name)}
                  title="Double-click to rename"
                >
                  {row.name}
                </span>
              )}
              <span className="text-right text-white/70">{row.date}</span>
              <div className="flex items-center justify-end gap-3 text-white/70">
                <button
                  className="hover:text-white"
                  title="Edit"
                  onClick={() => navigate(`/resumes?id=${row.id}`)}
                >
                  <Edit2 className="size-4" />
                </button>
                <button
                  className="hover:text-white disabled:opacity-50"
                  title="Download"
                  disabled={downloadingId === row.id}
                  onClick={() => handleDownload(row.id)}
                >
                  <Download className="size-4" />
                </button>
                <button
                  className="hover:text-red-400"
                  title="Delete"
                  onClick={() => setDeletingId(row.id)}
                >
                  <Trash className="size-4 text-red-500" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="px-6 py-8 text-center text-sm text-white/40">
            No matching activity found.
          </div>
        )}
      </div>
    </section>
  );
}

function CreditsGuidelineNote({ onClose }: { onClose: () => void }) {
  return (
    <div className="rounded-lg border border-white/12 bg-white/5 px-3 py-2.5 text-sm text-white/80 flex items-center gap-2">
      <div className="size-6 rounded-md bg-yellow-500/20 border border-yellow-400/40 grid place-items-center">
        <Coins className="size-4 text-yellow-400" />
      </div>
      <span>Tip: Tap your profile icon in the top bar to see your available credits.</span>
      <button
        onClick={onClose}
        className="ml-auto size-7 rounded-md border border-white/10 text-white/70 hover:text-white hover:bg-white/10 grid place-items-center"
        aria-label="Close tip"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

export default function DashboardModal() {
  const [showCreditsTip, setShowCreditsTip] = useState(true);
  const [_summary, setSummary] = useState<any>(null);

  useEffect(() => {
    dashboardService.getSummary()
      .then((data: any) => setSummary(data))
      .catch(() => {/* summary is optional, fail silently */});
  }, []);

  return (
    <div className="min-h-svh bg-[var(--app-bg)] text-[var(--app-fg)]">
      <SiteNavbar />
      <PageWithSidebar activeRoute="dashboard" mainClassName="space-y-6">
          {showCreditsTip && (
            <CreditsGuidelineNote onClose={() => setShowCreditsTip(false)} />
          )}
          <HeroCard />
          <RecentActivity />
      </PageWithSidebar>
    </div>
  );
}
