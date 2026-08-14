"use client";

import { useState, useTransition } from "react";
import { toggleTodayHabitAction } from "@/actions/habits";

export type HabitPillData = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  complete: boolean;
};

/** Píldora horizontal de la pantalla Hoy: un toque cierra el hábito del día. */
export function HabitPill({ habit }: { habit: HabitPillData }) {
  const [complete, setComplete] = useState(habit.complete);
  const [, startTransition] = useTransition();

  const toggle = () => {
    const next = !complete;
    setComplete(next);
    startTransition(async () => {
      const res = await toggleTodayHabitAction(habit.id);
      if ("value" in res) setComplete(res.value > 0);
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={complete}
      className="flex flex-none items-center gap-2.5 rounded-full py-2.5 pl-2.5 pr-3.5 transition-[background-color] duration-200 active:scale-[0.97]"
      style={{
        background: complete ? habit.color + "2E" : "var(--g1)",
        border: `1px solid ${complete ? habit.color + "55" : "var(--gbd)"}`,
        backdropFilter: "var(--gb)",
        WebkitBackdropFilter: "var(--gb)",
      }}
    >
      <span
        className="grid h-[30px] w-[30px] place-items-center rounded-full text-[15px]"
        style={{ background: habit.color + "26" }}
      >
        {habit.emoji}
      </span>
      <span className="whitespace-nowrap text-[13px] font-semibold">{habit.name}</span>
      <span
        className="grid h-[18px] w-[18px] place-items-center rounded-full text-[10px] font-extrabold text-[#0B1038]"
        style={{
          background: complete ? habit.color : "transparent",
          border: complete ? "none" : "1.4px solid rgba(255,255,255,.3)",
          opacity: complete ? 1 : 0.55,
        }}
      >
        ✓
      </span>
    </button>
  );
}
