"use server";

import { revalidatePath } from "next/cache";
import { and, eq, max, sql } from "drizzle-orm";
import { z } from "zod";

import { requireUser } from "@/auth";
import { db } from "@/db";
import { goalUpdates, goals, milestones } from "@/db/schema";
import { getSettings, resolveToday } from "@/lib/queries";
import { defaultTargetDate } from "@/lib/dates";

const goalInput = z.object({
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(400).nullish(),
  why: z.string().trim().max(1000).nullish(),
  categoryId: z.string().nullish(),
  type: z.enum(["numeric", "percent", "milestone", "binary"]),
  timeframe: z.enum(["week", "month", "quarter", "year", "long_term"]),
  targetValue: z.coerce.number().min(0).max(1_000_000_000).default(100),
  unit: z.string().trim().max(40).nullish(),
  targetDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullish(),
  reminder: z.boolean().default(false),
  milestones: z.array(z.string().trim().min(1).max(200)).max(50).default([]),
});

export type GoalInput = z.input<typeof goalInput>;

function revalidateAll() {
  revalidatePath("/today");
  revalidatePath("/goals");
  revalidatePath("/tasks");
}

/** Toda mutación pasa por aquí: sin dueño confirmado no se toca la fila. */
async function assertGoalOwner(userId: string, goalId: string) {
  const [row] = await db
    .select({ id: goals.id, type: goals.type })
    .from(goals)
    .where(and(eq(goals.id, goalId), eq(goals.userId, userId)))
    .limit(1);
  if (!row) throw new Error("NOT_FOUND");
  return row;
}

export async function createGoalAction(input: GoalInput) {
  const user = await requireUser();
  const parsed = goalInput.safeParse(input);
  if (!parsed.success) return { error: "invalid" as const };

  const data = parsed.data;
  const settings = await getSettings(user.id);
  const today = resolveToday(settings);

  const [{ value: currentMax }] = await db
    .select({ value: max(goals.sortOrder) })
    .from(goals)
    .where(eq(goals.userId, user.id));

  const [row] = await db
    .insert(goals)
    .values({
      userId: user.id,
      categoryId: data.categoryId || null,
      title: data.title,
      description: data.description || null,
      why: data.why || null,
      type: data.type,
      timeframe: data.timeframe,
      targetValue: data.type === "percent" ? 100 : data.targetValue,
      currentValue: 0,
      unit: data.unit || null,
      targetDate: data.targetDate || defaultTargetDate(data.timeframe, today),
      reminder: data.reminder,
      sortOrder: (currentMax ?? 0) + 1,
    })
    .returning({ id: goals.id });

  if (data.type === "milestone" && data.milestones.length) {
    await db.insert(milestones).values(
      data.milestones.map((title, i) => ({
        goalId: row.id,
        title,
        sortOrder: i,
      })),
    );
  }

  revalidateAll();
  return { ok: true as const, id: row.id };
}

export async function updateGoalAction(goalId: string, input: GoalInput) {
  const user = await requireUser();
  await assertGoalOwner(user.id, goalId);

  const parsed = goalInput.safeParse(input);
  if (!parsed.success) return { error: "invalid" as const };
  const data = parsed.data;

  await db
    .update(goals)
    .set({
      categoryId: data.categoryId || null,
      title: data.title,
      description: data.description || null,
      why: data.why || null,
      type: data.type,
      timeframe: data.timeframe,
      targetValue: data.type === "percent" ? 100 : data.targetValue,
      unit: data.unit || null,
      targetDate: data.targetDate || null,
      reminder: data.reminder,
      updatedAt: new Date(),
    })
    .where(eq(goals.id, goalId));

  revalidateAll();
  revalidatePath(`/goals/${goalId}`);
  return { ok: true as const };
}

export async function deleteGoalAction(goalId: string) {
  const user = await requireUser();
  await assertGoalOwner(user.id, goalId);
  await db.delete(goals).where(eq(goals.id, goalId));
  revalidateAll();
  return { ok: true as const };
}

const logInput = z.object({
  goalId: z.string().min(1),
  value: z.coerce.number().min(0).max(1_000_000_000),
  note: z.string().trim().max(300).nullish(),
});

