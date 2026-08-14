"use client";

import { useState, useTransition } from "react";
import { useApp } from "@/components/app-provider";
import { useSheets } from "@/components/sheets/sheet-provider";
import { useToast } from "@/components/ui/toast";
import { deleteHabitAction, toggleHabitEntryAction } from "@/actions/habits";
import { formatDuration } from "@/lib/dates";
import { dayNames } from "@/lib/i18n";

export type WeekHabit = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  type: "binary" | "count" | "duration";
  targetValue: number;
  frequency: "daily" | "weekly_n" | "specific";
  weeklyTarget: number;
  days: number[] | null;
  typeLabel: string;
  streak: number;
  /** Siete celdas de lunes a domingo con su fecha y valor. */
  cells: { date: string; value: number; scheduled: boolean; future: boolean }[];
};

export function HabitWeekCard({ habit }: { habit: WeekHabit }) {
  const { t, locale } = useApp();
  const { open } = useSheets();
  const { toast } = useToast();
  const [, startTransition] = useTransition();
  const [values, setValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(habit.cells.map((c) => [c.date, c.value])),
  );

  const names = dayNames(locale);

  const complete = (value: number) =>
    habit.type === "binary" ? value > 0 : value >= habit.targetValue;

  const tap = (date: string) => {
    const current = values[date] ?? 0;
    /* Predecimos el mismo salto que aplica el servidor para no esperar. */
    const optimistic =
      habit.type === "binary"
        ? current > 0
          ? 0
          : 1
        : habit.type === "count"
          ? current >= habit.targetValue
            ? 0
            : current + 1
          : current > 0
            ? 0
            : habit.targetValue;

    setValues((prev) => ({ ...prev, [date]: optimistic }));
    startTransition(async () => {
      const res = await toggleHabitEntryAction(habit.id, date);
      if (typeof res.value === "number") {
        setValues((prev) => ({ ...prev, [date]: res.value as number }));
      }
    });
  };

  const cellContent = (value: number) => {
    if (!value) return "";
    if (habit.type === "binary") return "✓";
    if (habit.type === "count") return String(Math.round(value));
    return formatDuration(value);
  };

  return (
    <div className="card card-hover flex flex-col gap-3 p-4">
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
          <span className="text-[13px] font-medium text-[var(--t3)]">
            {habit.typeLabel}
          </span>
        </span>

        <span
          className="tabular flex flex-none items-center gap-1 rounded-full px-2.5 py-1 text-[13px] font-bold"
          style={{
            background: habit.streak > 0 ? "rgba(255,138,61,.16)" : "var(--g2)",
            border: `1px solid ${habit.streak > 0 ? "rgba(255,138,61,.35)" : "var(--gbd)"}`,
            color: habit.streak > 0 ? "#FF8A3D" : "var(--t3)",
          }}
          title={`${habit.streak} ${t.daysUnit}`}
        >
          <span style={{ opacity: habit.streak > 0 ? 1 : 0.4 }}>🔥</span>
          {habit.streak}
        </span>

        <button
          type="button"
          aria-label={t.editHabit}
          onClick={() =>
            open({
              type: "habit",
              habitId: habit.id,
              initial: {
                name: habit.name,
                emoji: habit.emoji,
                color: habit.color,
                type: habit.type,
                targetValue: String(habit.targetValue),
                frequency: habit.frequency,
                weeklyTarget: String(habit.weeklyTarget),
                days: habit.days ?? [],
              },
            })
          }
          className="flex-none text-[var(--t3)] transition-colors hover:text-[var(--t1)]"
        >
          ⋯
        </button>

        <button
          type="button"
          aria-label={t.deleteHabit}
          onClick={() =>
            startTransition(async () => {
              await deleteHabitAction(habit.id);
              toast(t.habitDeleted);
            })
          }
          className="flex-none text-[var(--t3)] transition-colors hover:text-[var(--danger)]"
        >
          ×
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {habit.cells.map((c, i) => {
          const value = values[c.date] ?? 0;
          const isComplete = complete(value);
          const partial = value > 0 && !isComplete;

          return (
            <div key={c.date} className="flex flex-col items-center gap-1.5">
              <span
                className="text-[10px] font-bold tracking-[0.04em]"
                style={{ color: c.scheduled ? "var(--t3)" : "rgba(255,255,255,.2)" }}
              >
                {names[i]}
              </span>
              <button
                type="button"
                onClick={() => tap(c.date)}
                disabled={c.future}
                aria-label={c.date}
                aria-pressed={isComplete}
                className="tabular grid h-11 w-full place-items-center rounded-xl text-[11px] font-bold transition-[background-color] duration-200 active:scale-[0.94] focus-visible:outline-2 focus-visible:outline-[var(--acc)] focus-visible:outline-offset-2 disabled:cursor-default disabled:opacity-45"
                style={{
                  background: isComplete
                    ? habit.color
                    : partial
                      ? habit.color + "59"
                      : c.scheduled
                        ? "rgba(255,255,255,.08)"
                        : "rgba(255,255,255,.04)",
                  border: `1px solid ${isComplete ? habit.color : "var(--gbd)"}`,
                  color: isComplete ? "#0B1038" : "var(--t2)",
                }}
              >
                {cellContent(value)}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
