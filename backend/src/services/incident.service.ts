import { createIncident, findIncidents, findIncidentById, updateIncident, updateIncidentStatus } from "../repositories/incident.repository.js";

import type { CreateIncidentInput, UpdateIncidentInput, UpdateIncidentStatusInput } from "../validators/incident.validator.js";

import { findIncidentsForUser, getIncidentRole } from "../repositories/incident-access.repository.js";

import { HttpError } from "../utils/HttpError.js";

export async function create(input: CreateIncidentInput, userId: string) {
  return await createIncident(input.title, input.description, input.severity, userId);
}

export async function list() {
  return await findIncidents();
}

export async function getById(id: string, userId: string) {
  const incident = await findIncidentById(id);

  if (!incident) {
    throw new HttpError(404, "Incident not found");
  }

  const role = await getIncidentRole(id, userId);

  if (!role) {
    throw new HttpError(403, "You do not have access to this incident");
  }

  return { ...incident, current_user_role: role };
}

export async function update(id: string, input: UpdateIncidentInput, userId: string) {
  const incident = await findIncidentById(id);

  if (!incident) {
    throw new HttpError(404, "Incident not found");
  }

  const role = await getIncidentRole(id, userId);

  if (!role) {
    throw new HttpError(403, "You do not have access to this incident");
  }

  if (role !== "OWNER") {
    throw new HttpError(403, "Only the incident owner can edit incident details");
  }

  const updated = await updateIncident(id, input.title, input.description, input.severity);

  if (!updated) {
    throw new HttpError(404, "Incident not found");
  }

  return updated;
}

export async function changeStatus(id: string, input: UpdateIncidentStatusInput, userId: string) {
  const incident = await findIncidentById(id);

  if (!incident) {
    throw new HttpError(404, "Incident not found");
  }

  const role = await getIncidentRole(id, userId);

  if (!role) {
    throw new HttpError(403, "You do not have access to this incident");
  }

  if (role !== "OWNER" && role !== "RESPONDER") {
    throw new HttpError(403, "Only the incident owner or a responder can change its status");
  }

  const updated = await updateIncidentStatus(id, input.status);

  if (!updated) {
    throw new HttpError(404, "Incident not found");
  }

  return updated;
}
