import { useState } from "react";
import { authApi, type Role } from "../api/auth";

type Props = {
  onSuccess: () => void;
  onGoLogin?: () => void;
};

export default function RegisterPage({ onSuccess, onGoLogin }: Props) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<Role>("BUYER");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate(): string | null {
    if (!fullName.trim()) return "El nombre completo es obligatorio.";
    if (!email.trim()) return "El correo electrónico es obligatorio.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "Ingresa un correo electrónico válido.";
    if (password.length < 6)
      return "La contraseña debe tener al menos 6 caracteres.";
    if (!phone.trim()) return "El teléfono es obligatorio.";
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
      await authApi.register({ fullName, email, password, phone, role });
      onSuccess(); // tras registro exitoso → ir al login
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al registrarse.";
      // El backend devuelve 409 si el email ya existe
      setError(
        msg.toLowerCase().includes("conflict") || msg.includes("409")
          ? "El correo electrónico ya está registrado."
          : "Error al registrarse. Intenta de nuevo."
      );
    } finally {
      setLoading(false);
    }
  }

return (
  <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-700 flex items-center justify-center px-4 py-8">
    <div className="w-full max-w-md">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-8">

        {/* Encabezado */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg">
            <span className="text-2xl">🌾🐟</span>
          </div>

          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-700 to-cyan-700 bg-clip-text text-transparent">
            CadenaJusta
          </h1>

          <p className="text-sm text-slate-500 mt-2">
            Crea tu cuenta y empieza a comercializar productos del Pacífico Nariñense
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Nombre completo
            </label>

            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Juan Pérez"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none"
              disabled={loading}
            />
          </div>

          {/* Email */}
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

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Contraseña
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none"
              autoComplete="new-password"
              disabled={loading}
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Teléfono
            </label>

            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+57 300 000 0000"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none"
              disabled={loading}
            />
          </div>

          {/* Rol */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Tipo de usuario
            </label>

            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none"
              disabled={loading}
            >
              <option value="BUYER">
                🛒 Comprador
              </option>

              <option value="PRODUCER">
                🌾 Productor
              </option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            {loading ? "Registrando..." : "Crear cuenta"}
          </button>
        </form>

        {/* Login */}
        {onGoLogin && (
          <p className="mt-6 text-center text-sm text-slate-600">
            ¿Ya tienes una cuenta?{" "}
            <button
              onClick={onGoLogin}
              className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              Inicia sesión
            </button>
          </p>
        )}
      </div>
    </div>
  </div>
);
}