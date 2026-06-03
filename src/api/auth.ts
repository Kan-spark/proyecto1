import { http } from "./http";

// ── Tipos alineados con el backend ──────────────────────────────────────────

export type Role = "PRODUCER" | "BUYER";

export type AuthUser = {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  role: Role;
  isVerified: boolean;
};

/** Lo que devuelve POST /auth/login */
export type LoginResponse = {
  access_token: string;
  user: AuthUser;
};

/** Lo que devuelve POST /auth/register (usuario sin password) */
export type RegisterResponse = Omit<AuthUser, never> & {
  createdAt: string;
  updatedAt: string;
};

// ── DTOs ────────────────────────────────────────────────────────────────────

export type LoginDto = {
  email: string;
  password: string;
};

export type RegisterDto = {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  role: Role;
};

// ── Capa de llamadas ─────────────────────────────────────────────────────────

export const authApi = {
  login: (dto: LoginDto) =>
    http<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  register: (dto: RegisterDto) =>
    http<RegisterResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(dto),
    }),
};