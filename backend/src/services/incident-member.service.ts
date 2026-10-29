import { addMember, findMembers, removeMember, isIncidentMember } from "../repositories/incident-member.repository.js";

import { findIncidentById } from "../repositories/incident.repository.js";
import { HttpError } from "../utils/HttpError.js";

import type { IncidentMemberRole } from "../types/incidentMemberTypes.js";

import type { AddMemberInput } from "../validators/incident-member.validator.js";

export async function add(incidentId: string, input: AddMemberInput, currentUserId: string) {
  const incident = await findIncidentById(incidentId);

  if (!incident) {
    throw new HttpError(404, "Incident not found");
  }

  if (incident.created_by !== currentUserId) {
    throw new HttpError(403, "Only the incident creator can add members");
  }

  return await addMember(incidentId, input.userId, input.role);
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

  return findMembers(incidentId);
}

export async function remove(incidentId: string, userId: string, currentUserId: string) {
  const incident = await findIncidentById(incidentId);
  if (!incident) {
    throw new HttpError(404, "Incident not found");
  }

  if (incident.created_by !== currentUserId) {
    throw new HttpError(403, "Only the incident creator can remove members");
  }

  const removed = await removeMember(incidentId, userId);

  if (!removed) {
    throw new HttpError(404, "Incident member not found");
  }

  return removed;
}
