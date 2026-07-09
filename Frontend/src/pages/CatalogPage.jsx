import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard.jsx";
import { getProducts } from "../services/product.service.js";

export default function CatalogPage() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const filters = {};
    const search = searchParams.get("search");
    if (search) filters.search = search;

    setLoading(true);
    getProducts(filters)
      .then(setProducts)
      .catch(() => setError("Error al cargar productos"))
      .finally(() => setLoading(false));
  }, [searchParams]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-card bg-surface p-4">
            <div className="aspect-square rounded-lg bg-border" />
            <div className="mt-3 h-4 w-3/4 rounded bg-border" />
            <div className="mt-2 h-4 w-1/2 rounded bg-border" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <p className="text-lg text-muted">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-accent px-6 py-2 text-sm font-semibold text-fg"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <p className="text-lg font-semibold">No encontramos productos</p>
        <p className="text-sm text-muted">Probá con otros filtros o volvé más tarde.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 font-heading text-3xl font-bold">Productos</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
