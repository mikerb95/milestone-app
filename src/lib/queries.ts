import "server-only";
import { and, asc, desc, eq, gte, inArray, lte } from "drizzle-orm";

import { db } from "@/db";
import {
  categories,
  goalUpdates,
  goals,
  habitEntries,
  habits,
  milestones,
  subtasks,
  tasks,
  userSettings,
  type Category,
  type Goal,
  type Habit,
  type Milestone,
  type Subtask,
  type Task,
  type UserSettings,
} from "@/db/schema";
import { bootstrapUser } from "./bootstrap";
import { isEntryComplete, isHabitScheduled } from "./domain";
import { addDays, todayISO, weekStart, type ISODate } from "./dates";

/* ------------------------------------------------------------------ */
/* Ajustes                                                             */
/* ------------------------------------------------------------------ */

export async function getSettings(userId: string): Promise<UserSettings> {
  const [row] = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .limit(1);

  if (row) return row;

  /* Cuentas creadas antes de que existieran los ajustes, o por un proveedor
     que no pasó por nuestro flujo: las completamos al vuelo. */
  await bootstrapUser(userId);
  const [created] = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .limit(1);
  return created;
}

export function resolveToday(settings: UserSettings): ISODate {
  return todayISO(settings.timezone, settings.dayCutoffHour);
}

/* ------------------------------------------------------------------ */
/* Categorías                                                          */
/* ------------------------------------------------------------------ */

export async function getCategories(userId: string): Promise<Category[]> {
  return db
    .select()
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(asc(categories.sortOrder), asc(categories.name));
}

/* ------------------------------------------------------------------ */
/* Metas                                                               */
/* ------------------------------------------------------------------ */

export type GoalWithMeta = Goal & {
  category: Category | null;
  milestones: Milestone[];
};

export async function getGoals(
  userId: string,
  opts: { includeArchived?: boolean; hideCompleted?: boolean } = {},
): Promise<GoalWithMeta[]> {
  const conditions = [eq(goals.userId, userId)];
  if (!opts.includeArchived) conditions.push(eq(goals.archived, false));
  if (opts.hideCompleted) conditions.push(eq(goals.status, "active"));

  const rows = await db
    .select({ goal: goals, category: categories })
    .from(goals)
    .leftJoin(categories, eq(goals.categoryId, categories.id))
    .where(and(...conditions))
    .orderBy(asc(goals.sortOrder), desc(goals.createdAt));

  if (!rows.length) return [];

  const ids = rows.map((r) => r.goal.id);
  const ms = await db
    .select()
    .from(milestones)
    .where(inArray(milestones.goalId, ids))
    .orderBy(asc(milestones.sortOrder));

  const byGoal = new Map<string, Milestone[]>();
  for (const m of ms) {
    const list = byGoal.get(m.goalId) ?? [];
    list.push(m);
    byGoal.set(m.goalId, list);
  }

  return rows.map((r) => ({
    ...r.goal,
    category: r.category,
    milestones: byGoal.get(r.goal.id) ?? [],
  }));
}

export type GoalDetail = GoalWithMeta & {
  updates: { id: string; value: number; note: string | null; date: string }[];
};

export async function getGoalDetail(
  userId: string,
  goalId: string,
): Promise<GoalDetail | null> {
  const [row] = await db
    .select({ goal: goals, category: categories })
    .from(goals)
    .leftJoin(categories, eq(goals.categoryId, categories.id))
    .where(and(eq(goals.id, goalId), eq(goals.userId, userId)))
    .limit(1);

  if (!row) return null;

  const [ms, ups] = await Promise.all([
    db
      .select()
      .from(milestones)
      .where(eq(milestones.goalId, goalId))
      .orderBy(asc(milestones.sortOrder)),
    db
      .select({
        id: goalUpdates.id,
        value: goalUpdates.value,
        note: goalUpdates.note,
        date: goalUpdates.date,
      })
      .from(goalUpdates)
      .where(eq(goalUpdates.goalId, goalId))
      .orderBy(desc(goalUpdates.date), desc(goalUpdates.createdAt))
      .limit(20),
  ]);

  return { ...row.goal, category: row.category, milestones: ms, updates: ups };
}

/* ------------------------------------------------------------------ */
/* Hábitos                                                             */
/* ------------------------------------------------------------------ */

export type HabitWithEntries = Habit & {
  /** Valores indexados por fecha, ya listos para pintar celdas y rachas. */
  entries: Map<ISODate, number>;
  total: number;
};

/**
 * Trae los hábitos con las entradas de un rango. `from` acota el histórico:
 * la vista semana pide 8 semanas y la anual algo más de un año.
 */
export async function getHabits(
  userId: string,
  from: ISODate,
  to: ISODate,
): Promise<HabitWithEntries[]> {
  const rows = await db
    .select()
    .from(habits)
    .where(and(eq(habits.userId, userId), eq(habits.archived, false)))
    .orderBy(asc(habits.sortOrder), asc(habits.createdAt));

  if (!rows.length) return [];

  const ids = rows.map((h) => h.id);
  const entries = await db
    .select()
    .from(habitEntries)
    .where(
      and(
        inArray(habitEntries.habitId, ids),
        gte(habitEntries.date, from),
        lte(habitEntries.date, to),
      ),
    );

  /* El total histórico se cuenta aparte: el rango visible no lo representa. */
  const allEntries = await db
    .select({ habitId: habitEntries.habitId, date: habitEntries.date, value: habitEntries.value })
    .from(habitEntries)
    .where(inArray(habitEntries.habitId, ids));

  const byHabit = new Map<string, Map<ISODate, number>>();
  for (const e of entries) {
    const map = byHabit.get(e.habitId) ?? new Map<ISODate, number>();
    map.set(e.date, e.value);
    byHabit.set(e.habitId, map);
  }

  const totals = new Map<string, number>();
  for (const e of allEntries) {
    if (e.value > 0) totals.set(e.habitId, (totals.get(e.habitId) ?? 0) + 1);
  }

  return rows.map((h) => ({
    ...h,
    entries: byHabit.get(h.id) ?? new Map(),
    total: totals.get(h.id) ?? 0,
  }));
}

