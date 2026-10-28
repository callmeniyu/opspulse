import * as taskRepository from "../repositories/task.repository.js";

import { findIncidentById } from "../repositories/incident.repository.js";
import type { TaskStatus } from "../types/taskTypes.js";
import type { CreateTaskInput, UpdateTaskInput } from "../validators/task.validator.js";
import { isIncidentMember } from "../repositories/incident-member.repository.js";

export async function create(incidentId: string, input: CreateTaskInput, createdBy: string) {
  const incident = await findIncidentById(incidentId);

  if (!incident) {
    throw new Error("Incident not found");
  }

  return await taskRepository.createTask(incidentId, input.title, input.description, createdBy, input.assignedTo);
}

export async function list(incidentId: string, currentUserId: string) {
  const incident = await findIncidentById(incidentId);

  if (!incident) {
    throw new Error("Incident not found");
  }

  const isMember = await isIncidentMember(incidentId, currentUserId);

  if (!isMember) {
    throw new Error("You do not have access to this incident");
  }

  return taskRepository.findTasks(incidentId);
}

export async function update(taskId: string, input: UpdateTaskInput) {
  const task = await taskRepository.updateTask(taskId, input.title, input.description, input.assignedTo ?? null, input.status as TaskStatus | undefined);
  return task;
}

export async function remove(taskId: string) {
  const task = await taskRepository.deleteTask(taskId);
  return task;
}
