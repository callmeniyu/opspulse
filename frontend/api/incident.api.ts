import { Incident, UpdateIncidentInput } from "@/types/incidentTypes";
import { apiClient } from "@/lib/apiClient";

export function getIncidents() {
  return apiClient<{ incidents: Incident[] }>("/incidents");
}

export function getIncidentById(id: string) {
  return apiClient<{ incident: Incident }>(`/incidents/${id}`);
}

export function createIncident(data: { title: string; description?: string; severity: Incident["severity"] }) {
  return apiClient<{ incident: Incident }>("/incidents", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateIncident(id: string, data: UpdateIncidentInput) {
  return apiClient<{ incident: Incident }>(`/incidents/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
