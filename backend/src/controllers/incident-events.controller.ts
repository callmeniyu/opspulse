import type { Request, Response, NextFunction } from "express";
import * as eventService from "../services/incident-event.service.js";

export async function list(req: Request<{ incidentId: string }>, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const events = await eventService.list(req.params.incidentId, req.user.id);

    return res.status(200).json({ events });
  } catch (error) {
    next(error);
  }
}
