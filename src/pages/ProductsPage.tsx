import { useState } from "react";
import { useProducts, useCreateProduct, useDeleteProduct } from "../api/products.queries";
import type { Category } from "../api/products";

export default function ProductsPage() {
  // Estado simulado para saber qué usuario interactúa (Productor dueño o Comprador)
  const [simulatedProducerId, setSimulatedProducerId] = useState<number>(1);

  // TanStack Query maneja la carga, errores y datos automáticamente
  const { data: products = [], isLoading, isError, error, refetch } = useProducts();
  const createMut = useCreateProduct();
  const deleteMut = useDeleteProduct();

  // Estados locales para los campos del formulario de creación
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("KG");
  const [stock, setStock] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState<Category>("AGROPECUARIO");

  // Manejador para enviar el formulario de creación (POST)
  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    
    await createMut.mutateAsync({
      title,
      description: description || undefined,
      price: Number(price),
      unit,
      stock: Number(stock),
      location,
      category,
      producerId: simulatedProducerId, // Inyecta el creador según la sesión simulada
    });

    // Limpiamos los campos esenciales tras la inserción exitosa
    setTitle("");
    setDescription("");
    setPrice("");
    setStock("");
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans">
      
      {/* Encabezado */}
      <div className="mb-6 flex flex-col justify-between gap-4 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-700 p-6 text-white shadow-sm sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cadena Justa — Catálogo</h1>
          <p className="mt-1 text-sm text-green-100">Gestión de productos agrícolas y pesqueros con caché optimizado</p>
        </div>
        <button
          onClick={() => refetch()}
          className="rounded-lg bg-emerald-800 px-4 py-2 text-sm font-bold border border-emerald-500 shadow-sm hover:bg-emerald-900 transition-all"
        >
          🔄 Sincronizar Catálogo
        </button>
      </div>

      {/* Selector de Usuario para pruebas locales */}
      <div className="mb-6 rounded-xl bg-slate-100 p-3 border border-slate-200 max-w-xs text-xs sm:text-sm">
        <label className="block text-gray-600 font-semibold mb-1">ID Productor Activo (Sesión):</label>
        <input 
          type="number" 
          value={simulatedProducerId} 
          onChange={(e) => setSimulatedProducerId(Number(e.target.value))} 
          className="w-full rounded border bg-white p-1.5 font-bold focus:outline-slate-500"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* COLUMNA 1: Formulario de Publicación (Create) */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm h-fit">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Publicar Cosecha / Pesca</h2>
          <p className="text-xs text-gray-500 mb-4">Los datos ingresados se guardan y actualizan masivamente el catálogo.</p>

          <form onSubmit={onCreate} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Título del Producto</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Camarón Tití Fresco, Papa Única"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Descripción</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalles del producto, empaque, etc."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 h-16 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Precio por unidad</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Ej: 5000"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Unidad Medida</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none bg-white"
                >
                  <option value="KG">Kilogramo (KG)</option>
                  <option value="Libra">Libra</option>
                  <option value="Bulto">Bulto</option>
                  <option value="Tonelada">Tonelada</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Stock Disponible</label>
                <input
                  type="number"
                  step="any"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="Ej: 45.5"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Categoría</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none bg-white"
                >
                  <option value="AGROPECUARIO">🌾 Agropecuario</option>
                  <option value="PESQUERO">🐟 Pesquero</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Ubicación de Recogida</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ej: Plaza Central, Finca La Esperanza"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={createMut.isPending}
              className="w-full rounded-lg bg-green-600 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-green-700 transition-all disabled:bg-green-400"
            >
              {createMut.isPending ? "Publicando..." : "🚀 Publicar Producto"}
            </button>

            {createMut.isError && (
              <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100">
                ❌ Error al publicar: {String(createMut.error)}
              </p>
            )}
          </form>
        </div>

        {/* COLUMNA 2-3: Listado de Catálogo (List + Delete) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-500">
              {isLoading ? "Buscando datos..." : `${products.length} producto(s) en oferta`}
            </span>
          </div>

          {/* Estado de carga general */}
          {isLoading && <p className="text-center text-gray-600 font-medium py-10">🌾 Cargando catálogo en tiempo real...</p>}
          {isError && <p className="rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">⚠️ Error de conexión: {String(error)}</p>}

          {/* Listado en Tarjetas Responsivas */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {products.map((p) => (
              <div key={p.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      p.category === 'PESQUERO' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                    }`}>
                      {p.category}
                    </span>
                    <span className="text-xs text-gray-400">📍 {p.location}</span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 line-clamp-1">{p.title}</h3>
                  <p className="mt-1 text-xs text-gray-500 line-clamp-2">{p.description ?? "Sin descripción."}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="flex items-baseline justify-between mb-3">
                    <span className="text-xs text-gray-400">Precio por {p.unit}</span>
                    <span className="text-lg font-black text-green-700">${Number(p.price).toLocaleString()}</span>
                  </div>
                  
                  <div className="flex items-center justify-between gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                    <span>Stock: <strong>{p.stock} {p.unit}</strong></span>
                    
                    {/* Botón de Borrado Protegido */}
                    <button
                      onClick={() => {
                        if (!confirm(`¿Seguro que deseas eliminar "${p.title}" del catálogo?`)) return;
                        deleteMut.mutate({ id: p.id, userId: simulatedProducerId });
                      }}
                      className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600 border border-red-100 hover:bg-red-100 transition-all"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {!isLoading && !isError && products.length === 0 && (
              <div className="col-span-full rounded-2xl border border-dashed border-gray-300 p-10 text-center bg-white">
                <p className="text-gray-500 text-sm">El catálogo está vacío. ¡Publica el primer producto usando el formulario de la izquierda!</p>
              </div>
            )}
          </div>

          {deleteMut.isError && (
            <p className="rounded-lg bg-red-50 p-3 text-xs text-red-600 border border-red-100 shadow-sm">
              🛑 Error al eliminar: {String(deleteMut.error)} (Verifica que el ID Productor Activo sea el dueño real del producto)
            </p>
          )}
        </div>

      </div>
    </div>
  );
}