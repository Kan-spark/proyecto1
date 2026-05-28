import { http } from "./http";

export type Role = "PRODUCER" | "BUYER";

export type User = {
    id: number;
    email: string;
    fullName: string;
    phone: string;
    role: Role;
    isVerified: boolean;
    createdAt?: string;
};

export type CreateUserDto = {
    email: string;
    password?: string; // Opcional en el tipado si se maneja desde el registro
    fullName: string;
    phone: string;
    role: Role;
};

export type UpdateUserDto = Partial<CreateUserDto>;

export const usersApi = {
    list: () => http<User[]>("/users"),
    getProfile: (id: number) => http<User>(`/users/${id}`),
    register: (dto: CreateUserDto) => 
        http<User>("/users/register", { method: "POST", body: JSON.stringify(dto) }),
    update: (id: number, dto: UpdateUserDto) => 
        http<User>(`/users/${id}`, { method: "PATCH", body: JSON.stringify(dto) }),
    remove: (id: number) => http<{ message: string }>(`/users/${id}`, { method: "DELETE" }),
};