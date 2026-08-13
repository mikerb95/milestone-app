"use client";

import { useState, useTransition } from "react";
import { Sheet } from "@/components/ui/sheet";
import { Chip, Eyebrow } from "@/components/ui/chip";
import { useApp } from "@/components/app-provider";
import { useToast } from "@/components/ui/toast";
import { createTaskAction, updateTaskAction } from "@/actions/tasks";
import { PRIORITY_COLORS, priorityLabels, recurrenceLabels, tr } from "@/lib/i18n";
import type { GoalOption } from "./sheet-provider";

export type TaskSheetValues = {
  title: string;
  priority: "high" | "med" | "low";
  dueDate: string;
  goalId: string;
  recurrence: "" | "daily" | "weekly" | "monthly";
  subtasks: string[];
};

const PRIORITIES = ["high", "med", "low"] as const;
const RECURRENCES = ["daily", "weekly", "monthly"] as const;

export function TaskSheet({
  open,
  onClose,
  goalOptions,
  today,
  taskId,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  goalOptions: GoalOption[];
  today: string;
  taskId?: string;
  initial?: Partial<TaskSheetValues>;
}) {
  const { t, locale } = useApp();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [subDraft, setSubDraft] = useState("");

  const [v, setV] = useState<TaskSheetValues>({
    title: initial?.title ?? "",
    priority: initial?.priority ?? "med",
    dueDate: initial?.dueDate ?? today,
    goalId: initial?.goalId ?? "",
    recurrence: initial?.recurrence ?? "",
    subtasks: initial?.subtasks ?? [],
  });

  const set = <K extends keyof TaskSheetValues>(k: K, value: TaskSheetValues[K]) =>
    setV((prev) => ({ ...prev, [k]: value }));

  const addSub = () => {
    const title = subDraft.trim();
    if (!title) return;
    set("subtasks", [...v.subtasks, title]);
    setSubDraft("");
  };

  const submit = () => {
    if (!v.title.trim()) {
      setError(t.errRequired);
      return;
    }
    setError(null);
    startTransition(async () => {
      const payload = {
        title: v.title,
        priority: v.priority,
        dueDate: v.dueDate || null,
        goalId: v.goalId || null,
        recurrence: v.recurrence || null,
        subtasks: v.subtasks,
      };
      const res = taskId
        ? await updateTaskAction(taskId, payload)
        : await createTaskAction(payload);

      if ("error" in res && res.error) {
        setError(t.errGeneric);
        return;
      }
      toast(t.saved);
      onClose();
    });
  };

  return (
    <Sheet open={open} onClose={onClose} title={taskId ? t.newTask : t.newTask}>
      <div className="flex flex-col gap-3.5">
        <input
          value={v.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder={t.taskTitlePh}
          className="field h-[50px] text-base font-semibold"
          maxLength={200}
        />

        <div className="flex flex-wrap gap-2">
          {PRIORITIES.map((k) => (
            <Chip
              key={k}
              active={v.priority === k}
              color={PRIORITY_COLORS[k]}
              onClick={() => set("priority", k)}
            >
              {tr(priorityLabels, k, locale)}
            </Chip>
          ))}
        </div>

        <label
          className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3.5"
          style={{ background: "var(--g2)", border: "1px solid var(--gbd)" }}
        >
          <span className="text-[15px] font-medium">{t.dueDate}</span>
          <input
            type="date"
            value={v.dueDate}
            onChange={(e) => set("dueDate", e.target.value)}
            className="tabular bg-transparent text-[15px] text-[var(--t2)] outline-none"
          />
        </label>

        <label
          className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3.5"
          style={{ background: "var(--g2)", border: "1px solid var(--gbd)" }}
        >
          <span className="flex-none text-[15px] font-medium">{t.linkGoal}</span>
          <select
            value={v.goalId}
            onChange={(e) => set("goalId", e.target.value)}
            className="min-w-0 max-w-[55%] truncate bg-transparent text-right text-[15px] text-[var(--t2)] outline-none"
          >
            <option value="" className="bg-[#141C4F]">
              {t.none}
            </option>
            {goalOptions.map((g) => (
              <option key={g.id} value={g.id} className="bg-[#141C4F]">
                {g.title}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <Eyebrow>↻</Eyebrow>
          <Chip active={v.recurrence === ""} onClick={() => set("recurrence", "")}>
            {t.none}
          </Chip>
          {RECURRENCES.map((k) => (
            <Chip
              key={k}
              active={v.recurrence === k}
              onClick={() => set("recurrence", k)}
            >
              {tr(recurrenceLabels, k, locale)}
            </Chip>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          {v.subtasks.map((s, i) => (
            <div
              key={`${s}-${i}`}
              className="flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5"
              style={{ background: "var(--g2)", border: "1px solid var(--gbd)" }}
            >
              <span className="h-4 w-4 flex-none rounded-full border-[1.4px] border-white/28" />
              <span className="min-w-0 flex-1 text-sm">{s}</span>
              <button
                type="button"
                aria-label={t.delete}
                onClick={() =>
                  set(
                    "subtasks",
                    v.subtasks.filter((_, j) => j !== i),
                  )
                }
                className="text-[var(--t3)] transition-colors hover:text-[var(--danger)]"
              >
                ×
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              value={subDraft}
              onChange={(e) => setSubDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSub();
                }
              }}
              placeholder={t.addSubtask}
              className="field flex-1"
            />
            <button
              type="button"
              onClick={addSub}
              aria-label={t.addSubtask}
              className="grid h-12 w-12 flex-none place-items-center rounded-2xl text-xl transition-colors hover:bg-[var(--g3)]"
              style={{ background: "var(--g2)", border: "1px solid var(--gbd)" }}
            >
              +
            </button>
          </div>
        </div>

        {error ? (
          <p role="alert" className="text-[13px] font-medium text-[var(--danger)]">
            {error}
          </p>
        ) : null}

        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="btn-primary"
        >
          {pending ? t.saving : t.save}
        </button>
      </div>
    </Sheet>
  );
}
