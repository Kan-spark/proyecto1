import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "../api/products.queries";
import type { Category, CreateProductDto, Product, UpdateProductDto } from "../api/products";

// ── Constantes ────────────────────────────────────────────────────────────────

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "PESQUERO", label: "Pesquero" },
  { value: "AGROPECUARIO", label: "Agropecuario" },
];

const EMPTY_FORM: CreateProductDto = {
  title: "",
  description: "",
  price: 0,
  unit: "",
  stock: 0,
  location: "",
  category: "AGROPECUARIO",
  imageUrl: "",
};

// ── Componente principal ──────────────────────────────────────────────────────

export default function ProductsPage() {
  const { user } = useAuth();
  const isProducer = user?.role === "PRODUCER";

  // ── Filtros ────────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<Category | "">("");
  const [locationFilter, setLocationFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Solo envía filtros no vacíos al query
  const activeFilters = {
    ...(search && { search }),
    ...(categoryFilter && { category: categoryFilter as Category }),
    ...(locationFilter && { location: locationFilter }),
    ...(minPrice && { minPrice }),
    ...(maxPrice && { maxPrice }),
  };

  const { data: products = [], isLoading, isError, error } = useProducts(activeFilters);
  const createMut = useCreateProduct();
  const updateMut = useUpdateProduct();
  const deleteMut = useDeleteProduct();

  // ── Modal crear / editar ───────────────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<CreateProductDto>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);

  function openCreate() {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setModalOpen(true);
  }

  function openEdit(p: Product) {
    setEditingProduct(p);
    setForm({
      title: p.title,
      description: p.description ?? "",
      price: p.price,
      unit: p.unit,
      stock: p.stock,
      location: p.location,
      category: p.category,
      imageUrl: p.imageUrl ?? "",
    });
    setFormError(null);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingProduct(null);
    setFormError(null);
  }

  function setField<K extends keyof CreateProductDto>(key: K, val: CreateProductDto[K]) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  function validate(): string | null {
    if (!form.title.trim()) return "El título es obligatorio.";
    if (!form.price || form.price <= 0) return "El precio debe ser mayor a cero.";
    if (!form.unit.trim()) return "La unidad de medida es obligatoria.";
    if (form.stock < 0) return "El stock no puede ser negativo.";
    if (!form.location.trim()) return "La ubicación es obligatoria.";
    return null;
  }


async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  const validationError = validate();
  if (validationError) { setFormError(validationError); return; }
  setFormError(null);

  try {
    if (editingProduct) {
      // ✅ Solo envía los campos que cambiaron respecto al producto original
      const dto: UpdateProductDto = {};
      if (form.title !== editingProduct.title) dto.title = form.title;
      if (form.description !== (editingProduct.description ?? "")) dto.description = form.description || undefined;
      if (form.price !== editingProduct.price) dto.price = form.price;
      if (form.unit !== editingProduct.unit) dto.unit = form.unit;
      if (form.stock !== editingProduct.stock) dto.stock = form.stock;
      if (form.location !== editingProduct.location) dto.location = form.location;
      if (form.category !== editingProduct.category) dto.category = form.category;
      if (form.imageUrl !== (editingProduct.imageUrl ?? "")) dto.imageUrl = form.imageUrl || undefined;

      await updateMut.mutateAsync({ id: editingProduct.id, dto });
    } else {
      // Crear: envía todo
      const payload: CreateProductDto = {
        ...form,
        description: form.description || undefined,
        imageUrl: form.imageUrl || undefined,
      };
      await createMut.mutateAsync(payload);
    }
    closeModal();
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    setFormError(
      msg.includes("403") || msg.toLowerCase().includes("forbidden")
        ? "No tienes permisos para realizar esta acción."
        : "Error al guardar el producto. Intenta de nuevo."
    );
  }
}

  async function handleDelete(p: Product) {
    if (!confirm(`¿Seguro que deseas eliminar "${p.title}"?`)) return;
    try {
      await deleteMut.mutateAsync(p.id);
    } catch {
      alert("Error al eliminar el producto.");
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

return (
  <div className="space-y-6">

    {/* Encabezado */}
    <div className="flex items-start justify-between gap-4 pb-2 border-b border-emerald-100">
      <div>
        <h1 className="text-3xl font-bold text-emerald-800">Productos</h1>
        <p className="text-slate-500 text-sm mt-1">
          {isProducer
            ? "Administra y publica tus productos agropecuarios y pesqueros."
            : "Encuentra productos frescos directamente de productores y pescadores."}
        </p>
      </div>
      {isProducer && (
        <button
          onClick={openCreate}
          className="shrink-0 flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white font-medium hover:bg-emerald-700 transition-colors"
        >
          <i className="ti ti-plus text-[15px]" />
          Nuevo producto
        </button>
      )}
    </div>

    {/* Filtros */}
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <div className="sm:col-span-2 lg:col-span-1">
        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
          Buscar
        </label>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Título o descripción…"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
          Categoría
        </label>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as Category | "")}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
        >
          <option value="">Todas</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
          Ubicación
        </label>
        <input
          type="text"
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          placeholder="Ciudad o municipio…"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
          Precio mínimo
        </label>
        <input
          type="number"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          placeholder="0"
          min={0}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
          Precio máximo
        </label>
        <input
          type="number"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          placeholder="Sin límite"
          min={0}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
      </div>

      <div className="flex items-end">
        <button
          onClick={() => {
            setSearch("");
            setCategoryFilter("");
            setLocationFilter("");
            setMinPrice("");
            setMaxPrice("");
          }}
          className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 transition-colors"
        >
          <i className="ti ti-x text-[14px]" />
          Limpiar filtros
        </button>
      </div>
    </div>

    {/* Estados de carga / error */}
    {isLoading && (
      <p className="text-sm text-emerald-600 animate-pulse">Cargando productos…</p>
    )}
    {isError && (
      <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 flex items-center gap-2">
        <i className="ti ti-alert-circle text-[16px]" />
        Error al cargar productos: {String(error)}
      </div>
    )}

    {/* Grilla de productos */}
    {!isLoading && !isError && (
      <>
        <p className="text-sm text-slate-400">
          {products.length} producto(s) encontrado(s)
        </p>

        {products.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-10 flex flex-col items-center gap-2 text-slate-400">
            <i className="ti ti-mood-empty text-[36px]" />
            <p className="text-sm">No hay productos que coincidan con los filtros.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => {
              const isOwner = isProducer && p.producerId === user?.id;
              return (
                <div
                  key={p.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Imagen o placeholder */}
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.title}
                      className="h-40 w-full object-cover"
                    />
                  ) : (
                    <div className="h-40 w-full bg-emerald-50 flex flex-col items-center justify-center gap-1 text-emerald-300">
                      <i className="ti ti-photo-off text-[28px]" />
                      <span className="text-xs">Sin imagen</span>
                    </div>
                  )}

                  <div className="p-4 flex flex-col gap-2 flex-1">
                    {/* Badge categoría */}
                    <span
                      className={`self-start rounded-full px-2.5 py-0.5 text-xs font-medium flex items-center gap-1 ${
                        p.category === "PESQUERO"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      <i className={`ti ${p.category === "PESQUERO" ? "ti-fish" : "ti-plant"} text-[12px]`} />
                      {p.category === "PESQUERO" ? "Pesquero" : "Agropecuario"}
                    </span>

                    <h3 className="font-semibold text-slate-800 leading-tight">
                      {p.title}
                    </h3>

                    {p.description && (
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {p.description}
                      </p>
                    )}

                    <div className="mt-auto pt-2 border-t border-slate-100 space-y-1.5 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 flex items-center gap-1">
                          <i className="ti ti-currency-dollar text-[13px]" />Precio
                        </span>
                        <span className="font-semibold text-emerald-700">
                          ${p.price.toLocaleString("es-CO")} / {p.unit}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 flex items-center gap-1">
                          <i className="ti ti-stack text-[13px]" />Stock
                        </span>
                        <span className="text-slate-700">{p.stock} {p.unit}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 flex items-center gap-1">
                          <i className="ti ti-map-pin text-[13px]" />Ubicación
                        </span>
                        <span className="text-slate-700 text-right">{p.location}</span>
                      </div>
                    </div>

                    {/* Datos del productor — visible solo para BUYER */}
                    {!isProducer && (
                      <div className="mt-2 rounded-lg bg-emerald-50 border border-emerald-100 p-2 text-xs text-slate-600 space-y-0.5">
                        <p>
                          <span className="font-medium">Productor:</span>{" "}
                          {p.producer.fullName}
                          {p.producer.isVerified && (
                            <span className="ml-1 text-emerald-600">
                              <i className="ti ti-circle-check text-[12px]" />
                            </span>
                          )}
                        </p>
                        <p>
                          <span className="font-medium">Contacto:</span>{" "}
                          {p.producer.phone}
                        </p>
                      </div>
                    )}

                    {/* Acciones — solo si es el dueño PRODUCER */}
                    {isOwner && (
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => openEdit(p)}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          <i className="ti ti-edit text-[13px]" />
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(p)}
                          disabled={deleteMut.isPending}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
                        >
                          <i className="ti ti-trash text-[13px]" />
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </>
    )}

    {/* Modal crear / editar */}
    {modalOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">

          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-emerald-900 flex items-center gap-2">
              <i className={`ti ${editingProduct ? "ti-edit" : "ti-plus"} text-[16px] text-emerald-600`} />
              {editingProduct ? "Editar producto" : "Nuevo producto"}
            </h2>
            <button
              onClick={closeModal}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <i className="ti ti-x text-[16px]" />
            </button>
          </div>

          {formError && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 flex items-center gap-2">
              <i className="ti ti-alert-circle text-[15px]" />
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                Título *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                disabled={createMut.isPending || updateMut.isPending}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                Descripción{" "}
                <span className="text-slate-400 normal-case font-normal">(opcional)</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
                disabled={createMut.isPending || updateMut.isPending}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                  Precio *
                </label>
                <input
                  type="number"
                  value={form.price === 0 ? "" : form.price}
                  onChange={(e) => {
                    const val = e.target.value;
                    setField("price", val === "" ? 0 : Number(val));
                  }}
                  min={0}
                  placeholder="0"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  disabled={createMut.isPending || updateMut.isPending}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                  Unidad *
                </label>
                <input
                  type="text"
                  value={form.unit}
                  onChange={(e) => setField("unit", e.target.value)}
                  placeholder="KG, Bulto…"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  disabled={createMut.isPending || updateMut.isPending}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                  Stock *
                </label>
                <input
                  type="number"
                  value={form.stock === 0 ? "" : form.stock}
                  onChange={(e) => {
                    const val = e.target.value;
                    setField("stock", val === "" ? 0 : Number(val));
                  }}
                  min={0}
                  placeholder="0"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  disabled={createMut.isPending || updateMut.isPending}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                  Categoría *
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setField("category", e.target.value as Category)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
                  disabled={createMut.isPending || updateMut.isPending}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                Ubicación de recogida *
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setField("location", e.target.value)}
                placeholder="Ej: Tumaco, Nariño"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                disabled={createMut.isPending || updateMut.isPending}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                URL de imagen{" "}
                <span className="text-slate-400 normal-case font-normal">(opcional)</span>
              </label>
              <input
                type="url"
                value={form.imageUrl}
                onChange={(e) => setField("imageUrl", e.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                disabled={createMut.isPending || updateMut.isPending}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={createMut.isPending || updateMut.isPending}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2 text-sm text-white font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                <i className="ti ti-device-floppy text-[15px]" />
                {createMut.isPending || updateMut.isPending
                  ? "Guardando…"
                  : editingProduct
                  ? "Guardar cambios"
                  : "Crear producto"}
              </button>
              <button
                type="button"
                onClick={closeModal}
                disabled={createMut.isPending || updateMut.isPending}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-slate-200 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <i className="ti ti-x text-[15px]" />
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
  </div>
);
}
