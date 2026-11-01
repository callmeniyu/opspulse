import { getIncidentRole } from "../repositories/incident-access.repository.js";
import { HttpError } from "../utils/HttpError.js";

export async function requireTaskManager(incidentId: string, userId: string) {
  const role = await getIncidentRole(incidentId, userId);

  if (!role) {
    throw new HttpError(403, "You do not have access to this incident");
  }

  if (role !== "OWNER" && role !== "RESPONDER") {
    throw new HttpError(403, "Only incident owners and responders can manage tasks");
  }
}