/** Rango que cubre la vista semanal con margen para calcular rachas. */
export function weekRange(today: ISODate, offset: number, firstDay = 1) {
  const start = addDays(weekStart(today, firstDay), offset * 7);
  return { start, end: addDays(start, 6) };
}

/* ------------------------------------------------------------------ */
/* Tareas                                                              */
/* ------------------------------------------------------------------ */

export type TaskWithMeta = Task & {
  goal: { id: string; title: string; color: string | null } | null;
  subtasks: Subtask[];
};

export async function getTasks(
  userId: string,
  opts: { includeDone?: boolean; dueOn?: ISODate } = {},
): Promise<TaskWithMeta[]> {
  const conditions = [eq(tasks.userId, userId)];
  if (!opts.includeDone) conditions.push(eq(tasks.done, false));
  if (opts.dueOn) {
    /* "Hoy" incluye lo vencido: si no, lo atrasado desaparece de la vista. */
    conditions.push(lte(tasks.dueDate, opts.dueOn));
  }

  const rows = await db
    .select({
      task: tasks,
      goalId: goals.id,
      goalTitle: goals.title,
      goalColor: categories.color,
    })
    .from(tasks)
    .leftJoin(goals, eq(tasks.goalId, goals.id))
    .leftJoin(categories, eq(goals.categoryId, categories.id))
    .where(and(...conditions))
    .orderBy(asc(tasks.sortOrder), desc(tasks.createdAt));

  if (!rows.length) return [];

  const ids = rows.map((r) => r.task.id);
  const subs = await db
    .select()
    .from(subtasks)
    .where(inArray(subtasks.taskId, ids))
    .orderBy(asc(subtasks.sortOrder));

  const byTask = new Map<string, Subtask[]>();
  for (const s of subs) {
    const list = byTask.get(s.taskId) ?? [];
    list.push(s);
    byTask.set(s.taskId, list);
  }

  return rows.map((r) => ({
    ...r.task,
    goal: r.goalId
      ? { id: r.goalId, title: r.goalTitle ?? "", color: r.goalColor }
      : null,
    subtasks: byTask.get(r.task.id) ?? [],
  }));
}

/** Tareas pendientes con fecha de hoy o anteriores, para la pantalla Hoy. */
export async function getTodayTasks(
  userId: string,
  today: ISODate,
): Promise<TaskWithMeta[]> {
  const all = await getTasks(userId, { includeDone: true });
  return all.filter(
    (k) =>
      (k.dueDate !== null && k.dueDate <= today) ||
      (k.done && k.doneAt !== null && isSameDay(k.doneAt, today)),
  );
}

function isSameDay(date: Date, iso: ISODate): boolean {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}` === iso;
}

/** Metas sin movimiento reciente: alimenta "METAS POR ACTUALIZAR". */
export async function getStaleGoals(
  userId: string,
  since: Date,
  limit = 3,
): Promise<GoalWithMeta[]> {
  const all = await getGoals(userId);
  return all
    .filter((g) => g.status === "active")
    .filter((g) => (g.lastProgressAt ?? g.createdAt) < since)
    .sort((a, b) => {
      const av = (a.lastProgressAt ?? a.createdAt).getTime();
      const bv = (b.lastProgressAt ?? b.createdAt).getTime();
      return av - bv;
    })
    .slice(0, limit);
}

/**
 * Cuántas cosas quedan por hoy: hábitos programados sin cerrar más tareas
 * vencidas o de hoy. Es el número de la insignia y del saludo de la pantalla Hoy.
 */
export async function getTodayPendingCount(
  userId: string,
  today: ISODate,
): Promise<number> {
  const [habitRows, entryRows, taskRows] = await Promise.all([
    db
      .select()
      .from(habits)
      .where(and(eq(habits.userId, userId), eq(habits.archived, false))),
    db
      .select({ habitId: habitEntries.habitId, value: habitEntries.value })
      .from(habitEntries)
      .innerJoin(habits, eq(habitEntries.habitId, habits.id))
      .where(and(eq(habits.userId, userId), eq(habitEntries.date, today))),
    db
      .select({ id: tasks.id })
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, userId),
          eq(tasks.done, false),
          lte(tasks.dueDate, today),
        ),
      ),
  ]);

  const values = new Map(entryRows.map((e) => [e.habitId, e.value]));

  const habitsLeft = habitRows.filter((h) => {
    if (!isHabitScheduled(h, today)) return false;
    return !isEntryComplete(h, values.get(h.id) ?? 0);
  }).length;

  return habitsLeft + taskRows.length;
}

/** Lista mínima de metas para el selector de los formularios. */
export async function getGoalOptions(userId: string) {
  return db
    .select({ id: goals.id, title: goals.title })
    .from(goals)
    .where(and(eq(goals.userId, userId), eq(goals.archived, false)))
    .orderBy(asc(goals.sortOrder));
}
