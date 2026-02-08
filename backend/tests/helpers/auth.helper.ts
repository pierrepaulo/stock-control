import crypto from "crypto";
import { eq } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { users, type User } from "../../src/db/schema/index.js";
import { insertUser } from "./factories.js";
import type { NewUser } from "../../src/db/schema/index.js";

export interface AuthenticatedUser {
  user: User;
  token: string;
}

export async function createAuthenticatedUser(
  db: PostgresJsDatabase,
  overrides: Partial<NewUser> = {},
): Promise<AuthenticatedUser> {
  const user = await insertUser(db, overrides);
  const token = crypto.randomBytes(32).toString("hex");

  await db
    .update(users)
    .set({ token })
    .where(eq(users.id, user.id));

  return { user: { ...user, token }, token };
}

export function getAuthHeader(token: string): string {
  return `Bearer ${token}`;
}
