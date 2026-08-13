"use client";

import { useEffect, useRef } from "react";

/**
 * Hoja inferior en móvil, diálogo centrado a partir de tablet. Reproduce el
 * comportamiento del sheet de la maqueta, incluido el scrim con desenfoque.
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    /* Con la hoja abierta el fondo no debe desplazarse. */
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      const first = panelRef.current?.querySelector<HTMLElement>(
        "input, textarea, select, button",
      );
      first?.focus({ preventScroll: true });
    }
  }, [open]);

  return (
    <>
      <div
        aria-hidden
        onClick={onClose}
        className="fixed inset-0 z-55"
        style={{
          background: "rgba(6,10,32,.55)",
          backdropFilter: open ? "blur(2px)" : "none",
          WebkitBackdropFilter: open ? "blur(2px)" : "none",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity .26s",
        }}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={[
          "fixed z-60 overflow-y-auto",
          "bottom-0 left-0 right-0 max-h-[88vh] rounded-t-[28px] px-4 pt-3 pb-[calc(28px+env(safe-area-inset-bottom))]",
          "md:bottom-auto md:left-1/2 md:right-auto md:top-1/2 md:w-[min(520px,92vw)] md:max-h-[86vh] md:rounded-3xl md:px-5 md:pt-4 md:pb-6",
        ].join(" ")}
        style={{
          background: "rgba(20,28,79,0.86)",
          border: "1px solid var(--gbd)",
          backdropFilter: open ? "blur(30px)" : "none",
          WebkitBackdropFilter: open ? "blur(30px)" : "none",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,.10)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition:
            "transform .3s var(--ease-ms), opacity .26s var(--ease-ms)",
        }}
        data-open={open ? "true" : "false"}
      >
        {/* Asa: solo aporta en móvil, donde la hoja sube desde abajo. */}
        <div className="mx-auto mb-3.5 h-1 w-9 rounded-full bg-white/30 md:hidden" />
        <div className="mb-4 flex items-center gap-3">
          <div className="min-w-0 flex-1 text-[22px] font-bold tracking-[-0.02em]">
            {title}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="grid h-[34px] w-[34px] place-items-center rounded-full text-base transition-colors hover:bg-[var(--g3)]"
            style={{ background: "var(--g2)", border: "1px solid var(--gbd)" }}
          >
            ×
          </button>
        </div>
        {children}
        {footer}
      </div>
      <style>{`
        [data-open="false"][role="dialog"] { transform: translateY(101%); }
        [data-open="true"][role="dialog"] { transform: none; }
        @media (min-width: 768px) {
          [data-open="false"][role="dialog"] { transform: translate(-50%,-46%) scale(.96); }
          [data-open="true"][role="dialog"] { transform: translate(-50%,-50%) scale(1); }
        }
      `}</style>
    </>
  );
}
