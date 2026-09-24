import type { Request, Response, NextFunction } from "express";

import { registerUser, loginUser } from "../services/auth.service.js";

import { registerSchema, loginSchema } from "../validators/auth.validator.js";

import { findUserById } from "../repositories/user.repository.js";

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const input = registerSchema.parse(req.body);

    const user = await registerUser(input);

    res.status(201).json({ user });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const input = loginSchema.parse(req.body);

    const result = await loginUser(input);

    res.cookie("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

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
