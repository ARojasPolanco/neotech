import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import FeaturedCarousel from "../components/FeaturedCarousel.jsx";
import { getFeaturedProducts } from "../services/product.service.js";

const featured = [
  { name: "Auriculares", desc: "Sumergite en el sonido", emoji: "🎧" },
  { name: "Teclados", desc: "Precisión y estilo", emoji: "⌨️" },
  { name: "Micrófonos", desc: "Sonido profesional", emoji: "🎙️" },
  { name: "Parlantes", desc: "Potencia y claridad", emoji: "🔊" },
  { name: "Cargadores", desc: "Carga rápida y segura", emoji: "⚡" },
  { name: "Accesorios", desc: "Todo lo que necesitás", emoji: "🔌" },
];

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFeaturedProducts()
      .then(setFeaturedProducts)
      .catch(() => setFeaturedProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="relative mb-12 mt-2 overflow-hidden rounded-2xl bg-gradient-to-br from-fg to-neutral-900 px-6 py-16 text-center text-white sm:py-20">
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
      </section>

      {featuredProducts.length > 0 && (
        <section className="mb-12">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="font-heading text-2xl font-bold sm:text-3xl">
              Destacados
            </h2>
            <Link
              to="/products"
              className="text-sm font-medium text-accent-dark hover:underline"
            >
              Ver todos
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-card bg-surface p-4">
                  <div className="aspect-[4/3] rounded-lg bg-border" />
                  <div className="mt-3 h-4 w-3/4 rounded bg-border" />
                  <div className="mt-2 h-4 w-1/2 rounded bg-border" />
                </div>
              ))}
            </div>
          ) : (
            <FeaturedCarousel products={featuredProducts} />
          )}
        </section>
      )}

      <section className="mb-12">
        <h2 className="mb-4 font-heading text-2xl font-bold sm:text-3xl">
          Categorías
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {featured.map((cat) => (
            <motion.div
              key={cat.name}
              whileHover={{ y: -4 }}
              className="flex flex-col items-center rounded-card border border-border bg-white p-6 text-center shadow-sm transition-shadow hover:shadow-md"
            >
              <span className="text-3xl">{cat.emoji}</span>
              <h3 className="mt-3 font-heading text-lg font-semibold">{cat.name}</h3>
              <p className="mt-1 text-xs text-muted">{cat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
