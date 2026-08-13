"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/components/app-provider";
import {
  GoalsIcon,
  HabitsIcon,
  MoreIcon,
  TasksIcon,
  TodayIcon,
} from "./nav-icons";

const ITEMS = [
  { key: "today", href: "/today", Icon: TodayIcon },
  { key: "goals", href: "/goals", Icon: GoalsIcon },
  { key: "habits", href: "/habits", Icon: HabitsIcon },
  { key: "tasks", href: "/tasks", Icon: TasksIcon },
  { key: "more", href: "/more", Icon: MoreIcon },
] as const;

export function Nav({ todayBadge }: { todayBadge: number }) {
  const pathname = usePathname();
  const t = useT();

  /* Ajustes cuelga de Más, así que la píldora se queda allí. */
  const activeKey = pathname.startsWith("/settings")
    ? "more"
    : (ITEMS.find((i) => pathname.startsWith(i.href))?.key ?? "today");
  const activeIdx = Math.max(
    0,
    ITEMS.findIndex((i) => i.key === activeKey),
  );

  const labels: Record<string, string> = {
    today: t.today,
    goals: t.goals,
    habits: t.habits,
    tasks: t.tasks,
    more: t.more,
  };

  return (
    <nav
      className="ms-nav"
      style={{ ["--nav-idx" as string]: activeIdx }}
      aria-label="Milestone"
    >
      <div className="ms-nav-pill" aria-hidden />
      {ITEMS.map(({ key, href, Icon }) => {
        const active = key === activeKey;
        return (
          <Link
            key={key}
            href={href}
            className="ms-nav-item"
            data-active={active ? "true" : "false"}
            aria-current={active ? "page" : undefined}
          >
            <span className="relative grid place-items-center">
              <Icon />
              {key === "today" && todayBadge > 0 ? (
                <span
                  className="absolute -right-2 -top-1 grid h-[17px] min-w-[17px] place-items-center rounded-full px-1 text-[10px] font-bold text-white"
                  style={{ background: "var(--danger)" }}
                >
                  {todayBadge}
                </span>
              ) : null}
            </span>
            <span className="ms-nav-label">{labels[key]}</span>
          </Link>
        );
      })}
    </nav>
  );
}
