import "server-only";
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
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { DEFAULT_CATEGORIES } from "./defaults";
import {
  ONBOARDING_TEMPLATES,
  SAMPLE_GOALS,
  SAMPLE_HABITS,
  SAMPLE_TASKS,
} from "./sample-data";
import { addDays, mondayIndex, todayISO, weekStart, type ISODate } from "./dates";
import type { Locale } from "./i18n";

/**
 * Toda cuenta nueva necesita sus ajustes y sus 6 categorías antes de poder
 * usar la app. Es idempotente: llamarla dos veces no duplica nada.
 */
export async function bootstrapUser(userId: string, locale: Locale = "es") {
  const existing = await db
    .select({ userId: userSettings.userId })
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .limit(1);

  if (existing.length) return;

  await db.insert(userSettings).values({ userId, locale }).onConflictDoNothing();

  await db
    .insert(categories)
    .values(
      DEFAULT_CATEGORIES.map((c, i) => ({
        userId,
        slug: c.slug,
        name: c.es,
        nameEn: c.en,
        emoji: c.emoji,
        color: c.color,
        sortOrder: i,
      })),
    )
    .onConflictDoNothing();
}

/**
 * Crea las metas y hábitos que el usuario eligió en el tercer paso del
 * onboarding, con los datos de la plantilla pero sin histórico inventado.
 */
export async function createFromTemplates(
  userId: string,
  templateKeys: string[],
  locale: Locale = "es",
  timezone = "America/Bogota",
) {
  if (!templateKeys.length) return;

  const today = todayISO(timezone);
  const chosen = ONBOARDING_TEMPLATES.filter((tpl) =>
    templateKeys.includes(tpl.key),
  );

  const cats = await db
    .select()
    .from(categories)
    .where(eq(categories.userId, userId));
  const catBySlug = new Map(cats.map((c) => [c.slug, c.id]));

  for (const [i, tpl] of chosen.entries()) {
    if ("goal" in tpl && tpl.goal) {
      const g = SAMPLE_GOALS.find((s) => s.key === tpl.goal);
      if (!g) continue;
      const [row] = await db
        .insert(goals)
        .values({
          userId,
          categoryId: catBySlug.get(g.category) ?? null,
          title: g.title[locale],
          description: g.desc[locale],
          why: g.why[locale],
          type: g.type,
          timeframe: g.timeframe,
          status: "active",
          trend: "steady",
          /* La plantilla aporta la meta, no el avance: se arranca en cero. */
          currentValue: 0,
          targetValue: g.target,
          unit: g.unit[locale],
          targetDate: addDays(today, g.targetInDays),
          sortOrder: i,
        })
        .returning({ id: goals.id });

      if (g.milestones?.length) {
        await db.insert(milestones).values(
          g.milestones.map((m, j) => ({
            goalId: row.id,
            title: m.t[locale],
            done: false,
            sortOrder: j,
          })),
        );
      }
    }

    if ("habit" in tpl && tpl.habit) {
      const h = SAMPLE_HABITS.find((s) => s.key === tpl.habit);
      if (!h) continue;
      await db.insert(habits).values({
        userId,
        name: h.name[locale],
        emoji: h.emoji,
        color: h.color,
        type: h.type,
        targetValue: h.target,
        frequency: h.frequency,
        days: h.days ? [...h.days] : null,
        sortOrder: i,
      });
    }
  }
}

