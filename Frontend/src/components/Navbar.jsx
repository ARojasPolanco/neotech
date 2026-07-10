import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import MiniCart from "./MiniCart.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems, lastAdded, clearLastAdded } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
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

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
        <Link to="/" className="font-heading text-2xl font-bold tracking-tight">
          NEO <span className="text-accent">TECH</span>
        </Link>

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
                    className="absolute -right-3 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-fg"
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
              className="rounded-lg bg-accent px-4 py-1.5 text-sm font-semibold text-fg transition-colors hover:bg-accent-dark"
            >
              Ingresar
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen((prev) => !prev)}
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
          aria-label="Menú"
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

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border bg-white md:hidden"
          >
            <div className="flex flex-col gap-2 px-5 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-fg"
                >
                  {link.label}
                  {link.to === "/cart" && totalItems > 0 && (
                    <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-fg">
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
                      onClick={() => setMobileOpen(false)}
                      className="rounded-lg px-3 py-2 text-sm font-medium text-accent-dark transition-colors hover:bg-surface hover:text-fg"
                    >
                      Panel Admin
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setMobileOpen(false);
                    }}
                    className="rounded-lg px-3 py-2 text-left text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-fg"
                  >
                    Salir
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 rounded-lg bg-accent px-3 py-2 text-center text-sm font-semibold text-fg transition-colors hover:bg-accent-dark"
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
