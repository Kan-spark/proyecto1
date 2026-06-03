import { http } from "./http";
import type { Product } from "./products";

// ── Tipos ────────────────────────────────────────────────────────────────────

export type OrderStatus = "PENDING" | "CONFIRMED" | "DELIVERED" | "CANCELLED";

export type OrderItem = {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  product: Product;
};

export type OrderBuyer = {
  fullName: string;
  phone: string;
};

export type Order = {
  id: number;
  buyerId: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  items: OrderItem[];
  buyer: OrderBuyer;
};

// ── DTOs ─────────────────────────────────────────────────────────────────────

export type CreateOrderItemDto = {
  productId: number;
  quantity: number;
};

export type CreateOrderDto = {
  items: CreateOrderItemDto[];
};

export type UpdateOrderStatusDto = {
  status: OrderStatus;
};

// ── Llamadas ─────────────────────────────────────────────────────────────────

export const ordersApi = {
  /** POST /orders — crea pedido con items */
  create: (dto: CreateOrderDto) =>
    http<Order>("/orders", {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  /** GET /orders/my-orders?role=BUYER|PRODUCER */
  myOrders: (role: "BUYER" | "PRODUCER") =>
    http<Order[]>(`/orders/my-orders?role=${role}`),

  /** GET /orders/:id */
  findOne: (id: number) => http<Order>(`/orders/${id}`),

  /** PATCH /orders/:id/status */
  updateStatus: (id: number, dto: UpdateOrderStatusDto) =>
    http<Order>(`/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(dto),
    }),
};