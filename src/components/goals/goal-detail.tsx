"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useApp } from "@/components/app-provider";
import { useSheets } from "@/components/sheets/sheet-provider";
import { useToast } from "@/components/ui/toast";
import { PencilIcon } from "@/components/shell/nav-icons";
import {
  addMilestoneAction,
  deleteGoalAction,
  deleteMilestoneAction,
  setGoalStatusAction,
  toggleMilestoneAction,
} from "@/actions/goals";
import { formatDate, formatNumber, timeLeftLabel } from "@/lib/dates";

/** Los tonos claros necesitan texto oscuro para que el botón siga legible. */
const LIGHT_ACCENTS = ["#F2C94C", "#34D399", "#A78BFA", "#FF8A5B", "#F472B6"];

export type GoalDetailData = {
  id: string;
  title: string;
  description: string | null;
  why: string | null;
  type: "numeric" | "percent" | "milestone" | "binary";
  timeframe: string;
  timeframeLabel: string;
  status: "active" | "paused" | "completed";
  trend: "improving" | "steady" | "behind" | "risk";
  currentValue: number;
  targetValue: number;
  startValue: number;
  unit: string | null;
  targetDate: string | null;
  percent: number;
  category: { name: string; emoji: string; color: string } | null;
  /* Sueltos además de `category`: el formulario de edición los necesita para
     no reescribirlos con sus valores por defecto. */
  categoryId: string | null;
  reminder: boolean;
  milestones: { id: string; title: string; done: boolean }[];
  updates: { id: string; value: number; note: string | null; date: string }[];
};

