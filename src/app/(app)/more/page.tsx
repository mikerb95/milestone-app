import Link from "next/link";
import { redirect } from "next/navigation";
import { and, count, eq, or } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db";
import { categories, goals } from "@/db/schema";
import { signOutAction } from "@/actions/auth";
import { getSettings } from "@/lib/queries";
import { t } from "@/lib/i18n";

const COPY = {
  es: {
    stats: "Estadísticas",
    categories: "Categorías",
    archive: "Archivo",
    settings: "Ajustes",
    export: "Exportar datos",
    onboarding: "Ver onboarding",
    signOut: "Cerrar sesión",
    about: "Acerca de",
    goalsUnit: "metas",
  },
  en: {
    stats: "Statistics",
    categories: "Categories",
    archive: "Archive",
    settings: "Settings",
    export: "Export data",
    onboarding: "Replay onboarding",
    signOut: "Sign out",
    about: "About",
    goalsUnit: "goals",
  },
};

export default async function MorePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/welcome");

  const settings = await getSettings(session.user.id);
  const d = t(settings.locale);
  const c = COPY[settings.locale];

  const [[catCount], [archivedCount]] = await Promise.all([
    db
      .select({ value: count() })
      .from(categories)
      .where(eq(categories.userId, session.user.id)),
    db
      .select({ value: count() })
      .from(goals)
      .where(
        and(
          eq(goals.userId, session.user.id),
          or(eq(goals.status, "completed"), eq(goals.archived, true)),
        ),
      ),
  ]);

  const name = session.user.name?.trim() || session.user.email || "";
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("");

  const items = [
    { icon: "📊", label: c.stats, href: "/more/stats" },
    { icon: "🗂", label: c.categories, href: "/more/categories", value: String(catCount.value) },
    {
      icon: "📦",
      label: c.archive,
      href: "/more/archive",
      value: `${archivedCount.value} ${c.goalsUnit}`,
    },
    { icon: "⚙️", label: c.settings, href: "/settings" },
    { icon: "☁️", label: c.export, href: "/api/export" },
    { icon: "🧭", label: c.onboarding, href: "/onboarding" },
    { icon: "ℹ️", label: c.about, href: "/more/about", value: "v1.0.0" },
  ];

  return (
    <>
      <div className="pt-3.5" />
      <div className="flex flex-col gap-3">
        <div className="card flex items-center gap-3.5 p-4">
          <div
            className="grid h-14 w-14 flex-none place-items-center rounded-full text-[19px] font-bold"
            style={{ background: "linear-gradient(150deg,#7C5CFF,#FF8A5B)" }}
          >
            {initials || "?"}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
            <div className="text-lg font-bold tracking-[-0.01em]">
              {session.user.name ?? d.more}
            </div>
            <div className="truncate text-sm text-[var(--t2)]">
              {session.user.email}
            </div>
          </div>
        </div>

        <div className="ms-grid">
          {items.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              prefetch={m.href.startsWith("/api") ? false : undefined}
              className="card card-hover flex items-center gap-3 px-4 py-3.5 text-left"
            >
              <span
                className="grid h-[34px] w-[34px] flex-none place-items-center rounded-[10px] text-base"
                style={{ background: "var(--g2)" }}
              >
                {m.icon}
              </span>
              <span className="min-w-0 flex-1 text-base font-semibold">
                {m.label}
              </span>
              {m.value ? (
                <span className="text-sm font-medium text-[var(--t3)]">
                  {m.value}
                </span>
              ) : null}
              <span className="text-[15px] text-[var(--t3)]">›</span>
            </Link>
          ))}

          <form action={signOutAction}>
            <button
              type="submit"
              className="card card-hover flex w-full items-center gap-3 px-4 py-3.5 text-left"
            >
              <span
                className="grid h-[34px] w-[34px] flex-none place-items-center rounded-[10px] text-base"
                style={{ background: "var(--g2)" }}
              >
                🚪
              </span>
              <span className="min-w-0 flex-1 text-base font-semibold text-[var(--danger)]">
                {c.signOut}
              </span>
              <span className="text-[15px] text-[var(--t3)]">›</span>
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
