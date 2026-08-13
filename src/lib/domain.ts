import type { Goal, Habit, Milestone, Task } from "@/db/schema";
import { addDays, diffDays, formatNumber, mondayIndex, type ISODate } from "./dates";
import type { Locale } from "./i18n";

/* ------------------------------------------------------------------ */
/* Metas                                                               */
/* ------------------------------------------------------------------ */

export function goalPercent(goal: Goal, milestones: Milestone[] = []): number {
  if (goal.type === "milestone") {
    if (!milestones.length) return 0;
    const done = milestones.filter((m) => m.done).length;
    return Math.round((done / milestones.length) * 100);
  }
  if (goal.type === "binary") return goal.currentValue > 0 ? 100 : 0;
  if (goal.type === "percent") return clamp(Math.round(goal.currentValue));
  if (!goal.targetValue) return 0;
  return clamp(Math.round((goal.currentValue / goal.targetValue) * 100));
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, n));
}

/** "3 / 4 libros", "65 / 100 %", "3 / 5 hitos". */
export function goalRawLabel(
  goal: Goal,
  milestones: Milestone[],
  locale: Locale,
): string {
  if (goal.type === "milestone") {
    const done = milestones.filter((m) => m.done).length;
    const unit = goal.unit || (locale === "es" ? "hitos" : "milestones");
    return `${done} / ${milestones.length} ${unit}`;
  }
  if (goal.type === "binary") {
    if (locale === "es") return goal.currentValue > 0 ? "Hecho" : "Pendiente";
    return goal.currentValue > 0 ? "Done" : "Pending";
  }
  if (goal.type === "percent") return `${Math.round(goal.currentValue)} / 100 %`;
  return `${formatNumber(goal.currentValue, locale)} / ${formatNumber(goal.targetValue, locale)}${goal.unit ? " " + goal.unit : ""}`;
}

/**
 * Una meta entra en "por actualizar" cuando lleva más de una semana sin
 * movimiento. Es lo que alimenta la sección de la pantalla Hoy.
 */
export const STALE_DAYS = 7;

export function daysSinceProgress(goal: Goal, today: ISODate): number | null {
  const ref = goal.lastProgressAt ?? goal.createdAt;
  if (!ref) return null;
  const iso = isoFromDate(ref);
  return Math.max(0, diffDays(today, iso));
}

function isoFromDate(d: Date): ISODate {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/* ------------------------------------------------------------------ */
/* Hábitos                                                             */
/* ------------------------------------------------------------------ */

export function isHabitScheduled(habit: Habit, iso: ISODate): boolean {
  if (habit.frequency !== "specific") return true;
  const days = habit.days ?? [];
  if (!days.length) return true;
  return days.includes(mondayIndex(iso));
}

export function isEntryComplete(habit: Habit, value: number): boolean {
  if (habit.type === "binary") return value > 0;
  return value >= habit.targetValue;
}

/**
 * Racha en días consecutivos programados. El día de hoy solo rompe la racha
 * cuando el ajuste "contar el día actual" está activo; si no, se salta.
 */
export function habitStreak(
  habit: Habit,
  entries: Map<ISODate, number>,
  today: ISODate,
  countToday = true,
): number {
  let streak = 0;
  let cursor = today;
  let guard = 0;

  while (guard++ < 800) {
    if (!isHabitScheduled(habit, cursor)) {
      cursor = addDays(cursor, -1);
      continue;
    }
    const complete = isEntryComplete(habit, entries.get(cursor) ?? 0);
    if (complete) {
      streak++;
    } else if (cursor === today && !countToday) {
      /* Hoy todavía está en curso: no cuenta pero tampoco rompe. */
    } else if (cursor === today) {
      /* Hoy sin marcar: la racha sigue viva desde ayer. */
    } else {
      break;
    }
    cursor = addDays(cursor, -1);
  }
  return streak;
}

/** Nivel 0-4 para el heatmap anual, o -1 en los días futuros. */
export function heatLevel(habit: Habit, value: number | undefined): number {
  if (value === undefined || value === 0) return 0;
  if (habit.type === "binary") return 4;
  const ratio = value / (habit.targetValue || 1);
  if (ratio >= 1) return 4;
  if (ratio >= 0.66) return 3;
  if (ratio >= 0.33) return 2;
  return 1;
}

export function heatColor(color: string, level: number): string {
  if (level < 0) return "rgba(255,255,255,0.055)";
  if (level === 0) return "rgba(255,255,255,0.11)";
  const alpha = level === 1 ? "59" : level === 2 ? "8C" : level === 3 ? "C4" : "FF";
  return color + alpha;
}

/** Siguiente valor al tocar una celda: binario alterna, contable suma y reinicia. */
export function nextEntryValue(habit: Habit, current: number): number {
  if (habit.type === "binary") return current > 0 ? 0 : 1;
  if (habit.type === "count") return current >= habit.targetValue ? 0 : current + 1;
  return current > 0 ? 0 : habit.targetValue || 20;
}

export function habitTypeLabel(habit: Habit, locale: Locale): string {
  const d = {
    es: { binary: "Binario", count: "Contable", duration: "Duración", min: "min" },
    en: { binary: "Binary", count: "Countable", duration: "Duration", min: "min" },
  }[locale];
  if (habit.type === "binary") return d.binary;
  if (habit.type === "count") return `${d.count} · ${formatNumber(habit.targetValue, locale)}`;
  return `${d.duration} · ${formatNumber(habit.targetValue, locale)} ${d.min}`;
}

/* ------------------------------------------------------------------ */
/* Tareas                                                              */
/* ------------------------------------------------------------------ */

export type TaskGroupKey =
  | "overdue"
  | "today"
  | "tomorrow"
  | "week"
  | "later"
  | "nodate";

export const TASK_GROUP_ORDER: TaskGroupKey[] = [
  "overdue",
  "today",
  "tomorrow",
  "week",
  "later",
  "nodate",
];

export function taskGroup(task: Task, today: ISODate): TaskGroupKey {
  if (!task.dueDate) return "nodate";
  const delta = diffDays(task.dueDate, today);
  if (delta < 0) return "overdue";
  if (delta === 0) return "today";
  if (delta === 1) return "tomorrow";
  if (delta <= 7) return "week";
  return "later";
}

export const PRIORITY_ORDER: Record<string, number> = { high: 0, med: 1, low: 2 };

export function sortTasks(a: Task, b: Task): number {
  const p = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
  if (p !== 0) return p;
  if (a.dueDate && b.dueDate && a.dueDate !== b.dueDate)
    return a.dueDate < b.dueDate ? -1 : 1;
  return a.sortOrder - b.sortOrder;
}
