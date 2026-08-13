"use client";

import Link from "next/link";
import { useApp } from "@/components/app-provider";
import { useToast } from "@/components/ui/toast";
import { BellIcon, SettingsIcon } from "./nav-icons";

export function TopBar({
  title,
  extra,
}: {
  title: string;
  /** Acción propia de la pantalla, como el cambio de vista en Hábitos. */
  extra?: React.ReactNode;
}) {
  const { user, reminders, t } = useApp();
  const { toast } = useToast();

  return (
    <header className="flex items-center gap-2.5 pt-3.5 pb-1.5 xl:pt-2 xl:pb-3">
      <Link
        href="/more"
        aria-label={t.more}
        className="grid h-[38px] w-[38px] flex-none place-items-center rounded-full text-[15px] font-bold"
        style={{
          background: "linear-gradient(150deg,#FF8A3D,#7C5CFF)",
          boxShadow: "0 0 0 1px var(--gbd)",
        }}
      >
        {user.initial}
      </Link>

      <h1 className="min-w-0 flex-1 truncate text-[22px] font-bold tracking-[-0.02em] xl:text-[28px]">
        {title}
      </h1>

      {extra}

      <button
        type="button"
        className="icon-btn"
        aria-label={t.remindersPending(reminders)}
        onClick={() => toast(t.remindersPending(reminders))}
      >
        <BellIcon />
        {reminders > 0 ? (
          <span
            className="absolute right-[9px] top-[9px] h-2 w-2 rounded-full"
            style={{ background: "var(--danger)", boxShadow: "0 0 0 2px rgba(11,16,56,.9)" }}
          />
        ) : null}
      </button>

      <Link href="/settings" className="icon-btn" aria-label={t.settings}>
        <SettingsIcon />
      </Link>
    </header>
  );
}
