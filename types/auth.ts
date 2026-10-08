export const USER_ROLES = [
  "CUSTOMER",
  "RESTAURANT_OWNER",
  "MODERATOR",
  "ADMIN",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export interface AuthUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
}

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginData {
  token: string;
  user: AuthUser;
}