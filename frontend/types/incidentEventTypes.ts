export type IncidentEventType = "INCIDENT_CREATED" | "INCIDENT_UPDATED" | "INCIDENT_STATUS_CHANGED" | "INCIDENT_SEVERITY_CHANGED" | "MEMBER_ADDED" | "MEMBER_REMOVED" | "MEMBER_ROLE_UPDATED" | "TASK_CREATED" | "TASK_UPDATED" | "TASK_ASSIGNED" | "TASK_STATUS_CHANGED" | "TASK_DELETED";

export interface IncidentEvent {
  id: string;
  incident_id: string;
  user_id: string | null;
  user_name: string | null;
  event_type: IncidentEventType;
  metadata: Record<string, unknown> | null;
  created_at: string;
}
