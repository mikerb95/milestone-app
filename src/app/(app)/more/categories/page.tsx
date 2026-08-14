import { redirect } from "next/navigation";
import { count, eq } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db";
import { categories, goals } from "@/db/schema";
import { CategoriesManager } from "@/components/settings/categories-manager";
import { getCategories, getSettings } from "@/lib/queries";
import { categoryName } from "@/lib/defaults";

export default async function CategoriesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/welcome");

  const [settings, cats, counts] = await Promise.all([
    getSettings(session.user.id),
    getCategories(session.user.id),
    db
      .select({ categoryId: goals.categoryId, value: count() })
      .from(goals)
      .where(eq(goals.userId, session.user.id))
      .groupBy(goals.categoryId),
  ]);

  const byCategory = new Map(counts.map((c) => [c.categoryId, c.value]));

  return (
    <CategoriesManager
      categories={cats.map((c) => ({
        id: c.id,
        name: categoryName(c, settings.locale),
        emoji: c.emoji,
        color: c.color,
        goalCount: byCategory.get(c.id) ?? 0,
      }))}
    />
  );
}
