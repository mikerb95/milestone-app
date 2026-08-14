import Link from "next/link";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db";
import { habitEntries, habits } from "@/db/schema";
import { TopBar } from "@/components/shell/top-bar";
import { HabitPill } from "@/components/cards/habit-pill";
import { TaskRow } from "@/components/cards/task-row";
import { getSettings, getStaleGoals, getTasks, resolveToday } from "@/lib/queries";
import { formatDayLong } from "@/lib/dates";
import {
  STALE_DAYS,
  daysSinceProgress,
  isEntryComplete,
  isHabitScheduled,
} from "@/lib/domain";
import { t } from "@/lib/i18n";

export default async function TodayPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/welcome");
  const userId = session.user.id;

  const settings = await getSettings(userId);
  const today = resolveToday(settings);
  const d = t(settings.locale);

  const [habitRows, entryRows, allTasks, stale] = await Promise.all([
    db
      .select()
      .from(habits)
      .where(and(eq(habits.userId, userId), eq(habits.archived, false))),
    db
      .select({ habitId: habitEntries.habitId, value: habitEntries.value })
      .from(habitEntries)
      .innerJoin(habits, eq(habitEntries.habitId, habits.id))
      .where(and(eq(habits.userId, userId), eq(habitEntries.date, today))),
    getTasks(userId, { includeDone: true }),
    getStaleGoals(userId, new Date(Date.now() - STALE_DAYS * 86_400_000)),
  ]);

  const values = new Map(entryRows.map((e) => [e.habitId, e.value]));

  const todayHabits = habitRows
    .filter((h) => isHabitScheduled(h, today))
    .slice(0, 6)
    .map((h) => ({
      id: h.id,
      name: h.name,
      emoji: h.emoji,
      color: h.color,
      complete: isEntryComplete(h, values.get(h.id) ?? 0),
    }));

  /* Lo vencido se muestra junto a lo de hoy: esconderlo no lo resuelve. */
  const todayTasks = allTasks.filter(
    (k) => k.dueDate !== null && k.dueDate <= today && (!k.done || k.dueDate === today),
  );

  const total = todayHabits.length + todayTasks.length;
  const doneCount =
    todayHabits.filter((h) => h.complete).length + todayTasks.filter((k) => k.done).length;
  const remaining = total - doneCount;
  const dayPct = total ? Math.round((doneCount / total) * 100) : 0;

  const circumference = 213.6;
  const ringOffset = circumference - (circumference * dayPct) / 100;

  const name = session.user.name?.trim().split(" ")[0] ?? "";

  const summary =
    total === 0
      ? d.nothingToday
      : remaining === 0
        ? d.allDoneToday
        : remaining === 1
          ? d.oneThingLeft
          : d.thingsLeft(remaining);

  return (
    <>
      <TopBar title={d.today} />

      <div className="flex flex-col gap-3">
        <section className="card flex items-center gap-4 px-4 py-[18px]">
          <div className="flex min-w-0 flex-1 flex-col gap-[5px]">
            <div className="text-[11px] font-semibold uppercase tracking-[0.09em] text-[var(--t3)]">
              {formatDayLong(today, settings.locale)}
            </div>
            <div className="text-[22px] font-bold tracking-[-0.02em]">
              {name ? `${d.greeting}, ${name}` : d.greeting}
            </div>
            <div className="text-pretty text-[15px] text-[var(--t2)]">{summary}</div>
          </div>

          <div className="relative h-[82px] w-[82px] flex-none">
            <svg
              width="82"
              height="82"
              viewBox="0 0 82 82"
              style={{ transform: "rotate(-90deg)" }}
              aria-hidden
            >
              <circle
                cx="41"
                cy="41"
                r="34"
                fill="none"
                stroke="rgba(255,255,255,0.10)"
                strokeWidth="8"
              />
              <circle
                cx="41"
                cy="41"
                r="34"
                fill="none"
                stroke="#34D399"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={ringOffset}
                style={{ transition: "stroke-dashoffset .7s var(--ease-ms)" }}
              />
            </svg>
            <div className="tabular absolute inset-0 grid place-items-center text-[19px] font-bold tracking-[-0.02em]">
              {dayPct}%
            </div>
          </div>
        </section>

        {total > 0 && remaining === 0 ? (
          <section className="card flex flex-col items-center gap-3 px-5 py-7 text-center">
            <div
              className="grid h-[72px] w-[72px] place-items-center rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 50% 35%,rgba(52,211,153,.45),rgba(52,211,153,.08))",
                animation: "msPop .5s var(--ease-ms)",
              }}
            >
              <svg
                width="34"
                height="34"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#34D399"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12.8l4.4 4.4L19 7.6" />
              </svg>
            </div>
            <div className="text-[19px] font-bold">{d.allDone}</div>
            <div className="max-w-[280px] text-pretty text-sm text-[var(--t2)]">
              {d.allDoneSub}
            </div>
          </section>
        ) : null}

        {todayHabits.length ? (
          <>
            <div className="eyebrow px-0.5 pt-2">{d.todayHabits}</div>
            <div className="no-scrollbar flex gap-2.5 overflow-x-auto p-0.5">
              {todayHabits.map((h) => (
                <HabitPill key={h.id} habit={h} />
              ))}
            </div>
          </>
        ) : null}

        {todayTasks.length ? (
          <>
            <div className="eyebrow px-0.5 pt-2">{d.todayTasks}</div>
            <div className="flex flex-col gap-2">
              {todayTasks.map((k) => (
                <TaskRow key={k.id} task={k} />
              ))}
            </div>
          </>
        ) : null}

        {stale.length ? (
          <>
            <div className="eyebrow px-0.5 pt-2">{d.goalsToUpdate}</div>
            <div className="flex flex-col gap-2">
              {stale.map((g) => {
                const days = daysSinceProgress(g, today);
                const color = g.category?.color ?? "#6C8CF5";
                return (
                  <Link
                    key={g.id}
                    href={`/goals/${g.id}`}
                    className="card card-hover flex items-center gap-3 px-4 py-3.5 text-left"
                  >
                    <span
                      className="grid h-[38px] w-[38px] flex-none place-items-center rounded-xl text-lg"
                      style={{ background: color + "26", border: `1px solid ${color}3D` }}
                    >
                      {g.category?.emoji ?? "🎯"}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="truncate text-[15px] font-semibold">{g.title}</span>
                      <span className="text-[13px] font-medium text-[var(--t3)]">
                        {days === null ? d.neverUpdated : d.staleNote(days)}
                      </span>
                    </span>
                    <span className="text-[13px] font-semibold text-[var(--t2)]">›</span>
                  </Link>
                );
              })}
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}
