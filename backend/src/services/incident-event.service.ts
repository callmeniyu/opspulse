import * as eventRepository from "../repositories/incident-event.repository.js";
import { findIncidentById } from "../repositories/incident.repository.js";
import { isIncidentMember } from "../repositories/incident-member.repository.js";
import { HttpError } from "../utils/HttpError.js";
import type { IncidentEventType } from "../types/incidentEventType.js";

export async function record(incidentId: string, userId: string | null, eventType: IncidentEventType, metadata: Record<string, unknown> = {}) {
  return eventRepository.createIncidentEvent(incidentId, userId, eventType, metadata);
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

  return eventRepository.findIncidentEvents(incidentId);
}
