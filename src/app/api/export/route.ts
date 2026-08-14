import { eq, inArray } from "drizzle-orm";
import { auth } from "@/auth";
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

/** Exporta todo lo del usuario en un JSON descargable. */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }
  const userId = session.user.id;

  const [cats, goalRows, habitRows, taskRows, settings] = await Promise.all([
    db.select().from(categories).where(eq(categories.userId, userId)),
    db.select().from(goals).where(eq(goals.userId, userId)),
    db.select().from(habits).where(eq(habits.userId, userId)),
    db.select().from(tasks).where(eq(tasks.userId, userId)),
    db.select().from(userSettings).where(eq(userSettings.userId, userId)),
  ]);

  const goalIds = goalRows.map((g) => g.id);
  const habitIds = habitRows.map((h) => h.id);
  const taskIds = taskRows.map((k) => k.id);

  const [ms, ups, entries, subs] = await Promise.all([
    goalIds.length
      ? db.select().from(milestones).where(inArray(milestones.goalId, goalIds))
      : [],
    goalIds.length
      ? db.select().from(goalUpdates).where(inArray(goalUpdates.goalId, goalIds))
      : [],
    habitIds.length
      ? db.select().from(habitEntries).where(inArray(habitEntries.habitId, habitIds))
      : [],
    taskIds.length
      ? db.select().from(subtasks).where(inArray(subtasks.taskId, taskIds))
      : [],
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    version: 1,
    settings: settings[0] ?? null,
    categories: cats,
    goals: goalRows,
    milestones: ms,
    goalUpdates: ups,
    habits: habitRows,
    habitEntries: entries,
    tasks: taskRows,
    subtasks: subs,
  };

  const date = new Date().toISOString().slice(0, 10);

  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="milestone-${date}.json"`,
      "cache-control": "no-store",
    },
  });
}
