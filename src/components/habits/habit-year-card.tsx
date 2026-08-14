"use client";

import { useState, useTransition } from "react";
import { useApp } from "@/components/app-provider";
import { useToast } from "@/components/ui/toast";
import { toggleTodayHabitAction } from "@/actions/habits";
import { heatColor } from "@/lib/domain";

export type YearHabit = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  total: number;
  streak: number;
  todayComplete: boolean;
  /** Columnas semanales con 7 niveles cada una; -1 marca días futuros. */
  weeks: { month: string; levels: number[] }[];
};

export function HabitYearCard({ habit }: { habit: YearHabit }) {
  const { t } = useApp();
  const { toast } = useToast();
  const [, startTransition] = useTransition();
  const [done, setDone] = useState(habit.todayComplete);

  const quick = () => {
    const next = !done;
    setDone(next);
    startTransition(async () => {
      const res = await toggleTodayHabitAction(habit.id);
      if (typeof res.value === "number") setDone(res.value > 0);
      if (next) toast(`${habit.name} ${t.logged}`);
    });
  };

  return (
    <div className="card flex flex-col gap-3.5 p-4">
      <div className="flex items-center gap-2.5">
        <span
          className="grid h-[38px] w-[38px] flex-none place-items-center rounded-xl text-lg"
          style={{
            background: habit.color + "26",
            border: `1px solid ${habit.color}3D`,
          }}
        >
          {habit.emoji}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-[17px] font-semibold tracking-[-0.01em]">
            {habit.name}
          </span>
          <span className="tabular text-[13px] font-medium text-[var(--t3)]">
            {habit.total} {t.daysUnit}
          </span>
        </span>

        <span
          className="tabular flex flex-none items-center gap-1 rounded-full px-2.5 py-1 text-[13px] font-bold"
          style={{
            background: habit.streak > 0 ? "rgba(255,138,61,.16)" : "var(--g2)",
            border: `1px solid ${habit.streak > 0 ? "rgba(255,138,61,.35)" : "var(--gbd)"}`,
            color: habit.streak > 0 ? "#FF8A3D" : "var(--t3)",
          }}
        >
          <span style={{ opacity: habit.streak > 0 ? 1 : 0.4 }}>🔥</span>
          {habit.streak}
        </span>

        <button
          type="button"
          onClick={quick}
          aria-pressed={done}
          className="h-8 flex-none rounded-full px-3.5 text-[13px] font-bold transition-[background-color] active:scale-[0.94]"
          style={{
            background: done ? habit.color : "var(--g2)",
            border: `1px solid ${done ? habit.color : "var(--gbd)"}`,
            color: done ? "#0B1038" : "var(--t2)",
          }}
        >
          {done ? "✓" : t.todayPill}
        </button>
      </div>

      {/* Mapa de calor: una columna por semana, siete filas por día. */}
      <div className="flex w-full flex-col gap-1.5">
        <div className="flex h-3 w-full gap-[3px]">
          {habit.weeks.map((w, i) => (
            <span
              key={i}
              className="min-w-0 flex-1 text-[9px] font-semibold text-[var(--t3)]"
            >
              {w.month}
            </span>
          ))}
        </div>
        <div className="flex w-full gap-[3px]">
          {habit.weeks.map((w, i) => (
            <div key={i} className="flex min-w-0 flex-1 flex-col gap-[3px]">
              {w.levels.map((level, j) => (
                <span
                  key={j}
                  className="aspect-square w-full rounded-[3px]"
                  style={{ background: heatColor(habit.color, level) }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
