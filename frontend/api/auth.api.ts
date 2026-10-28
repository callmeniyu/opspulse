// frontend/api/auth.api.ts
import { apiFetch } from "../lib/apiFetch";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
};

export type LoginResponse = {
  user: AuthUser;
  accessToken: string;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};

export type RegisterResponse = {
  user: AuthUser;
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
