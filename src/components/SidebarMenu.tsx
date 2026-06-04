type Props = {
  current: string;
  onChange: (page: string) => void;
};

const navItems = [
  { key: "users",    label: "Perfil",  icon: "ti-users"         },
  { key: "products", label: "Productos", icon: "ti-package"       },
  { key: "orders",   label: "Pedidos",   icon: "ti-shopping-cart" },
  { key: "reviews",  label: "Reseñas",   icon: "ti-star"          },
];

export default function SidebarMenu({ current, onChange }: Props) {
  return (
    <div className="flex flex-col h-full">

      {/* Encabezado */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <h2 className="text-[15px] font-semibold text-emerald-900">
            Cadena Justa
          </h2>
        </div>
        <p className="text-xs text-slate-400 pl-4">Panel de administración</p>
      </div>

      {/* Navegación */}
      <nav className="flex flex-col gap-1">
        {navItems.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`flex items-center gap-2.5 text-left w-full px-3 py-2.5 rounded-lg text-sm transition-colors
              ${current === key
                ? "bg-emerald-50 text-emerald-700 font-medium"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
          >
            <i className={`ti ${icon} text-[18px]`} />
            {label}
          </button>
        ))}
      </nav>

      {/* Pie */}
      <div className="mt-auto pt-4 border-t border-slate-100">
        <p className="text-xs text-slate-400 flex items-center gap-1.5">
          <i className="ti ti-fish text-[14px] text-emerald-500" />
          Pacífico Nariñense
        </p>
      </div>

    </div>
  );
}
