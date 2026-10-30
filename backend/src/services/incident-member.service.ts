import { addMember, findMembers, removeMember, isIncidentMember } from "../repositories/incident-member.repository.js";
import { findIncidentById } from "../repositories/incident.repository.js";
import { findUserById, findUserCandidateByEmail } from "../repositories/user.repository.js";
import { getIncidentRole } from "../repositories/incident-access.repository.js";
import { HttpError } from "../utils/HttpError.js";
import type { AddMemberInput } from "../validators/incident-member.validator.js";

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

  try {
    return await addMember(incidentId, input.userId, input.role);
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") {
      throw new HttpError(409, "This user is already a member of the incident");
    }

    throw error;
  }
}

export async function list(incidentId: string, currentUserId: string) {
  const incident = await findIncidentById(incidentId);
  if (!incident) throw new HttpError(404, "Incident not found");

  if (!(await isIncidentMember(incidentId, currentUserId))) {
    throw new HttpError(403, "You do not have access to this incident");
  }

  return findMembers(incidentId);
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

  const removed = await removeMember(incidentId, userId);
  if (!removed) throw new HttpError(404, "Incident member not found");

  return removed;
}
