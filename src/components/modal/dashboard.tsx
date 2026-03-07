import { useState, useEffect, type ReactNode } from "react";
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
} from "lucide-react";
import SiteNavbar from "../layout/site-navbar";
import PageWithSidebar from "../layout/page-with-sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { dashboardService } from "@/services";
import { resumeService } from "@/services/resume";

export function Sidebar({ activeRoute }: { activeRoute?: string }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
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
    <aside className="w-64 shrink-0 border-r border-white/10 bg-[var(--app-bg)] text-white/90">
      {showLogoutModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4">
          <div className="w-full max-w-sm rounded-xl border border-white/10 bg-[#0f1629] p-6 shadow-2xl transform transition-all">
            <h3 className="text-lg font-semibold text-white">Log out?</h3>
            <p className="mt-2 text-sm text-white/70">Are you sure you want to log out of your account?</p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  doLogout();
                  setShowLogoutModal(false);
                }}
                className="rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors"
              >
                Log out
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
      <nav className="px-3 py-4 flex flex-col gap-2">
        <NavItem icon={<Home className="size-4 text-sky-400" />} label="Dashboard" route="dashboard" active={current === "dashboard"} />
        <NavItem icon={<FileText className="size-4 text-emerald-400" />} label="My Resumes" route="my-resumes" active={current === "my-resumes"} />
        <NavItem icon={<LayoutGrid className="size-4 text-violet-400" />} label="Templates" route="templates" active={current === "templates"} />
        <NavItem icon={<Wand2 className="size-4 text-pink-400" />} label="Juno AI" route="tailoring" active={current === "tailoring"} />
        {/*<NavItem icon={<MessagesSquare className="size-4 text-orange-400" />} label=" AI Interviews" route="interview" active={current === "interview"} />*/}
        <NavItem icon={<Crown className="size-4 text-yellow-400" />} label="Explore Pro Plans" route="pricing" active={current === "pricing"} />
        <NavItem icon={<Settings className="size-4 text-slate-400" />} label="Settings" route="account" active={current === "account"} />
        <NavItem icon={<HelpCircle className="size-4 text-teal-400" />} label="Help Center" route="help-center" active={current === "help-center"} />
        <NavItem icon={<LogOut className="size-4 text-red-400" />} label="Logout" route="login" onClick={() => setShowLogoutModal(true)} />
      </nav>
      <div className="mt-2 h-px bg-white/10 mx-3" />
      <div className="mt-auto px-3 py-4 space-y-3">
        {/* Rotating tips box - Low Profile */}
        <div className="mt-2">
            <div className="mb-2 px-1 flex items-center justify-between">
                 <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Quick Guide</span>
            </div>

            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3 transition-colors hover:bg-white/[0.04]">
              <div className="flex items-center gap-2 mb-2">
                <div className="text-white/60 scale-75">{currentTip.icon}</div>
                <div className="text-xs font-medium text-white/80">{currentTip.title}</div>
              </div>

              <ul className="space-y-2 pl-1">
                {currentTip.points.map((p) => (
                  <li key={p} className="text-[11px] text-white/60 flex items-start gap-2">
                    <span className="mt-[5px] size-1 rounded-full bg-sky-400/60 shrink-0 shadow-[0_0_4px_rgba(56,189,248,0.3)]" />
                    <span className="leading-tight">{p}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-3 flex items-center justify-end">
                <button
                  onClick={nextTip}
                  className="flex items-center gap-1 text-[10px] text-white/40 hover:text-white transition-colors"
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

function NavItem({ icon, label, route, active = false, onClick }: { icon: ReactNode; label: string; route: string; active?: boolean; onClick?: () => void }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={onClick ? onClick : () => navigate(`/${route}`)}
      className={
        "w-full text-left flex items-center gap-3 rounded-xl px-4 py-2 text-sm cursor-pointer transition-colors " +
        (active ? "bg-white/5 text-white" : "text-white/70 hover:bg-white/5 hover:text-white")
      }
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}


function HeroCard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const displayName = user?.name ?? user?.email ?? "there";
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Welcome back, {displayName}!</h2>
          <p className="text-white/60 mt-1">Ready to land your dream job? Let's get started.</p>
        </div>
        <AppButton variant="primary" size="lg" onClick={() => navigate("/resumes")}>
          <Plus className="size-4" />
          Create New Resume
        </AppButton>
      </div>
    </section>
  );
}

function RecentActivity() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activities, setActivities] = useState<{ id: number; name: string; date: string }[]>([]);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

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
        <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
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
              <span className="truncate">{row.name}</span>
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
                  className="hover:text-white"
                  title="Download"
                  onClick={() => navigate(`/resumes?id=${row.id}`)}
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
    <div className="min-h-svh bg-[var(--app-bg)] text-white">
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
