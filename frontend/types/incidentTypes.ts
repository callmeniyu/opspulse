export type IncidentStatus = "OPEN" | "INVESTIGATING" | "MITIGATED" | "RESOLVED";

export type IncidentSeverity = "SEV1" | "SEV2" | "SEV3" | "SEV4";

export interface Incident {
  id: string;
  title: string;
  description?: string | null;
  status: IncidentStatus;
  severity: IncidentSeverity;
  created_by: string;
  creator_name?: string;
  created_at: string;
  updated_at?: string;
  current_user_role?: "OWNER" | "RESPONDER" | "VIEWER";
  resolved_at?: string | null;
}

export interface CreateIncidentInput {
  title: string;
  description?: string;
  severity: IncidentSeverity;
}

export interface UpdateIncidentInput {
  title?: string;
  description?: string | null;
  severity?: IncidentSeverity;
}
