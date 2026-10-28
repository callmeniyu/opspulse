import { Incident, UpdateIncidentInput } from "@/types/incidentTypes";
import { apiFetch } from "@/lib/apiFetch";

export function getIncidents() {
  return apiFetch<{ incidents: Incident[] }>("/incidents");
}

export function getIncidentById(id: string) {
  return apiFetch<{ incident: Incident }>(`/incidents/${id}`);
}

export function createIncident(data: { title: string; description?: string; severity: Incident["severity"] }) {
  return apiFetch<{ incident: Incident }>("/incidents", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateIncident(id: string, data: UpdateIncidentInput) {
  return apiFetch<{ incident: Incident }>(`/incidents/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function changeIncidentStatus(id: string, status: Incident["status"]) {
  return apiFetch<{ incident: Incident }>(`/incidents/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
