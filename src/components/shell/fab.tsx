"use client";

import { usePathname } from "next/navigation";
import { useSheets } from "@/components/sheets/sheet-provider";
import { useT } from "@/components/app-provider";

/**
 * El botón flotante cambia de acción y de color según la pantalla: metas en
 * naranja, hábitos en morado. En Más y Ajustes no hay nada que crear.
 */
export function Fab() {
  const pathname = usePathname();
  const { open } = useSheets();
  const t = useT();

  if (pathname.startsWith("/more") || pathname.startsWith("/settings")) return null;

  const isHabits = pathname.startsWith("/habits");
  const isTasks = pathname.startsWith("/tasks");

  const label = isHabits ? t.newHabit : isTasks ? t.newTask : t.newGoal;

  const onClick = () => {
    if (isHabits) open({ type: "habit" });
    else if (isTasks) open({ type: "task" });
    else open({ type: "goal" });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="fixed right-4 bottom-[calc(84px+env(safe-area-inset-bottom))] z-40 grid h-14 w-14 place-items-center rounded-full text-[26px] font-light transition-transform duration-200 hover:scale-105 active:scale-95 md:right-7 md:bottom-7 md:h-15 md:w-15"
      style={{
        background: isHabits
          ? "linear-gradient(150deg,#8B6BFF,#6B4BEA)"
          : "linear-gradient(150deg,#FF9A52,#FF7A2E)",
        color: isHabits ? "#fff" : "#1A1A1A",
        boxShadow: isHabits
          ? "0 10px 30px rgba(124,92,255,.42), inset 0 1px 0 rgba(255,255,255,.28)"
          : "0 10px 30px rgba(255,138,61,.4), inset 0 1px 0 rgba(255,255,255,.35)",
      }}
    >
      +
    </button>
  );
}
