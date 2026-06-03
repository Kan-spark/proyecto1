import { useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useProducerReviews, useCreateReview } from "../api/reviews.queries";
import { useMyOrders } from "../api/orders.queries";
import { useProducts } from "../api/products.queries";
import type { Review } from "../api/reviews";

// ── Helpers ───────────────────────────────────────────────────────────────────

function Stars({
  rating,
  interactive = false,
  onSelect,
}: {
  rating: number;
  interactive?: boolean;
  onSelect?: (n: number) => void;
}) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type={interactive ? "button" : undefined}
          onClick={interactive && onSelect ? () => onSelect(n) : undefined}
          className={`text-xl leading-none transition-transform ${
            interactive ? "hover:scale-110 cursor-pointer" : "cursor-default"
          } ${n <= rating ? "text-amber-400" : "text-slate-200"}`}
          tabIndex={interactive ? 0 : -1}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function avgRating(reviews: Review[]): string {
  if (reviews.length === 0) return "—";
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  return avg.toFixed(1);
}

// ── Panel de reseñas de un productor (reutilizable) ──────────────────────────

function ProducerReviewsPanel({ producerId }: { producerId: number }) {
  const { data: reviews = [], isLoading, isError, error } =
    useProducerReviews(producerId);

  if (isLoading) {
    return <p className="text-sm text-slate-500 py-4">Cargando reseñas…</p>;
  }

  if (isError) {
    return (
      <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
        Error al cargar reseñas: {String(error)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Resumen */}
      <div className="bg-white rounded-xl border shadow-sm p-5 flex flex-wrap gap-6 items-center">
        <div className="text-center">
          <p className="text-4xl font-bold text-amber-500">{avgRating(reviews)}</p>
          <p className="text-xs text-slate-500 mt-1">Promedio</p>
        </div>
        <div className="text-center">
          <p className="text-4xl font-bold text-slate-800">{reviews.length}</p>
          <p className="text-xs text-slate-500 mt-1">Reseñas</p>
        </div>
        {reviews.length > 0 && (
          <div className="flex-1 space-y-1 min-w-40">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviews.filter((r) => r.rating === star).length;
              const pct = (count / reviews.length) * 100;
              return (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-4 text-right text-slate-500">{star}</span>
                  <span className="text-amber-400">★</span>
                  <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-4 text-slate-400">{count}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lista */}
      {reviews.length === 0 ? (
        <div className="bg-white rounded-xl border p-8 text-center text-slate-500 text-sm">
          Este productor aún no tiene reseñas.
        </div>
      ) : (
        reviews.map((review) => (
          <div key={review.id} className="bg-white rounded-xl border shadow-sm p-5 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Stars rating={review.rating} />
                <span className="text-sm font-medium text-slate-700">
                  {review.author.fullName}
                </span>
              </div>
              <span className="text-xs text-slate-400 shrink-0">
                {new Date(review.createdAt).toLocaleDateString("es-CO", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            {review.comment && (
              <p className="text-sm text-slate-600 leading-relaxed">{review.comment}</p>
            )}
            <p className="text-xs text-slate-400">Pedido #{review.orderId}</p>
          </div>
        ))
      )}
    </div>
  );
}

// ── Vista BUYER ───────────────────────────────────────────────────────────────

function BuyerReviews() {
  const { data: orders = [], isLoading: ordersLoading } = useMyOrders("BUYER");
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const createMut = useCreateReview();

  const deliveredOrders = orders.filter((o) => o.status === "DELIVERED");
  const [reviewedInSession, setReviewedInSession] = useState<Set<number>>(new Set());

  // Modal de calificar
  const [modalOrderId, setModalOrderId] = useState<number | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // Buscador de productor por nombre
  const [nameSearch, setNameSearch] = useState("");
  const [selectedProducerId, setSelectedProducerId] = useState<number | null>(null);
  const [selectedProducerName, setSelectedProducerName] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Extrae productores únicos del catálogo de productos
  const producers = useMemo(() => {
    const map = new Map<number, string>();
    products.forEach((p) => {
      if (!map.has(p.producerId)) {
        map.set(p.producerId, p.producer.fullName);
      }
    });
    return Array.from(map.entries()).map(([id, fullName]) => ({ id, fullName }));
  }, [products]);

  // Filtra por lo que el usuario escribe
  const filteredProducers = useMemo(() => {
    const term = nameSearch.trim().toLowerCase();
    if (!term) return producers;
    return producers.filter((p) => p.fullName.toLowerCase().includes(term));
  }, [producers, nameSearch]);

  function selectProducer(id: number, name: string) {
    setSelectedProducerId(id);
    setSelectedProducerName(name);
    setNameSearch(name);
    setDropdownOpen(false);
  }

  function clearProducerSearch() {
    setSelectedProducerId(null);
    setSelectedProducerName("");
    setNameSearch("");
    setDropdownOpen(false);
  }

  function openModal(orderId: number) {
    setModalOrderId(orderId);
    setRating(5);
    setComment("");
    setFormError(null);
  }

  function closeModal() {
    setModalOrderId(null);
    setFormError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!modalOrderId) return;
    setFormError(null);
    try {
      await createMut.mutateAsync({
        rating,
        comment: comment.trim() || undefined,
        orderId: modalOrderId,
      });
      setReviewedInSession((prev) => new Set(prev).add(modalOrderId));
      closeModal();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      setFormError(
        msg.toLowerCase().includes("ya has calificado")
          ? "Ya has calificado este pedido anteriormente."
          : "Error al enviar la reseña. Intenta de nuevo."
      );
    }
  }

  return (
    <div className="space-y-8">

      {/* ── Sección 1: calificar pedidos entregados ── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Calificar mis pedidos</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Solo puedes calificar pedidos que ya fueron entregados.
          </p>
        </div>

        {ordersLoading && <p className="text-sm text-slate-500">Cargando pedidos…</p>}

        {!ordersLoading && deliveredOrders.length === 0 && (
          <div className="bg-white rounded-xl border p-8 text-center text-slate-500 text-sm">
            Aún no tienes pedidos entregados para calificar.
          </div>
        )}

        {!ordersLoading && deliveredOrders.map((order) => {
          const alreadyReviewed = reviewedInSession.has(order.id);
          return (
            <div
              key={order.id}
              className="bg-white rounded-xl border shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-800">
                  Pedido #{order.id}
                </p>
                <p className="text-xs text-slate-400">
                  {new Date(order.createdAt).toLocaleDateString("es-CO", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="text-xs text-slate-600">
                  {order.items.map((i) => i.product.title).join(", ")}
                </p>
                <p className="text-sm font-bold text-slate-800">
                  ${order.total.toLocaleString("es-CO")}
                </p>
              </div>

              {alreadyReviewed ? (
                <span className="shrink-0 rounded-full bg-green-100 text-green-700 px-3 py-1 text-xs font-medium">
                  Reseña enviada ✓
                </span>
              ) : (
                <button
                  onClick={() => openModal(order.id)}
                  className="shrink-0 rounded-lg bg-amber-500 px-4 py-2 text-sm text-white font-medium hover:bg-amber-600 transition-colors"
                >
                  Calificar pedido
                </button>
              )}
            </div>
          );
        })}
      </section>

      {/* ── Sección 2: ver reseñas de un productor por nombre ── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Ver reseñas de un productor
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Busca un productor por nombre para consultar su calificación.
          </p>
        </div>

        {/* Buscador con autocompletado */}
        <div className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={nameSearch}
                onChange={(e) => {
                  setNameSearch(e.target.value);
                  setSelectedProducerId(null);
                  setDropdownOpen(true);
                }}
                onFocus={() => setDropdownOpen(true)}
                placeholder={
                  productsLoading ? "Cargando productores…" : "Escribe el nombre del productor…"
                }
                disabled={productsLoading}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
              />

              {/* Dropdown de sugerencias */}
              {dropdownOpen && nameSearch && !selectedProducerId && (
                <div className="absolute z-10 mt-1 w-full rounded-xl border bg-white shadow-lg overflow-hidden">
                  {filteredProducers.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-slate-400">
                      No se encontraron productores con ese nombre.
                    </p>
                  ) : (
                    filteredProducers.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => selectProducer(p.id, p.fullName)}
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors border-b last:border-0"
                      >
                        {p.fullName}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {selectedProducerId && (
              <button
                type="button"
                onClick={clearProducerSearch}
                className="rounded-lg border px-3 py-2 text-sm hover:bg-slate-50 transition-colors"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Resultado */}
        {selectedProducerId && (
          <div>
            <p className="text-xs text-slate-400 mb-3">
              Mostrando reseñas de{" "}
              <span className="font-medium text-slate-600">{selectedProducerName}</span>
            </p>
            <ProducerReviewsPanel producerId={selectedProducerId} />
          </div>
        )}

        {/* Estado inicial — lista de productores disponibles */}
        {!selectedProducerId && !nameSearch && !productsLoading && producers.length > 0 && (
          <div className="bg-white rounded-xl border p-4">
            <p className="text-xs font-medium text-slate-500 mb-3">
              Productores disponibles ({producers.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {producers.map((p) => (
                <button
                  key={p.id}
                  onClick={() => selectProducer(p.id, p.fullName)}
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:bg-slate-50 hover:border-blue-300 transition-colors"
                >
                  {p.fullName}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── Modal de calificar ── */}
      {modalOrderId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">
                Calificar pedido #{modalOrderId}
              </h2>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 text-xl leading-none"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Calificación *
                </label>
                <Stars rating={rating} interactive onSelect={setRating} />
                <p className="mt-1 text-xs text-slate-400">
                  {rating === 1 && "Muy malo"}
                  {rating === 2 && "Malo"}
                  {rating === 3 && "Regular"}
                  {rating === 4 && "Bueno"}
                  {rating === 5 && "Excelente"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Comentario{" "}
                  <span className="text-slate-400 font-normal">(opcional)</span>
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  placeholder="Cuéntanos tu experiencia…"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                  disabled={createMut.isPending}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={createMut.isPending}
                  className="flex-1 rounded-lg bg-amber-500 py-2 text-sm text-white font-medium hover:bg-amber-600 disabled:opacity-50 transition-colors"
                >
                  {createMut.isPending ? "Enviando…" : "Enviar reseña"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={createMut.isPending}
                  className="flex-1 rounded-lg border py-2 text-sm hover:bg-slate-50 transition-colors"
                >
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

// ── Vista PRODUCER ────────────────────────────────────────────────────────────

function ProducerReviews({ producerId }: { producerId: number }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">
          Reseñas de mis productos
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Calificaciones dejadas por tus compradores.
        </p>
      </div>
      <ProducerReviewsPanel producerId={producerId} />
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function ReviewsPage() {
  const { user } = useAuth();
  const isProducer = user?.role === "PRODUCER";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Reseñas</h1>
        <p className="text-slate-500 text-sm mt-1">
          {isProducer
            ? "Calificaciones que han dejado tus compradores."
            : "Califica tus pedidos y consulta productores."}
        </p>
      </div>

      {isProducer ? (
        <ProducerReviews producerId={user!.id} />
      ) : (
        <BuyerReviews />
      )}
    </div>
  );
}