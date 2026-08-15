"use server";

import { revalidatePath } from "next/cache";
import { and, asc, eq, inArray, max } from "drizzle-orm";
import { z } from "zod";

import { requireUser } from "@/auth";
import { db } from "@/db";
import { goals, subtasks, tasks } from "@/db/schema";
import { addDays } from "@/lib/dates";

const taskInput = z.object({
  title: z.string().trim().min(1).max(200),
  notes: z.string().trim().max(1000).nullish(),
  priority: z.enum(["high", "med", "low"]).default("med"),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullish(),
  goalId: z.string().nullish(),
  recurrence: z.enum(["daily", "weekly", "monthly"]).nullish(),
  /**
   * Las subtareas viajan con su id cuando ya existen. Así al editar podemos
   * distinguir las que se renombran de las que se añaden o se quitan, sin
   * perder por el camino cuáles estaban marcadas.
   */
  subtasks: z
    .array(
      z.object({
        id: z.string().min(1).optional(),
        title: z.string().trim().min(1).max(200),
      }),
    )
    .max(30)
    .default([]),
});

export type TaskInput = z.input<typeof taskInput>;

function revalidateAll() {
  revalidatePath("/today");
  revalidatePath("/tasks");
  revalidatePath("/goals");
}

async function assertTaskOwner(userId: string, taskId: string) {
  const [row] = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
    .limit(1);
  if (!row) throw new Error("NOT_FOUND");
  return row;
}

/** Una meta ajena no puede colarse como vínculo de una tarea propia. */
async function resolveGoalId(userId: string, goalId?: string | null) {
  if (!goalId) return null;
  const [row] = await db
    .select({ id: goals.id })
    .from(goals)
    .where(and(eq(goals.id, goalId), eq(goals.userId, userId)))
    .limit(1);
  return row?.id ?? null;
}

export async function createTaskAction(input: TaskInput) {
  const user = await requireUser();
  const parsed = taskInput.safeParse(input);
  if (!parsed.success) return { error: "invalid" as const };
  const data = parsed.data;

  const [{ value: currentMax }] = await db
    .select({ value: max(tasks.sortOrder) })
    .from(tasks)
    .where(eq(tasks.userId, user.id));

  const [row] = await db
    .insert(tasks)
    .values({
      userId: user.id,
      title: data.title,
      notes: data.notes || null,
      priority: data.priority,
      dueDate: data.dueDate || null,
      goalId: await resolveGoalId(user.id, data.goalId),
      recurrence: data.recurrence || null,
      sortOrder: (currentMax ?? 0) + 1,
    })
    .returning({ id: tasks.id });

  if (data.subtasks.length) {
    await db.insert(subtasks).values(
      data.subtasks.map((s, i) => ({
        taskId: row.id,
        title: s.title,
        sortOrder: i,
      })),
    );
  }

  revalidateAll();
  return { ok: true as const, id: row.id };
}

export async function updateTaskAction(taskId: string, input: TaskInput) {
  const user = await requireUser();
  await assertTaskOwner(user.id, taskId);

  const parsed = taskInput.safeParse(input);
  if (!parsed.success) return { error: "invalid" as const };
  const data = parsed.data;

  await db
    .update(tasks)
    .set({
      title: data.title,
      notes: data.notes || null,
      priority: data.priority,
      dueDate: data.dueDate || null,
      goalId: await resolveGoalId(user.id, data.goalId),
      recurrence: data.recurrence || null,
    })
    .where(eq(tasks.id, taskId));

  await syncSubtasks(taskId, data.subtasks);

  revalidateAll();
  return { ok: true as const };
}

/**
 * Deja las subtareas exactamente como llegan del formulario: borra las que el
 * usuario quitó, renombra las que siguen (conservando si estaban marcadas) y
 * añade las nuevas.
 */
async function syncSubtasks(
  taskId: string,
  incoming: { id?: string; title: string }[],
) {
  const existing = await db
    .select({ id: subtasks.id })
    .from(subtasks)
    .where(eq(subtasks.taskId, taskId))
    .orderBy(asc(subtasks.sortOrder));

  const existingIds = new Set(existing.map((s) => s.id));
  /* Un id que no sea de esta tarea se trata como fila nueva, nunca se toca. */
  const kept = new Set(
    incoming.map((s) => s.id).filter((id): id is string => !!id && existingIds.has(id)),
  );

  const removed = existing.filter((s) => !kept.has(s.id)).map((s) => s.id);
  if (removed.length) {
    await db
      .delete(subtasks)
      .where(and(eq(subtasks.taskId, taskId), inArray(subtasks.id, removed)));
  }

  const added: { taskId: string; title: string; sortOrder: number }[] = [];

  for (const [i, s] of incoming.entries()) {
    if (s.id && kept.has(s.id)) {
      await db
        .update(subtasks)
        .set({ title: s.title, sortOrder: i })
        .where(and(eq(subtasks.id, s.id), eq(subtasks.taskId, taskId)));
    } else {
      added.push({ taskId, title: s.title, sortOrder: i });
    }
  }

  if (added.length) await db.insert(subtasks).values(added);
}

/**
 * Completar una tarea recurrente no la cierra: la reprograma al siguiente
 * ciclo, que es lo que espera quien puso "cada semana".
 */
export async function toggleTaskAction(taskId: string) {
  const user = await requireUser();
  const task = await assertTaskOwner(user.id, taskId);

  if (!task.done && task.recurrence && task.dueDate) {
    const step =
      task.recurrence === "daily" ? 1 : task.recurrence === "weekly" ? 7 : 30;
    await db
      .update(tasks)
      .set({ dueDate: addDays(task.dueDate, step), done: false, doneAt: null })
      .where(eq(tasks.id, taskId));
    revalidateAll();
    return { ok: true as const, done: true, rescheduled: true };
  }

  const done = !task.done;
  await db
    .update(tasks)
    .set({ done, doneAt: done ? new Date() : null })
    .where(eq(tasks.id, taskId));

  revalidateAll();
  return { ok: true as const, done, rescheduled: false };
}

export async function deleteTaskAction(taskId: string) {
  const user = await requireUser();
  await assertTaskOwner(user.id, taskId);
  await db.delete(tasks).where(eq(tasks.id, taskId));
  revalidateAll();
  return { ok: true as const };
}

export async function toggleSubtaskAction(subtaskId: string) {
  const user = await requireUser();

  const [row] = await db
    .select({ id: subtasks.id, done: subtasks.done })
    .from(subtasks)
    .innerJoin(tasks, eq(subtasks.taskId, tasks.id))
    .where(and(eq(subtasks.id, subtaskId), eq(tasks.userId, user.id)))
    .limit(1);

  if (!row) return { error: "not_found" as const };

  await db
    .update(subtasks)
    .set({ done: !row.done })
    .where(eq(subtasks.id, subtaskId));

  revalidateAll();
  return { ok: true as const };
}
