import { db } from "../client";
import { users, refreshTokens, accessTokens } from "../schema";
import { eq } from "drizzle-orm";

export async function insertUser(
  name: string,
  email: string,
  passwordHash: string,
) {
  const [user] = await db
    .insert(users)
    .values({ name, email, passwordHash })
    .returning();
  return user;
}

export async function findUserByEmail(email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user;
}

export async function findUserById(id: string) {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user;
}

export async function saveAccessToken(
  userId: string,
  token: string,
  expiresAt: Date,
) {
  await db
    .insert(accessTokens)
    .values({ userId, token, isValid: true, expiresAt });
}

export async function findAccessToken(token: string) {
  const [row] = await db
    .select()
    .from(accessTokens)
    .where(eq(accessTokens.token, token));
  return row;
}

export async function invalidateAllUserAccessTokens(userId: string) {
  await db
    .update(accessTokens)
    .set({ isValid: false })
    .where(eq(accessTokens.userId, userId));
}

export async function saveRefreshToken(
  userId: string,
  token: string,
  expiresAt: Date,
) {
  await db
    .insert(refreshTokens)
    .values({ userId, token, isValid: true, expiresAt });
}

export async function findRefreshToken(token: string) {
  const [row] = await db
    .select()
    .from(refreshTokens)
    .where(eq(refreshTokens.token, token));
  return row;
}

export async function invalidateRefreshToken(token: string) {
  await db
    .update(refreshTokens)
    .set({ isValid: false })
    .where(eq(refreshTokens.token, token));
}

export async function invalidateAllUserRefreshTokens(userId: string) {
  await db
    .update(refreshTokens)
    .set({ isValid: false })
    .where(eq(refreshTokens.userId, userId));
}
