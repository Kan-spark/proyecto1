import { http } from "./http";

export interface Review {
  id: number;
  rating: number;
  comment?: string;
  orderId: number;
  authorId: number;
  createdAt: string;
  author?: {
    fullName: string;
  };
}

export const reviewsApi = {
  // GET /reviews/producer/:id (Ruta exacta del backend)
  getByProducer: (producerId: number) => {
    return http<Review[]>(`/reviews/producer/${producerId}`, { method: "GET" });
  },

  // POST /reviews (Envía la estructura exacta del CreateReviewDto)
  create: (dto: { orderId: number; authorId: number; rating: number; comment?: string }) => {
    return http<Review>("/reviews", {
      method: "POST",
      body: JSON.stringify(dto),
    });
  },
};