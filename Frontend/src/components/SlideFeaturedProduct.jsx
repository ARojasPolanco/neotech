import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Tag } from "lucide-react";

export default function SlideFeaturedProduct({ product }) {
  if (!product || product.empty) {
    return (
      <div className="relative flex h-full min-h-[280px] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-900 px-6 py-16 text-center text-white sm:min-h-[340px]">
        <div className="relative z-10">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-heading text-2xl font-bold text-white/80 sm:text-3xl"
          >
            Próximamente ofertas exclusivas
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-3 text-sm text-white/50"
          >
            Muy pronto novedades y descuentos especiales
          </motion.p>
        </div>
      </div>
    );
  }

  const placeholder = "https://placehold.co/800x400/1a1a1a/666?text=Neo+Tech";
  const imgSrc = product.imageUrl || placeholder;

  return (
    <Link
      to={`/products/${product.id}`}
      className="relative block h-full min-h-[280px] overflow-hidden rounded-2xl sm:min-h-[340px]"
    >
      <img
        src={imgSrc}
        alt={product.name}
        className="absolute inset-0 h-full w-full object-cover blur-sm brightness-50"
      />

      <div className="relative z-10 flex h-full min-h-[280px] items-center justify-center px-6 py-16 sm:min-h-[340px]">
        <div className="text-center text-white">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-bold text-fg"
          >
            <Tag size={16} />
            {Number(product.discountPercent)}% OFF
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-heading text-3xl font-bold leading-tight sm:text-4xl md:text-5xl"
          >
            {product.name}
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 flex items-center justify-center gap-3"
          >
            <span className="text-lg text-white/50 line-through">
              ${Number(product.price).toLocaleString("es-AR")}
            </span>
            <span className="text-2xl font-bold text-accent sm:text-3xl">
              ${Number(product.discountedPrice).toLocaleString("es-AR")}
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <span className="mt-6 inline-block rounded-lg bg-accent px-8 py-3 text-sm font-semibold text-fg transition-colors hover:bg-accent-dark">
              Ver producto
            </span>
          </motion.div>
        </div>
      </div>
    </Link>
  );
}
