import { apiFetch } from "@/lib/apiFetch";
import type { MyTask, MyTeam } from "@/types/personalWorkTypes";

export async function getMyTasks(): Promise<MyTask[]> {
  const response = await apiFetch<{ tasks: MyTask[] }>("/tasks/mine");
  return response.tasks;
}

export async function getMyTeams(): Promise<MyTeam[]> {
  const response = await apiFetch<{ teams: MyTeam[] }>("/teams/mine");
  return response.teams;
}
