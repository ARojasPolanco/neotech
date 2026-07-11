import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import VariantDots from "./VariantDots.jsx";

export default function FeaturedCard({ product }) {
  const [imageIndex, setImageIndex] = useState(-1);
  const variants = product.ProductVariants || [];
  const placeholder = "https://placehold.co/400x400/e0e0e0/666?text=Neo+Tech";

  const images = [
    product.imageUrl || placeholder,
    ...variants.filter((v) => v.imageUrl).map((v) => v.imageUrl),
  ];

  const currentImg = images[Math.max(0, imageIndex)] || placeholder;
  const hasMultiple = images.length > 1;

  const nextImage = (e) => {
    e.preventDefault();
    setImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.preventDefault();
    setImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <Link
      to={`/products/${product.id}`}
      className="group block w-64 overflow-hidden rounded-card border border-border bg-white shadow-sm transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface">
        <img
          src={currentImg}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {hasMultiple && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-1 top-1/2 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/80 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-1 top-1/2 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/80 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <ChevronRight size={14} />
            </button>
          </>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-heading text-lg font-semibold leading-tight line-clamp-1">
          {product.name}
        </h3>
        {product.description && (
          <p className="mt-1 line-clamp-2 text-sm text-muted">{product.description}</p>
        )}
        <div className="mt-2 flex items-center justify-between">
          <p className="text-xl font-bold">
            ${Number(product.price).toLocaleString("es-AR")}
          </p>
          {variants.length > 0 && (
            <VariantDots
              variants={variants}
              currentIndex={imageIndex}
              onSelect={setImageIndex}
              size="sm"
            />
          )}
        </div>
      </div>
    </Link>
  );
}
