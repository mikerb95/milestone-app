import { AuthForm } from "@/components/auth/auth-form";
import { googleEnabled } from "@/auth";
import { getCookieLocale } from "@/lib/preferences";

export default async function SignupPage() {
  const locale = await getCookieLocale();
  return <AuthForm mode="signup" locale={locale} googleEnabled={googleEnabled} />;
}
