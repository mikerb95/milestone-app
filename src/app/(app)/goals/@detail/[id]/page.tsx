import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { GoalDetail } from "@/components/goals/goal-detail";
import { getGoalDetail, getSettings } from "@/lib/queries";
import { categoryName } from "@/lib/defaults";
import { goalPercent } from "@/lib/domain";
import { timeframePlain, tr } from "@/lib/i18n";

export default async function GoalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/welcome");

  const { id } = await params;
  const [settings, goal] = await Promise.all([
    getSettings(session.user.id),
    getGoalDetail(session.user.id, id),
  ]);

  if (!goal) notFound();

  return (
    <GoalDetail
      goal={{
        id: goal.id,
        title: goal.title,
        description: goal.description,
        why: goal.why,
        type: goal.type,
        timeframe: goal.timeframe,
        timeframeLabel: tr(timeframePlain, goal.timeframe, settings.locale),
        status: goal.status,
        trend: goal.trend,
        currentValue: goal.currentValue,
        targetValue: goal.targetValue,
        startValue: goal.startValue,
        unit: goal.unit,
        targetDate: goal.targetDate,
        percent: goalPercent(goal, goal.milestones),
        category: goal.category
          ? {
              name: categoryName(goal.category, settings.locale),
              emoji: goal.category.emoji,
              color: goal.category.color,
            }
          : null,
        milestones: goal.milestones.map((m) => ({
          id: m.id,
          title: m.title,
          done: m.done,
        })),
        updates: goal.updates,
      }}
    />
  );
}
