export type NotificationType =
  | "resume-created"
  | "resume-draft"
  | "templates-coming-soon"
  | "ai-features-coming-soon";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  desc: string;
  createdAt: string;
}

const NOTIFICATIONS_KEY = "jobsynk.notifications";
const UNREAD_COUNT_KEY = "jobsynk.notificationUnreadCount";
const NOTIFICATION_EVENT = "jobsynk:notifications-updated";

const BASE_NOTIFICATIONS: AppNotification[] = [
  {
    id: "templates-coming-soon",
    type: "templates-coming-soon",
    title: "More templates coming soon",
    desc: "Fresh, more appealing resume templates are on the way.",
    createdAt: "always",
  },
  {
    id: "ai-features-coming-soon",
    type: "ai-features-coming-soon",
    title: "New AI features coming soon",
    desc: "More smart tools for tailoring, feedback, and resume improvements are coming.",
    createdAt: "always",
  },
];

function notifyListeners() {
  window.dispatchEvent(new CustomEvent(NOTIFICATION_EVENT));
}

export function getNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    if (!raw) return BASE_NOTIFICATIONS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? [...parsed, ...BASE_NOTIFICATIONS] : BASE_NOTIFICATIONS;
  } catch {
    return BASE_NOTIFICATIONS;
  }
}

export function getUnreadNotificationCount() {
  try {
    const raw = localStorage.getItem(UNREAD_COUNT_KEY);
    if (raw !== null) {
      const parsed = Number.parseInt(raw, 10);
      return Number.isNaN(parsed) ? 0 : parsed;
    }
  } catch {
    // Local storage can be unavailable in restricted browser contexts.
  }
  return BASE_NOTIFICATIONS.length;
}

function saveUnreadNotificationCount(count: number) {
  const safeCount = Math.max(0, count);
  try {
    localStorage.setItem(UNREAD_COUNT_KEY, String(safeCount));
  } catch {
    // Local storage can be unavailable in restricted browser contexts.
  }
  try {
    sessionStorage.setItem("notificationCount", String(safeCount));
  } catch {
    // Session storage can be unavailable in restricted browser contexts.
  }
}

export function saveNotifications(notifications: AppNotification[]) {
  try {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  } catch {
    // Local storage can be unavailable in restricted browser contexts.
  }
  notifyListeners();
}

export function markNotificationsRead() {
  saveUnreadNotificationCount(0);
  notifyListeners();
}

export function addNotification(notification: Omit<AppNotification, "id" | "createdAt">) {
  const next: AppNotification = {
    ...notification,
    id: `${notification.type}-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  const storedNotifications = getNotifications().filter(
    (item) => !BASE_NOTIFICATIONS.some((base) => base.id === item.id)
  );
  saveNotifications([next, ...storedNotifications].slice(0, 20));
  saveUnreadNotificationCount(getUnreadNotificationCount() + 1);
  notifyListeners();
}

export function addResumeCreatedNotification(kind: "blank" | "complete") {
  addNotification(
    kind === "blank"
      ? {
          type: "resume-draft",
          title: "Resume draft created",
          desc: "Continue where you left off and complete your resume.",
        }
      : {
          type: "resume-created",
          title: "Resume created",
          desc: "Your resume has been created successfully.",
        }
  );
}

export const notificationEvents = {
  updated: NOTIFICATION_EVENT,
};
