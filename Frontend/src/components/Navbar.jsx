import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Search, Sun, X } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import BrandLogo from "./BrandLogo.jsx";
import MiniCart from "./MiniCart.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems, lastAdded, clearLastAdded } = useCart();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [bump, setBump] = useState(false);

  useEffect(() => {
    if (lastAdded) {
      setBump(true);
      const timer = setTimeout(() => {
        setBump(false);
        clearLastAdded();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [lastAdded, clearLastAdded]);

  const navLinks = [
    { to: "/products", label: "Productos" },
    { to: "/cart", label: "Carrito" },
  ];

  const closeMenus = () => {
    setSearchOpen(false);
    setMobileOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const term = query.trim();
    navigate(term ? `/products?search=${encodeURIComponent(term)}` : "/products");
    closeMenus();
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-5">
        <div className="flex items-center gap-3">
          <BrandLogo size="md" />
          <button
            onClick={toggleTheme}
            aria-label={
              theme === "dark" ? "Activar modo claro" : "Activar modo oscuro"
            }
            className="hidden h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-border text-muted transition-colors hover:bg-surface hover:text-fg md:flex"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        {/* Desktop search */}
        <form
          onSubmit={handleSearch}
          role="search"
          className="absolute left-1/2 top-1/2 hidden w-64 -translate-x-1/2 -translate-y-1/2 md:block"
        >
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar productos..."
            aria-label="Buscar productos"
            className="w-full rounded-full border border-border bg-surface py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </form>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          <Link
            to="/products"
            className="text-sm font-medium text-muted transition-colors hover:text-fg"
          >
            Productos
          </Link>

          {user?.role === "ADMIN" && (
            <Link
              to="/admin"
              className="text-sm font-medium text-accent-dark transition-colors hover:text-fg"
            >
              Admin
            </Link>
          )}

          <div
            className="relative"
            onMouseEnter={() => setCartOpen(true)}
            onMouseLeave={() => setCartOpen(false)}
          >
            <Link
              to="/cart"
              className="relative text-sm font-medium text-muted transition-colors hover:text-fg"
            >
              Carrito
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span
                    key={totalItems}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{
                      scale: bump ? [1, 1.5, 1] : 1,
                      opacity: 1,
                    }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    className="absolute -right-3 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-fg"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
            <MiniCart isOpen={cartOpen} onClose={() => setCartOpen(false)} />
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted">{user.fullname}</span>
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
              className="rounded-lg bg-accent px-4 py-1.5 text-sm font-semibold text-accent-fg transition-colors hover:bg-accent-dark"
            >
              Ingresar
            </Link>
          )}
        </div>

        {/* Mobile actions */}
        <div className="flex items-center gap-1 md:hidden">
          <button
            onClick={toggleTheme}
            aria-label={
              theme === "dark" ? "Activar modo claro" : "Activar modo oscuro"
            }
            className="flex h-10 w-10 items-center justify-center rounded-lg text-fg"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button
            onClick={() => {
              setSearchOpen((prev) => !prev);
              setMobileOpen(false);
            }}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-fg"
            aria-label={searchOpen ? "Cerrar búsqueda" : "Buscar"}
            aria-expanded={searchOpen}
          >
            {searchOpen ? <X size={22} /> : <Search size={22} />}
          </button>

          <button
            onClick={() => {
              setMobileOpen((prev) => !prev);
              setSearchOpen(false);
            }}
            className="flex h-10 w-10 flex-col items-center justify-center gap-1.5"
            aria-label="Menú"
            aria-expanded={mobileOpen}
          >
            <motion.span
              animate={{
                rotate: mobileOpen ? 45 : 0,
                y: mobileOpen ? 7 : 0,
              }}
              className="block h-0.5 w-6 bg-fg"
            />
            <motion.span
              animate={{ opacity: mobileOpen ? 0 : 1 }}
              className="block h-0.5 w-6 bg-fg"
            />
            <motion.span
              animate={{
                rotate: mobileOpen ? -45 : 0,
                y: mobileOpen ? -7 : 0,
              }}
              className="block h-0.5 w-6 bg-fg"
            />
          </button>
        </div>
      </div>

      {/* Mobile search */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border bg-card md:hidden"
          >
            <form onSubmit={handleSearch} role="search" className="px-5 py-3">
              <div className="relative">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar productos..."
                  aria-label="Buscar productos"
                  autoFocus
                  className="w-full rounded-full border border-border bg-surface py-2.5 pl-9 pr-3 text-sm outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent"
                />
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border bg-card md:hidden"
          >
            <div className="flex flex-col gap-2 px-5 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={closeMenus}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-fg"
                >
                  {link.label}
                  {link.to === "/cart" && totalItems > 0 && (
                    <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-accent-fg">
                      {totalItems}
                    </span>
                  )}
                </Link>
              ))}

              {user ? (
                <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3">
                  <span className="px-3 text-sm text-muted">{user.fullname}</span>
                  {user.role === "ADMIN" && (
                    <Link
                      to="/admin"
                      onClick={closeMenus}
                      className="rounded-lg px-3 py-2 text-sm font-medium text-accent-dark transition-colors hover:bg-surface hover:text-fg"
                    >
                      Panel Admin
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      closeMenus();
                    }}
                    className="rounded-lg px-3 py-2 text-left text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-fg"
                  >
                    Salir
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={closeMenus}
                  className="mt-2 rounded-lg bg-accent px-3 py-2 text-center text-sm font-semibold text-accent-fg transition-colors hover:bg-accent-dark"
                >
                  Ingresar
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
