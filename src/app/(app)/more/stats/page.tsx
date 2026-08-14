import { redirect } from "next/navigation";
import { and, eq, gte } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { SubHeader } from "@/components/shell/sub-header";
import { getGoals, getHabits, getSettings, resolveToday } from "@/lib/queries";
import { addDays } from "@/lib/dates";
import { goalPercent, habitStreak, isEntryComplete, isHabitScheduled } from "@/lib/domain";

const COPY = {
  es: {
    title: "Estadísticas",
    goals: "METAS",
    active: "Activas",
    completed: "Completadas",
    paused: "En pausa",
    avgProgress: "Avance promedio",
    habits: "HÁBITOS",
    compliance: "Cumplimiento (30 días)",
    bestStreak: "Mejor racha activa",
    tracked: "Hábitos en seguimiento",
    tasks: "TAREAS",
    doneWeek: "Completadas esta semana",
    pending: "Pendientes",
    days: "días",
    empty: "Todavía no hay suficientes datos. Vuelve en unos días.",
  },
  en: {
    title: "Statistics",
    goals: "GOALS",
    active: "Active",
    completed: "Completed",
    paused: "Paused",
    avgProgress: "Average progress",
    habits: "HABITS",
    compliance: "Compliance (30 days)",
    bestStreak: "Best active streak",
    tracked: "Habits tracked",
    tasks: "TASKS",
    doneWeek: "Completed this week",
    pending: "Pending",
    days: "days",
    empty: "Not enough data yet. Come back in a few days.",
  },
};

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card flex flex-col gap-1 p-4">
      <div className="tabular text-[28px] font-bold tracking-[-0.02em]">{value}</div>
      <div className="text-[13px] font-medium text-[var(--t2)]">{label}</div>
    </div>
  );
}

export default async function StatsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/welcome");
  const userId = session.user.id;

  const settings = await getSettings(userId);
  const today = resolveToday(settings);
  const c = COPY[settings.locale];

  const from = addDays(today, -29);

  const [goals, habits, weekTasks, pendingTasks] = await Promise.all([
    getGoals(userId, { includeArchived: true }),
    getHabits(userId, from, today),
    db
      .select({ id: tasks.id })
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, userId),
          eq(tasks.done, true),
          gte(tasks.doneAt, new Date(Date.now() - 7 * 86_400_000)),
        ),
      ),
    db
      .select({ id: tasks.id })
      .from(tasks)
      .where(and(eq(tasks.userId, userId), eq(tasks.done, false))),
  ]);

  const active = goals.filter((g) => g.status === "active");
  const completed = goals.filter((g) => g.status === "completed");
  const paused = goals.filter((g) => g.status === "paused");

  const avg = active.length
    ? Math.round(
        active.reduce((sum, g) => sum + goalPercent(g, g.milestones), 0) / active.length,
      )
    : 0;

  /* Cumplimiento: días cerrados sobre días en que tocaba, en el último mes. */
  let scheduled = 0;
  let met = 0;
  for (const h of habits) {
    for (let i = 0; i < 30; i++) {
      const date = addDays(from, i);
      if (!isHabitScheduled(h, date)) continue;
      scheduled++;
      if (isEntryComplete(h, h.entries.get(date) ?? 0)) met++;
    }
  }
  const compliance = scheduled ? Math.round((met / scheduled) * 100) : 0;

  const bestStreak = habits.reduce(
    (best, h) => Math.max(best, habitStreak(h, h.entries, today, settings.countToday)),
    0,
  );

  const nothing = !goals.length && !habits.length && !pendingTasks.length;

  return (
    <>
      <SubHeader title={c.title} />

      {nothing ? (
        <div className="card px-5 py-8 text-center text-pretty text-[15px] text-[var(--t2)]">
          {c.empty}
        </div>
      ) : (
        <div className="flex flex-col gap-[18px]">
          <section className="flex flex-col gap-3">
            <div className="eyebrow px-0.5">{c.goals}</div>
            <div className="ms-grid">
              <Stat label={c.active} value={String(active.length)} />
              <Stat label={c.completed} value={String(completed.length)} />
              <Stat label={c.paused} value={String(paused.length)} />
              <Stat label={c.avgProgress} value={`${avg}%`} />
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <div className="eyebrow px-0.5">{c.habits}</div>
            <div className="ms-grid">
              <Stat label={c.compliance} value={`${compliance}%`} />
              <Stat label={c.bestStreak} value={`${bestStreak} ${c.days}`} />
              <Stat label={c.tracked} value={String(habits.length)} />
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <div className="eyebrow px-0.5">{c.tasks}</div>
            <div className="ms-grid">
              <Stat label={c.doneWeek} value={String(weekTasks.length)} />
              <Stat label={c.pending} value={String(pendingTasks.length)} />
            </div>
          </section>
        </div>
      )}
    </>
  );
}
