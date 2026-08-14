"use client";

import { useRouter } from "next/navigation";
import { useApp } from "@/components/app-provider";
import { useSheets } from "@/components/sheets/sheet-provider";
import { timeLeftLabel } from "@/lib/dates";

export type GoalCardData = {
  id: string;
  title: string;
  description: string | null;
  status: "active" | "paused" | "completed";
  trend: "improving" | "steady" | "behind" | "risk";
  type: "numeric" | "percent" | "milestone" | "binary";
  currentValue: number;
  targetValue: number;
  unit: string | null;
  targetDate: string | null;
  percent: number;
  rawLabel: string;
  nextMilestone: string | null;
  category: { name: string; emoji: string; color: string } | null;
};

export function GoalCard({ goal }: { goal: GoalCardData }) {
  const router = useRouter();
  const { t, locale, today } = useApp();
  const { open } = useSheets();

  const color = goal.category?.color ?? "#6C8CF5";

  /* El diseño combina estado y tendencia en una sola etiqueta. */
  const statusColor =
    goal.status === "completed"
      ? "#34D399"
      : goal.status === "paused"
        ? "var(--t3)"
        : goal.trend === "improving"
          ? "#34D399"
          : goal.trend === "behind" || goal.trend === "risk"
            ? "#F2C94C"
            : "var(--t2)";

  const statusLabel =
    goal.status === "completed"
      ? t.statusDone
      : goal.status === "paused"
        ? t.statusPaused
        : goal.trend === "improving"
          ? `↗ ${t.statusActive}`
          : t.statusActive;

  const openDetail = () => router.push(`/goals/${goal.id}`);

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={openDetail}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openDetail();
        }
      }}
      className="card card-hover flex cursor-pointer flex-col gap-3.5 p-4 focus-visible:outline-2 focus-visible:outline-[var(--acc)] focus-visible:outline-offset-2"
    >
      <div className="flex items-start gap-3">
        <span
          className="grid h-[38px] w-[38px] flex-none place-items-center rounded-xl text-lg"
          style={{ background: color + "26", border: `1px solid ${color}3D` }}
        >
          {goal.category?.emoji ?? "🎯"}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
          <span className="text-pretty text-[17px] font-semibold tracking-[-0.01em]">
            {goal.title}
          </span>
          {goal.description ? (
            <span className="truncate text-[15px] text-[var(--t2)]">
              {goal.description}
            </span>
          ) : null}
        </span>
        <span
          className="flex-none whitespace-nowrap text-[11px] font-bold tracking-[0.06em]"
          style={{ color: statusColor }}
        >
          {statusLabel}
        </span>
      </div>

      <div className="flex flex-col gap-[7px]">
        <div className="flex items-baseline justify-between gap-2.5">
          <span className="tabular text-[13px] font-semibold text-[var(--t2)]">
            {goal.rawLabel}
          </span>
          <span
            className="tabular text-[13px] font-bold"
            style={{ color: goal.percent >= 100 ? "#34D399" : "var(--t1)" }}
          >
            {goal.percent}%
          </span>
        </div>

        <div
          className="h-1.5 overflow-hidden rounded-full"
          style={{ background: "rgba(255,255,255,.10)" }}
        >
          <div
            className="h-full rounded-full transition-[width] duration-700"
            style={{
              width: `${goal.percent}%`,
              background: `linear-gradient(90deg,${color},${color}CC)`,
            }}
          />
        </div>

        {goal.nextMilestone ? (
          <div className="flex items-center gap-2 pt-0.5">
            <span className="h-[14px] w-[14px] flex-none rounded-full border-[1.5px] border-white/35" />
            <span className="truncate text-[13px] font-medium text-[var(--t2)]">
              {goal.nextMilestone}
            </span>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {goal.category ? (
          <span
            className="rounded-full px-2.5 py-[3px] text-xs font-semibold"
            style={{
              background: color + "1F",
              border: `1px solid ${color}44`,
              color,
            }}
          >
            {goal.category.name}
          </span>
        ) : null}
        {goal.targetDate ? (
          <>
            <span className="text-[13px] font-medium text-[var(--t3)]">·</span>
            <span className="text-[13px] font-medium text-[var(--t3)]">
              {timeLeftLabel(goal.targetDate, today, locale)}
            </span>
          </>
        ) : null}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            open({
              type: "log",
              target: {
                goalId: goal.id,
                title: goal.title,
                type: goal.type,
                currentValue: goal.currentValue,
                targetValue: goal.targetValue,
                unit: goal.unit,
                color,
              },
            });
          }}
          className="ml-auto flex h-8 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold transition-colors hover:bg-[var(--g3)] active:scale-[0.97]"
          style={{ background: "var(--g2)", border: "1px solid var(--gbd)" }}
        >
          {t.update} ›
        </button>
      </div>
    </div>
  );
}
