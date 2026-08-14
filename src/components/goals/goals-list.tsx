import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { TopBar } from "@/components/shell/top-bar";
import { GoalCard } from "@/components/cards/goal-card";
import { getGoals, getSettings, type GoalWithMeta } from "@/lib/queries";
import { categoryName } from "@/lib/defaults";
import { goalPercent, goalRawLabel } from "@/lib/domain";
import { t, timeframeLabels, tr, type Locale } from "@/lib/i18n";

const ORDER = ["week", "month", "quarter", "year", "long_term"] as const;

function toCardData(g: GoalWithMeta, locale: Locale) {
  const next = g.milestones.find((m) => !m.done);
  return {
    id: g.id,
    title: g.title,
    description: g.description,
    status: g.status,
    trend: g.trend,
    type: g.type,
    currentValue: g.currentValue,
    targetValue: g.targetValue,
    unit: g.unit,
    targetDate: g.targetDate,
    percent: goalPercent(g, g.milestones),
    rawLabel: goalRawLabel(g, g.milestones, locale),
    nextMilestone: next?.title ?? null,
    category: g.category
      ? {
          name: categoryName(g.category, locale),
          emoji: g.category.emoji,
          color: g.category.color,
        }
      : null,
  };
}

export async function GoalsList() {
  const session = await auth();
  if (!session?.user?.id) redirect("/welcome");

  const settings = await getSettings(session.user.id);
  const d = t(settings.locale);
  const goals = await getGoals(session.user.id, {
    hideCompleted: settings.hideCompleted,
  });

  const groups = ORDER.map((tf) => ({
    key: tf,
    label: tr(timeframeLabels, tf, settings.locale),
    goals: goals.filter((g) => g.timeframe === tf),
  })).filter((g) => g.goals.length);

  return (
    <>
      <TopBar title={d.goals} />

      {groups.length === 0 ? (
        <div className="card px-5 py-8 text-center text-pretty text-[15px] text-[var(--t2)]">
          {d.noGoals}
        </div>
      ) : (
        <div className="flex flex-col gap-[18px]">
          {groups.map((grp) => (
            <section key={grp.key} className="flex flex-col gap-3">
              <div className="flex items-center gap-2 px-0.5">
                <span className="eyebrow">{grp.label}</span>
                <span
                  className="grid h-[19px] min-w-[19px] place-items-center rounded-full px-1.5 text-[11px] font-semibold text-[var(--t2)]"
                  style={{ background: "var(--g2)", border: "1px solid var(--gbd)" }}
                >
                  {grp.goals.length}
                </span>
              </div>
              <div className="ms-grid">
                {grp.goals.map((g) => (
                  <GoalCard key={g.id} goal={toCardData(g, settings.locale)} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
