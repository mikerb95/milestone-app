"use client";

import { useState, useTransition } from "react";
import { useApp } from "@/components/app-provider";
import { useToast } from "@/components/ui/toast";
import { useSheets } from "@/components/sheets/sheet-provider";
import {
  deleteTaskAction,
  toggleSubtaskAction,
  toggleTaskAction,
} from "@/actions/tasks";
import { formatDateShort } from "@/lib/dates";
import { PRIORITY_COLORS, priorityLabels, recurrenceLabels, tr } from "@/lib/i18n";
import type { Subtask } from "@/db/schema";

export type TaskRowData = {
  id: string;
  title: string;
  priority: "high" | "med" | "low";
  dueDate: string | null;
  recurrence: string | null;
  done: boolean;
  goal: { id: string; title: string; color: string | null } | null;
  subtasks: Subtask[];
};

export function TaskRow({
  task,
  showDue = false,
}: {
  task: TaskRowData;
  /** La pantalla Hoy ya agrupa por fecha, así que allí la ocultamos. */
  showDue?: boolean;
}) {
  const { t, locale } = useApp();
  const { toast } = useToast();
  const { open } = useSheets();
  const [, startTransition] = useTransition();

  /* Marcar debe sentirse inmediato; el servidor confirma después. */
  const [done, setDone] = useState(task.done);
  const [subsOpen, setSubsOpen] = useState(false);
  const [subDone, setSubDone] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(task.subtasks.map((s) => [s.id, s.done])),
  );

  const priColor = PRIORITY_COLORS[task.priority];
  const goalColor = task.goal?.color ?? "#6C8CF5";

  const toggle = () => {
    const next = !done;
    setDone(next);
    startTransition(async () => {
      const res = await toggleTaskAction(task.id);
      if ("error" in res && res.error) {
        setDone(!next);
        return;
      }
      if (res.ok && next) toast(t.taskCompleted);
    });
  };

  const remove = () => {
    startTransition(async () => {
      await deleteTaskAction(task.id);
      toast(t.taskDeleted);
    });
  };

  const toggleSub = (id: string) => {
    setSubDone((prev) => ({ ...prev, [id]: !prev[id] }));
    startTransition(async () => {
      await toggleSubtaskAction(id);
    });
  };

  return (
    <div className="card card-hover group flex flex-col gap-2.5 px-4 py-3.5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          role="checkbox"
          aria-checked={done}
          aria-label={task.title}
          className="mt-px grid h-6 w-6 flex-none place-items-center rounded-full transition-[background-color] duration-200 active:scale-90"
          style={{
            background: done ? "#34D399" : "transparent",
            border: done ? "1px solid #34D399" : "1.6px solid rgba(255,255,255,.32)",
            animation: done ? "var(--animate-ms-pop)" : "none",
          }}
        >
          <span
            className="text-xs font-extrabold text-[#0B1038] transition-opacity duration-200"
            style={{ opacity: done ? 1 : 0 }}
          >
            ✓
          </span>
        </button>

        <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
          <button
            type="button"
            onClick={() =>
              open({
                type: "task",
                taskId: task.id,
                initial: {
                  title: task.title,
                  priority: task.priority,
                  dueDate: task.dueDate ?? "",
                  goalId: task.goal?.id ?? "",
                  recurrence: (task.recurrence ?? "") as "" | "daily" | "weekly" | "monthly",
                  subtasks: task.subtasks.map((s) => ({
                    id: s.id,
                    title: s.title,
                    /* El marcado se ve pero no se cambia aquí: para eso está
                       el desplegable de la propia tarjeta. */
                    done: subDone[s.id] ?? s.done,
                  })),
                },
              })
            }
            className="text-pretty text-left text-base font-semibold transition-colors"
            style={{
              color: done ? "var(--t3)" : "var(--t1)",
              textDecoration: done ? "line-through" : "none",
            }}
          >
            {task.title}
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className="rounded-full px-2.5 py-[3px] text-[11px] font-bold tracking-[0.04em]"
              style={{
                background: priColor + "26",
                border: `1px solid ${priColor}4D`,
                color: priColor,
              }}
            >
              {tr(priorityLabels, task.priority, locale)}
            </span>

            {task.goal ? (
              <span
                className="inline-flex max-w-[190px] items-center gap-1.5 truncate rounded-full px-2.5 py-[3px] text-xs font-semibold"
                style={{
                  background: goalColor + "1F",
                  border: `1px solid ${goalColor}44`,
                  color: goalColor,
                }}
              >
                {task.goal.title}
              </span>
            ) : null}

            {showDue && task.dueDate ? (
              <span className="tabular text-xs font-medium text-[var(--t3)]">
                {formatDateShort(task.dueDate, locale)}
              </span>
            ) : null}

            {task.recurrence ? (
              <span className="text-xs font-medium text-[var(--t3)]">
                ↻ {tr(recurrenceLabels, task.recurrence, locale)}
              </span>
            ) : null}
          </div>
        </div>

        {task.subtasks.length ? (
          <button
            type="button"
            onClick={() => setSubsOpen((o) => !o)}
            aria-expanded={subsOpen}
            className="flex flex-none items-center gap-1.5 text-xs font-semibold text-[var(--t3)] transition-colors hover:text-[var(--t2)]"
          >
            <span
              className="inline-block transition-transform duration-200"
              style={{ transform: subsOpen ? "rotate(90deg)" : "none" }}
            >
              ›
            </span>
            {task.subtasks.length === 1 ? t.oneSubtask : t.subtasks(task.subtasks.length)}
          </button>
        ) : null}

        <button
          type="button"
          onClick={remove}
          aria-label={t.deleteTask}
          className="flex-none text-[var(--t3)] opacity-0 transition-[opacity,color] focus-visible:opacity-100 group-hover:opacity-100 hover:text-[var(--danger)]"
        >
          ×
        </button>
      </div>

      {subsOpen ? (
        <div className="flex flex-col gap-2 pl-9">
          {task.subtasks.map((s) => {
            const checked = subDone[s.id];
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleSub(s.id)}
                role="checkbox"
                aria-checked={checked}
                className="flex items-center gap-2.5 text-left"
              >
                <span
                  className="h-4 w-4 flex-none rounded-full"
                  style={{
                    background: checked ? "#34D399" : "transparent",
                    border: checked ? "none" : "1.4px solid rgba(255,255,255,.28)",
                  }}
                />
                <span
                  className="text-sm"
                  style={{
                    color: checked ? "var(--t3)" : "var(--t2)",
                    textDecoration: checked ? "line-through" : "none",
                  }}
                >
                  {s.title}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
