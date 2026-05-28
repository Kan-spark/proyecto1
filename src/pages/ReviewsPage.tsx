import { useState } from "react";
import { useProducerReviews, useCreateReview } from "../api/reviews.queries";

export default function ReviewsPage() {
  // Estado para simular la sesión del Comprador (authorId)
  const [simulatedBuyerId, setSimulatedBuyerId] = useState<number>(2);
  
  // Estado para elegir de qué Productor queremos ver el Muro de Reputación
  const [activeProducerId, setActiveProducerId] = useState<number>(1);

  // Estados locales para el formulario de Calificación de Pedidos
  const [orderId, setOrderId] = useState("");
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState("");

  // TanStack Query Hooks vinculados al Productor activo
  const { data: reviews = [], isLoading, isError, error, refetch } = useProducerReviews(activeProducerId);
  const createReviewMut = useCreateReview(activeProducerId);

  // Calcular la puntuación promedio del productor en tiempo real usando el caché
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
    : "0.0";

  // Manejador del envío del formulario (POST)
  async function onSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!orderId || !comment.trim()) return;

    await createReviewMut.mutateAsync({
      orderId: Number(orderId),
      authorId: simulatedBuyerId, // Mapeado al authorId que espera tu NestJS DTO
      rating: Number(rating),
      comment: comment.trim(),
    });

    // Limpiamos los campos del formulario tras el guardado exitoso
    setOrderId("");
    setRating(5);
    setComment("");
  }

  const renderStars = (count: number) => "⭐".repeat(count);

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans">
      
      {/* Encabezado */}
      <div className="mb-6 flex flex-col justify-between gap-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-white shadow-sm sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cadena Justa — Reputación y Confianza</h1>
          <p className="mt-1 text-sm text-amber-100">Evaluación del desempeño contractual del productor</p>
        </div>
        <button
          onClick={() => refetch()}
          className="rounded-lg bg-amber-700 px-4 py-2 text-sm font-bold border border-amber-400 shadow-sm hover:bg-amber-800 transition-all"
        >
          🔄 Sincronizar Muro
        </button>
      </div>

      {/* Control de Sesiones y Filtros */}
      <div className="mb-6 grid grid-cols-1 gap-4 rounded-xl bg-slate-100 p-4 border border-slate-200 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase mb-1">ID Comprador Activo (Autor):</label>
          <input 
            type="number" 
            value={simulatedBuyerId} 
            onChange={(e) => setSimulatedBuyerId(Number(e.target.value))} 
            className="w-full rounded-lg border bg-white p-2 text-sm font-bold focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase mb-1">🚜 Ver Reputación del Productor (ID):</label>
          <input 
            type="number" 
            value={activeProducerId} 
            onChange={(e) => setActiveProducerId(Number(e.target.value))}
            className="w-full rounded-lg border bg-white p-2 text-sm font-bold focus:outline-none text-orange-700 font-extrabold"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* COLUMNA 1: Formulario para Calificar un Pedido Recibido */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm h-fit space-y-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Calificar un Pedido</h2>
            <p className="text-xs text-gray-500">El backend validará que seas el dueño de la orden y que no la hayas calificado antes.</p>
          </div>

          <form onSubmit={onSubmitReview} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">ID del Pedido (Order ID)</label>
              <input
                type="number"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Ej: 1"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Calificación Contractual</label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:border-orange-500 focus:outline-none font-bold text-amber-500"
              >
                <option value={5}>⭐⭐⭐⭐⭐ (5 - Excelente Servicio)</option>
                <option value={4}>⭐⭐⭐⭐ (4 - Bueno / Cumplió)</option>
                <option value={3}>⭐⭐⭐ (3 - Regular)</option>
                <option value={2}>⭐⭐ (2 - Mal empaque o demoras)</option>
                <option value={1}>⭐ (1 - Producto defectuoso / Incumplimiento)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Testimonio de la Entrega</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="¿Cómo llegó el bulto/pescado? ¿Se respetaron los tiempos de transporte acordados?"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none h-24 resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={createReviewMut.isPending}
              className="w-full rounded-lg bg-orange-500 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-orange-600 transition-all disabled:bg-orange-300"
            >
              {createReviewMut.isPending ? "Validando DTO y Guardando..." : "📣 Enviar Calificación"}
            </button>

            {createReviewMut.isError && (
              <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100">
                🛑 Error del Back: {
                  // Muestra el mensaje detallado enviado por NestJS (BadRequest, NotFound, etc)
                  (createReviewMut.error as any)?.response?.data?.message || String(createReviewMut.error)
                }
              </p>
            )}
          </form>
        </div>

        {/* COLUMNA 2-3: Tablero Analítico y Opiniones del Productor Seleccionado */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Métrica de Reputación */}
          <div className="grid grid-cols-2 gap-4 rounded-xl bg-orange-50/50 border border-orange-200 p-4">
            <div className="text-center border-r border-orange-200">
              <span className="text-[10px] uppercase font-black text-gray-500 tracking-wider block">Reputación Productor #{activeProducerId}</span>
              <span className="text-3xl font-black text-orange-600">{averageRating} / 5.0</span>
            </div>
            <div className="text-center flex flex-col justify-center">
              <span className="text-[10px] uppercase font-black text-gray-500 tracking-wider block">Calificaciones Recibidas</span>
              <span className="text-2xl font-bold text-gray-800">{reviews.length} total</span>
            </div>
          </div>

          {/* Listado de Feedback */}
          {isLoading && <p className="text-center text-gray-600 font-medium py-10">⏳ Extrayendo reputación histórica...</p>}
          {isError && <p className="rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">⚠️ Error al conectar con el backend: {String(error)}</p>}

          <div className="space-y-3.5">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-2 hover:border-orange-300 transition-colors">
                
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">
                      👤 {r.author?.fullName ?? `Comprador (ID: ${r.authorId})`}
                    </span>
                    <span className="text-xs text-slate-500 font-medium text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">
                      Pedido N° {r.orderId}
                    </span>
                  </div>
                  <span className="text-xs text-amber-500 font-bold bg-amber-50 px-2 py-0.5 rounded">
                    {renderStars(r.rating)}
                  </span>
                </div>

                <p className="text-sm text-gray-700 italic bg-gray-50 p-3 rounded-lg border border-gray-100">
                  "{r.comment ?? "Sin comentarios adicionales."}"
                </p>
              </div>
            ))}

            {!isLoading && !isError && reviews.length === 0 && (
              <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center bg-white">
                <p className="text-gray-500 text-sm">
                  Este productor no tiene calificaciones aún o no se han completado ventas vinculadas a él.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}