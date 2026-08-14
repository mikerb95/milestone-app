"use client";

/** Fila de ajuste: icono, etiqueta y a la derecha un control o un valor. */
export function Row({
  icon,
  label,
  first,
  danger,
  children,
  onClick,
}: {
  icon: string;
  label: string;
  first: boolean;
  danger?: boolean;
  children?: React.ReactNode;
  onClick?: () => void;
}) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      {...(onClick ? { type: "button" as const, onClick } : {})}
      className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-white/[0.03]"
      style={{
        borderTop: first ? "none" : "1px solid rgba(255,255,255,.07)",
      }}
    >
      <span
        className="grid h-8 w-8 flex-none place-items-center rounded-[10px] text-[15px]"
        style={{ background: "var(--g2)" }}
      >
        {icon}
      </span>
      <span
        className="min-w-0 flex-1 text-pretty text-[15px] font-medium"
        style={{ color: danger ? "#FF453A" : "var(--t1)" }}
      >
        {label}
      </span>
      {children}
      {onClick ? <span className="text-[15px] text-[var(--t3)]">›</span> : null}
    </Tag>
  );
}

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="relative h-7 w-[46px] flex-none rounded-full transition-colors duration-200"
      style={{
        background: checked ? "rgba(52,211,153,.75)" : "rgba(255,255,255,.16)",
      }}
    >
      <span
        className="absolute top-[3px] h-[22px] w-[22px] rounded-full bg-white transition-[left] duration-200"
        style={{ left: checked ? "21px" : "3px" }}
      />
    </button>
  );
}

/** Selector que conserva el aspecto de "valor + chevron" de la maqueta. */
export function Choice({
  value,
  options,
  onChange,
  label,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (next: string) => void;
  label: string;
}) {
  return (
    <div className="flex flex-none items-center gap-1">
      <select
        value={value}
        aria-label={label}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer appearance-none bg-transparent text-right text-sm font-medium text-[var(--t3)] outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#141C4F] text-white">
            {o.label}
          </option>
        ))}
      </select>
      <span className="text-[15px] text-[var(--t3)]">›</span>
    </div>
  );
}

export function Value({ children }: { children: React.ReactNode }) {
  return (
    <span className="whitespace-nowrap text-sm font-medium text-[var(--t3)]">
      {children}
    </span>
  );
}

export function Group({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2.5">
      <div className="eyebrow px-0.5">{title}</div>
      <div className="card overflow-hidden">{children}</div>
    </section>
  );
}
