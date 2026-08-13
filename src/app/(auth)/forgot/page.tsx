import { AuthForm } from "@/components/auth/auth-form";
import { getCookieLocale } from "@/lib/preferences";

export default async function ForgotPage() {
  const locale = await getCookieLocale();
  return <AuthForm mode="forgot" locale={locale} googleEnabled={false} />;
}
