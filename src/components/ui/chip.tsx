"use client";

/** Píldora seleccionable de los formularios. Se tiñe con el color que reciba. */
export function Chip({
  active,
  color = "#FF8A3D",
  onClick,
  children,
  className = "",
  title,
}: {
  active: boolean;
  color?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-pressed={active}
      className={`inline-flex items-center justify-center gap-1.5 rounded-full px-3.5 py-2.5 text-sm font-semibold transition-[background-color,color] duration-150 active:scale-[0.97] ${className}`}
      style={{
        background: active ? color + "2E" : "var(--g2)",
        border: `1px solid ${active ? color + "77" : "var(--gbd)"}`,
        color: active ? color : "var(--t2)",
      }}
    >
      {children}
    </button>
  );
}

/** Variante cuadrada para la rejilla de categorías. */
export function ChipTile({
  active,
  color = "#FF8A3D",
  onClick,
  emoji,
  label,
}: {
  active: boolean;
  color?: string;
  onClick?: () => void;
  emoji: string;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-3 transition-[background-color,color] duration-150 active:scale-[0.97]"
      style={{
        background: active ? color + "2E" : "var(--g2)",
        border: `1px solid ${active ? color + "77" : "var(--gbd)"}`,
        color: active ? color : "var(--t2)",
      }}
    >
      <span className="text-base">{emoji}</span>
      <span className="text-[13px] font-semibold">{label}</span>
    </button>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-semibold tracking-[0.09em] text-[var(--t3)]">
      {children}
    </div>
  );
}
