import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SettingsScreen } from "@/components/settings/settings-screen";
import { getSettings } from "@/lib/queries";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/welcome");

  const settings = await getSettings(session.user.id);

  return (
    <SettingsScreen
      settings={settings}
      user={{
        name: session.user.name ?? "",
        email: session.user.email ?? "",
      }}
    />
  );
}
