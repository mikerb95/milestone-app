"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { GoalSheet, type GoalSheetValues } from "./goal-sheet";
import { HabitSheet, type HabitSheetValues } from "./habit-sheet";
import { TaskSheet, type TaskSheetValues } from "./task-sheet";
import { LogSheet, type LogTarget } from "./log-sheet";

export type CategoryOption = {
  id: string;
  name: string;
  nameEn: string | null;
  slug: string | null;
  emoji: string;
  color: string;
};

export type GoalOption = { id: string; title: string };

export type SheetRequest =
  | { type: "goal"; goalId?: string; initial?: Partial<GoalSheetValues> }
  | { type: "habit"; habitId?: string; initial?: Partial<HabitSheetValues> }
  | { type: "task"; taskId?: string; initial?: Partial<TaskSheetValues> }
  | { type: "log"; target: LogTarget };

type SheetContextValue = {
  open: (request: SheetRequest) => void;
  close: () => void;
  isOpen: boolean;
};

const SheetContext = createContext<SheetContextValue | null>(null);

export function useSheets(): SheetContextValue {
  const ctx = useContext(SheetContext);
  if (!ctx) throw new Error("useSheets debe usarse dentro de SheetProvider");
  return ctx;
}

export function SheetProvider({
  categories,
  goalOptions,
  today,
  children,
}: {
  categories: CategoryOption[];
  goalOptions: GoalOption[];
  today: string;
  children: React.ReactNode;
}) {
  const [request, setRequest] = useState<SheetRequest | null>(null);
  /* La hoja se desmonta después de la animación de salida, no al instante. */
  const [visible, setVisible] = useState(false);

  const open = useCallback((next: SheetRequest) => {
    setRequest(next);
    setVisible(true);
  }, []);

  const close = useCallback(() => {
    setVisible(false);
    setTimeout(() => setRequest(null), 320);
  }, []);

  const value = useMemo(
    () => ({ open, close, isOpen: visible }),
    [open, close, visible],
  );

  return (
    <SheetContext.Provider value={value}>
      {children}

      {request?.type === "goal" ? (
        <GoalSheet
          open={visible}
          onClose={close}
          categories={categories}
          today={today}
          goalId={request.goalId}
          initial={request.initial}
        />
      ) : null}

      {request?.type === "habit" ? (
        <HabitSheet
          open={visible}
          onClose={close}
          habitId={request.habitId}
          initial={request.initial}
        />
      ) : null}

      {request?.type === "task" ? (
        <TaskSheet
          open={visible}
          onClose={close}
          goalOptions={goalOptions}
          today={today}
          taskId={request.taskId}
          initial={request.initial}
        />
      ) : null}

      {request?.type === "log" ? (
        <LogSheet open={visible} onClose={close} target={request.target} />
      ) : null}
    </SheetContext.Provider>
  );
}
