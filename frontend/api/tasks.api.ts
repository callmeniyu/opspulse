import { apiClient } from "@/lib/apiClient";
import { Task } from "@/types/taskTypes";

export async function createTask(incidentId: string, taskData: Task): Promise<Task> {
  const response = await apiClient<{ task: Task }>(`/incidents/${incidentId}/tasks`, {
    method: "POST",
    body: JSON.stringify(taskData),
  });
  return response.task;
}

export const getTasksByIncidentId = async (incidentId: string): Promise<Task[]> => {
  const response = await apiClient<{ tasks: Task[] }>(`/incidents/${incidentId}/tasks`);
  return response.tasks;
};

export const updateTask = async (taskId: string, taskData: Partial<Task>): Promise<Task> => {
  const response = await apiClient<{ task: Task }>(`/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify(taskData),
  });
  return response.task;
};
