import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  const img = product.imageUrl || "https://placehold.co/400x400/e0e0e0/666?text=Neo+Tech";

  return (
    <Link
      to={`/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-card border border-border bg-white transition-shadow hover:shadow-lg"
    >
      <div className="aspect-square overflow-hidden bg-surface">
        <img
          src={img}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="font-heading text-lg font-semibold leading-tight">
          {product.name}
        </h3>
        {product.description && (
          <p className="line-clamp-2 text-sm text-muted">{product.description}</p>
        )}
        <p className="mt-auto pt-2 text-xl font-bold">
          ${Number(product.price).toLocaleString("es-AR")}
        </p>
      </div>
    </Link>
  );
}
