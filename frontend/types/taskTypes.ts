export type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED";

export interface Task {
  id: string;
  incident_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  assigned_user_id: string | null;
  assigned_user_name: string | null;
  assigned_user_role: "OWNER" | "RESPONDER" | "VIEWER" | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string | null;
  assignedTo?: string | null;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  assignedTo?: string | null;
  status?: TaskStatus;
}
