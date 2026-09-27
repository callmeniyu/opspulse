export type IncidentMemberRole = "OWNER" | "RESPONDER" | "VIEWER";

export interface IncidentMember {
  id: string;
  name: string;
  email: string;
  role: IncidentMemberRole;
  joined_at: string;
}
