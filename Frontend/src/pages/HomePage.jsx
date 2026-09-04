import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Headphones, Keyboard, Mic, Speaker, Zap, Cable, Smartphone } from "lucide-react";
import FeaturedCarousel from "../components/FeaturedCarousel.jsx";
import HeroSlider from "../components/HeroSlider.jsx";
import { getFeaturedProducts, getFeaturedHighlight } from "../services/product.service.js";

const categories = [
  { name: "Auriculares", desc: "Sumergite en el sonido", icon: Headphones },
  { name: "Teclados", desc: "Precisión y estilo", icon: Keyboard },
  { name: "Micrófonos", desc: "Sonido profesional", icon: Mic },
  { name: "Parlantes", desc: "Potencia y claridad", icon: Speaker },
  { name: "Cargadores", desc: "Carga rápida y segura", icon: Zap },
  { name: "Fundas", desc: "Protegé tu celular", icon: Smartphone },
  { name: "Accesorios", desc: "Todo lo que necesitás", icon: Cable },
];

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [highlight, setHighlight] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getFeaturedProducts().catch(() => []),
      getFeaturedHighlight().catch(() => null),
    ])
      .then(([products, hl]) => {
        setFeaturedProducts(products);
        setHighlight(hl);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <HeroSlider featuredProduct={highlight} />

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
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to={`/products?category=${cat.name}`}
            >
              <motion.div
                whileHover={{ y: -4 }}
                className="flex flex-col items-center rounded-card border border-border bg-white p-6 text-center shadow-sm transition-shadow hover:shadow-md"
              >
                <cat.icon size={28} className="text-accent" />
                <h3 className="mt-3 font-heading text-lg font-semibold">{cat.name}</h3>
                <p className="mt-1 text-xs text-muted">{cat.desc}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
