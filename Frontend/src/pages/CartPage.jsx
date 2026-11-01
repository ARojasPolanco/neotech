import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import ProductImage from "../components/ProductImage.jsx";
import { useCart } from "../context/CartContext.jsx";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-4 py-20"
      >
        <p className="text-lg font-semibold">Tu carrito está vacío</p>
        <p className="text-sm text-muted">Agregá productos para empezar a comprar.</p>
        <Link
          to="/products"
          className="rounded-lg bg-accent px-6 py-2 text-sm font-semibold text-fg transition-colors hover:bg-accent-dark"
        >
          Ver productos
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 font-heading text-3xl font-bold">Tu Carrito</h1>

      <div className="flex flex-col gap-4">
        <AnimatePresence mode="popLayout">
          {items.map((item) => (
            <motion.div
              key={item.key}
              layout
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100, height: 0, marginBottom: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="flex flex-col gap-4 rounded-card border border-border bg-white p-4 sm:flex-row sm:items-center"
            >
              <div className="h-24 w-full flex-shrink-0 overflow-hidden rounded-lg bg-surface sm:h-20 sm:w-20">
                <ProductImage
                  src={item.image || null}
                  alt={item.name}
                  className="h-full w-full"
                  imgClassName="h-full w-full object-cover"
                />
              </div>

              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                {item.color && (
                  <p className="text-sm text-muted">Color: {item.color}</p>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold">
                    ${Number(item.price).toLocaleString("es-AR")}
                  </p>
                  {item.discountActive && (
                    <>
                      <span className="text-xs text-muted line-through">
                        ${Number(item.originalPrice).toLocaleString("es-AR")}
                      </span>
                      <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-fg">
                        {item.discountPercent}% OFF
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 sm:justify-start">
                <div className="flex items-center gap-2">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => updateQuantity(item.key, item.quantity - 1)}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-border transition-colors hover:bg-surface"
                  >
                    -
                  </motion.button>
                  <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => updateQuantity(item.key, item.quantity + 1)}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-border transition-colors hover:bg-surface"
                  >
                    +
                  </motion.button>
                </div>

                <p className="w-24 text-right font-semibold">
                  ${(Number(item.price) * item.quantity).toLocaleString("es-AR")}
                </p>

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => removeItem(item.key)}
                  className="cursor-pointer text-muted transition-colors hover:text-error"
                  aria-label={`Quitar ${item.name}`}
                >
                  <X size={16} />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <motion.div
        layout
        className="mt-6 flex items-center justify-between rounded-card border border-border bg-white p-4"
      >
        <p className="text-lg font-semibold">Total</p>
        <p className="text-2xl font-bold">${totalPrice.toLocaleString("es-AR")}</p>
      </motion.div>

      <motion.button
        layout
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate("/checkout")}
        className="mt-4 w-full cursor-pointer rounded-lg bg-accent py-3 text-sm font-semibold text-fg transition-colors hover:bg-accent-dark"
      >
        Finalizar Compra
      </motion.button>
    </div>
  );
}