/** RNG determinista: el mismo usuario siempre ve el mismo histórico. */
function seededRandom(seed: number) {
  let s = seed * 9301;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/**
 * Llena la cuenta con el conjunto de ejemplo del diseño: 6 metas, 7 hábitos
 * con ~7 meses de histórico y 10 tareas repartidas alrededor de hoy.
 */
export async function seedSampleData(
  userId: string,
  locale: Locale = "es",
  timezone = "America/Bogota",
) {
  const today = todayISO(timezone);

  const cats = await db
    .select()
    .from(categories)
    .where(eq(categories.userId, userId));
  const catBySlug = new Map(cats.map((c) => [c.slug, c.id]));

  /* --- Metas, hitos y actualizaciones --- */
  const goalIdByKey = new Map<string, string>();

  for (const [i, g] of SAMPLE_GOALS.entries()) {
    const lastUpdate = g.updates?.[0];
    const lastProgressAt = lastUpdate
      ? new Date(Date.now() - lastUpdate.daysAgo * 86_400_000)
      : new Date(Date.now() - 9 * 86_400_000);

    const [row] = await db
      .insert(goals)
      .values({
        userId,
        categoryId: catBySlug.get(g.category) ?? null,
        title: g.title[locale],
        description: g.desc[locale],
        why: g.why[locale],
        type: g.type,
        timeframe: g.timeframe,
        status: g.status,
        trend: g.trend,
        currentValue: g.current,
        targetValue: g.target,
        startValue: 0,
        unit: g.unit[locale],
        targetDate: addDays(today, g.targetInDays),
        sortOrder: i,
        lastProgressAt,
      })
      .returning({ id: goals.id });

    goalIdByKey.set(g.key, row.id);

    if (g.milestones?.length) {
      await db.insert(milestones).values(
        g.milestones.map((m, j) => ({
          goalId: row.id,
          title: m.t[locale],
          done: m.done,
          doneAt: m.done ? new Date(Date.now() - (j + 4) * 86_400_000) : null,
          sortOrder: j,
        })),
      );
    }

    if (g.updates?.length) {
      await db.insert(goalUpdates).values(
        g.updates.map((u) => ({
          goalId: row.id,
          value: u.v,
          note: u.note[locale],
          date: addDays(today, -u.daysAgo),
          createdAt: new Date(Date.now() - u.daysAgo * 86_400_000),
        })),
      );
    }
  }

  /* --- Hábitos y su histórico --- */
  const monday = weekStart(today, 1);
  const todayOffset = mondayIndex(today);

  for (const [i, h] of SAMPLE_HABITS.entries()) {
    const [row] = await db
      .insert(habits)
      .values({
        userId,
        name: h.name[locale],
        emoji: h.emoji,
        color: h.color,
        type: h.type,
        targetValue: h.target,
        frequency: h.frequency,
        weeklyTarget: h.frequency === "specific" ? (h.days?.length ?? 7) : 7,
        days: h.days ? [...h.days] : null,
        sortOrder: i,
      })
      .returning({ id: habits.id });

    const rnd = seededRandom(i + 2);
    const entries: { habitId: string; date: ISODate; value: number }[] = [];

    /* 30 semanas hacia atrás desde el lunes de esta semana. */
    for (let w = 30; w >= 1; w--) {
      const start = addDays(monday, -w * 7);
      for (let d = 0; d < 7; d++) {
        const date = addDays(start, d);
        if (h.days && !h.days.includes(d)) continue;
        const r = rnd();
        if (r > h.rate) continue;
        const value =
          h.type === "binary"
            ? 1
            : h.type === "count"
              ? Math.max(1, Math.round(h.target * (0.5 + r)))
              : Math.max(5, Math.round(h.target * (0.6 + r * 0.9)));
        entries.push({ habitId: row.id, date, value });
      }
    }

    /* La semana en curso usa los valores exactos del diseño, hasta hoy. */
    for (let d = 0; d <= todayOffset; d++) {
      const value = h.week[d];
      if (!value) continue;
      entries.push({ habitId: row.id, date: addDays(monday, d), value });
    }

    /* Turso limita el tamaño de cada lote, así que insertamos por trozos. */
    for (let c = 0; c < entries.length; c += 200) {
      await db
        .insert(habitEntries)
        .values(entries.slice(c, c + 200))
        .onConflictDoNothing();
    }
  }

  /* --- Tareas y subtareas --- */
  for (const [i, k] of SAMPLE_TASKS.entries()) {
    const [row] = await db
      .insert(tasks)
      .values({
        userId,
        goalId: k.goal ? (goalIdByKey.get(k.goal) ?? null) : null,
        title: k.title[locale],
        priority: k.priority,
        dueDate: k.dueInDays === null ? null : addDays(today, k.dueInDays),
        recurrence: k.recurrence ?? null,
        sortOrder: i,
      })
      .returning({ id: tasks.id });

    if (k.subs?.length) {
      await db.insert(subtasks).values(
        k.subs.map((s, j) => ({
          taskId: row.id,
          title: s.t[locale],
          done: s.done,
          sortOrder: j,
        })),
      );
    }
  }
}
