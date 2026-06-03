import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  productsApi,
  type CreateProductDto,
  type GetProductsFilterDto,
  type UpdateProductDto,
} from "./products";

// ── Keys ─────────────────────────────────────────────────────────────────────

const keys = {
  all: ["products"] as const,
  list: (filters: GetProductsFilterDto) =>
    ["products", "list", filters] as const,
  detail: (id: number) => ["products", id] as const,
};

// ── Queries ──────────────────────────────────────────────────────────────────

/** Lista productos con filtros opcionales (GET /products) */
function useProducts(filters: GetProductsFilterDto = {}) {
  return useQuery({
    queryKey: keys.list(filters),
    queryFn: () => productsApi.list(filters),
  });
}

/** Un producto por ID (GET /products/:id) */
function useProduct(id: number) {
  return useQuery({
    queryKey: keys.detail(id),
    queryFn: () => productsApi.findOne(id),
    enabled: id > 0,
  });
}

// ── Mutations ────────────────────────────────────────────────────────────────

/** Crea un producto — solo PRODUCER (POST /products) */
function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateProductDto) => productsApi.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}

/** Actualiza un producto — solo PRODUCER dueño (PATCH /products/:id) */
function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateProductDto }) =>
      productsApi.update(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}

/** Elimina un producto — solo PRODUCER dueño (DELETE /products/:id) */
function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => productsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}

export {
  useProducts,
  useProduct,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
};