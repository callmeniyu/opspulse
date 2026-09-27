import { createIncident, findIncidents, findIncidentById, updateIncident, updateIncidentStatus } from "../repositories/incident.repository.js";

import type { CreateIncidentInput, UpdateIncidentInput, UpdateIncidentStatusInput } from "../validators/incident.validator.js";

export async function create(input: CreateIncidentInput, userId: string) {
  return await createIncident(input.title, input.description, input.severity, userId);
}

export async function list() {
  return await findIncidents();
}

export async function getById(id: string) {
  const incident = await findIncidentById(id);
  if (!incident) {
    throw new Error("Incident not found");
  }

  return incident;
}

export async function update(id: string, input: UpdateIncidentInput) {
  const existing = await findIncidentById(id);

  if (!existing) {
    throw new Error("Incident not found");
  }

  return await updateIncident(id, input.title, input.description, input.severity);
}

export async function changeStatus(id: string, input: UpdateIncidentStatusInput) {
  const existing = await findIncidentById(id);

  if (!existing) {
    throw new Error("Incident not found");
  }

  return await updateIncidentStatus(id, input.status);
}
