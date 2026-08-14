import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { TopBar } from "@/components/shell/top-bar";
import { HabitWeekCard } from "@/components/habits/habit-week-card";
import { HabitYearCard } from "@/components/habits/habit-year-card";
import { ViewToggle, WeekNav } from "@/components/habits/habits-controls";
import { getHabits, getSettings, resolveToday, weekRange } from "@/lib/queries";
import {
  addDays,
  formatWeekRange,
  parseISO,
  toISO,
  weekStart,
} from "@/lib/dates";
import {
  habitStreak,
  habitTypeLabel,
  heatLevel,
  isEntryComplete,
  isHabitScheduled,
} from "@/lib/domain";
import { intlLocale, t } from "@/lib/i18n";

/** Semanas que abarca el mapa de calor anual. */
const YEAR_WEEKS = 33;

export default async function HabitsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; w?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/welcome");

  const { view: viewParam, w } = await searchParams;
  const view = viewParam === "year" ? "year" : "week";
  const offset = Math.min(0, Number(w) || 0);

  const settings = await getSettings(session.user.id);
  const today = resolveToday(settings);
  const d = t(settings.locale);

  const monday = weekStart(today, 1);
  const { start, end } = weekRange(today, offset, 1);

  /* La vista anual necesita el histórico completo; la semanal, ocho semanas
     para que la racha tenga con qué contar. */
  const from = view === "year" ? addDays(monday, -YEAR_WEEKS * 7) : addDays(start, -60);
  const to = view === "year" ? addDays(monday, 6) : end;

  const habits = await getHabits(session.user.id, from, to);

  const topBar = (
    <TopBar title={d.habits} extra={<ViewToggle view={view} />} />
  );

  if (!habits.length) {
    return (
      <>
        {topBar}
        <div className="card px-5 py-8 text-center text-pretty text-[15px] text-[var(--t2)]">
          {d.noHabits}
        </div>
      </>
    );
  }

  if (view === "year") {
    const monthFmt = new Intl.DateTimeFormat(intlLocale(settings.locale), {
      month: "short",
    });

    const cards = habits.map((h) => {
      const weeks = Array.from({ length: YEAR_WEEKS }, (_, wi) => {
        const weekStartIso = addDays(monday, -(YEAR_WEEKS - 1 - wi) * 7);
        const levels = Array.from({ length: 7 }, (_, di) => {
          const date = addDays(weekStartIso, di);
          if (date > today) return -1;
          return heatLevel(h, h.entries.get(date));
        });

        /* La etiqueta del mes solo aparece en la primera semana que lo abre. */
        const dt = parseISO(weekStartIso);
        const prev = parseISO(addDays(weekStartIso, -7));
        const month =
          wi === 0 || dt.getMonth() !== prev.getMonth()
            ? monthFmt.format(dt).replace(".", "")
            : "";

        return { month, levels };
      });

      return {
        id: h.id,
        name: h.name,
        emoji: h.emoji,
        color: h.color,
        total: h.total,
        streak: habitStreak(h, h.entries, today, settings.countToday),
        todayComplete: isEntryComplete(h, h.entries.get(today) ?? 0),
        weeks,
      };
    });

    return (
      <>
        {topBar}
        <div className="flex flex-col gap-3">
          {cards.map((h) => (
            <HabitYearCard key={h.id} habit={h} />
          ))}
        </div>
      </>
    );
  }

  const todayDate = parseISO(today);

  const cards = habits.map((h) => ({
    id: h.id,
    name: h.name,
    emoji: h.emoji,
    color: h.color,
    type: h.type,
    targetValue: h.targetValue,
    frequency: h.frequency,
    weeklyTarget: h.weeklyTarget,
    days: h.days,
    typeLabel: habitTypeLabel(h, settings.locale),
    streak: habitStreak(h, h.entries, today, settings.countToday),
    cells: Array.from({ length: 7 }, (_, i) => {
      const date = addDays(start, i);
      return {
        date,
        value: h.entries.get(date) ?? 0,
        scheduled: isHabitScheduled(h, date),
        future: parseISO(date) > todayDate,
      };
    }),
  }));

  return (
    <>
      {topBar}
      <div className="flex flex-col gap-3">
        <WeekNav
          offset={offset}
          rangeLabel={formatWeekRange(start, settings.locale)}
        />
        <div className="ms-grid">
          {cards.map((h) => (
            <HabitWeekCard key={h.id} habit={h} />
          ))}
        </div>
      </div>
    </>
  );
}
