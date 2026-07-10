import { NavLink, Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const tabs = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/products", label: "Productos" },
  { to: "/admin/orders", label: "Pedidos" },
];

export default function AdminLayout() {
  const { user } = useAuth();

  if (!user || user.role !== "ADMIN") {
    return <Navigate to="/login" replace />;
  }

  return (
    <div>
      <nav className="mb-6 flex gap-1 overflow-x-auto rounded-card border border-border bg-white p-1">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `rounded-lg px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? "bg-accent text-fg"
                  : "text-muted hover:bg-surface hover:text-fg"
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}
