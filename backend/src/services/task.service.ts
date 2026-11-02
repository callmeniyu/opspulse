import * as taskRepository from "../repositories/task.repository.js";
import * as incidentEventService from "./incident-event.service.js";
import { findIncidentById } from "../repositories/incident.repository.js";
import { getIncidentRole } from "../repositories/incident-access.repository.js";
import { isIncidentMember } from "../repositories/incident-member.repository.js";

import { IncidentEventType } from "../types/incidentEventType.js";
import type { TaskStatus } from "../types/taskTypes.js";
import type { CreateTaskInput, UpdateTaskInput } from "../validators/task.validator.js";

import { HttpError } from "../utils/HttpError.js";

async function validateAssignee(incidentId: string, assignedTo: string | null | undefined) {
  if (assignedTo == null) {
    return;
  }

  const isMember = await isIncidentMember(incidentId, assignedTo);

  if (!isMember) {
    throw new HttpError(400, "The task assignee must be a member of this incident");
  }

  const role = await getIncidentRole(incidentId, assignedTo);

  if (role == "VIEWER") {
    throw new HttpError(400, "The task assignee must be an incident owner or responder");
  }
}

export async function create(incidentId: string, input: CreateTaskInput, createdBy: string) {
  const incident = await findIncidentById(incidentId);

  if (!incident) {
    throw new HttpError(404, "Incident not found");
  }

  const role = await getIncidentRole(incidentId, createdBy);

  if (role !== "OWNER" && role !== "RESPONDER") {
    throw new HttpError(403, "Only incident owners and responders can create tasks");
  }

  await validateAssignee(incidentId, input.assignedTo);

  const task = await taskRepository.createTask(incidentId, input.title, input.description, createdBy, input.assignedTo);

  await incidentEventService.record(incidentId, createdBy, IncidentEventType.TASK_CREATED, {
    task_id: task.id,
    task_title: task.title,
    assigned_to: task.assigned_to,
  });

  return task;
}

export async function list(incidentId: string, currentUserId: string) {
  const incident = await findIncidentById(incidentId);

  if (!incident) {
    throw new HttpError(404, "Incident not found");
  }

  const isMember = await isIncidentMember(incidentId, currentUserId);

  if (!isMember) {
    throw new HttpError(403, "You do not have access to this incident");
  }

  return taskRepository.findTasks(incidentId);
}

export async function update(taskId: string, input: UpdateTaskInput, currentUserId: string) {
  const task = await taskRepository.findTaskById(taskId);

  if (!task) {
    throw new HttpError(404, "Task not found");
  }

  const role = await getIncidentRole(task.incident_id, currentUserId);

  if (!role) {
    throw new HttpError(403, "You do not have access to this incident");
  }

  const isTaskCreator = task.created_by === currentUserId;
  const isIncidentOwner = role === "OWNER";

  if (!isTaskCreator && !isIncidentOwner) {
    throw new HttpError(403, "Only the incident owner or task creator can edit task details");
  }

  if (input.assignedTo !== undefined) {
    await validateAssignee(task.incident_id, input.assignedTo);
  }

  const updatedTask = await taskRepository.updateTask(taskId, input);

  if (!updatedTask) {
    throw new HttpError(404, "Task not found");
  }

  return updatedTask;
}

export async function updateStatus(taskId: string, status: TaskStatus, currentUserId: string) {
  const task = await taskRepository.findTaskById(taskId);

  if (!task) {
    throw new HttpError(404, "Task not found");
  }

  const role = await getIncidentRole(task.incident_id, currentUserId);

  if (!role) {
    throw new HttpError(403, "You do not have access to this incident");
  }

  const isTaskCreator = task.created_by === currentUserId;
  const isTaskAssignee = task.assigned_to === currentUserId;
  const isIncidentOwner = role === "OWNER";

  const canChangeStatus = isIncidentOwner || isTaskCreator || isTaskAssignee;

  if (!canChangeStatus) {
    throw new HttpError(403, "Only the incident owner, task creator, or assigned user can change task status");
  }

  const oldStatus = task.status;

  const updatedTask = await taskRepository.updateTaskStatus(taskId, status);

  if (!updatedTask) {
    throw new HttpError(404, "Task not found");
  }

  if (oldStatus !== updatedTask?.status) {
    await incidentEventService.record(task.incident_id, currentUserId, IncidentEventType.TASK_STATUS_CHANGED, {
      task_id: task.id,
      task_title: task.title,
      old_status: oldStatus,
      new_status: updatedTask.status,
    });
  }

  return updatedTask;
}

export async function remove(taskId: string, currentUserId: string) {
  const task = await taskRepository.findTaskById(taskId);

  if (!task) {
    throw new HttpError(404, "Task not found");
  }

  const role = await getIncidentRole(task.incident_id, currentUserId);

  if (!role) {
    throw new HttpError(403, "You do not have access to this incident");
  }

  const isTaskCreator = task.created_by === currentUserId;
  const isIncidentOwner = role === "OWNER";

  if (!isTaskCreator && !isIncidentOwner) {
    throw new HttpError(403, "Only the incident owner or task creator can delete this task");
  }

  const deletedTask = await taskRepository.deleteTask(taskId);

  await incidentEventService.record(task.incident_id, currentUserId, IncidentEventType.TASK_DELETED, {
    task_id: task.id,
    task_title: task.title,
  });

  if (!deletedTask) {
    throw new HttpError(404, "Task not found");
  }

  return deletedTask;
}
