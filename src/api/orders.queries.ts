import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ordersApi, type CreateOrderDto, type UpdateOrderStatusDto } from "./orders";

// ── Keys ─────────────────────────────────────────────────────────────────────

const keys = {
  all: ["orders"] as const,
  myOrders: (role: "BUYER" | "PRODUCER") => ["orders", "my-orders", role] as const,
  detail: (id: number) => ["orders", id] as const,
};

// ── Queries ──────────────────────────────────────────────────────────────────

/** GET /orders/my-orders?role=... */
function useMyOrders(role: "BUYER" | "PRODUCER") {
  return useQuery({
    queryKey: keys.myOrders(role),
    queryFn: () => ordersApi.myOrders(role),
  });
}

/** GET /orders/:id */
function useOrder(id: number) {
  return useQuery({
    queryKey: keys.detail(id),
    queryFn: () => ordersApi.findOne(id),
    enabled: id > 0,
  });
}

// ── Mutations ────────────────────────────────────────────────────────────────

/** POST /orders */
function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateOrderDto) => ordersApi.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}

/** PATCH /orders/:id/status */
function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateOrderStatusDto }) =>
      ordersApi.updateStatus(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}

export { useMyOrders, useOrder, useCreateOrder, useUpdateOrderStatus };