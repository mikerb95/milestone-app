import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { userSettings } from "@/db/schema";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { getCookieLocale } from "@/lib/preferences";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/welcome");

  const [settings] = await db
    .select({ locale: userSettings.locale, onboardedAt: userSettings.onboardedAt })
    .from(userSettings)
    .where(eq(userSettings.userId, session.user.id))
    .limit(1);

  const locale = settings?.locale ?? (await getCookieLocale());

  return <OnboardingFlow initialLocale={locale} />;
}
