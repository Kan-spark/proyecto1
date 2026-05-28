import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productsApi, type CreateProductDto, type UpdateProductDto, type GetProductsFilterDto } from "./products";

const keys = {
    all: ["products"] as const,
    lists: () => ["products", "list"] as const,
    listFiltered: (filters?: GetProductsFilterDto) => ["products", "list", { ...filters }] as const,
    detail: (id: number) => ["products", "detail", id] as const,
};

export function useProducts(filters?: GetProductsFilterDto) {
    return useQuery({
        queryKey: keys.listFiltered(filters),
        queryFn: () => productsApi.list(filters),
    });
}

export function useProductDetail(id: number) {
    return useQuery({
        queryKey: keys.detail(id),
        queryFn: () => productsApi.getOne(id),
        enabled: id > 0,
    });
}

export function useCreateProduct() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (dto: CreateProductDto) => productsApi.create(dto),
        onSuccess: () => {
            // Invalida todas las listas de productos para forzar el refresco de catálogos
            qc.invalidateQueries({ queryKey: keys.lists() });
        },
    });
}

export function useUpdateProduct() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, userId, dto }: { id: number; userId: number; dto: UpdateProductDto }) => 
            productsApi.update(id, userId, dto),
        onSuccess: (_, variables) => {
            qc.invalidateQueries({ queryKey: keys.lists() });
            qc.invalidateQueries({ queryKey: keys.detail(variables.id) });
        },
    });
}

export function useDeleteProduct() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, userId }: { id: number; userId: number }) => 
            productsApi.remove(id, userId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: keys.lists() });
        },
    });
}