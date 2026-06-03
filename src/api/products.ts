import { http } from "./http";

// ── Tipos ────────────────────────────────────────────────────────────────────

export type Category = "PESQUERO" | "AGROPECUARIO";

export type ProductProducer = {
  fullName: string;
  phone: string;
  isVerified: boolean;
};

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
  createdAt: string;
  producer: ProductProducer;
};

// ── DTOs ─────────────────────────────────────────────────────────────────────

export type CreateProductDto = {
  title: string;
  description?: string;
  price: number;
  unit: string;
  stock: number;
  location: string;
  category: Category;
  imageUrl?: string;
};

export type UpdateProductDto = Partial<CreateProductDto>;

export type GetProductsFilterDto = {
  category?: Category;
  location?: string;
  minPrice?: string;
  maxPrice?: string;
  search?: string;
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildQuery(filters: GetProductsFilterDto): string {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.location) params.set("location", filters.location);
  if (filters.minPrice) params.set("minPrice", filters.minPrice);
  if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
  if (filters.search) params.set("search", filters.search);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

// ── Llamadas ─────────────────────────────────────────────────────────────────

export const productsApi = {
  /** GET /products — público, acepta filtros como query params */
  list: (filters: GetProductsFilterDto = {}) =>
    http<Product[]>(`/products${buildQuery(filters)}`),

  /** GET /products/:id — público */
  findOne: (id: number) => http<Product>(`/products/${id}`),

  /** POST /products — requiere JWT + rol PRODUCER */
  create: (dto: CreateProductDto) =>
    http<Product>("/products", {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  /** PATCH /products/:id — requiere JWT + ser el PRODUCER dueño */
  update: (id: number, dto: UpdateProductDto) =>
    http<Product>(`/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(dto),
    }),

  /** DELETE /products/:id — requiere JWT + ser el PRODUCER dueño */
  remove: (id: number) =>
    http<{ message: string }>(`/products/${id}`, {
      method: "DELETE",
    }),
};