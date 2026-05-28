import { useState } from "react";
import { useAllUsers, useCreateUser, useUpdateUser, type User } from "../api/users.queries";

export default function UsersPage() {
  // Queries de TanStack
  const { data: users = [], isLoading, isError, error, refetch } = useAllUsers();
  const createUserMut = useCreateUser();
  const updateUserMut = useUpdateUser();

  // Modo del formulario: 'create' o 'edit'
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingUserId, setEditingUserId] = useState<number | null>(null);

  // Estados controlados estrictos
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); 
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"PRODUCER" | "BUYER">("PRODUCER");

  // Activar el modo de edición
  const handleEditClick = (user: User) => {
    setFormMode('edit');
    setEditingUserId(user.id);
    setEmail(user.email); 
    setFullName(user.fullName);
    setPhone(user.phone || "");
    setRole(user.role);
    setPassword(""); 
  };

  // Resetear el formulario
  const resetForm = () => {
    setFormMode('create');
    setEditingUserId(null);
    setEmail("");
    setPassword("");
    setFullName("");
    setPhone("");
    setRole("PRODUCER");
  };

  // Procesar el envío (Guardar o Actualizar)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !email.trim()) return;

    if (formMode === 'create') {
      if (password.length < 6) {
        alert("La contraseña debe tener al menos 6 caracteres.");
        return;
      }

      await createUserMut.mutateAsync({
        email: email.trim(),
        fullName: fullName.trim(),
        phone: phone.trim(),
        role,
        password: password,
      });
    } else if (formMode === 'edit' && editingUserId) {
      await updateUserMut.mutateAsync({
        id: editingUserId,
        dto: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          role, 
        },
      });
    }

    resetForm();
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans">
      
      {/* Encabezado */}
      <div className="mb-6 flex flex-col justify-between gap-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white shadow-sm sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ecosistema de Usuarios</h1>
          <p className="mt-1 text-sm text-blue-100">Panel de aprovisionamiento de cuentas y asignación de roles comerciales</p>
        </div>
        <button
          onClick={() => refetch()}
          className="rounded-lg bg-blue-800 px-4 py-2 text-sm font-bold border border-blue-500 shadow-sm hover:bg-blue-900 transition-all"
        >
          🔄 Refrescar Lista
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* COLUMNA INTERACTIVA: Formulario Dinámico */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm h-fit space-y-4">
          <div className="flex justify-between items-center pb-2 border-b">
            <h2 className="text-lg font-bold text-gray-900">
              {formMode === 'create' ? "➕ Registrar Usuario" : "📝 Modificar Perfil"}
            </h2>
            {formMode === 'edit' && (
              <button 
                onClick={resetForm}
                className="text-xs font-semibold text-red-500 hover:underline"
              >
                Cancelar Edición
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Correo Electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@cadenajusta.com"
                disabled={formMode === 'edit'} 
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
                required
              />
            </div>

            {/* Contraseña (Solo Creación) */}
            {formMode === 'create' && (
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Contraseña (Mín. 6)"</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nombre Completo o Empresa</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ej: Cooperativa Agro"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Rol en el Mercado</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:border-indigo-500 focus:outline-none font-bold text-indigo-700"
              >
                <option value="PRODUCER">🚜 Productor (Vendedor)</option>
                <option value="BUYER">🛒 Comprador (Aliado Comercial)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Teléfono Móvil (WhatsApp)</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ej: +57 315 987 6543"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={createUserMut.isPending || updateUserMut.isPending}
              className={`w-full rounded-lg py-2.5 text-sm font-bold text-white shadow-sm transition-all ${
                formMode === 'create' 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {createUserMut.isPending || updateUserMut.isPending 
                ? "Procesando..." 
                : formMode === 'create' ? "🚀 Crear Cuenta" : "💾 Confirmar Cambios"}
            </button>
          </form>

          {/* Gestión de Errores */}
          {(createUserMut.isError || updateUserMut.isError) && (
            <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100">
              🛑 Error: {
                (createUserMut.error as any)?.response?.data?.message?.toString() || 
                (updateUserMut.error as any)?.response?.data?.message?.toString() || 
                String(createUserMut.error || updateUserMut.error)
              }
            </p>
          )}
        </div>

        {/* COLUMNA DE DATOS: Tabla */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="bg-slate-50 p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800">Cuentas Registradas</h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                {users.length} En total
              </span>
            </div>

            {isLoading && <p className="text-center text-gray-600 font-medium py-10">⏳ Solicitando base de datos completa...</p>}
            {isError && <p className="m-4 rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">⚠️ Error de conexión: {String(error)}</p>}

            {!isLoading && !isError && users.length === 0 && (
              <p className="text-center text-gray-400 py-12 text-sm italic">No hay cuentas creadas en el backend todavía.</p>
            )}

            {users.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-slate-100 font-bold text-gray-600">
                      <th className="p-3">ID</th>
                      <th className="p-3">Nombre / Datos de Contacto</th>
                      <th className="p-3">Rol Contractual</th>
                      <th className="p-3 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3 font-mono font-bold text-slate-400">#{u.id}</td>
                        <td className="p-3">
                          <div className="font-bold text-gray-900">{u.fullName}</div>
                          <div className="text-gray-500 text-[11px]">{u.email}</div>
                          <div className="text-gray-400 text-[11px]">📞 {u.phone || "Sin teléfono"}</div>
                        </td>
                        <td className="p-3">
                          <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            u.role === 'PRODUCER'
                              ? 'bg-green-50 text-green-700 border border-green-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {u.role === 'PRODUCER' ? '🚜 PRODUCER' : '🛒 BUYER'}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleEditClick(u)}
                            className="rounded bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 px-2.5 py-1 text-xs font-bold text-indigo-700 shadow-sm transition-all"
                          >
                            ✏️ Editar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}