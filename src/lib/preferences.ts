import "server-only";
import { cookies } from "next/headers";
import type { Locale } from "./i18n";

export const LOCALE_COOKIE = "ms_locale";

/**
 * Idioma para las pantallas sin sesión. Una vez dentro manda la preferencia
 * guardada en la base; esta cookie solo cubre el antes del login.
 */
export async function getCookieLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return value === "en" ? "en" : "es";
}
