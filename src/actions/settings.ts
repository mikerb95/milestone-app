"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { and, eq, max } from "drizzle-orm";
import { z } from "zod";

import { requireUser } from "@/auth";
import { db } from "@/db";
import { categories, userSettings } from "@/db/schema";
import { LOCALE_COOKIE } from "@/lib/preferences";

const settingsInput = z
  .object({
    locale: z.enum(["es", "en"]),
    timezone: z.string().min(1).max(64),
    dateFormat: z.string().min(1).max(32),
    timeFormat: z.enum(["24h", "12h"]),
    firstDayOfWeek: z.coerce.number().int().min(0).max(6),
    currency: z.string().min(1).max(8),
    unitSystem: z.enum(["metric", "imperial"]),

    theme: z.string().min(1).max(16),
    accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    textSize: z.enum(["small", "medium", "large"]),
    reduceMotion: z.boolean(),
    reduceTransparency: z.boolean(),

    notifications: z.boolean(),
    streakAlerts: z.boolean(),
    dailySummary: z.string().max(16).nullish(),
    weeklySummary: z.string().max(24).nullish(),
    goalNudges: z.string().max(16).nullish(),
    quietHoursStart: z.string().max(8).nullish(),
    quietHoursEnd: z.string().max(8).nullish(),

    defaultTimeframe: z.enum(["week", "month", "quarter", "year", "long_term"]),
    countToday: z.boolean(),
    streakFreeze: z.coerce.number().int().min(0).max(31),
    dayCutoffHour: z.coerce.number().int().min(0).max(12),
    hideCompleted: z.boolean(),

    sync: z.boolean(),
    biometricLock: z.boolean(),
    analytics: z.boolean(),
  })
  .partial();

export type SettingsInput = z.input<typeof settingsInput>;

/** Guarda solo los campos enviados: la pantalla de ajustes va uno a uno. */
export async function updateSettingsAction(input: SettingsInput) {
  const user = await requireUser();
  const parsed = settingsInput.safeParse(input);
  if (!parsed.success) return { error: "invalid" as const };

  const data = parsed.data;
  if (!Object.keys(data).length) return { ok: true as const };

  await db
    .update(userSettings)
    .set(data)
    .where(eq(userSettings.userId, user.id));

  /* El idioma también viaja en cookie para las pantallas sin sesión. */
  if (data.locale) {
    const store = await cookies();
    store.set(LOCALE_COOKIE, data.locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  revalidatePath("/", "layout");
  return { ok: true as const };
}

const categoryInput = z.object({
  name: z.string().trim().min(1).max(60),
  nameEn: z.string().trim().max(60).nullish(),
  emoji: z.string().trim().min(1).max(8).default("🎯"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
});

export async function createCategoryAction(input: z.input<typeof categoryInput>) {
  const user = await requireUser();
  const parsed = categoryInput.safeParse(input);
  if (!parsed.success) return { error: "invalid" as const };

  const [{ value: currentMax }] = await db
    .select({ value: max(categories.sortOrder) })
    .from(categories)
    .where(eq(categories.userId, user.id));

  await db.insert(categories).values({
    userId: user.id,
    name: parsed.data.name,
    nameEn: parsed.data.nameEn || null,
    emoji: parsed.data.emoji,
    color: parsed.data.color,
    sortOrder: (currentMax ?? 0) + 1,
  });

  revalidatePath("/more/categories");
  revalidatePath("/goals");
  return { ok: true as const };
}

export async function updateCategoryAction(
  categoryId: string,
  input: z.input<typeof categoryInput>,
) {
  const user = await requireUser();
  const parsed = categoryInput.safeParse(input);
  if (!parsed.success) return { error: "invalid" as const };

  await db
    .update(categories)
    .set({
      name: parsed.data.name,
      nameEn: parsed.data.nameEn || null,
      emoji: parsed.data.emoji,
      color: parsed.data.color,
    })
    .where(and(eq(categories.id, categoryId), eq(categories.userId, user.id)));

  revalidatePath("/more/categories");
  revalidatePath("/goals");
  return { ok: true as const };
}

export async function deleteCategoryAction(categoryId: string) {
  const user = await requireUser();
  await db
    .delete(categories)
    .where(and(eq(categories.id, categoryId), eq(categories.userId, user.id)));

  revalidatePath("/more/categories");
  revalidatePath("/goals");
  return { ok: true as const };
}
