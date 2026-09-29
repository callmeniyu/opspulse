import { apiClient } from "@/lib/apiClient";
import { User } from "../../backend/src/types/UserTypes";

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  user: User;
};

export function loginUser(credentials: LoginRequest): Promise<LoginResponse> {
  return apiClient<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}
