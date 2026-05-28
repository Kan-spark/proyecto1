import { useState } from "react";
import { useUserOrders, useCreateOrder, useUpdateOrderStatus } from "../api/orders.queries";
import type { OrderStatus } from "../api/orders";

// Definimos un tipo local para los ítems que están en el carrito temporal
interface CartItem {
  productId: number;
  quantity: number;
}

export default function OrdersPage() {
  // Estados para simular la sesión del usuario en pruebas locales
  const [simulatedUserId, setSimulatedUserId] = useState<number>(2);
  const [simulatedRole, setSimulatedRole] = useState<"BUYER" | "PRODUCER">("BUYER");

  // Estados para el producto que se está intentando añadir al carrito
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");

  // ESTADO DEL CARRITO LOCAL (Soporta múltiples productos antes de enviar)
  const [cart, setCart] = useState<CartItem[]>([]);

  // TanStack Query Hooks
  const { data: orders = [], isLoading, isError, error, refetch } = useUserOrders(simulatedUserId, simulatedRole);
  const createOrderMut = useCreateOrder();
  const updateStatusMut = useUpdateOrderStatus();

  // Agregar un producto al carrito temporal de la pantalla
  function handleAddToCar(e: React.FormEvent) {
    e.preventDefault();
    if (!productId || !quantity) return;

    const newItem: CartItem = {
      productId: Number(productId),
      quantity: Number(quantity),
    };

    // Si el producto ya existe en el carrito, sumamos la cantidad, si no, lo agregamos
    const existingIndex = cart.findIndex((item) => item.productId === newItem.productId);
    if (existingIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity += newItem.quantity;
      setCart(updatedCart);
    } else {
      setCart([...cart, newItem]);
    }

    // Limpiamos solo los inputs para que pueda agregar otro producto
    setProductId("");
    setQuantity("");
  }

  // Quitar un ítem del carrito por si el usuario se equivocó
  function handleRemoveFromCart(index: number) {
    setCart(cart.filter((_, i) => i !== index));
  }

  // Enviar TODO el carrito al backend (POST)
  async function onCreateOrder() {
    if (cart.length === 0) return;

    await createOrderMut.mutateAsync({
      buyerId: simulatedUserId,
      items: cart, // <- Aquí enviamos el arreglo con todos los productos juntos
    });

    // Vaciamos el carrito tras la compra exitosa
    setCart([]);
  }

  // Cambiar estado de la orden (PATCH)
  async function onUpdateStatus(orderId: number, nextStatus: OrderStatus) {
    await updateStatusMut.mutateAsync({
      id: orderId,
      status: nextStatus,
    });
  }

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-amber-100 text-amber-800 border-amber-200";
      case "CONFIRMED": return "bg-blue-100 text-blue-800 border-blue-200";
      case "DELIVERED": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-red-100 text-red-800 border-red-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans">
      
      {/* Encabezado */}
      <div className="mb-6 flex flex-col justify-between gap-4 rounded-2xl bg-gradient-to-r from-slate-700 to-slate-900 p-6 text-white shadow-sm sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cadena Justa — Transacciones</h1>
          <p className="mt-1 text-sm text-slate-300">Historial contractual y flujos de confirmación claros</p>
        </div>
        <button
          onClick={() => refetch()}
          className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-bold border border-slate-600 shadow-sm hover:bg-slate-800/50 transition-all"
        >
          🔄 Sincronizar Pedidos
        </button>
      </div>

      {/* Panel de Simulación de Sesión Activa */}
      <div className="mb-6 grid grid-cols-1 gap-4 rounded-xl bg-slate-100 p-4 border border-slate-200 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase mb-1">ID Usuario en Sesión:</label>
          <input 
            type="number" 
            value={simulatedUserId} 
            onChange={(e) => setSimulatedUserId(Number(e.target.value))} 
            className="w-full rounded-lg border bg-white p-2 text-sm font-bold focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Ver Panel Como:</label>
          <select 
            value={simulatedRole} 
            onChange={(e) => setSimulatedRole(e.target.value as "BUYER" | "PRODUCER")}
            className="w-full rounded-lg border bg-white p-2 text-sm font-bold focus:outline-none bg-white"
          >
            <option value="BUYER">🛒 Comprador (Mis Compras)</option>
            <option value="PRODUCER">🚜 Productor (Mis Ventas)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* COLUMNA 1: Carrito Multi-Producto */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm h-fit space-y-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Generar Nuevo Pedido</h2>
            <p className="text-xs text-gray-500">Agrega múltiples productos a tu orden antes de procesarla.</p>
          </div>

          {simulatedRole === "BUYER" ? (
            <>
              {/* Formulario para añadir al Carrito */}
              <form onSubmit={handleAddToCar} className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Añadir Ítem</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">ID Producto</label>
                    <input
                      type="number"
                      value={productId}
                      onChange={(e) => setProductId(e.target.value)}
                      placeholder="Ej: 1"
                      className="w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs focus:outline-none focus:border-slate-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">Cantidad</label>
                    <input
                      type="number"
                      step="any"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="Ej: 5"
                      className="w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs focus:outline-none focus:border-slate-500"
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="w-full text-center text-xs font-bold bg-slate-200 hover:bg-slate-300 py-1.5 rounded-md transition-colors">
                  ➕ Añadir al Carrito
                </button>
              </form>

              {/* Vista del Carrito de Compras Temporal */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-700 block">Tu Carrito ({cart.length} ítems):</span>
                
                {cart.length === 0 ? (
                  <p className="text-xs text-gray-400 italic text-center py-4 border border-dashed rounded-xl">El carrito está vacío</p>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {cart.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-xs bg-slate-100 p-2 rounded-lg border border-slate-200">
                        <span>📦 Prod ID: <strong>{item.productId}</strong> — Cant: <strong>{item.quantity}</strong></span>
                        <button 
                          onClick={() => handleRemoveFromCart(index)}
                          className="text-red-500 hover:text-red-700 font-bold px-1"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Botón Final para Emitir Pedido */}
              <button
                onClick={onCreateOrder}
                disabled={cart.length === 0 || createOrderMut.isPending}
                className="w-full rounded-lg bg-slate-800 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-slate-900 transition-all disabled:bg-slate-300"
              >
                {createOrderMut.isPending ? "Procesando Pedido..." : `🛒 Enviar Orden (${cart.length} Productos)`}
              </button>

              {createOrderMut.isError && (
                <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100">
                  ❌ Error: {String(createOrderMut.error)} (Verifica IDs o stock disponible)
                </p>
              )}
            </>
          ) : (
            <div className="rounded-xl bg-amber-50/50 border border-amber-200 p-4 text-center">
              <p className="text-sm text-amber-800 font-medium">
                Panel de Productor activo. Cambia tu rol a "Comprador" arriba si deseas simular y armar un nuevo carrito.
              </p>
            </div>
          )}
        </div>

        {/* COLUMNA 2-3: Historial Contractual Dinámico */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-500">
              {isLoading ? "Buscando transacciones..." : `${orders.length} registro(s) encontrados`}
            </span>
          </div>

          {isLoading && <p className="text-center text-gray-600 font-medium py-10">📦 Leyendo bloque de órdenes en tiempo real...</p>}
          {isError && <p className="rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">⚠️ Error: {String(error)}</p>}

          <div className="space-y-4">
            {orders.map((o) => (
              <div key={o.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex flex-col justify-between gap-4">
                
                {/* Cabecera del pedido */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                  <div>
                    <span className="text-sm font-bold text-gray-900">Pedido N° {o.id}</span>
                    <span className="block text-[10px] text-gray-400">{o.items?.length || 0} producto(s) en esta orden</span>
                  </div>
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${getStatusStyles(o.status)}`}>
                    {o.status}
                  </span>
                </div>

                {/* Ítems del pedido (Muestra la lista de todos los productos del pedido) */}
                <div className="space-y-2">
                  {o.items?.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm text-gray-700 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                      <div>
                        <span className="font-bold text-gray-900">{item.product?.title ?? `Producto (ID: ${item.productId})`}</span>
                        <span className="block text-xs text-gray-500">Cantidad transada: {item.quantity} {item.product?.unit ?? 'unidades'}</span>
                      </div>
                      <span className="font-extrabold text-slate-900">${Number(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {/* Pie del pedido */}
                <div className="pt-2 border-t border-gray-100 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-xs text-gray-400 italic">
                    {simulatedRole === "BUYER" ? "Origen directo de finca/puerto" : `Cliente comprador: ${o.buyer?.fullName ?? "Usuario"}`}
                  </span>
                  
                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider">Total Acordado</span>
                      <span className="text-base font-black text-slate-800">${Number(o.total).toLocaleString()}</span>
                    </div>

                    {/* CONTROL DE FLUJO DE ESTADOS */}
                    {simulatedRole === "PRODUCER" && o.status === "PENDING" && (
                      <button
                        onClick={() => onUpdateStatus(o.id, "CONFIRMED")}
                        disabled={updateStatusMut.isPending}
                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-all"
                      >
                        ✅ Aceptar Pedido
                      </button>
                    )}

                    {simulatedRole === "PRODUCER" && o.status === "CONFIRMED" && (
                      <button
                        onClick={() => onUpdateStatus(o.id, "DELIVERED")}
                        disabled={updateStatusMut.isPending}
                        className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-green-700 transition-all"
                      >
                        🚚 Marcar Entregado
                      </button>
                    )}
                  </div>
                </div>

              </div>
            ))}

            {!isLoading && !isError && orders.length === 0 && (
              <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center bg-white">
                <p className="text-gray-500 text-sm">No existen órdenes registradas bajo los parámetros de este usuario.</p>
              </div>
            )}
          </div>

          {updateStatusMut.isError && (
            <p className="rounded-lg bg-red-50 p-3 text-xs text-red-600 border border-red-100 shadow-sm">
              🛑 Error al actualizar el estado: {String(updateStatusMut.error)}
            </p>
          )}
        </div>

      </div>
    </div>
  );
}