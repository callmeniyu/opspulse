import * as incidentMemberService from "../services/incident-member.service.js";

import type { Request, Response, NextFunction } from "express";

import { addMemberSchema } from "../validators/incident-member.validator.js";

export async function findCandidate(req: Request<{ incidentId: string }>, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const email = typeof req.query.email === "string" ? req.query.email.trim() : "";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "A valid email is required" });
    }

    const user = await incidentMemberService.findCandidate(req.params.incidentId, email, req.user.id);

    return res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
}

export async function add(req: Request<{ incidentId: string }>, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { incidentId } = req.params;
    const { userId, role } = req.body;

    const input = addMemberSchema.parse({ userId, role });

    const result = await incidentMemberService.add(incidentId, input, req.user.id);

    return res.status(201).json({ member: result });
  } catch (error) {
    next(error);
  }
}

export async function list(req: Request<{ incidentId: string }>, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { incidentId } = req.params;

    const result = await incidentMemberService.list(incidentId, req.user.id);

    return res.status(200).json({ members: result });
  } catch (error) {
    next(error);
  }
}

export async function remove(req: Request<{ incidentId: string; userId: string }>, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { incidentId, userId } = req.params;

    const result = await incidentMemberService.remove(incidentId, userId, req.user.id);

    return res.status(200).json({ message: "Member removed successfully", member: result });
  } catch (error) {
    next(error);
  }
}
