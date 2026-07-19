import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

type ToastType = "success" | "error";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
  visible: boolean;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, type, visible: true }]);

    setTimeout(() => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, visible: false } : t)));
    }, 4000);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 left-4 right-4 z-50 flex flex-col items-end gap-3 sm:left-auto sm:right-6">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex max-w-full items-center gap-3 rounded-xl border px-5 py-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-300 sm:max-w-sm ${
              toast.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
            } ${
              toast.type === "success"
                ? "border-green-500/30 bg-[#0f1f10]"
                : "border-red-500/30 bg-[#1f0f0f]"
            }`}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full ${
                toast.type === "success" ? "bg-green-500/20" : "bg-red-500/20"
              }`}
            >
              {toast.type === "success" ? (
                <svg className="h-3 w-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-3 w-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </span>
            <span className={`min-w-0 break-words text-sm font-medium ${toast.type === "success" ? "text-green-300" : "text-red-300"}`}>
              {toast.message}
            </span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
