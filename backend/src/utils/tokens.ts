import jwt from "jsonwebtoken";
import type { StringValue } from "ms";

export const createAccessToken = (userId: string) => {
  const secret = process.env.JWT_ACCESS_SECRET || "default_secret_key";
  const expiresIn = (process.env.JWT_ACCESS_EXPIRES_IN || "15m") as StringValue;
  return jwt.sign({ userId }, secret, { expiresIn });
};

export const createRefreshToken = (userId: string) => {
  const secret = process.env.JWT_REFRESH_SECRET || "default_secret_key";
  const expiresIn = (process.env.JWT_REFRESH_EXPIRES_IN || "7d") as StringValue;
  return jwt.sign({ userId }, secret, { expiresIn });
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET || "default_secret_key");
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET || "default_secret_key");
};
