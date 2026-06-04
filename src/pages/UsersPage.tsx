import { useState } from "react";
import { useMyProfile, useUpdateMyProfile } from "../api/users.queries";
import type { UpdateUserDto } from "../api/users";

export default function ProfilePage() {
  const { data: profile, isLoading, isError, error } = useMyProfile();
  const updateMut = useUpdateMyProfile();

  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  function openEdit() {
    if (!profile) return;
    setFullName(profile.fullName);
    setEmail(profile.email);
    setPhone(profile.phone);
    setPassword("");
    setFormError(null);
    setSuccessMsg(null);
    setEditing(true);
  }

  function validate(): string | null {
    if (!fullName.trim()) return "El nombre completo es obligatorio.";
    if (!email.trim()) return "El correo electrónico es obligatorio.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "Ingresa un correo electrónico válido.";
    if (!phone.trim()) return "El teléfono es obligatorio.";
    if (password && password.length < 6)
      return "La nueva contraseña debe tener al menos 6 caracteres.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setFormError(validationError);
      return;
    }
    setFormError(null);

    // El rol nunca se incluye — el usuario no puede cambiarlo
    const dto: UpdateUserDto = { fullName, email, phone };
    if (password) dto.password = password;

    try {
      await updateMut.mutateAsync(dto);
      setSuccessMsg("Perfil actualizado correctamente.");
      setEditing(false);
      setPassword("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      setFormError(
        msg.toLowerCase().includes("conflict") || msg.includes("409")
          ? "El correo ya está en uso por otro usuario."
          : "Error al actualizar. Intenta de nuevo."
      );
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-emerald-600 animate-pulse">Cargando perfil…</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
        Error al cargar el perfil: {String(error)}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">

      {/* Encabezado */}
      <div className="pb-2 border-b border-emerald-100">
        <h1 className="text-3xl font-bold text-emerald-800">Mi perfil</h1>
        <p className="text-slate-500 text-sm mt-1">
          Información de tu cuenta y productos asociados.
        </p>
      </div>

      {/* Mensaje de éxito */}
      {successMsg && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700 flex items-center gap-2">
          <i className="ti ti-circle-check text-[16px]" />
          {successMsg}
        </div>
      )}

      {/* Tarjeta de datos */}
      {!editing ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-semibold text-sm">
                {profile!.fullName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-emerald-900 text-sm">{profile!.fullName}</p>
                <p className="text-xs text-emerald-600">{profile!.role}</p>
              </div>
            </div>
            <button
              onClick={openEdit}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-sm text-emerald-700 hover:bg-emerald-50 transition-colors"
            >
              <i className="ti ti-edit text-[14px]" />
              Editar
            </button>
          </div>

          <div className="p-6">
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <Field label="Nombre completo" value={profile!.fullName} icon="ti-user" />
              <Field label="Correo electrónico" value={profile!.email} icon="ti-mail" />
              <Field label="Teléfono" value={profile!.phone} icon="ti-phone" />
              <Field label="Rol" value={profile!.role} icon="ti-badge" />
              <Field label="Verificado" value={profile!.isVerified ? "Sí" : "No"} icon="ti-shield-check" />
              <Field
                label="Miembro desde"
                value={new Date(profile!.createdAt).toLocaleDateString("es-CO", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                icon="ti-calendar"
              />
            </div>
          </div>
        </div>
      ) : (

        /* Formulario de edición */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-4">
            <h2 className="text-base font-semibold text-emerald-900 flex items-center gap-2">
              <i className="ti ti-edit text-[16px]" />
              Editar perfil
            </h2>
          </div>

          <div className="p-6">
            {formError && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 flex items-center gap-2">
                <i className="ti ti-alert-circle text-[16px]" />
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    disabled={updateMut.isPending}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    disabled={updateMut.isPending}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    disabled={updateMut.isPending}
                  />
                </div>

                {/* Rol: solo lectura, no editable */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                    Rol
                  </label>
                  <div className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400 flex items-center justify-between">
                    <span>{profile!.role === "BUYER" ? "Comprador (BUYER)" : "Productor (PRODUCER)"}</span>
                    <span className="text-xs text-slate-300">No editable</span>
                  </div>
                </div>

              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={updateMut.isPending}
                  className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                >
                  <i className="ti ti-device-floppy text-[15px]" />
                  {updateMut.isPending ? "Guardando…" : "Guardar cambios"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  disabled={updateMut.isPending}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <i className="ti ti-x text-[15px]" />
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Productos del usuario */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-4 flex items-center gap-2">
          <i className="ti ti-package text-emerald-600 text-[18px]" />
          <h2 className="text-base font-semibold text-emerald-900">
            Mis productos
          </h2>
          <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
            {profile!.products.length}
          </span>
        </div>

        <div className="p-6">
          {profile!.products.length === 0 ? (
            <div className="flex flex-col items-center py-6 text-slate-400 gap-2">
              <i className="ti ti-mood-empty text-[32px]" />
              <p className="text-sm">No tienes productos registrados aún.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    <th className="p-3 font-medium text-slate-500 text-xs uppercase tracking-wide">ID</th>
                    <th className="p-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Nombre</th>
                    <th className="p-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {profile!.products.map((p) => (
                    <tr key={p.id} className="border-t border-slate-100 hover:bg-emerald-50 transition-colors">
                      <td className="p-3 text-slate-400 font-mono text-xs">{p.id}</td>
                      <td className="p-3 text-slate-700 font-medium">{p.title || p.name || "—"}</td>
                      <td className="p-3 text-slate-600">{(p as any).stock ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 w-7 h-7 rounded-md bg-emerald-50 flex items-center justify-center shrink-0">
        <i className={`ti ${icon} text-emerald-600 text-[14px]`} />
      </div>
      <div>
        <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-slate-800 font-medium">{value}</p>
      </div>
    </div>
  );
}
