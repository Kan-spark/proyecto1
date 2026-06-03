import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { reviewsApi, type CreateReviewDto } from "./reviews";

// ── Keys ─────────────────────────────────────────────────────────────────────

const keys = {
  all: ["reviews"] as const,
  byProducer: (producerId: number) => ["reviews", "producer", producerId] as const,
};

// ── Queries ──────────────────────────────────────────────────────────────────

/** GET /reviews/producer/:id — reseñas de un productor */
function useProducerReviews(producerId: number) {
  return useQuery({
    queryKey: keys.byProducer(producerId),
    queryFn: () => reviewsApi.findByProducer(producerId),
    enabled: producerId > 0,
  });
}

// ── Mutations ────────────────────────────────────────────────────────────────

/** POST /reviews — solo BUYER */
function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateReviewDto) => reviewsApi.create(dto),
    // Invalida reseñas del productor y el historial de pedidos
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}

export { useProducerReviews, useCreateReview };