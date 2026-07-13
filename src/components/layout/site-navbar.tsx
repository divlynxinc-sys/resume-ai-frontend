import { useEffect, useRef, useState, type JSX } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { Bell, User2, LogOut, FileText, CheckCircle, Building2, Crown, Moon, Sun, LayoutGrid, Sparkles } from "lucide-react";
import lightLogo from "../../assets/Logo-01.png";
import lightBrandIcon from "../../assets/Logo-03.png";
import darkLogo from "../../assets/Logo-04.png";
import darkBrandIcon from "../../assets/Logo-06.png";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
  clearNotifications,
  getNotifications,
  getUnreadNotificationCount,
  markNotificationsRead,
  notificationEvents,
  type AppNotification,
} from "@/services/notifications";
import { settingsService } from "@/services/settings";

function notificationIcon(type: AppNotification["type"]): JSX.Element {
  if (type === "resume-draft") {
    return <FileText className="size-4 text-amber-400" />;
  }
  if (type === "templates-coming-soon") {
    return <LayoutGrid className="size-4 text-blue-400" />;
  }
  if (type === "ai-features-coming-soon") {
    return <Sparkles className="size-4 text-purple-400" />;
  }
  return <CheckCircle className="size-4 text-emerald-400" />;
}

function notificationTime(createdAt: string) {
  if (createdAt === "always") return "Soon";
  const elapsedMs = Date.now() - new Date(createdAt).getTime();
  if (!Number.isFinite(elapsedMs) || elapsedMs < 60_000) return "Now";
  const minutes = Math.floor(elapsedMs / 60_000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

// Free-tier fallback shown when the user has no paid plan attached.
const FREE_PLAN_LABEL = "Free";

export default function SiteNavbar({ marketingMode = false }: { marketingMode?: boolean }) {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [planTitle, setPlanTitle] = useState<string>(FREE_PLAN_LABEL);
  const showAuthControls = isAuthenticated && !marketingMode;

  // Fetch the user's current plan from /settings/account/summary, with refetch
  // on focus and on the `plan-updated` event (dispatched after a Polar sync).
  useEffect(() => {
    if (!isAuthenticated || marketingMode) return;

    let cancelled = false;
    const fetchPlan = () => {
      settingsService
        .getAccountSummary()
        .then((res) => {
          if (cancelled) return;
          setPlanTitle(res.current_plan || FREE_PLAN_LABEL);
        })
        .catch(() => {
          // Leave the existing label rather than flicker to "Free" on transient errors.
        });
    };

    fetchPlan();
    const onPlanUpdated = () => fetchPlan();
    const onFocus = () => fetchPlan();
    window.addEventListener("plan-updated", onPlanUpdated);
    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      window.removeEventListener("plan-updated", onPlanUpdated);
      window.removeEventListener("focus", onFocus);
    };
  }, [isAuthenticated, marketingMode]);

  // Profile dropdown state & refs
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);
  // Notifications dropdown state & ref
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement | null>(null);

  const [notifications, setNotifications] = useState<AppNotification[]>(() => getNotifications());
  const [notifCount, setNotifCount] = useState(() => getUnreadNotificationCount());
  const hasClearableNotifications = notifications.some((n) => n.createdAt !== "always");

  const [showLogoutModal, setShowLogoutModal] = useState(false);

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

  useEffect(() => {
    const refreshNotifications = () => {
      setNotifications(getNotifications());
      setNotifCount(getUnreadNotificationCount());
    };
    window.addEventListener(notificationEvents.updated, refreshNotifications);
    window.addEventListener("storage", refreshNotifications);
    return () => {
      window.removeEventListener(notificationEvents.updated, refreshNotifications);
      window.removeEventListener("storage", refreshNotifications);
    };
  }, []);

  const askLogout = () => {
    setShowLogoutModal(true);
    setProfileOpen(false);
    setNotifOpen(false);
  };

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
      <div className="relative h-full px-6 flex items-center justify-between">

        {/* Brand */}
        <button
          type="button"
          onClick={() => navigate(isAuthenticated && !marketingMode ? "/dashboard" : "/")}
          className="flex h-full items-center gap-2.5 select-none cursor-pointer hover:opacity-80 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 rounded-lg"
          aria-label="Jobsynk AI — go to home"
        >
          <img
            src={theme === "dark" ? darkBrandIcon : lightBrandIcon}
            alt=""
            className="pointer-events-none size-8 shrink-0 object-contain select-none"
          />
          <span className="relative h-7 w-[8.75rem] shrink-0 overflow-hidden" aria-hidden="true">
            <img
              src={theme === "dark" ? darkLogo : lightLogo}
              alt=""
              className="pointer-events-none absolute -left-[0.2rem] -top-[3.54rem] w-[8.86rem] max-w-none select-none"
            />
          </span>
        </button>

        {/* Marketing nav. Real <Link>s, not navigate() buttons — these are the only
            crawlable internal links into the content surface from the top of the page. */}
        {marketingMode && (
          <nav
            aria-label="Main"
            className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 md:flex"
          >
            <Link
              to="/#features"
              className="text-sm font-medium text-[var(--app-fg-muted)] transition-colors hover:text-[var(--app-fg)]"
            >
              Features
            </Link>
            <Link
              to="/ats-checker"
              className="text-sm font-medium text-[var(--app-fg-muted)] transition-colors hover:text-[var(--app-fg)]"
            >
              ATS Checker
            </Link>
            <Link
              to="/pricing"
              className="text-sm font-medium text-[var(--app-fg-muted)] transition-colors hover:text-[var(--app-fg)]"
            >
              Pricing
            </Link>
            <Link
              to="/blog"
              className="text-sm font-medium text-[var(--app-fg-muted)] transition-colors hover:text-[var(--app-fg)]"
            >
              Blog
            </Link>
          </nav>
        )}

        {/* Right: actions */}
        <div className="flex items-center gap-4 ml-auto relative">
          {marketingMode && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="h-9 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-900 shadow-sm transition-colors hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/50"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="h-9 rounded-lg bg-[var(--btn-primary-bg)] px-4 text-sm font-medium text-[var(--btn-primary-text)] hover:bg-[var(--btn-primary-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/35"
              >
                Sign up
              </button>
            </div>
          )}

          {/* Theme toggle — always visible */}
          <button
            onClick={toggleTheme}
            className="size-8 rounded-full bg-white/10 border border-white/20 text-white/70 hover:text-white grid place-items-center transition"
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          >
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>

          {showAuthControls && (
          <>

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
                  <div className="flex items-center gap-3">
                    <button
                      className="text-xs text-white/70 hover:text-white"
                      onClick={() => {
                        markNotificationsRead();
                      }}
                    >
                      Mark all read
                    </button>
                    <button
                      className="text-xs text-white/70 hover:text-white disabled:pointer-events-none disabled:opacity-40"
                      disabled={!hasClearableNotifications}
                      onClick={() => {
                        clearNotifications();
                      }}
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <div className="h-px bg-white/10" />
                <ul className="max-h-64 overflow-auto py-2">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                    <li key={n.id} className="px-3 py-2.5 flex items-start gap-3 hover:bg-white/5">
                      <div className="size-7 rounded-md bg-white/5 border border-white/10 grid place-items-center shrink-0">
                        {notificationIcon(n.type)}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-white/90 font-medium">{n.title}</div>
                        <div className="text-xs text-white/60">{n.desc}</div>
                      </div>
                      <div className="text-[11px] text-white/50">{notificationTime(n.createdAt)}</div>
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
              <div className="absolute right-0 top-10 w-64 rounded-xl bg-[#0f1629] border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
                {/* User info */}
                <div className="px-3 py-3 flex items-center gap-3">
                  <div className="size-9 rounded-full bg-blue-500/20 border border-blue-400/30 grid place-items-center shrink-0">
                    <User2 className="size-4 text-blue-300" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{user?.name || "User"}</div>
                    <div className="text-xs text-white/50 truncate">{user?.email || ""}</div>
                  </div>
                </div>
                <div className="h-px bg-white/10" />
                <div className="px-3 py-2.5 flex items-center gap-2">
                  <div className="size-7 rounded-md bg-purple-500/20 border border-purple-400/40 grid place-items-center">
                    <Crown className="size-4 text-purple-300" />
                  </div>
                  <div className="text-sm text-white/90">Plan: <span className="font-semibold text-white">{planTitle}</span></div>
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
                  onClick={() => askLogout()}
                  className="w-full text-left px-3 py-2.5 flex items-center gap-2 text-sm text-white/80 hover:text-white hover:bg-white/5"
                >
                  <LogOut className="size-4" /> Logout
                </button>
              </div>
            )}
          </div>
          </>
          )}
        </div>
      </div>
    </header>
  );
}
