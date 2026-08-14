import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { SubHeader } from "@/components/shell/sub-header";
import { getGoals, getSettings } from "@/lib/queries";
import { goalPercent, goalRawLabel } from "@/lib/domain";
import { formatDate } from "@/lib/dates";

const COPY = {
  es: {
    title: "Archivo",
    empty: "Aquí guardamos las metas completadas y las archivadas. Todavía no hay ninguna.",
    completedOn: "Completada el",
  },
  en: {
    title: "Archive",
    empty: "Completed and archived goals live here. None yet.",
    completedOn: "Completed on",
  },
};

export default async function ArchivePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/welcome");

  const settings = await getSettings(session.user.id);
  const c = COPY[settings.locale];

  const all = await getGoals(session.user.id, { includeArchived: true });
  const archived = all.filter((g) => g.status === "completed" || g.archived);

  return (
    <>
      <SubHeader title={c.title} />

      {archived.length === 0 ? (
        <div className="card px-5 py-8 text-center text-pretty text-[15px] text-[var(--t2)]">
          {c.empty}
        </div>
      ) : (
        <div className="ms-grid">
          {archived.map((g) => {
            const color = g.category?.color ?? "#6C8CF5";
            return (
              <Link
                key={g.id}
                href={`/goals/${g.id}`}
                className="card card-hover flex items-center gap-3 px-4 py-3.5"
              >
                <span
                  className="grid h-[38px] w-[38px] flex-none place-items-center rounded-xl text-lg"
                  style={{ background: color + "26", border: `1px solid ${color}3D` }}
                >
                  {g.category?.emoji ?? "🎯"}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-[15px] font-semibold">{g.title}</span>
                  <span className="tabular text-[13px] font-medium text-[var(--t3)]">
                    {goalRawLabel(g, g.milestones, settings.locale)}
                    {g.completedAt
                      ? ` · ${c.completedOn} ${formatDate(
                          g.completedAt.toISOString().slice(0, 10),
                          settings.locale,
                        )}`
                      : ""}
                  </span>
                </span>
                <span className="tabular flex-none text-[13px] font-bold text-[#34D399]">
                  {goalPercent(g, g.milestones)}%
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
