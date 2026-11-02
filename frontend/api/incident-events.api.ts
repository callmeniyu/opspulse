import { apiFetch } from "@/lib/apiFetch";
import type { IncidentEvent } from "@/types/incidentEventTypes";

export async function getIncidentEvents(incidentId: string): Promise<IncidentEvent[]> {
  const response = await apiFetch<{ events: IncidentEvent[] }>(`/incidents/${incidentId}/events`);

  return response.events;
}
