import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { http } from "./http";

export interface User {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  role: "PRODUCER" | "BUYER";
  createdAt?: string;
}

export const usersApi = {
  // GET /users
  getAll: () => http<User[]>("/users", { method: "GET" }),
  
  // GET /users/:id
  getOne: (id: number) => http<User>(`/users/${id}`, { method: "GET" }),
  
  // POST /users/register (Solo campos estrictos del CreateUserDto)
  create: (dto: { email: string; fullName: string; phone: string; role: "PRODUCER" | "BUYER"; password?: string }) => {
    return http<User>("/users/register", {
      method: "POST",
      body: JSON.stringify(dto),
    });
  },
  
  // PATCH /users/:id (Solo campos estrictos del UpdateUserDto)
  update: (id: number, dto: { fullName: string; phone: string; role?: "PRODUCER" | "BUYER" }) => {
    return http<User>(`/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(dto),
    });
  },
};

// --- HOOKS ---
export function useAllUsers() {
  return useQuery({
    queryKey: ["users", "list"],
    queryFn: usersApi.getAll,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "list"] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: any }) => usersApi.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "list"] });
    },
  });
}