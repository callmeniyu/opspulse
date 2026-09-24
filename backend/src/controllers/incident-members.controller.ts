import * as incidentMemberService from "../services/incident-member.service.js";

import type { Request, Response, NextFunction } from "express";

import { addMemberSchema } from "../validators/incident-member.validator.js";

export async function add(req: Request<{ incidentId: string }>, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { incidentId } = req.params;
    const { userId, role } = req.body;
    console.log("Request Params: ", req.params);

    const input = addMemberSchema.parse({ userId, role });

    const result = await incidentMemberService.add(incidentId, input, req.user.id);

    return res.status(201).json(result);
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

    const result = await incidentMemberService.list(incidentId);

    return res.status(200).json(result);
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

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
