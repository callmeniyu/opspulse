// frontend/api/auth.api.ts
import { User } from "../../backend/src/types/UserTypes";
import { apiFetch } from "../lib/apiFetch";

export type LoginResponse = {
  user: User;
  accessToken: string;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};

export type RegisterResponse = {
  user: User;
};

export async function loginUser(credentials: { email: string; password: string }) {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
    skipRefresh: true,
  });
}

export function registerUser(credentials: RegisterRequest): Promise<RegisterResponse> {
  return apiFetch<RegisterResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export async function logoutUser() {
  return apiFetch<{ message: string }>("/auth/logout", {
    method: "GET",
  });
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await apiFetch<{ user: User }>("/auth/me", {
      method: "GET",
    });
    return response.user;
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
}
