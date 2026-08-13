import { AuthForm } from "@/components/auth/auth-form";
import { googleEnabled } from "@/auth";
import { getCookieLocale } from "@/lib/preferences";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string }>;
}) {
  const locale = await getCookieLocale();
  const { reset } = await searchParams;

  const notice = reset
    ? locale === "es"
      ? "Contraseña actualizada. Ya puedes entrar."
      : "Password updated. You can sign in now."
    : undefined;

  return (
    <AuthForm
      mode="login"
      locale={locale}
      googleEnabled={googleEnabled}
      notice={notice}
    />
  );
}
