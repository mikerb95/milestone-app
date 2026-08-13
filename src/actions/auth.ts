"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { signIn, signOut } from "@/auth";
import { db } from "@/db";
import { passwordResetTokens, users } from "@/db/schema";
import { bootstrapUser, seedSampleData } from "@/lib/bootstrap";
import { getCookieLocale } from "@/lib/preferences";
import { t } from "@/lib/i18n";

export type AuthState = { error?: string; ok?: boolean; resetUrl?: string };

const emailSchema = z.string().trim().toLowerCase().email();
const passwordSchema = z.string().min(8);

export async function signInAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const locale = await getCookieLocale();
  const d = t(locale);

  const email = emailSchema.safeParse(formData.get("email"));
  const password = z.string().min(1).safeParse(formData.get("password"));

  if (!email.success) return { error: d.errInvalidEmail };
  if (!password.success) return { error: d.errRequired };

  try {
    await signIn("credentials", {
      email: email.data,
      password: password.data,
      redirectTo: "/today",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: d.errInvalidCredentials };
    }
    /* redirect() lanza internamente: hay que dejarlo pasar. */
    throw error;
  }
  return {};
}

export async function signUpAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const locale = await getCookieLocale();
  const d = t(locale);

  const name = z
    .string()
    .trim()
    .min(1)
    .max(80)
    .safeParse(formData.get("name"));
  const email = emailSchema.safeParse(formData.get("email"));
  const password = passwordSchema.safeParse(formData.get("password"));

  if (!name.success) return { error: d.errRequired };
  if (!email.success) return { error: d.errInvalidEmail };
  if (!password.success) return { error: d.errShortPassword };

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email.data))
    .limit(1);

  if (existing) return { error: d.errEmailTaken };

  const passwordHash = await bcrypt.hash(password.data, 10);

  const [created] = await db
    .insert(users)
    .values({ name: name.data, email: email.data, passwordHash })
    .returning({ id: users.id });

  await bootstrapUser(created.id, locale);

  try {
    await signIn("credentials", {
      email: email.data,
      password: password.data,
      redirectTo: "/onboarding",
    });
  } catch (error) {
    if (error instanceof AuthError) return { error: d.errGeneric };
    throw error;
  }
  return {};
}

/**
 * "Explorar la demo": crea una cuenta desechable ya sembrada con el conjunto
 * de ejemplo del diseño, para poder recorrer la app sin registrarse.
 */
export async function demoAction(): Promise<void> {
  const locale = await getCookieLocale();
  const suffix = crypto.randomUUID().slice(0, 8);
  const email = `demo-${suffix}@milestone.local`;
  const password = crypto.randomUUID();
  const passwordHash = await bcrypt.hash(password, 10);

  const [created] = await db
    .insert(users)
    .values({
      name: locale === "es" ? "Invitada" : "Guest",
      email,
      passwordHash,
    })
    .returning({ id: users.id });

  await bootstrapUser(created.id, locale);
  await seedSampleData(created.id, locale);
  await db
    .update(users)
    .set({ emailVerified: new Date() })
    .where(eq(users.id, created.id));

  await signIn("credentials", { email, password, redirectTo: "/today" });
}

export async function googleSignInAction(): Promise<void> {
  await signIn("google", { redirectTo: "/today" });
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: "/welcome" });
}

/**
 * Genera el enlace de recuperación. Sin proveedor de correo configurado el
 * enlace se devuelve para mostrarlo en pantalla en desarrollo; en producción
 * la respuesta es siempre la misma, exista o no la cuenta.
 */
export async function forgotAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const locale = await getCookieLocale();
  const d = t(locale);

  const email = emailSchema.safeParse(formData.get("email"));
  if (!email.success) return { error: d.errInvalidEmail };

  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email.data))
    .limit(1);

  if (!user) return { ok: true };

  const token = crypto.randomUUID().replace(/-/g, "");
  await db.insert(passwordResetTokens).values({
    token,
    userId: user.id,
    expires: new Date(Date.now() + 60 * 60 * 1000),
  });

  const base = process.env.AUTH_URL ?? "http://localhost:3000";
  const resetUrl = `${base}/reset/${token}`;

  if (process.env.NODE_ENV !== "production") {
    console.log("[milestone] enlace de recuperación:", resetUrl);
    return { ok: true, resetUrl };
  }

  return { ok: true };
}

export async function resetPasswordAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const locale = await getCookieLocale();
  const d = t(locale);

  const token = z.string().min(10).safeParse(formData.get("token"));
  const password = passwordSchema.safeParse(formData.get("password"));

  if (!token.success) return { error: d.errGeneric };
  if (!password.success) return { error: d.errShortPassword };

  const [row] = await db
    .select()
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.token, token.data))
    .limit(1);

  if (!row || row.usedAt || row.expires < new Date()) {
    return { error: d.errGeneric };
  }

  const passwordHash = await bcrypt.hash(password.data, 10);
  await db
    .update(users)
    .set({ passwordHash })
    .where(eq(users.id, row.userId));
  await db
    .update(passwordResetTokens)
    .set({ usedAt: new Date() })
    .where(eq(passwordResetTokens.token, token.data));

  redirect("/login?reset=1");
}
