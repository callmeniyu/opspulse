import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/tokens.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Access token required" });
    return;
  }

  const accessToken = authorization.slice("Bearer ".length);

  try {
    const payload = verifyAccessToken(accessToken);

    req.user = { id: payload.userId };
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired access token" });
  }
}
