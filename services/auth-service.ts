import { apiRequest } from "@/lib/api-client";
import type {
  AuthUser,
  LoginData,
  LoginInput,
  RegisterInput,
} from "@/types/auth";

export function registerUser(input: RegisterInput): Promise<AuthUser> {
  return apiRequest<AuthUser>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function loginUser(input: LoginInput): Promise<LoginData> {
  return apiRequest<LoginData>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getCurrentUser(token: string): Promise<AuthUser> {
  return apiRequest<AuthUser>("/auth/me", {
    method: "GET",
    token,
  });
}