import { useEffect, useRef, useState, type JSX } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Bell, User2, LogOut, FileText, CheckCircle, Building2, Crown, Moon, Sun, LayoutGrid, Sparkles } from "lucide-react";
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
  const location = useLocation();
  const [planTitle, setPlanTitle] = useState<string>(FREE_PLAN_LABEL);
  const showAuthControls = isAuthenticated && !marketingMode;
  const compactBrand = isAuthenticated && !marketingMode && location.pathname === "/dashboard";

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
      <div className="h-full px-6 flex items-center justify-between">

        {/* Brand */}
        <button
          type="button"
          onClick={() => navigate(isAuthenticated && !marketingMode ? "/dashboard" : "/")}
          className={`flex h-full items-center select-none cursor-pointer hover:opacity-80 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 rounded-lg ${compactBrand ? "gap-2" : "gap-2.5"}`}
          aria-label="Jobsynk AI — go to home"
        >
          <img
            src={theme === "dark" ? darkBrandIcon : lightBrandIcon}
            alt=""
            className={`pointer-events-none shrink-0 object-contain select-none ${compactBrand ? "size-6" : "size-8"}`}
          />
          <span className={`relative shrink-0 overflow-hidden ${compactBrand ? "h-[1.4rem] w-28" : "h-7 w-[8.75rem]"}`} aria-hidden="true">
            <img
              src={theme === "dark" ? darkLogo : lightLogo}
              alt=""
              className={`pointer-events-none absolute max-w-none select-none ${compactBrand ? "-left-[0.16rem] -top-[2.83rem] w-[7.09rem]" : "-left-[0.2rem] -top-[3.54rem] w-[8.86rem]"}`}
            />
          </span>
        </button>



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
              className={`grid size-9 place-items-center rounded-xl border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 ${
                profileOpen
                  ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-text)]"
                  : "border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-fg-muted)] hover:border-[var(--app-border-strong)] hover:bg-[var(--app-surface-2)] hover:text-[var(--app-fg)]"
              }`}
              aria-label="Profile"
              aria-expanded={profileOpen}
            >
              <User2 className="size-4" />
            </button>
            {profileOpen && (
              <div className="absolute right-0 top-12 w-[19rem] overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-2 shadow-[var(--shadow-pop)]">
                <span className="absolute right-3.5 top-0 size-3 -translate-y-1/2 rotate-45 border-l border-t border-[var(--app-border)] bg-[var(--app-surface)]" aria-hidden="true" />
                {/* User info */}
                <div className="flex items-center gap-3 px-2 py-2.5">
                  <div className="grid size-11 shrink-0 place-items-center rounded-xl border border-[var(--app-border)] bg-[var(--accent-soft)] text-[var(--accent-text)]">
                    <User2 className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-[var(--app-fg)]">{user?.name || "User"}</div>
                    <div className="mt-0.5 truncate text-xs text-[var(--app-fg-soft)]">{user?.email || ""}</div>
                  </div>
                </div>

                <div className="my-1 h-px bg-[var(--app-border)]" />

                <div className="flex items-center justify-between gap-3 rounded-xl bg-[var(--app-surface-2)] px-3 py-2.5">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--pastel-lavender)] text-[var(--accent-text)]">
                      <Crown className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--app-fg-soft)]">Current plan</p>
                      <p className="truncate text-sm font-semibold text-[var(--app-fg)]">{planTitle}</p>
                    </div>
                  </div>
                  <span className="size-2 shrink-0 rounded-full bg-emerald-500 ring-4 ring-emerald-500/10" aria-label="Plan active" />
                </div>

                <div className="mt-2 space-y-1">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/enterprise");
                  }}
                  className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-[var(--accent-soft)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--accent-text)] transition-colors group-hover:border-transparent">
                    <Building2 className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-[var(--app-fg)]">Enterprise Plans</span>
                    <span className="mt-0.5 block text-xs text-[var(--app-fg-soft)]">Plans and tools for teams</span>
                  </span>
                  <ArrowRight className="size-4 text-[var(--app-fg-soft)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--accent-text)]" />
                </button>

                <button
                  onClick={() => askLogout()}
                  className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-rose-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/30"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] text-rose-500 transition-colors group-hover:border-rose-500/20">
                    <LogOut className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-[var(--app-fg)] group-hover:text-rose-600 dark:group-hover:text-rose-400">Logout</span>
                    <span className="mt-0.5 block text-xs text-[var(--app-fg-soft)]">Sign out of your account</span>
                  </span>
                </button>
                </div>
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
