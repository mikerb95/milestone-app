import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppProvider } from "@/components/app-provider";
import { ToastProvider } from "@/components/ui/toast";
import { SheetProvider } from "@/components/sheets/sheet-provider";
import { Shell } from "@/components/shell/shell";
import {
  getCategories,
  getGoalOptions,
  getSettings,
  getTodayPendingCount,
  resolveToday,
} from "@/lib/queries";
import { t } from "@/lib/i18n";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/welcome");

  const settings = await getSettings(session.user.id);
  const today = resolveToday(settings);

  const [categories, goalOptions, pending] = await Promise.all([
    getCategories(session.user.id),
    getGoalOptions(session.user.id),
    getTodayPendingCount(session.user.id, today),
  ]);

  const name = session.user.name?.trim() || session.user.email?.split("@")[0] || "?";

  return (
    <AppProvider
      settings={{
        locale: settings.locale,
        timezone: settings.timezone,
        textSize: settings.textSize,
        reduceMotion: settings.reduceMotion,
        reduceTransparency: settings.reduceTransparency,
        accentColor: settings.accentColor,
        countToday: settings.countToday,
        hideCompleted: settings.hideCompleted,
        firstDayOfWeek: settings.firstDayOfWeek,
        defaultTimeframe: settings.defaultTimeframe,
      }}
      today={today}
      user={{
        name,
        initial: name.charAt(0).toUpperCase(),
        image: session.user.image ?? null,
      }}
      reminders={pending}
    >
      <ToastProvider undoLabel={t(settings.locale).undo}>
        <SheetProvider
          categories={categories.map((c) => ({
            id: c.id,
            name: c.name,
            nameEn: c.nameEn,
            slug: c.slug,
            emoji: c.emoji,
            color: c.color,
          }))}
          goalOptions={goalOptions}
          today={today}
        >
          <Shell todayBadge={pending}>{children}</Shell>
        </SheetProvider>
      </ToastProvider>
    </AppProvider>
  );
}
