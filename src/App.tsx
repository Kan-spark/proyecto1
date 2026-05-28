import { useState } from 'react';
import ProductsPage from "./pages/ProductsPage";
import OrdersPage from "./pages/OrdersPage";
import UsersPage from "./pages/UsersPage";
import ReviewsPage from "./pages/ReviewsPage";

// Definimos los identificadores de nuestras páginas
type ActivePage = 'products' | 'orders' | 'users' | 'reviews';

function App() {
  const [currentPage, setCurrentPage] = useState<ActivePage>('products');

  // Función auxiliar para renderizar la página seleccionada
  const renderPage = () => {
    switch (currentPage) {
      case 'products':
        return <ProductsPage />;
      case 'orders':
        return <OrdersPage />;
      case 'users':
        return <UsersPage />;
      case 'reviews':
        return <ReviewsPage />;
      default:
        return <ProductsPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      {/* Barra de Navegación Principal (Diseño Móvil-Primero) */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            
            {/* Logo de la aplicación */}
            <div className="flex flex-shrink-0 items-center">
              <span className="text-xl font-black tracking-tight text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl">
                🌾 Cadena Justa
              </span>
            </div>

            {/* Menú de pestañas adaptado para pantallas táctiles */}
            <nav className="flex space-x-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none max-w-full">
              <button
                onClick={() => setCurrentPage('products')}
                className={`rounded-lg px-3 py-2 text-xs sm:text-sm font-bold tracking-wide transition-all whitespace-nowrap ${
                  currentPage === 'products'
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                🛒 Catálogo
              </button>

              <button
                onClick={() => setCurrentPage('orders')}
                className={`rounded-lg px-3 py-2 text-xs sm:text-sm font-bold tracking-wide transition-all whitespace-nowrap ${
                  currentPage === 'orders'
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                📦 Pedidos
              </button>

              <button
                onClick={() => setCurrentPage('users')}
                className={`rounded-lg px-3 py-2 text-xs sm:text-sm font-bold tracking-wide transition-all whitespace-nowrap ${
                  currentPage === 'users'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                👥 Usuarios
              </button>

              <button
                onClick={() => setCurrentPage('reviews')}
                className={`rounded-lg px-3 py-2 text-xs sm:text-sm font-bold tracking-wide transition-all whitespace-nowrap ${
                  currentPage === 'reviews'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                ⭐ Reseñas
              </button>
            </nav>

          </div>
        </div>
      </header>

      {/* Contenedor del Contenido Dinámico */}
      <main className="flex-1 mx-auto w-full max-w-7xl">
        {renderPage()}
      </main>

      {/* Footer Minimalista */}
      <footer className="bg-white border-t border-gray-200 py-3 text-center text-xs text-gray-400">
        &copy; {new Date().getFullYear()} Cadena Justa. Interfaz optimizada para el comercio directo.
      </footer>
    </div>
  );
}

export default App;