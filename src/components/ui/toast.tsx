"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type ToastPayload = {
  message: string;
  /** Si se pasa, el toast muestra el botón de deshacer. */
  undo?: () => void | Promise<void>;
};

type ToastContextValue = {
  toast: (message: string, undo?: () => void | Promise<void>) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  /* Fuera del provider el toast no rompe nada: simplemente no se muestra. */
  return ctx ?? { toast: () => {} };
}

const DURATION = 3200;

export function ToastProvider({
  children,
  undoLabel = "Deshacer",
}: {
  children: React.ReactNode;
  undoLabel?: string;
}) {
  const [payload, setPayload] = useState<ToastPayload | null>(null);
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    setVisible(false);
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const toast = useCallback(
    (message: string, undo?: () => void | Promise<void>) => {
      if (timer.current) clearTimeout(timer.current);
      setPayload({ message, undo });
      setVisible(true);
      timer.current = setTimeout(() => setVisible(false), DURATION);
    },
    [],
  );

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="fixed bottom-[calc(96px+env(safe-area-inset-bottom))] left-4 right-4 z-70 flex items-center gap-3.5 rounded-2xl px-4 py-3.5 md:bottom-7 md:left-1/2 md:right-auto md:w-[min(420px,90vw)] md:-translate-x-1/2"
        style={{
          background: "rgba(20,28,79,0.9)",
          border: "1px solid var(--gbd)",
          backdropFilter: "blur(24px) saturate(160%)",
          WebkitBackdropFilter: "blur(24px) saturate(160%)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,.10)",
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? "auto" : "none",
          translate: visible ? "0 0" : "0 12px",
          transition: "opacity .22s, translate .22s var(--ease-ms)",
        }}
      >
        <span className="min-w-0 flex-1 text-sm font-medium">
          {payload?.message}
        </span>
        {payload?.undo ? (
          <button
            type="button"
            className="flex-none text-sm font-bold text-[#8FA8FF]"
            onClick={async () => {
              dismiss();
              await payload.undo?.();
            }}
          >
            {undoLabel}
          </button>
        ) : null}
      </div>
    </ToastContext.Provider>
  );
}
