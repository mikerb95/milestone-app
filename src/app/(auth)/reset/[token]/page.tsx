import { ResetForm } from "@/components/auth/reset-form";
import { getCookieLocale } from "@/lib/preferences";

export default async function ResetPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const locale = await getCookieLocale();
  return <ResetForm token={token} locale={locale} />;
}
