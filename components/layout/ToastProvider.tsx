"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import type { Toast, ToastType } from "@/types";

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType, duration = 4000) => {
      const id = Date.now().toString() + Math.random().toString(36).slice(2);
      const toast: Toast = { id, message, type, duration };
      setToasts((prev) => [...prev, toast]);

      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast]
  );

  const typeStyles: Record<ToastType, string> = {
    success: "border-gaming-green bg-gaming-green/10",
    error: "border-gaming-red bg-gaming-red/10",
    info: "border-gaming-purple bg-gaming-purple/10",
    warning: "border-gaming-gold bg-gaming-gold/10",
  };

  const typeIcons: Record<ToastType, string> = {
    success: "✅",
    error: "❌",
    info: "ℹ️",
    warning: "⚠️",
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast-enter border rounded-lg px-4 py-3 flex items-center gap-3 backdrop-blur-sm ${typeStyles[toast.type]}`}
          >
            <span className="text-lg">{typeIcons[toast.type]}</span>
            <p className="text-sm text-white flex-1">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/50 hover:text-white text-sm"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
