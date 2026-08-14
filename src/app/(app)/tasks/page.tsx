import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { TopBar } from "@/components/shell/top-bar";
import { TaskRow } from "@/components/cards/task-row";
import { EmptyGroup } from "@/components/tasks/empty-group";
import { getSettings, getTasks, resolveToday } from "@/lib/queries";
import { TASK_GROUP_ORDER, sortTasks, taskGroup } from "@/lib/domain";
import { t, taskGroupLabels, tr } from "@/lib/i18n";

export default async function TasksPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/welcome");

  const settings = await getSettings(session.user.id);
  const today = resolveToday(settings);
  const d = t(settings.locale);

  const tasks = await getTasks(session.user.id, {
    includeDone: !settings.hideCompleted,
  });

  const pending = tasks.filter((k) => !k.done).sort(sortTasks);
  const done = tasks.filter((k) => k.done);

  const groups = TASK_GROUP_ORDER.map((key) => ({
    key,
    label: tr(taskGroupLabels, key, settings.locale),
    tasks: pending.filter((k) => taskGroup(k, today) === key),
  }));

  /* Los grupos vacíos se ocultan salvo el de hoy, que invita a llenarlo. */
  const visible = groups.filter((g) => g.tasks.length || g.key === "today");

  return (
    <>
      <TopBar title={d.tasks} />

      <div className="flex flex-col gap-[18px]">
        {visible.map((grp) => (
          <section key={grp.key} className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2 px-0.5">
              <span
                className="text-[11px] font-semibold tracking-[0.09em]"
                style={{
                  color: grp.key === "overdue" ? "#FF453A" : "var(--t3)",
                }}
              >
                {grp.label}
              </span>
              <span
                className="grid h-[19px] min-w-[19px] place-items-center rounded-full px-1.5 text-[11px] font-semibold text-[var(--t2)]"
                style={{ background: "var(--g2)", border: "1px solid var(--gbd)" }}
              >
                {grp.tasks.length}
              </span>
            </div>

            {grp.tasks.length === 0 ? (
              <EmptyGroup copy={d.emptyTasks} cta={d.addTask} dueDate={today} />
            ) : (
              <div className="ms-grid">
                {grp.tasks.map((k) => (
                  <TaskRow key={k.id} task={k} showDue />
                ))}
              </div>
            )}
          </section>
        ))}

        {done.length ? (
          <section className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2 px-0.5">
              <span className="eyebrow">
                {tr(taskGroupLabels, "done", settings.locale)}
              </span>
              <span
                className="grid h-[19px] min-w-[19px] place-items-center rounded-full px-1.5 text-[11px] font-semibold text-[var(--t2)]"
                style={{ background: "var(--g2)", border: "1px solid var(--gbd)" }}
              >
                {done.length}
              </span>
            </div>
            <div className="ms-grid">
              {done.map((k) => (
                <TaskRow key={k.id} task={k} showDue />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </>
  );
}
