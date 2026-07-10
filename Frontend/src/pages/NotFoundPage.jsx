import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-6 text-8xl font-bold text-accent"
      >
        404
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="font-heading text-3xl font-bold"
      >
        Página no encontrada
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-3 max-w-md text-muted"
      >
        Lo sentimos, no pudimos encontrar lo que buscás. Probá volver al inicio o explorar nuestros productos.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-8 flex gap-4"
      >
        <Link
          to="/"
          className="rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-fg transition-colors hover:bg-accent-dark"
        >
          Volver al inicio
        </Link>
        <Link
          to="/products"
          className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium transition-colors hover:bg-surface"
        >
          Ver productos
        </Link>
      </motion.div>
    </div>
  );
}
