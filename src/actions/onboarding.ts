"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { and, eq, inArray, notInArray } from "drizzle-orm";
import { z } from "zod";

import { requireUser } from "@/auth";
import { db } from "@/db";
import { categories, userSettings } from "@/db/schema";
import { bootstrapUser, createFromTemplates } from "@/lib/bootstrap";
import { LOCALE_COOKIE } from "@/lib/preferences";

const schema = z.object({
  locale: z.enum(["es", "en"]),
  timezone: z.string().min(1).max(64),
  categories: z.array(z.string()).default([]),
  templates: z.array(z.string()).default([]),
});

export async function completeOnboardingAction(input: unknown) {
  const user = await requireUser();
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: "invalid" };

  const { locale, timezone, categories: keptSlugs, templates } = parsed.data;

  await bootstrapUser(user.id, locale);

  await db
    .update(userSettings)
    .set({ locale, timezone, onboardedAt: new Date() })
    .where(eq(userSettings.userId, user.id));

  /**
   * Las categorías que el usuario no marcó se retiran de su cuenta. Solo
   * tocamos las sembradas por defecto: las suyas nunca se borran aquí.
   */
  if (keptSlugs.length) {
    await db
      .delete(categories)
      .where(
        and(
          eq(categories.userId, user.id),
          inArray(categories.slug, [
            "financial",
            "growth",
            "career",
            "health",
            "personal",
            "creative",
          ]),
          notInArray(categories.slug, keptSlugs),
        ),
      );
  }

  await createFromTemplates(user.id, templates, locale, timezone);

  const store = await cookies();
  store.set(LOCALE_COOKIE, locale, { path: "/", maxAge: 60 * 60 * 24 * 365 });

  redirect("/today");
}
