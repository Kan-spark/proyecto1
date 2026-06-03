import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { AuthUser } from "../api/auth";

// ── Tipos ────────────────────────────────────────────────────────────────────

type SessionUser = AuthUser & { token: string };

type AuthContextType = {
  user: SessionUser | null;
  login: (token: string, userData: AuthUser) => void;
  logout: () => void;
};

// ── Contexto ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null);

// ── Provider ─────────────────────────────────────────────────────────────────

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(() => {
    try {
      const token = localStorage.getItem("token");
      const raw = localStorage.getItem("user");
      if (token && raw) {
        return { token, ...JSON.parse(raw) };
      }
    } catch {
      // JSON corrupto → sesión limpia
    }
    return null;
  });

  function login(token: string, userData: AuthUser) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser({ token, ...userData });
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────────

function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

export { AuthProvider, useAuth };
export type { SessionUser };