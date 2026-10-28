import type { Request, Response, NextFunction } from "express";

import { registerUser, loginUser } from "../services/auth.service.js";

import { registerSchema, loginSchema } from "../validators/auth.validator.js";

import { findUserById } from "../repositories/user.repository.js";
import { refreshCookieOptions } from "../utils/refreshcookie.js";
import { createAccessToken, verifyRefreshToken } from "../utils/tokens.js";

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const input = registerSchema.parse(req.body);

    const result = await registerUser(input);

    res.cookie("refreshToken", result.refreshToken, refreshCookieOptions);

    res.status(201).json({
      user: result.user,
      accessToken: result.accessToken,
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const input = loginSchema.parse(req.body);

    const result = await loginUser(input);

    res.cookie("refreshToken", result.refreshToken, refreshCookieOptions);

    res.status(200).json({
      user: result.user,
      accessToken: result.accessToken,
    });
  } catch (error) {
    next(error);
  }
}

export const logout = (_req: Request, res: Response) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth",
  });

  res.status(200).json({ message: "Logged out" });
};

export async function getCurrentUser(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const user = await findUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
}

export const refresh = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      res.status(401).json({ message: "Refresh token missing" });
      return;
    }

    const payload = verifyRefreshToken(refreshToken);
    if (!payload.sub) {
      res.status(401).json({ message: "Invalid or expired refresh token" });
      return;
    }

    const accessToken = createAccessToken(payload.sub);

    res.status(200).json({ accessToken });
  } catch {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/auth",
    });

    res.status(401).json({ message: "Invalid or expired refresh token" });
  }
};
