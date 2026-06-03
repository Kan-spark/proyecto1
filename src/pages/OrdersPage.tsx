import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useMyOrders, useCreateOrder, useUpdateOrderStatus } from "../api/orders.queries";
import { useProducts } from "../api/products.queries";
import type { OrderStatus, CreateOrderItemDto } from "../api/orders";
import type { Category } from "../api/products";

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

const STATUS_STYLE: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

// Qué estados puede asignar un PRODUCER
const PRODUCER_NEXT_STATUSES: Partial<Record<OrderStatus, OrderStatus[]>> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["DELIVERED", "CANCELLED"],
};

// ── Componente principal ──────────────────────────────────────────────────────

export default function OrdersPage() {
  const { user } = useAuth();
  const isProducer = user?.role === "PRODUCER";

  const { data: orders = [], isLoading, isError, error } = useMyOrders(
    isProducer ? "PRODUCER" : "BUYER"
  );
  const updateStatusMut = useUpdateOrderStatus();
  const createOrderMut = useCreateOrder();

  // ── Estado del modal de nuevo pedido (solo BUYER) ─────────────────────────
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<CreateOrderItemDto[]>([]);
  const [cartError, setCartError] = useState<string | null>(null);

  // Para seleccionar productos desde el catálogo
  const { data: products = [] } = useProducts();
  const [productSearch, setProductSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<Category | "">("");

  const filteredProducts = products.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(productSearch.toLowerCase());
    const matchCat = categoryFilter ? p.category === categoryFilter : true;
    return matchSearch && matchCat;
  });

  function getCartQty(productId: number): number {
    return cart.find((i) => i.productId === productId)?.quantity ?? 0;
  }

  function setCartItem(productId: number, quantity: number) {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((i) => i.productId !== productId));
    } else {
      setCart((prev) => {
        const exists = prev.find((i) => i.productId === productId);
        if (exists) return prev.map((i) => i.productId === productId ? { ...i, quantity } : i);
        return [...prev, { productId, quantity }];
      });
    }
  }

  function openCart() {
    setCart([]);
    setCartError(null);
    setProductSearch("");
    setCategoryFilter("");
    setCartOpen(true);
  }

  async function handleCreateOrder() {
    if (cart.length === 0) {
      setCartError("Agrega al menos un producto al pedido.");
      return;
    }
    setCartError(null);
    try {
      await createOrderMut.mutateAsync({ items: cart });
      setCartOpen(false);
      setCart([]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      // El backend devuelve el mensaje de stock insuficiente en el body
      setCartError(msg || "Error al crear el pedido. Intenta de nuevo.");
    }
  }

  // ── Cambio de estado (PRODUCER) ───────────────────────────────────────────
  async function handleStatusChange(orderId: number, status: OrderStatus) {
    try {
      await updateStatusMut.mutateAsync({ id: orderId, dto: { status } });
    } catch {
      alert("Error al actualizar el estado.");
    }
  }

  // ── BUYER: cancela su propio pedido PENDING ───────────────────────────────
  async function handleCancel(orderId: number) {
    if (!confirm("¿Seguro que deseas cancelar este pedido?")) return;
    try {
      await updateStatusMut.mutateAsync({ id: orderId, dto: { status: "CANCELLED" } });
    } catch {
      alert("Error al cancelar el pedido.");
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

return (
  <div className="space-y-6">

    {/* Encabezado */}
    <div className="flex items-start justify-between gap-4 pb-2 border-b border-emerald-100">
      <div>
        <h1 className="text-3xl font-bold text-emerald-800">Pedidos</h1>
        <p className="text-slate-500 text-sm mt-1">
          {isProducer
            ? "Pedidos que contienen tus productos."
            : "Historial de tus compras."}
        </p>
      </div>
      {!isProducer && (
        <button
          onClick={openCart}
          className="shrink-0 flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white font-medium hover:bg-emerald-700 transition-colors"
        >
          <i className="ti ti-shopping-cart-plus text-[15px]" />
          Nuevo pedido
        </button>
      )}
    </div>

    {/* Estados de carga / error */}
    {isLoading && (
      <p className="text-sm text-emerald-600 animate-pulse">Cargando pedidos…</p>
    )}
    {isError && (
      <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 flex items-center gap-2">
        <i className="ti ti-alert-circle text-[16px]" />
        Error al cargar pedidos: {String(error)}
      </div>
    )}

    {/* Lista de pedidos */}
    {!isLoading && !isError && (
      <>
        <p className="text-sm text-slate-400">{orders.length} pedido(s) encontrado(s)</p>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-10 flex flex-col items-center gap-2 text-slate-400">
            <i className="ti ti-clipboard-off text-[36px]" />
            <p className="text-sm">
              {isProducer
                ? "Aún no hay pedidos para tus productos."
                : "No has realizado ningún pedido todavía."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const nextStatuses = isProducer
                ? PRODUCER_NEXT_STATUSES[order.status] ?? []
                : [];
              const canBuyerCancel = !isProducer && order.status === "PENDING";

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
                >
                  {/* Cabecera del pedido */}
                  <div className="bg-emerald-50 border-b border-emerald-100 px-5 py-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-emerald-900 flex items-center gap-1.5">
                        <i className="ti ti-receipt text-[14px] text-emerald-600" />
                        Pedido #{order.id}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(order.createdAt).toLocaleDateString("es-CO", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      {isProducer && (
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <i className="ti ti-user text-[12px]" />
                          {order.buyer.fullName} · {order.buyer.phone}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLE[order.status]}`}>
                        {STATUS_LABEL[order.status]}
                      </span>
                      <span className="text-sm font-bold text-emerald-700 bg-white border border-emerald-100 rounded-lg px-3 py-1">
                        ${order.total.toLocaleString("es-CO")}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    {/* Items del pedido */}
                    <div className="rounded-lg border border-slate-100 overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-slate-50 text-left">
                            <th className="p-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Producto</th>
                            <th className="p-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Cantidad</th>
                            <th className="p-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Precio unit.</th>
                            <th className="p-3 text-xs font-medium text-slate-500 uppercase tracking-wide text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map((item) => (
                            <tr key={item.id} className="border-t border-slate-100 hover:bg-emerald-50 transition-colors">
                              <td className="p-3 font-medium text-slate-700">{item.product.title}</td>
                              <td className="p-3 text-slate-500">{item.quantity} {item.product.unit}</td>
                              <td className="p-3 text-slate-500">${item.price.toLocaleString("es-CO")}</td>
                              <td className="p-3 text-right font-semibold text-emerald-700">
                                ${(item.price * item.quantity).toLocaleString("es-CO")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Acciones */}
                    {(nextStatuses.length > 0 || canBuyerCancel) && (
                      <div className="flex flex-wrap gap-2">
                        {nextStatuses.map((s) => (
                          <button
                            key={s}
                            onClick={() => handleStatusChange(order.id, s)}
                            disabled={updateStatusMut.isPending}
                            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors disabled:opacity-50 ${
                              s === "CANCELLED"
                                ? "border-red-200 text-red-600 hover:bg-red-50"
                                : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            }`}
                          >
                            <i className={`ti ${s === "CANCELLED" ? "ti-x" : "ti-arrow-right"} text-[13px]`} />
                            {updateStatusMut.isPending ? "Actualizando…" : `Marcar como ${STATUS_LABEL[s]}`}
                          </button>
                        ))}

                        {canBuyerCancel && (
                          <button
                            onClick={() => handleCancel(order.id)}
                            disabled={updateStatusMut.isPending}
                            className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
                          >
                            <i className="ti ti-x text-[13px]" />
                            Cancelar pedido
                          </button>
                        )}
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

    {/* Modal nuevo pedido (BUYER) */}
    {cartOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

          {/* Header modal */}
          <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-emerald-900 flex items-center gap-2">
                <i className="ti ti-shopping-cart text-[16px] text-emerald-600" />
                Nuevo pedido
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {cart.length === 0
                  ? "Selecciona productos y cantidades"
                  : `${cart.length} producto(s) en el pedido`}
              </p>
            </div>
            <button
              onClick={() => setCartOpen(false)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-white hover:text-slate-600 transition-colors"
            >
              <i className="ti ti-x text-[16px]" />
            </button>
          </div>

          {/* Filtros de búsqueda */}
          <div className="p-4 border-b border-slate-100 grid grid-cols-2 gap-3">
            <input
              type="text"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Buscar producto…"
              className="col-span-2 sm:col-span-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as Category | "")}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
            >
              <option value="">Todas las categorías</option>
              <option value="PESQUERO">Pesquero</option>
              <option value="AGROPECUARIO">Agropecuario</option>
            </select>
          </div>

          {/* Lista de productos */}
          <div className="overflow-y-auto flex-1 p-4 space-y-2">
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-slate-400">
                <i className="ti ti-mood-empty text-[32px]" />
                <p className="text-sm">No hay productos disponibles.</p>
              </div>
            ) : (
              filteredProducts.map((p) => {
                const qty = getCartQty(p.id);
                return (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between gap-3 rounded-xl border p-3 transition-colors ${
                      qty > 0
                        ? "border-emerald-300 bg-emerald-50"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{p.title}</p>
                      <p className="text-xs text-slate-500">
                        ${p.price.toLocaleString("es-CO")} / {p.unit} · Stock: {p.stock}
                      </p>
                    </div>

                    {/* Control de cantidad */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setCartItem(p.id, qty - 1)}
                        disabled={qty === 0}
                        className="w-7 h-7 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 text-sm font-bold"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={qty || ""}
                        onChange={(e) => setCartItem(p.id, Number(e.target.value))}
                        min={0}
                        max={p.stock}
                        placeholder="0"
                        className="w-16 rounded-lg border border-slate-300 px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      />
                      <button
                        onClick={() => setCartItem(p.id, qty + 1)}
                        disabled={qty >= p.stock}
                        className="w-7 h-7 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 text-sm font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer modal */}
          <div className="p-4 border-t border-slate-100 space-y-3">
            {cart.length > 0 && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3 text-sm space-y-1">
                {cart.map((item) => {
                  const p = products.find((x) => x.id === item.productId);
                  if (!p) return null;
                  return (
                    <div key={item.id} className="flex justify-between text-slate-700">
                      <span>{p.title} × {item.quantity} {p.unit}</span>
                      <span className="font-medium text-emerald-700">
                        ${(p.price * item.quantity).toLocaleString("es-CO")}
                      </span>
                    </div>
                  );
                })}
                <div className="flex justify-between font-semibold text-emerald-800 pt-1 border-t border-emerald-200">
                  <span>Total estimado</span>
                  <span>
                    ${cart.reduce((acc, item) => {
                      const p = products.find((x) => x.id === item.productId);
                      return acc + (p ? p.price * item.quantity : 0);
                    }, 0).toLocaleString("es-CO")}
                  </span>
                </div>
              </div>
            )}

            {cartError && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 flex items-center gap-2">
                <i className="ti ti-alert-circle text-[15px]" />
                {cartError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleCreateOrder}
                disabled={createOrderMut.isPending || cart.length === 0}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2 text-sm text-white font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                <i className="ti ti-check text-[15px]" />
                {createOrderMut.isPending ? "Creando pedido…" : "Confirmar pedido"}
              </button>
              <button
                onClick={() => setCartOpen(false)}
                disabled={createOrderMut.isPending}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-slate-200 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <i className="ti ti-x text-[15px]" />
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);
}