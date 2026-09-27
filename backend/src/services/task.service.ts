import * as taskRepository from "../repositories/task.repository.js";

import { findIncidentById } from "../repositories/incident.repository.js";
import type { TaskStatus } from "../types/taskTypes.js";
import type { CreateTaskInput, UpdateTaskInput } from "../validators/task.validator.js";

export async function create(incidentId: string, input: CreateTaskInput) {
  const incident = await findIncidentById(incidentId);

  if (!incident) {
    throw new Error("Incident not found");
  }

  return await taskRepository.createTask(incidentId, input.title, input.description, input.assignedTo);
}

export async function list(incidentId: string) {
  const incident = await findIncidentById(incidentId);

  if (!incident) {
    throw new Error("Incident not found");
  }

  return await taskRepository.findTasks(incidentId);
}

export async function update(taskId: string, input: UpdateTaskInput) {
  const task = await taskRepository.updateTask(taskId, input.title, input.description, input.assignedTo ?? null, input.status as TaskStatus | undefined);
  return task;
}
