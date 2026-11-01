import { apiFetch } from "@/lib/apiFetch";
import { Task, CreateTaskInput, TaskStatus, UpdateTaskInput } from "@/types/taskTypes";

export async function createTask(incidentId: string, taskData: CreateTaskInput): Promise<Task> {
  const response = await apiFetch<{ task: Task }>(`/incidents/${incidentId}/tasks`, {
    method: "POST",
    body: JSON.stringify(taskData),
  });
  return response.task;
}

export const getTasksByIncidentId = async (incidentId: string): Promise<Task[]> => {
  const response = await apiFetch<{ tasks: Task[] }>(`/incidents/${incidentId}/tasks`);
  return response.tasks;
};

export const updateTask = async (taskId: string, taskData: UpdateTaskInput): Promise<Task> => {
  const response = await apiFetch<{ task: Task }>(`/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify(taskData),
  });
  return response.task;
};

export const updateTaskStatus = async (taskId: string, status: TaskStatus): Promise<Task> => {
  const response = await apiFetch<{ task: Task }>(`/tasks/${taskId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  return response.task;
};

export async function deleteTask(taskId: string): Promise<void> {
  await apiFetch<{ task: unknown }>(`/tasks/${taskId}`, {
    method: "DELETE",
  });
}
