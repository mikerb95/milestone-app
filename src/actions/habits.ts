"use server";

import { revalidatePath } from "next/cache";
import { and, eq, max } from "drizzle-orm";
import { z } from "zod";

import { requireUser } from "@/auth";
import { db } from "@/db";
import { habitEntries, habits } from "@/db/schema";
import { getSettings, resolveToday } from "@/lib/queries";
import { nextEntryValue } from "@/lib/domain";

const habitInput = z.object({
  name: z.string().trim().min(1).max(120),
  emoji: z.string().trim().min(1).max(8).default("🎯"),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .default("#FF8A5B"),
  type: z.enum(["binary", "count", "duration"]),
  targetValue: z.coerce.number().min(1).max(10_000).default(1),
  frequency: z.enum(["daily", "weekly_n", "specific"]),
  weeklyTarget: z.coerce.number().int().min(1).max(7).default(7),
  days: z.array(z.number().int().min(0).max(6)).max(7).default([]),
});

export type HabitInput = z.input<typeof habitInput>;

function revalidateAll() {
  revalidatePath("/today");
  revalidatePath("/habits");
}

async function assertHabitOwner(userId: string, habitId: string) {
  const [row] = await db
    .select()
    .from(habits)
    .where(and(eq(habits.id, habitId), eq(habits.userId, userId)))
    .limit(1);
  if (!row) throw new Error("NOT_FOUND");
  return row;
}

export async function createHabitAction(input: HabitInput) {
  const user = await requireUser();
  const parsed = habitInput.safeParse(input);
  if (!parsed.success) return { error: "invalid" as const };
  const data = parsed.data;

  const [{ value: currentMax }] = await db
    .select({ value: max(habits.sortOrder) })
    .from(habits)
    .where(eq(habits.userId, user.id));

  const [row] = await db
    .insert(habits)
    .values({
      userId: user.id,
      name: data.name,
      emoji: data.emoji,
      color: data.color,
      type: data.type,
      targetValue: data.type === "binary" ? 1 : data.targetValue,
      frequency: data.frequency,
      weeklyTarget: data.frequency === "weekly_n" ? data.weeklyTarget : 7,
      days: data.frequency === "specific" ? data.days : null,
      sortOrder: (currentMax ?? 0) + 1,
    })
    .returning({ id: habits.id });

  revalidateAll();
  return { ok: true as const, id: row.id };
}

export async function updateHabitAction(habitId: string, input: HabitInput) {
  const user = await requireUser();
  await assertHabitOwner(user.id, habitId);

  const parsed = habitInput.safeParse(input);
  if (!parsed.success) return { error: "invalid" as const };
  const data = parsed.data;

  await db
    .update(habits)
    .set({
      name: data.name,
      emoji: data.emoji,
      color: data.color,
      type: data.type,
      targetValue: data.type === "binary" ? 1 : data.targetValue,
      frequency: data.frequency,
      weeklyTarget: data.frequency === "weekly_n" ? data.weeklyTarget : 7,
      days: data.frequency === "specific" ? data.days : null,
    })
    .where(eq(habits.id, habitId));

  revalidateAll();
  return { ok: true as const };
}

export async function deleteHabitAction(habitId: string) {
  const user = await requireUser();
  await assertHabitOwner(user.id, habitId);
  await db.delete(habits).where(eq(habits.id, habitId));
  revalidateAll();
  return { ok: true as const };
}

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

/**
 * Un toque sobre una celda: binario alterna, contable suma uno y vuelve a
 * cero al llegar al objetivo, y duración pone el objetivo completo.
 */
export async function toggleHabitEntryAction(habitId: string, date: string) {
  const user = await requireUser();
  const habit = await assertHabitOwner(user.id, habitId);

  const parsedDate = dateSchema.safeParse(date);
  if (!parsedDate.success) return { error: "invalid" as const };

  const [existing] = await db
    .select()
    .from(habitEntries)
    .where(
      and(eq(habitEntries.habitId, habitId), eq(habitEntries.date, parsedDate.data)),
    )
    .limit(1);

  const value = nextEntryValue(habit, existing?.value ?? 0);

  if (existing) {
    await db
      .update(habitEntries)
      .set({ value })
      .where(eq(habitEntries.id, existing.id));
  } else {
    await db
      .insert(habitEntries)
      .values({ habitId, date: parsedDate.data, value })
      .onConflictDoUpdate({
        target: [habitEntries.habitId, habitEntries.date],
        set: { value },
      });
  }

  revalidateAll();
  return { ok: true as const, value };
}

/** Fija un valor exacto: lo usa el registro manual de minutos o repeticiones. */
export async function setHabitEntryAction(
  habitId: string,
  date: string,
  value: number,
) {
  const user = await requireUser();
  await assertHabitOwner(user.id, habitId);

  const parsedDate = dateSchema.safeParse(date);
  const parsedValue = z.coerce.number().min(0).max(100_000).safeParse(value);
  if (!parsedDate.success || !parsedValue.success) return { error: "invalid" as const };

  await db
    .insert(habitEntries)
    .values({ habitId, date: parsedDate.data, value: parsedValue.data })
    .onConflictDoUpdate({
      target: [habitEntries.habitId, habitEntries.date],
      set: { value: parsedValue.data },
    });

  revalidateAll();
  return { ok: true as const };
}

/** Marca el hábito de hoy desde la pantalla Hoy, sin pasar por la rejilla. */
export async function toggleTodayHabitAction(habitId: string) {
  const user = await requireUser();
  const settings = await getSettings(user.id);
  return toggleHabitEntryAction(habitId, resolveToday(settings));
}
