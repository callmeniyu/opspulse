import type { IncidentStatus, IncidentSeverity } from "@/types/incidentTypes";
import type { TaskStatus } from "@/types/taskTypes";
import type { IncidentMemberRole } from "@/types/memberTypes";

export interface MyTask {
  id: string;
  incident_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  assigned_user_id: string;
  assigned_user_name: string | null;
  created_at: string;
  updated_at: string;
  incident_title: string;
  incident_status: IncidentStatus;
  incident_severity: IncidentSeverity;
}

export interface MyTeam {
  incident_id: string;
  incident_title: string;
  incident_description: string | null;
  incident_status: IncidentStatus;
  incident_severity: IncidentSeverity;
  incident_created_at: string;
  incident_updated_at: string;
  created_by: string;
  current_user_role: IncidentMemberRole;
  joined_at: string;
  member_count: number;
  open_task_count: number;
}
