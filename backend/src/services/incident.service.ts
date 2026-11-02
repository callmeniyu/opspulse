import { createIncident, findIncidents, findIncidentById, updateIncident, updateIncidentStatus } from "../repositories/incident.repository.js";

import type { CreateIncidentInput, UpdateIncidentInput, UpdateIncidentStatusInput } from "../validators/incident.validator.js";

import { findIncidentOwner, getIncidentRole } from "../repositories/incident-access.repository.js";

import * as incidentEventService from "./incident-event.service.js";

import { HttpError } from "../utils/HttpError.js";
import type { IncidentStatus } from "../types/incidentTypes.js";
import { IncidentEventType } from "../types/incidentEventType.js";

export async function create(input: CreateIncidentInput, userId: string) {
  const incident = await createIncident(input.title, input.description, input.severity, userId);

  await incidentEventService.record(incident.id, userId, IncidentEventType.INCIDENT_CREATED, {
    title: incident.title,
    severity: incident.severity,
  });

  return incident;
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
  const owner = await findIncidentOwner(id);

  if (!role) {
    throw new HttpError(403, `You do not have access to this incident. Please contact the incident owner ${owner?.name} for access.`);
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

  const previousData = {
    title: incident.title,
    description: incident.description,
    severity: incident.severity,
  };
  const updated = await updateIncident(id, input.title, input.description, input.severity);

  if (!updated) {
    throw new HttpError(404, "Incident not found");
  }

  if (previousData.title !== updated.title || previousData.description !== updated.description || previousData.severity !== updated.severity) {
    await incidentEventService.record(id, userId, IncidentEventType.INCIDENT_UPDATED, {
      old: previousData,
      new: {
        title: updated.title,
        description: updated.description,
        severity: updated.severity,
      },
    });
  }

  return updated;
}

export async function changeStatus(id: string, input: { status: IncidentStatus }, userId: string) {
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

  const previousStatus = incident.status;

  const updated = await updateIncidentStatus(id, input.status);

  if (!updated) {
    throw new HttpError(404, "Incident not found");
  }

  if (previousStatus !== updated.status) {
    await incidentEventService.record(id, userId, IncidentEventType.INCIDENT_STATUS_CHANGED, {
      old_status: previousStatus,
      new_status: updated.status,
    });
  }

  return updated;
}
