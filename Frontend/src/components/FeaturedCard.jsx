import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductImage from "./ProductImage.jsx";
import VariantDots from "./VariantDots.jsx";

export default function FeaturedCard({ product }) {
  const [imageIndex, setImageIndex] = useState(-1);
  const variants = product.ProductVariants || [];

  const images = [
    product.imageUrl,
    ...variants.filter((v) => v.imageUrl).map((v) => v.imageUrl),
  ].filter(Boolean);

  const currentImg =
    images.length > 0
      ? images[Math.min(Math.max(imageIndex, 0), images.length - 1)]
      : null;
  const hasMultiple = images.length > 1;

  const totalStock = variants.length
    ? variants.reduce((sum, v) => sum + Number(v.stock || 0), 0)
    : product.stock !== undefined && product.stock !== null
      ? Number(product.stock)
      : null;
  const isLastUnit = totalStock === 1;

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
      className="group block w-64 overflow-hidden rounded-card border border-border bg-card shadow-sm transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface">
        <ProductImage
          src={currentImg}
          alt={product.name}
          className="h-full w-full"
          imgClassName="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {product.discountActive && (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-accent-fg">
            {Number(product.discountPercent)}% OFF
          </span>
        )}

        {isLastUnit && (
          <span className="absolute bottom-2 left-2 z-10 rounded-full bg-warning px-2 py-0.5 text-[11px] font-bold text-accent-fg">
            Última unidad
          </span>
        )}

        {hasMultiple && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-1 top-1/2 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-card/80 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-1 top-1/2 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-card/80 opacity-0 transition-opacity group-hover:opacity-100"
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
          {product.discountActive ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted line-through">
                ${Number(product.price).toLocaleString("es-AR")}
              </span>
              <span className="text-xl font-bold text-accent-dark">
                ${Number(product.discountedPrice).toLocaleString("es-AR")}
              </span>
            </div>
          ) : (
            <p className="text-xl font-bold">
              ${Number(product.price).toLocaleString("es-AR")}
            </p>
          )}
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