/**
 * Registra un avance: guarda la entrada en el historial y deja la meta con el
 * valor nuevo. El "por actualizar" de la pantalla Hoy se apoya en esta fecha.
 */
export async function logProgressAction(input: z.input<typeof logInput>) {
  const user = await requireUser();
  const parsed = logInput.safeParse(input);
  if (!parsed.success) return { error: "invalid" as const };

  const { goalId, value, note } = parsed.data;
  await assertGoalOwner(user.id, goalId);

  const settings = await getSettings(user.id);
  const today = resolveToday(settings);

  await db.insert(goalUpdates).values({
    goalId,
    value,
    note: note || null,
    date: today,
  });

  const [current] = await db
    .select({
      currentValue: goals.currentValue,
      targetValue: goals.targetValue,
      status: goals.status,
    })
    .from(goals)
    .where(eq(goals.id, goalId))
    .limit(1);

  const improving = value > current.currentValue;
  const reached = current.targetValue > 0 && value >= current.targetValue;

  await db
    .update(goals)
    .set({
      currentValue: value,
      trend: improving ? "improving" : "steady",
      lastProgressAt: new Date(),
      updatedAt: new Date(),
      ...(reached && current.status === "active"
        ? { status: "completed" as const, completedAt: new Date() }
        : {}),
    })
    .where(eq(goals.id, goalId));

  revalidateAll();
  revalidatePath(`/goals/${goalId}`);
  return { ok: true as const, completed: reached };
}

export async function setGoalStatusAction(
  goalId: string,
  status: "active" | "paused" | "completed",
) {
  const user = await requireUser();
  await assertGoalOwner(user.id, goalId);

  await db
    .update(goals)
    .set({
      status,
      completedAt: status === "completed" ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(goals.id, goalId));

  revalidateAll();
  revalidatePath(`/goals/${goalId}`);
  return { ok: true as const };
}

export async function toggleMilestoneAction(milestoneId: string) {
  const user = await requireUser();

  const [row] = await db
    .select({
      id: milestones.id,
      goalId: milestones.goalId,
      done: milestones.done,
    })
    .from(milestones)
    .innerJoin(goals, eq(milestones.goalId, goals.id))
    .where(and(eq(milestones.id, milestoneId), eq(goals.userId, user.id)))
    .limit(1);

  if (!row) return { error: "not_found" as const };

  const done = !row.done;
  await db
    .update(milestones)
    .set({ done, doneAt: done ? new Date() : null })
    .where(eq(milestones.id, milestoneId));

  /* El avance de una meta por hitos es el recuento de hitos cumplidos. */
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(milestones)
    .where(and(eq(milestones.goalId, row.goalId), eq(milestones.done, true)));

  await db
    .update(goals)
    .set({
      currentValue: count,
      lastProgressAt: new Date(),
      updatedAt: new Date(),
      trend: done ? "improving" : "steady",
    })
    .where(eq(goals.id, row.goalId));

  revalidateAll();
  revalidatePath(`/goals/${row.goalId}`);
  return { ok: true as const, done };
}

export async function addMilestoneAction(goalId: string, title: string) {
  const user = await requireUser();
  await assertGoalOwner(user.id, goalId);

  const parsed = z.string().trim().min(1).max(200).safeParse(title);
  if (!parsed.success) return { error: "invalid" as const };

  const [{ value: currentMax }] = await db
    .select({ value: max(milestones.sortOrder) })
    .from(milestones)
    .where(eq(milestones.goalId, goalId));

  await db.insert(milestones).values({
    goalId,
    title: parsed.data,
    sortOrder: (currentMax ?? 0) + 1,
  });

  revalidatePath(`/goals/${goalId}`);
  revalidatePath("/goals");
  return { ok: true as const };
}

export async function deleteMilestoneAction(milestoneId: string) {
  const user = await requireUser();

  const [row] = await db
    .select({ goalId: milestones.goalId })
    .from(milestones)
    .innerJoin(goals, eq(milestones.goalId, goals.id))
    .where(and(eq(milestones.id, milestoneId), eq(goals.userId, user.id)))
    .limit(1);

  if (!row) return { error: "not_found" as const };

  await db.delete(milestones).where(eq(milestones.id, milestoneId));
  revalidatePath(`/goals/${row.goalId}`);
  revalidatePath("/goals");
  return { ok: true as const };
}
