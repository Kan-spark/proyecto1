import { http } from "./http";

export type Category = "PESQUERO" | "AGROPECUARIO";

export type Product = {
    id: number;
    title: string;
    description?: string | null;
    price: number;
    unit: string;
    stock: number;
    location: string;
    category: Category;
    imageUrl?: string | null;
    producerId: number;
    createdAt?: string;
    producer?: {
        fullName: string;
        phone: string;
        isVerified: boolean;
    };
};

export type CreateProductDto = {
    title: string;
    description?: string;
    price: number;
    unit: string;
    stock: number;
    location: string;
    category: Category;
    imageUrl?: string;
    producerId: number;
};

export type UpdateProductDto = Partial<CreateProductDto>;

export type GetProductsFilterDto = {
    category?: Category;
    location?: string;
    minPrice?: string;
    maxPrice?: string;
    search?: string;
};

export const productsApi = {
    list: (filters?: GetProductsFilterDto) => {
        // Convertimos el objeto de filtros en Query Params (ej: ?category=PESQUERO&search=camaron)
        const params = new URLSearchParams(filters as Record<string, string>).toString();
        const queryStr = params ? `?${params}` : "";
        return http<Product[]>(`/products${queryStr}`);
    },
    getOne: (id: number) => http<Product>(`/products/${id}`),
    create: (dto: CreateProductDto) => 
        http<Product>("/products", { method: "POST", body: JSON.stringify(dto) }),
    update: (id: number, userId: number, dto: UpdateProductDto) => 
        http<Product>(`/products/${id}`, { 
            method: "PATCH", 
            body: JSON.stringify({ ...dto, userId }) // Inyectamos el userId en el body requerido por el backend
        }),
    remove: (id: number, userId: number) => 
        http<{ message: string }>(`/products/${id}?userId=${userId}`, { method: "DELETE" }), // Pasado como query param
};