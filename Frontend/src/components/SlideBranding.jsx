import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function SlideBranding() {
  return (
    <div className="relative flex h-full min-h-[280px] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-fg to-neutral-900 px-6 py-16 text-center text-white sm:min-h-[340px]">
      <div className="relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-heading text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl"
        >
          Tecnología para{" "}
          <span className="text-accent">todo</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto mt-4 max-w-lg text-base text-white/80 sm:text-lg"
        >
          Descubrí nuestra selección de audio, gaming, carga y accesorios. Calidad y precio justo.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Link
            to="/products"
            className="mt-8 inline-block rounded-lg bg-accent px-8 py-3 text-sm font-semibold text-fg transition-colors hover:bg-accent-dark"
          >
            Ver Productos
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