export function GoalDetail({ goal }: { goal: GoalDetailData }) {
  const router = useRouter();
  const { t, locale, today } = useApp();
  const { open } = useSheets();
  const { toast } = useToast();
  const [, startTransition] = useTransition();

  const [msState, setMsState] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(goal.milestones.map((m) => [m.id, m.done])),
  );
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  const color = goal.category?.color ?? "#6C8CF5";
  const lightAccent = LIGHT_ACCENTS.includes(color);

  const doneCount = goal.milestones.filter((m) => msState[m.id]).length;
  const percent =
    goal.type === "milestone" && goal.milestones.length
      ? Math.round((doneCount / goal.milestones.length) * 100)
      : goal.percent;

  const of = locale === "es" ? "de" : "of";

  const big =
    goal.type === "milestone"
      ? String(doneCount)
      : goal.type === "percent"
        ? `${Math.round(goal.currentValue)}%`
        : `${formatNumber(goal.currentValue, locale)}${goal.unit ? " " + goal.unit : ""}`;

  const small =
    goal.type === "milestone"
      ? `${of} ${goal.milestones.length}`
      : goal.type === "percent"
        ? `${of} 100%`
        : `${of} ${formatNumber(goal.targetValue, locale)}${goal.unit ? " " + goal.unit : ""}`;

  const delta =
    goal.type === "milestone"
      ? `+${doneCount} ${goal.unit ?? ""}`.trim()
      : goal.type === "percent"
        ? `+${Math.round(goal.currentValue - goal.startValue)}%`
        : `+${formatNumber(goal.currentValue - goal.startValue, locale)}${goal.unit ? " " + goal.unit : ""}`;

  const trendLabel =
    goal.trend === "improving"
      ? t.improving
      : goal.trend === "steady"
        ? t.steady
        : goal.trend === "behind"
          ? t.behind
          : t.risk;

  const trendColor =
    goal.trend === "improving"
      ? "#34D399"
      : goal.trend === "steady"
        ? "rgba(255,255,255,.66)"
        : "#F2C94C";

  /* Los hitos pendientes van primero: es lo accionable. */
  const ordered = [
    ...goal.milestones.filter((m) => !msState[m.id]),
    ...goal.milestones.filter((m) => msState[m.id]),
  ];

  const close = () => router.push("/goals");

  const toggleMs = (id: string) => {
    setMsState((prev) => ({ ...prev, [id]: !prev[id] }));
    startTransition(async () => {
      await toggleMilestoneAction(id);
    });
  };

  const setStatus = (status: "active" | "paused" | "completed") => {
    startTransition(async () => {
      await setGoalStatusAction(goal.id, status);
      toast(
        status === "completed"
          ? t.goalCompleted
          : status === "paused"
            ? t.goalPaused
            : t.goalResumed,
      );
    });
  };

  const addMilestone = () => {
    const title = draft.trim();
    if (!title) return;
    setDraft("");
    setAdding(false);
    startTransition(async () => {
      await addMilestoneAction(goal.id, title);
    });
  };

  const removeMilestone = (id: string) => {
    startTransition(async () => {
      await deleteMilestoneAction(id);
    });
  };

  const remove = () => {
    if (!window.confirm(t.deleteGoalConfirm)) return;
    /* Volvemos a la lista antes de borrar: si no, el panel se queda pintando
       una meta que ya no existe mientras llega la revalidación. */
    router.push("/goals");
    startTransition(async () => {
      await deleteGoalAction(goal.id);
      toast(t.goalDeleted);
    });
  };

  const cta = () => {
    /* En metas por hitos la acción natural es sumar el siguiente paso. */
    if (goal.type === "milestone") {
      setAdding(true);
      return;
    }
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
  };

  return (
    <>
      {/* Tinte del color de la categoría, igual que en la maqueta. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-1"
        style={{
          background: `linear-gradient(180deg,${color} -10%,transparent 45%)`,
          opacity: 0.35,
        }}
      />

      <aside
        className="fixed inset-0 z-45 flex flex-col gap-3.5 overflow-y-auto px-4 pb-[calc(110px+env(safe-area-inset-bottom))] pt-4 xl:left-auto xl:right-0 xl:top-0 xl:bottom-0 xl:w-[440px] xl:border-l xl:border-[var(--gbd)] xl:px-6 xl:pb-10"
        style={{
          background:
            "linear-gradient(180deg,var(--bg-top) 0%,var(--bg-mid) 52%,var(--bg-bottom) 100%)",
          animation: "var(--animate-ms-in-a)",
        }}
        aria-label={goal.title}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={close}
            aria-label={locale === "es" ? "Volver" : "Back"}
            className="icon-btn text-lg"
          >
            ‹
          </button>
          <div className="min-w-0 flex-1 truncate text-center text-[17px] font-semibold">
            {goal.title}
          </div>
          <button
            type="button"
            aria-label={t.editGoal}
            className="icon-btn"
            onClick={() =>
              open({
                type: "goal",
                goalId: goal.id,
                initial: {
                  title: goal.title,
                  description: goal.description ?? "",
                  why: goal.why ?? "",
                  type: goal.type,
                  timeframe: goal.timeframe as
                    | "week"
                    | "month"
                    | "quarter"
                    | "year"
                    | "long_term",
                  targetValue: String(goal.targetValue),
                  unit: goal.unit ?? "",
                  targetDate: goal.targetDate ?? "",
                  categoryId: goal.categoryId,
                  reminder: goal.reminder,
                },
              })
            }
          >
            <PencilIcon />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {goal.category ? (
            <span
              className="inline-flex items-center gap-0.5 rounded-full px-3.5 py-[7px] text-sm font-semibold"
              style={{
                background: color + "2E",
                border: `1px solid ${color}55`,
                color,
              }}
            >
              {goal.category.emoji}&nbsp;&nbsp;{goal.category.name}
            </span>
          ) : null}
          <span className="text-sm font-medium text-[var(--t2)]">
            {goal.timeframeLabel}
          </span>
        </div>

        <div className="card flex flex-col gap-3 px-4 py-[18px]">
          <div className="flex items-end gap-2.5">
            <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-2">
              <span className="tabular text-[40px] font-bold leading-none tracking-[-0.02em]">
                {big}
              </span>
              <span className="tabular text-base font-medium text-[var(--t2)]">
                {small}
              </span>
            </div>
            <span
              className="tabular flex-none rounded-full px-3 py-1.5 text-[15px] font-bold"
              style={{ background: color + "33", color }}
            >
              {percent}%
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[13px] font-medium text-[var(--t3)]">
            <span className="tabular">{delta}</span>
            {goal.targetDate ? (
              <>
                <span>·</span>
                <span>{timeLeftLabel(goal.targetDate, today, locale)}</span>
              </>
            ) : null}
            <span>·</span>
            <span className="font-semibold" style={{ color: trendColor }}>
              {goal.trend === "improving" ? "↗ " : ""}
              {trendLabel}
            </span>
          </div>

          <div className="relative flex h-3.5 items-center">
            <div
              className="h-2 w-full overflow-hidden rounded-full"
              style={{ background: "rgba(255,255,255,.10)" }}
            >
              <div
                className="h-full rounded-full transition-[width] duration-700"
                style={{
                  width: `${percent}%`,
                  background: color,
                  boxShadow: `0 0 12px ${color}77`,
                }}
              />
            </div>
            <div
              className="absolute h-3.5 w-3.5 rounded-full bg-white transition-[left] duration-700"
              style={{
                left: `calc(${percent}% - 7px)`,
                border: "1px solid rgba(0,0,0,.06)",
              }}
            />
          </div>

          {goal.targetDate ? (
            <div className="tabular text-right text-[13px] font-medium text-[var(--t3)]">
              {t.targetDate} {formatDate(goal.targetDate, locale)}
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={cta}
          className="h-[54px] rounded-2xl text-base font-bold transition-[transform,filter] duration-200 hover:scale-[1.02] hover:brightness-110 active:scale-[0.97]"
          style={{ background: color, color: lightAccent ? "#1A1A1A" : "#fff" }}
        >
          {goal.type === "milestone" ? t.addMilestone : t.logProgress}
        </button>

        {goal.why ? (
          <div className="flex flex-col gap-2.5">
            <div className="eyebrow">{t.why}</div>
            <div className="card text-pretty p-4 text-[15px] leading-relaxed text-[var(--t2)]">
              {goal.why}
            </div>
          </div>
        ) : null}

        {goal.type === "milestone" ? (
          <div className="flex flex-col gap-2.5">
            <div className="eyebrow">
              {t.milestones} ({doneCount}/{goal.milestones.length})
            </div>
            <div className="relative flex flex-col gap-2">
              {ordered.map((m, i) => {
                const isDone = msState[m.id];
                const isNext = !isDone && i === 0;
                return (
                  <div
                    key={m.id}
                    className="group relative flex w-full items-center rounded-2xl transition-colors"
                    style={{
                      background: isNext ? "var(--g2)" : "var(--g1)",
                      border: `1px solid ${isNext ? "var(--gbd)" : "transparent"}`,
                      backdropFilter: "var(--gb)",
                      WebkitBackdropFilter: "var(--gb)",
                    }}
                  >
                    {/* Hilo vertical que une los hitos en una línea de tiempo. */}
                    <span
                      aria-hidden
                      className="absolute w-0.5 transition-colors duration-500"
                      style={{
                        left: "27px",
                        top: i === 0 ? "50%" : 0,
                        bottom: i === ordered.length - 1 ? "50%" : 0,
                        background: isDone ? color + "99" : "rgba(255,255,255,.14)",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => toggleMs(m.id)}
                      role="checkbox"
                      aria-checked={isDone}
                      className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl px-4 py-3.5 text-left active:scale-[0.98]"
                    >
                      <span
                        className="relative grid h-[22px] w-[22px] flex-none place-items-center rounded-full"
                        style={{
                          background: isDone ? color : "transparent",
                          border: isDone
                            ? `1px solid ${color}`
                            : "1.6px solid rgba(255,255,255,.38)",
                        }}
                      >
                        <span
                          className="text-xs font-extrabold text-[#0B1038] transition-opacity duration-200"
                          style={{ opacity: isDone ? 1 : 0 }}
                        >
                          ✓
                        </span>
                      </span>
                      <span
                        className="min-w-0 flex-1 text-pretty text-[15px]"
                        style={{
                          fontWeight: isNext ? 600 : 500,
                          color: isDone ? "var(--t2)" : "var(--t1)",
                        }}
                      >
                        {m.title}
                      </span>
                    </button>

                    {isNext ? (
                      <span
                        className="flex-none rounded-full px-2.5 py-[3px] text-[10px] font-semibold tracking-[0.09em] text-[var(--t2)]"
                        style={{ background: "var(--g2)", border: "1px solid var(--gbd)" }}
                      >
                        {t.next}
                      </span>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => removeMilestone(m.id)}
                      aria-label={t.delete}
                      className="flex-none px-3 text-[var(--t3)] opacity-0 transition-[opacity,color] focus-visible:opacity-100 group-hover:opacity-100 hover:text-[var(--danger)]"
                    >
                      ×
                    </button>
                  </div>
                );
              })}

              {adding ? (
                <div className="flex gap-2 pt-1">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addMilestone();
                      }
                      if (e.key === "Escape") setAdding(false);
                    }}
                    placeholder={t.milestonePh}
                    className="field flex-1"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={addMilestone}
                    aria-label={t.addMilestone}
                    className="grid h-12 w-12 flex-none place-items-center rounded-2xl text-xl transition-colors hover:bg-[var(--g3)]"
                    style={{ background: "var(--g2)", border: "1px solid var(--gbd)" }}
                  >
                    +
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {goal.updates.length ? (
          <div className="flex flex-col gap-2.5">
            <div className="eyebrow">{t.updates}</div>
            <div className="card overflow-hidden">
              {goal.updates.map((u, i) => (
                <div
                  key={u.id}
                  className="flex items-start gap-3 px-4 py-3.5"
                  style={{
                    borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,.07)",
                  }}
                >
                  <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
                    <span className="tabular text-base font-bold">
                      {goal.type === "percent"
                        ? `${Math.round(u.value)}%`
                        : `${formatNumber(u.value, locale)}${goal.unit ? " " + goal.unit : ""}`}
                    </span>
                    {u.note ? (
                      <span className="text-pretty text-sm text-[var(--t2)]">
                        {u.note}
                      </span>
                    ) : null}
                  </span>
                  <span className="tabular whitespace-nowrap text-[13px] font-medium text-[var(--t3)]">
                    {formatDate(u.date, locale)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-2.5 pb-2">
          <div className="eyebrow">{t.status}</div>
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => setStatus(goal.status === "completed" ? "active" : "completed")}
              className="flex h-[50px] flex-1 items-center justify-center gap-2 rounded-2xl text-[15px] font-semibold transition-colors active:scale-[0.97]"
              style={{
                background: "rgba(52,211,153,.14)",
                border: "1px solid rgba(52,211,153,.32)",
                color: "#34D399",
              }}
            >
              ✓ {goal.status === "completed" ? t.reopen : t.complete}
            </button>
            <button
              type="button"
              onClick={() => setStatus(goal.status === "paused" ? "active" : "paused")}
              className="flex h-[50px] flex-1 items-center justify-center gap-2 rounded-2xl text-[15px] font-semibold transition-colors active:scale-[0.97]"
              style={{
                background: "rgba(242,201,76,.14)",
                border: "1px solid rgba(242,201,76,.32)",
                color: "#F2C94C",
              }}
            >
              ⏸ {goal.status === "paused" ? t.resume : t.pause}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
