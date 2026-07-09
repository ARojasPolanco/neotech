import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
        <Link to="/" className="font-heading text-2xl font-bold tracking-tight">
          NEO <span className="text-accent">TECH</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/products" className="text-sm font-medium text-muted hover:text-fg transition-colors">
            Productos
          </Link>

          <Link to="/cart" className="relative text-sm font-medium text-muted hover:text-fg transition-colors">
            Carrito
            {totalItems > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-fg">
                {totalItems}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted">{user.fullname}</span>
              {user.role === "ADMIN" && (
                <span className="rounded-full bg-accent/20 px-2 py-0.5 text-xs font-medium text-accent-dark">
                  Admin
                </span>
              )}
              <button
                onClick={logout}
                className="cursor-pointer rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-surface"
              >
                Salir
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-lg bg-accent px-4 py-1.5 text-sm font-semibold text-fg transition-colors hover:bg-accent-dark"
            >
              Ingresar
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
