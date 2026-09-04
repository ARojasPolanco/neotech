import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard.jsx";
import { getProducts } from "../services/product.service.js";

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const category = searchParams.get("category");
  const subcategory = searchParams.get("subcategory");

  useEffect(() => {
    const filters = { isActive: "true", includeVariants: "true" };
    const search = searchParams.get("search");
    if (search) filters.search = search;
    if (category) filters.category = category;
    if (subcategory) filters.subcategory = subcategory;

    setLoading(true);
    getProducts(filters)
      .then((data) => {
        setProducts(data);
        if (category === "Fundas" && !subcategory) {
          const subs = [...new Set(data.map((p) => p.subcategory).filter(Boolean))];
          setSubcategories(subs);
        } else {
          setSubcategories([]);
        }
      })
      .catch(() => setError("Error al cargar productos"))
      .finally(() => setLoading(false));
  }, [searchParams, category, subcategory]);

  const categoryTitle = category;

  const handleSubcategoryClick = (sub) => {
    const params = new URLSearchParams(searchParams);
    if (sub === subcategory) {
      params.delete("subcategory");
    } else {
      params.set("subcategory", sub);
    }
    setSearchParams(params);
  };

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
      <h1 className="mb-6 font-heading text-3xl font-bold">
        {categoryTitle || "Productos"}
      </h1>

      {subcategories.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {subcategories.map((sub) => (
            <button
              key={sub}
              onClick={() => handleSubcategoryClick(sub)}
              className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                subcategory === sub
                  ? "bg-accent text-fg"
                  : "border border-border bg-white text-muted hover:bg-surface"
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
