import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usersApi, type UpdateUserDto } from "./users";

// ── Keys ─────────────────────────────────────────────────────────────────────

const keys = {
  me: ["users", "me"] as const,
};

// ── Queries ──────────────────────────────────────────────────────────────────

/** Obtiene el perfil del usuario autenticado (GET /users/me) */
function useMyProfile() {
  return useQuery({
    queryKey: keys.me,
    queryFn: usersApi.getMe,
  });
}

// ── Mutations ────────────────────────────────────────────────────────────────

/** Actualiza el perfil del usuario autenticado (PATCH /users/me) */
function useUpdateMyProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateUserDto) => usersApi.updateMe(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.me }),
  });
}

export { useMyProfile, useUpdateMyProfile };