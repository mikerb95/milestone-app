"use server";

import { eq } from "drizzle-orm";
import { requireUser, signOut } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";

/**
 * Borra la cuenta. El resto de tablas cuelgan del usuario con borrado en
 * cascada, así que basta con quitar la fila raíz.
 */
export async function deleteAccountAction() {
  const user = await requireUser();
  await db.delete(users).where(eq(users.id, user.id));
  await signOut({ redirectTo: "/welcome" });
}
