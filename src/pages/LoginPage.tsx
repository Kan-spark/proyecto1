import { useState } from "react";
import { authApi } from "../api/auth";
import { useAuth } from "../context/AuthContext";

type Props = {
  onSuccess: () => void;
  onGoRegister?: () => void;
};

export default function LoginPage({ onSuccess, onGoRegister }: Props) {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Validación del lado del cliente
  function validate(): string | null {
    if (!email.trim()) return "El correo electrónico es obligatorio.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "Ingresa un correo electrónico válido.";
    if (password.length < 6)
      return "La contraseña debe tener al menos 6 caracteres.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await authApi.login({ email, password });
      // Guardamos access_token y el objeto user completo
      login(res.access_token, res.user);
      onSuccess();
    } catch {
      setError("Credenciales inválidas. Verifica tu correo y contraseña.");
    } finally {
      setLoading(false);
    }
  }

return (
  <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-700 flex items-center justify-center px-4">
    <div className="w-full max-w-sm">
      
      {/* Tarjeta */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/30">

        {/* Encabezado */}
        <div className="mb-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg">
            <span className="text-2xl">🌾</span>
          </div>

          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-700 to-cyan-700 bg-clip-text text-transparent">
            CadenaJusta
          </h1>

          <p className="text-sm text-slate-500 mt-2">
            Conectando productores, pescadores y compradores del Pacífico Nariñense
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Correo electrónico
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none"
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Contraseña
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none"
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        {/* Registro */}
        {onGoRegister && (
          <p className="mt-6 text-center text-sm text-slate-600">
            ¿No tienes cuenta?{" "}
            <button
              onClick={onGoRegister}
              className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              Regístrate
            </button>
          </p>
        )}
      </div>
    </div>
  </div>
);
}