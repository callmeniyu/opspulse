import { addMember, findMembers, removeMember, isIncidentMember, updateMemberRole } from "../repositories/incident-member.repository.js";
import { findIncidentById } from "../repositories/incident.repository.js";
import { findUserById, findUserCandidateByEmail } from "../repositories/user.repository.js";
import { getIncidentRole } from "../repositories/incident-access.repository.js";
import { HttpError } from "../utils/HttpError.js";
import type { AddMemberInput } from "../validators/incident-member.validator.js";
import * as taskRepository from "../repositories/task.repository.js";
import * as incidentEventService from "./incident-event.service.js";
import { IncidentEventType } from "../types/incidentEventType.js";
export async function findCandidate(incidentId: string, email: string, currentUserId: string) {
  const incident = await findIncidentById(incidentId);
  if (!incident) throw new HttpError(404, "Incident not found");

  const role = await getIncidentRole(incidentId, currentUserId);
  if (role !== "OWNER") {
    throw new HttpError(403, "Only the incident owner can add responders");
  }

  const user = await findUserCandidateByEmail(email);
  if (!user) {
    throw new HttpError(404, "No registered user found for that email");
  }

  if (await isIncidentMember(incidentId, user.id)) {
    throw new HttpError(409, "This user is already a member of the incident");
  }

  return user;
}

export async function add(incidentId: string, input: AddMemberInput, currentUserId: string) {
  const incident = await findIncidentById(incidentId);
  if (!incident) throw new HttpError(404, "Incident not found");

  const role = await getIncidentRole(incidentId, currentUserId);
  if (role !== "OWNER") {
    throw new HttpError(403, "Only the incident owner can add responders");
  }

  const user = await findUserById(input.userId);
  if (!user) throw new HttpError(404, "Registered user not found");

  if (await isIncidentMember(incidentId, input.userId)) {
    throw new HttpError(409, "This user is already a member of the incident");
  }

  const member = await addMember(incidentId, input.userId, input.role);

  if (!member) {
    throw new HttpError(500, "Failed to add member to the incident");
  }

  await incidentEventService.record(incidentId, currentUserId, IncidentEventType.MEMBER_ADDED, {
    member_id: user.id,
    member_name: user.name,
    role: input.role,
  });

  return member;
}

export async function list(incidentId: string, currentUserId: string) {
  const incident = await findIncidentById(incidentId);
  if (!incident) throw new HttpError(404, "Incident not found");

  if (!(await isIncidentMember(incidentId, currentUserId))) {
    throw new HttpError(403, "You do not have access to this incident");
  }

  return findMembers(incidentId);
}

export async function updateRole(incidentId: string, userId: string, newRole: "OWNER" | "RESPONDER" | "VIEWER", currentUserId: string) {
  const incident = await findIncidentById(incidentId);
  if (!incident) throw new HttpError(404, "Incident not found");

  const role = await getIncidentRole(incidentId, currentUserId);
  if (role !== "OWNER") {
    throw new HttpError(403, "Only the incident owner can update member roles");
  }

  if (!(await isIncidentMember(incidentId, userId))) {
    throw new HttpError(404, "User is not a member of the incident");
  }

  if (userId === incident.created_by) {
    throw new HttpError(400, "The incident owner's role cannot be changed");
  }

  const oldRole = await getIncidentRole(incidentId, userId);
  const updatedMember = await updateMemberRole(incidentId, userId, newRole);

  await incidentEventService.record(incidentId, currentUserId, IncidentEventType.MEMBER_ROLE_UPDATED, {
    member_id: userId,
    old_role: oldRole,
    new_role: newRole,
  });
}

export async function remove(incidentId: string, userId: string, currentUserId: string) {
  const incident = await findIncidentById(incidentId);
  if (!incident) throw new HttpError(404, "Incident not found");

  const role = await getIncidentRole(incidentId, currentUserId);
  if (role !== "OWNER") {
    throw new HttpError(403, "Only the incident owner can remove responders");
  }

  if (userId === incident.created_by) {
    throw new HttpError(400, "The incident owner cannot be removed");
  }

  const isMember = await isIncidentMember(incidentId, userId);

  if (!isMember) {
    throw new HttpError(404, "Incident member not found");
  }

  const hasCreatedTasks = await taskRepository.hasTasksCreatedBy(incidentId, userId);

  if (hasCreatedTasks) {
    throw new HttpError(409, "This member cannot be removed because they created one or more incident tasks");
  }

  const member = await findUserById(userId);
  if (!member) {
    throw new HttpError(404, "Registered user not found");
  }

  const removed = await removeMember(incidentId, userId);
  if (!removed) throw new HttpError(404, "Incident member not found");

  await incidentEventService.record(incidentId, currentUserId, IncidentEventType.MEMBER_REMOVED, {
    member_id: member.id,
    member_name: member.name,
    member_role: member.role,
  });

  return removed;
}
