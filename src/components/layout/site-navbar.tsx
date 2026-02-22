import { useEffect, useRef, useState, type JSX } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { Bell, User2, Coins, LogOut, MessageSquare, Wand2, FileText, CheckCircle, Building2, Crown, Moon } from "lucide-react";
import resumeLogo from "../../assets/resume-ai-logo.png";
import { useAuth } from "@/contexts/AuthContext";

export default function SiteNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const credits = user?.credits_remaining ?? 0;
  const planTitle = "Freemium"; // plan comes from settings API later

  // Profile dropdown state & refs
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);
  // Notifications dropdown state & ref
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement | null>(null);

  // Notifications count (from sessionStorage or default)
  const [notifCount, setNotifCount] = useState<number>(() => {
    try {
      const raw = sessionStorage.getItem("notificationCount");
      if (raw) {
        const n = parseInt(raw, 10);
        if (!Number.isNaN(n)) return n;
      }
    } catch {}
    return 3; // fallback demo count
  });

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [notifications, setNotifications] = useState<{ id: string; title: string; desc: string; icon: JSX.Element; time: string }[]>([
    { id: "n1", title: "Resume exported", desc: "Your PDF is ready to download.", icon: <FileText className="size-4 text-blue-400" />, time: "2m" },
    { id: "n2", title: "AI suggestion", desc: "Improve your summary with AI.", icon: <Wand2 className="size-4 text-purple-400" />, time: "10m" },
    { id: "n3", title: "New message", desc: "Recruiter replied to your application.", icon: <MessageSquare className="size-4 text-emerald-400" />, time: "1h" },
    { id: "n4", title: "Plan upgraded", desc: "Premium features unlocked.", icon: <CheckCircle className="size-4 text-cyan-400" />, time: "1d" },
  ]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const doLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-white/10 bg-[var(--app-bg)]/80 backdrop-blur supports-[backdrop-filter]:bg-[var(--app-bg)]/60">
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
      <div className="mx-auto max-w-7xl h-full px-6 flex items-center justify-between">

        {/* Brand */}
        <Link to="/" className="flex items-center gap-3">
          <img src={resumeLogo} alt="ResumeCraft AI Logo" className="h-8 w-8 rounded-md" />
          <span className="text-white text-xl font-black tracking-tight">
            Jobsynk AI
          </span>
        </Link>



        {/* Right: actions */}
        <div className="flex items-center gap-4 ml-auto relative">

          {/* Notifications — before profile */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setNotifOpen((o) => !o)}
              className="size-8 rounded-full bg-white/10 border border-white/20 text-white/70 hover:text-white grid place-items-center transition relative"
              aria-label="Notifications"
            >
              <Bell className="size-4" />
              {notifCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-4 px-1 rounded-full bg-red-500 text-[10px] font-semibold text-white grid place-items-center border border-white/20 shadow">
                  {notifCount > 99 ? "99+" : notifCount}
                </span>
              )}
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-10 w-80 rounded-xl bg-[#0f1629] border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
                <div className="px-3 py-2.5 flex items-center justify-between">
                  <div className="text-sm text-white/80">Notifications</div>
                  <button
                    className="text-xs text-white/70 hover:text-white"
                    onClick={() => {
                      setNotifCount(0);
                      setNotifications([]);
                      try { sessionStorage.setItem("notificationCount", "0"); } catch {}
                    }}
                  >
                    Mark all read
                  </button>
                </div>
                <div className="h-px bg-white/10" />
                <ul className="max-h-64 overflow-auto py-2">
                  {notifications.length > 0 ? (
                    notifications.slice(0, 6).map((n) => (
                    <li key={n.id} className="px-3 py-2.5 flex items-start gap-3 hover:bg-white/5">
                      <div className="size-7 rounded-md bg-white/5 border border-white/10 grid place-items-center shrink-0">
                        {n.icon}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-white/90 font-medium">{n.title}</div>
                        <div className="text-xs text-white/60">{n.desc}</div>
                      </div>
                      <div className="text-[11px] text-white/50">{n.time}</div>
                    </li>
                    ))
                  ) : (
                    <li className="px-6 py-8 flex flex-col items-center justify-center text-center">
                      <div className="size-10 rounded-full bg-white/5 border border-white/10 grid place-items-center mb-3">
                        <Moon className="size-5 text-white/40" />
                      </div>
                      <p className="text-sm text-white/70 font-medium">No new notifications</p>
                      <p className="text-xs text-white/40 mt-1">You're all caught up!</p>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* Profile — after notifications */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setProfileOpen((o) => !o)}
              className="size-8 rounded-full bg-white/10 border border-white/20 grid place-items-center cursor-pointer hover:bg-white/20 transition"
              aria-label="Profile"
            >
              <User2 className="size-4 text-white/70" />
            </button>
            {profileOpen && (
              <div className="absolute right-0 top-10 w-56 rounded-xl bg-[#0f1629] border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
                <div className="px-3 py-2.5 flex items-center gap-2">
                  <div className="size-7 rounded-md bg-purple-500/20 border border-purple-400/40 grid place-items-center">
                    <Crown className="size-4 text-purple-300" />
                  </div>
                  <div className="text-sm text-white/90">Plan: <span className="font-semibold text-white">{planTitle}</span></div>
                </div>
                <div className="h-px bg-white/10" />
                <div className="px-3 py-2.5 flex items-center gap-2">
                  <div className="size-7 rounded-md bg-yellow-500/20 border border-yellow-400/40 grid place-items-center">
                    <Coins className="size-4 text-yellow-400" />
                  </div>
                  <div className="text-sm text-white/90">Credits: <span className="font-semibold text-white">{credits}</span></div>
                </div>

                <div className="h-px bg-white/10" />
                <button
                  onClick={() => { navigate("/enterprise"); }}
                  className="w-full text-left px-3 py-2.5 flex items-center gap-2 text-sm text-white/80 hover:text-white hover:bg-white/5"
                >
                  <Building2 className="size-4" /> Enterprise Plans
                </button>
                <div className="h-px bg-white/10" />
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="w-full text-left px-3 py-2.5 flex items-center gap-2 text-sm text-white/80 hover:text-white hover:bg-white/5"
                >
                  <LogOut className="size-4" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
