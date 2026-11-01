import { getIncidentRole } from "../repositories/incident-access.repository.js";
import { HttpError } from "../utils/HttpError.js";

function canManageTasks(role: string | null): boolean {
  return role === "OWNER" || role === "RESPONDER";
}

export async function requireTaskManager(incidentId: string, userId: string) {
  const role = await getIncidentRole(incidentId, userId);

  if (!role) {
    throw new HttpError(403, "You do not have access to this incident");
  }

  if (!canManageTasks(role)) {
    throw new HttpError(403, "Only incident owners and responders can manage tasks");
  }
}
