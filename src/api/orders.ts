import { http } from "./http";
import type { Product } from "./products";


export type OrderStatus = "PENDING" | "CONFIRMED" | "DELIVERED" | "CANCELLED";

export type OrderItem = {
    id: number;
    quantity: number;
    price: number;
    productId: number;
    product?: Product;
};

export type Order = {
    id: number;
    total: number;
    status: OrderStatus;
    buyerId: number;
    createdAt?: string;
    items?: OrderItem[];
    buyer?: {
        fullName: string;
        phone: string;
    };
};

export type CreateOrderItemDto = {
    productId: number;
    quantity: number;
};

export type CreateOrderDto = {
    buyerId: number;
    items: CreateOrderItemDto[];
};

export type UpdateOrderStatusDto = {
    status: OrderStatus;
};

export const ordersApi = {
    getOne: (id: number) => http<Order>(`/orders/${id}`),
    create: (dto: CreateOrderDto) => 
        http<Order>("/orders", { method: "POST", body: JSON.stringify(dto) }),
    listByUser: (userId: number, role: "BUYER" | "PRODUCER") => 
        http<Order[]>(`/orders/user/${userId}?role=${role}`),
    updateStatus: (id: number, status: OrderStatus) => 
        http<Order>(`/orders/${id}/status`, { 
            method: "PATCH", 
            body: JSON.stringify({ status }) 
        }),
};