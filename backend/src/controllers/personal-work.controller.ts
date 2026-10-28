import type { Request, Response, NextFunction } from "express";
import * as personalWorkService from "../services/personal-work.service.js";

export async function myTasks(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const tasks = await personalWorkService.listMyTasks(req.user.id);
    return res.status(200).json({ tasks });
  } catch (error) {
    next(error);
  }
}

export async function myTeams(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const teams = await personalWorkService.listMyTeams(req.user.id);
    return res.status(200).json({ teams });
  } catch (error) {
    next(error);
  }
}
