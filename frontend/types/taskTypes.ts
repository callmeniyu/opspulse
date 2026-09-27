export type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  assigned_user_id: string | null;
  assigned_user_name: string | null;
  created_at: string;
  updated_at: string;
}
