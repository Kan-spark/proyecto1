import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewsApi } from "./reviews";

const keys = {
  producer: (producerId: number) => ["reviews", "producer", producerId] as const,
};

export function useProducerReviews(producerId: number) {
  return useQuery({
    queryKey: keys.producer(producerId),
    queryFn: () => reviewsApi.getByProducer(producerId),
    // Evita que falle si al inicio pasas un ID inválido o en cero
    enabled: producerId > 0, 
  });
}

export function useCreateReview(producerIdToRefresh: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: { orderId: number; authorId: number; rating: number; comment?: string }) => {
      return reviewsApi.create(dto);
    },
    onSuccess: () => {
      // Sincroniza en caliente la lista de reputación del productor seleccionado
      queryClient.invalidateQueries({ queryKey: keys.producer(producerIdToRefresh) });
    },
  });
}