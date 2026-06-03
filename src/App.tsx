import { Profiler, useState } from "react";
import "./App.css";

import MainLayout from "./layouts/MainLayout";
import SidebarMenu from "./components/SidebarMenu";

import ProductsPage from "./pages/ProductsPage";
import OrdersPage from "./pages/OrdersPage";
import ReviewsPage from "./pages/ReviewsPage";
import ProfilePage from "./pages/UsersPage";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

import { useAuth } from "./context/AuthContext";

export default function App() {
  const { user, logout } = useAuth();

  const [page, setPage] = useState("products");

  // Solo se usa cuando NO hay sesión
  const [authScreen, setAuthScreen] = useState<
    "login" | "register"
  >("login");

  // ─────────────────────────────────────────────
  // SI NO HAY SESIÓN
  // ─────────────────────────────────────────────

  if (!user) {
    if (authScreen === "register") {
      return (
        <RegisterPage
          onSuccess={() =>
            setAuthScreen("login")
          }
          onGoLogin={() =>
            setAuthScreen("login")
          }
        />
      );
    }

    return (
      <LoginPage
        onSuccess={() => {}}
        onGoRegister={() =>
          setAuthScreen("register")
        }
      />
    );
  }

  // ─────────────────────────────────────────────
  // APP AUTENTICADA
  // ─────────────────────────────────────────────

  function renderContent() {
    switch (page) {
      case "products":
        return <ProductsPage />;

      case "users":
        return <ProfilePage />;


      case "orders":
        return <OrdersPage />;

      case "reviews":
        return <ReviewsPage />;

      default:
        return <ProductsPage />;
    }
  }

  const sidebar = (
    <div>
      <SidebarMenu
        current={page}
        onChange={setPage}
      />

      <div className="mt-6 border-t pt-4">
        <p className="text-sm font-semibold text-slate-700">
          {user.fullName}
        </p>

        <p className="text-xs text-slate-500">
          {user.email}
        </p>

        <p className="text-xs text-slate-500 mt-1">
          Rol: {user.role}
        </p>

        <button
          onClick={logout}
          className="mt-4 w-full rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );

  return (
    <MainLayout
      sidebar={sidebar}
      content={renderContent()}
    />
  );
}