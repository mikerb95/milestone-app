"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/components/app-provider";
import { CalendarIcon, GridIcon } from "@/components/shell/nav-icons";

/** Botón de la barra superior que alterna entre la vista semana y la anual. */
export function ViewToggle({ view }: { view: "week" | "year" }) {
  const router = useRouter();
  const { t } = useApp();
  const next = view === "week" ? "year" : "week";

  return (
    <button
      type="button"
      className="icon-btn"
      aria-label={next === "year" ? t.yearView : t.weekView}
      title={next === "year" ? t.yearView : t.weekView}
      onClick={() => router.push(`/habits?view=${next}`)}
    >
      {view === "week" ? <GridIcon /> : <CalendarIcon />}
    </button>
  );
}

export function WeekNav({
  offset,
  rangeLabel,
}: {
  offset: number;
  rangeLabel: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const { t } = useApp();

  const go = (next: number) => {
    const q = new URLSearchParams(params.toString());
    if (next === 0) q.delete("w");
    else q.set("w", String(next));
    router.push(`/habits${q.size ? `?${q}` : ""}`);
  };

  return (
    <div className="glass flex items-center gap-2.5 rounded-full px-3 py-2.5">
      <button
        type="button"
        onClick={() => go(offset - 1)}
        aria-label={t.weekView}
        className="grid h-[30px] w-[30px] place-items-center rounded-full text-[15px] transition-colors hover:bg-[var(--g3)] active:scale-[0.97]"
        style={{ background: "var(--g2)" }}
      >
        ‹
      </button>
      <div className="tabular flex-1 text-center text-sm font-semibold">
        {rangeLabel}
      </div>
      <button
        type="button"
        onClick={() => go(offset + 1)}
        disabled={offset >= 0}
        aria-label={t.weekView}
        className="grid h-[30px] w-[30px] place-items-center rounded-full text-[15px] transition-colors hover:bg-[var(--g3)] active:scale-[0.97] disabled:opacity-35"
        style={{ background: "var(--g2)" }}
      >
        ›
      </button>
      <button
        type="button"
        onClick={() => go(0)}
        className="h-[30px] rounded-full px-3.5 text-[13px] font-semibold transition-colors active:scale-[0.97]"
        style={{
          background: offset === 0 ? "rgba(255,138,61,.22)" : "var(--g2)",
          border: `1px solid ${offset === 0 ? "rgba(255,138,61,.45)" : "var(--gbd)"}`,
          color: offset === 0 ? "#FF8A3D" : "var(--t2)",
        }}
      >
        {t.todayPill}
      </button>
    </div>
  );
}
