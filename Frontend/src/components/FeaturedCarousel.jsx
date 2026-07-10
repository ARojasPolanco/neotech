import { useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function FeaturedCarousel({ products }) {
  const carouselRef = useRef(null);

  if (!products || products.length === 0) return null;

  return (
    <div className="relative">
      <motion.div
        ref={carouselRef}
        className="flex cursor-grab gap-4 overflow-x-hidden py-2 active:cursor-grabbing"
        whileTap={{ cursor: "grabbing" }}
      >
        <motion.div
          drag="x"
          dragConstraints={carouselRef}
          className="flex gap-4"
        >
          {products.map((product) => (
            <FeaturedCard key={product.id} product={product} />
          ))}
        </motion.div>
      </motion.div>

      <p className="mt-2 text-center text-xs text-muted md:hidden">
        Deslizá para ver más
      </p>
    </div>
  );
}

function FeaturedCard({ product }) {
  const img = product.imageUrl || "https://placehold.co/400x400/e0e0e0/666?text=Neo+Tech";

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="w-64 flex-shrink-0"
    >
      <Link
        to={`/products/${product.id}`}
        className="group block overflow-hidden rounded-card border border-border bg-white shadow-sm transition-shadow hover:shadow-lg"
      >
        <div className="aspect-[4/3] overflow-hidden bg-surface">
          <img
            src={img}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="p-4">
          <h3 className="font-heading text-lg font-semibold leading-tight line-clamp-1">
            {product.name}
          </h3>
          {product.description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted">{product.description}</p>
          )}
          <p className="mt-3 text-xl font-bold">
            ${Number(product.price).toLocaleString("es-AR")}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
