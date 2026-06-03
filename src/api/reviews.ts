import { http } from "./http";

// ── Tipos ────────────────────────────────────────────────────────────────────

export type Review = {
  id: number;
  rating: number;
  comment?: string | null;
  orderId: number;
  authorId: number;
  createdAt: string;
  author: {
    fullName: string;
  };
};

// ── DTOs ─────────────────────────────────────────────────────────────────────

export type CreateReviewDto = {
  rating: number;   // 1–5
  comment?: string;
  orderId: number;
};

// ── Llamadas ─────────────────────────────────────────────────────────────────

export const reviewsApi = {
  /** POST /reviews — requiere JWT, solo BUYER del pedido */
  create: (dto: CreateReviewDto) =>
    http<Review>("/reviews", {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  /** GET /reviews/producer/:id — público */
  findByProducer: (producerId: number) =>
    http<Review[]>(`/reviews/producer/${producerId}`),
};