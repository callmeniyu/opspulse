import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not configured");
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.cookie;
  if (!token?.startsWith("token=")) {
    res.status(401).json({
      message: "Invalid authentication token format ",
    });
  }

  const tokenValue = token?.split("=")[1];

  if (!tokenValue) {
    res.status(401).json({
      message: "Authentication required",
    });

    return;
  }

  try {
    const payload = jwt.verify(tokenValue, JWT_SECRET);
    if (typeof payload === "string" || typeof payload.userId !== "string") {
      res.status(401).json({
        message: "Invalid token",
      });

      return;
    }

    req.user = {
      id: payload.userId,
    };

    next();
  } catch {
    res.status(401).json({
      message: "Invalid or expired token",
    });
  }
}
