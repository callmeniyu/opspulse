import type { Request, Response, NextFunction } from "express";
import * as taskService from "../services/task.service.js";
import { createTaskSchema, updateTaskSchema, type CreateTaskInput, type UpdateTaskInput } from "../validators/task.validator.js";

export async function create(req: Request<{ incidentId: string }, {}, CreateTaskInput>, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { incidentId } = req.params;
    const input = createTaskSchema.parse(req.body);

    const task = await taskService.create(incidentId, input);

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
}

export async function list(req: Request<{ incidentId: string }, {}, {}>, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { incidentId } = req.params;
    const tasks = await taskService.list(incidentId);
    res.json(tasks);
  } catch (error) {
    next(error);
  }
}

export async function update(req: Request<{ taskId: string }, {}, UpdateTaskInput>, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { taskId } = req.params;
    const input = updateTaskSchema.parse(req.body);
    const task = await taskService.update(taskId, input);
    res.json(task);
  } catch (error) {
    next(error);
  }
}
