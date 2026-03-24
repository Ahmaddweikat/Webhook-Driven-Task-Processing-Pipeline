import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { config } from "../config";
import {
  insertUser,
  findUserByEmail,
  findUserById,
  saveAccessToken,
  saveRefreshToken,
  findRefreshToken,
  invalidateAllUserAccessTokens,
  invalidateAllUserRefreshTokens,
  invalidateRefreshToken,
} from "../db/queries/user";

function generateAccessToken(userId: string, email: string) {
  return jwt.sign({ userId, email }, config.jwtSecret, { expiresIn: "1m" });
}

function generateRefreshToken() {
  return crypto.randomBytes(64).toString("hex");
}

export async function registerUser(
  name: string,
  email: string,
  password: string,
) {
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await insertUser(name, email, passwordHash);

  const accessToken = generateAccessToken(user.id, user.email);
  const refreshToken = generateRefreshToken();

  const accessExpiresAt = new Date();
  accessExpiresAt.setMinutes(accessExpiresAt.getMinutes() + 15);

  const refreshExpiresAt = new Date();
  refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 7);

  await saveAccessToken(user.id, accessToken, accessExpiresAt);
  await saveRefreshToken(user.id, refreshToken, refreshExpiresAt);

  return {
    user: { id: user.id, name: user.name, email: user.email },
    accessToken,
    refreshToken,
  };
}

export async function loginUser(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user) throw new Error("Invalid email or password");

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new Error("Invalid email or password");

  await invalidateAllUserAccessTokens(user.id);
  await invalidateAllUserRefreshTokens(user.id);

  const accessToken = generateAccessToken(user.id, user.email);
  const refreshToken = generateRefreshToken();

  const accessExpiresAt = new Date();
  accessExpiresAt.setMinutes(accessExpiresAt.getMinutes() + 15);

  const refreshExpiresAt = new Date();
  refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 7);

  await saveAccessToken(user.id, accessToken, accessExpiresAt);
  await saveRefreshToken(user.id, refreshToken, refreshExpiresAt);

  return {
    user: { id: user.id, name: user.name, email: user.email },
    accessToken,
    refreshToken,
  };
}

export async function refreshAccessToken(refreshToken: string) {
  const row = await findRefreshToken(refreshToken);

  if (!row) throw new Error("Invalid refresh token");
  if (!row.isValid) throw new Error("Refresh token has been invalidated");
  if (new Date() > row.expiresAt) {
    await invalidateRefreshToken(refreshToken);
    throw new Error("Refresh token expired");
  }

  const user = await findUserById(row.userId);
  if (!user) throw new Error("User not found");

  await invalidateAllUserAccessTokens(user.id);

  const accessToken = generateAccessToken(user.id, user.email);

  const accessExpiresAt = new Date();
  accessExpiresAt.setMinutes(accessExpiresAt.getMinutes() + 15);

  await saveAccessToken(user.id, accessToken, accessExpiresAt);

  return { accessToken };
}

export async function logoutUser(userId: string) {
  await invalidateAllUserAccessTokens(userId);
  await invalidateAllUserRefreshTokens(userId);
}
