import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ordersApi, type CreateOrderDto, type OrderStatus } from "./orders";

const keys = {
    all: ["orders"] as const,
    userHistory: (userId: number, role: "BUYER" | "PRODUCER") => ["orders", "user", userId, role] as const,
    detail: (id: number) => ["orders", "detail", id] as const,
};

export function useUserOrders(userId: number, role: "BUYER" | "PRODUCER") {
    return useQuery({
        queryKey: keys.userHistory(userId, role),
        queryFn: () => ordersApi.listByUser(userId, role),
        enabled: userId > 0, // Evita llamadas innecesarias si no hay ID de usuario activo
    });
}

export function useOrderDetail(id: number) {
    return useQuery({
        queryKey: keys.detail(id),
        queryFn: () => ordersApi.getOne(id),
        enabled: id > 0,
    });
}

export function useCreateOrder() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (dto: CreateOrderDto) => ordersApi.create(dto),
        onSuccess: () => {
            // Invalida el caché general de órdenes para reflejar la compra de inmediato
            qc.invalidateQueries({ queryKey: keys.all });
        },
    });
}

export function useUpdateOrderStatus() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: number; status: OrderStatus }) => 
            ordersApi.updateStatus(id, status),
        onSuccess: (_, variables) => {
            qc.invalidateQueries({ queryKey: keys.all });
            qc.invalidateQueries({ queryKey: keys.detail(variables.id) });
        },
    });
}