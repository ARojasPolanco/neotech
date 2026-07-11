import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import VariantDots from "./VariantDots.jsx";

export default function ProductCard({ product }) {
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
      className="group flex flex-col overflow-hidden rounded-card border border-border bg-white transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden bg-surface">
        <img
          src={currentImg}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {hasMultiple && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-1 top-1/2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/80 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/80 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="font-heading text-lg font-semibold leading-tight">
          {product.name}
        </h3>
        {product.description && (
          <p className="line-clamp-2 text-sm text-muted">{product.description}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2">
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
