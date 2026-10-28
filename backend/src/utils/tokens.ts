import jwt, { type JwtPayload } from "jsonwebtoken";

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL = "7d";

function getAccessSecret(): string {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) throw new Error("JWT_ACCESS_SECRET is not configured");
  return secret;
}

function getRefreshSecret(): string {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) throw new Error("JWT_REFRESH_SECRET is not configured");
  return secret;
}

export function createAccessToken(userId: string): string {
  return jwt.sign({ sub: userId, type: "access" }, getAccessSecret(), { expiresIn: ACCESS_TOKEN_TTL });
}

export function createRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId, type: "refresh" }, getRefreshSecret(), { expiresIn: REFRESH_TOKEN_TTL });
}

export function verifyAccessToken(token: string): JwtPayload {
  const payload = jwt.verify(token, getAccessSecret());

  if (typeof payload === "string" || payload.type !== "access" || typeof payload.sub !== "string") {
    throw new Error("Invalid access token");
  }

  return payload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  const payload = jwt.verify(token, getRefreshSecret());

  if (typeof payload === "string" || payload.type !== "refresh" || typeof payload.sub !== "string") {
    throw new Error("Invalid refresh token");
  }

  return payload;
}
