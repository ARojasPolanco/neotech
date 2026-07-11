import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

export default function MiniCart({ isOpen, onClose }) {
  const { items, totalPrice, totalItems } = useCart();

  const recentItems = items.slice(-3).reverse();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="absolute right-0 top-full z-50 mt-2 w-80 rounded-card border border-border bg-white p-4 shadow-xl"
        >
            <div className="mb-3 flex items-center justify-between">
              <p className="font-heading text-lg font-semibold">
                Carrito ({totalItems})
              </p>
              <button
                onClick={onClose}
                className="text-lg text-muted transition-colors hover:text-fg"
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            {items.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted">
                Tu carrito está vacío
              </p>
            ) : (
              <>
                <div className="max-h-64 space-y-3 overflow-y-auto">
                  {recentItems.map((item) => (
                    <div key={item.key} className="flex gap-3">
                      <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-surface">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{item.name}</p>
                        {item.color && (
                          <p className="text-xs text-muted">{item.color}</p>
                        )}
                        <p className="text-xs text-muted">
                          x{item.quantity} · ${item.price.toLocaleString("es-AR")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 border-t border-border pt-3">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm text-muted">Total</span>
                    <span className="font-semibold">
                      ${totalPrice.toLocaleString("es-AR")}
                    </span>
                  </div>
                  <Link
                    to="/cart"
                    onClick={onClose}
                    className="block w-full rounded-lg bg-accent py-2.5 text-center text-sm font-semibold text-fg transition-colors hover:bg-accent-dark"
                  >
                    Ir al carrito
                  </Link>
                </div>
              </>
            )}
          </motion.div>
      )}
    </AnimatePresence>
  );
}
