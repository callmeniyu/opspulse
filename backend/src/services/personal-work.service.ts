import { findTasksAssignedToUser, findTeamsForUser } from "../repositories/personal-work.repository.js";

export async function listMyTasks(userId: string) {
  return findTasksAssignedToUser(userId);
}

export async function listMyTeams(userId: string) {
  return findTeamsForUser(userId);
}
