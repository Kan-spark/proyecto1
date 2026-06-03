import { http } from "./http";
import type { Role } from "./auth";

// ── Tipos alineados con el backend ───────────────────────────────────────────

export type Product = {
  id: number;
  name: string;
  [key: string]: unknown;
};

export type UserProfile = {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  role: Role;
  isVerified: boolean;
  createdAt: string;
  products: Product[];
};

export type UpdateUserDto = {
  email?: string;
  password?: string;
  fullName?: string;
  phone?: string;
  role?: Role;
};

export type UpdateUserResponse = {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  role: Role;
  isVerified: boolean;
  createdAt: string;
};

// ── Llamadas ─────────────────────────────────────────────────────────────────

export const usersApi = {
  /** GET /users/me — perfil completo con productos */
  getMe: () => http<UserProfile>("/users/me"),

  /** PATCH /users/me — actualiza campos opcionales */
  updateMe: (dto: UpdateUserDto) =>
    http<UpdateUserResponse>("/users/me", {
      method: "PATCH",
      body: JSON.stringify(dto),
    }),
};