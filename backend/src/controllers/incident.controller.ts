import type { Request, Response, NextFunction } from "express";

import * as incidentService from "../services/incident.service.js";

import { createIncidentSchema, updateIncidentSchema, updateIncidentStatusSchema } from "../validators/incident.validator.js";

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const input = createIncidentSchema.parse(req.body);

    const incident = await incidentService.create(input, req.user.id);

    res.status(201).json(incident);
  } catch (error) {
    next(error);
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const incidents = await incidentService.list();
    res.json(incidents);
  } catch (error) {
    next(error);
  }
}

export async function getById(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const incident = await incidentService.getById(req.params.id);
    res.json(incident);
  } catch (error) {
    next(error);
  }
}

export async function update(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const input = updateIncidentSchema.parse(req.body);
    const incident = await incidentService.update(req.params.id, input);
    res.json(incident);
  } catch (error) {
    next(error);
  }
}

export async function changeStatus(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const input = updateIncidentStatusSchema.parse(req.body);
    const incident = await incidentService.changeStatus(req.params.id, input);
    res.json(incident);
  } catch (error) {
    next(error);
  }
}
