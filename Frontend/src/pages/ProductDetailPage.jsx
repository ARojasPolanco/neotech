import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import ColorSelector from "../components/ColorSelector.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { getProduct, getProductVariants } from "../services/product.service.js";

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getProduct(id), getProductVariants(id)])
      .then(([prod, varts]) => {
        setProduct(prod);
        setVariants(varts);
        if (varts.length > 0) setSelected(varts[0]);
      })
      .catch(() => setError("Error al cargar el producto"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAdd = () => {
    addItem(product, selected, 1);
    showToast(`${product.name} agregado al carrito`, {
      actionLabel: "Ver carrito",
      actionHref: "/cart",
      duration: 3000,
    });
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl animate-pulse">
        <div className="aspect-square rounded-card bg-surface md:max-w-md" />
        <div className="mt-4 h-6 w-3/4 rounded bg-surface" />
        <div className="mt-2 h-4 w-1/2 rounded bg-surface" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <p className="text-lg text-muted">{error || "Producto no encontrado"}</p>
        <Link to="/products" className="rounded-lg bg-accent px-6 py-2 text-sm font-semibold text-fg">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  const displayImg = selected?.imageUrl || product.imageUrl || "https://placehold.co/600x600/e0e0e0/666?text=Neo+Tech";
  const stock = selected ? selected.stock : null;

  return (
    <div className="mx-auto max-w-4xl">
      <Link to="/products" className="mb-4 inline-block text-sm text-muted hover:text-fg">
        &larr; Volver
      </Link>

      <div className="flex flex-col gap-8 md:flex-row">
        <div className="aspect-square overflow-hidden rounded-card bg-surface md:w-1/2">
          <img src={displayImg} alt={product.name} className="h-full w-full object-cover" />
        </div>

        <div className="flex flex-1 flex-col gap-5">
          <h1 className="font-heading text-3xl font-bold">{product.name}</h1>
          {product.description && (
            <p className="text-muted">{product.description}</p>
          )}
          <p className="text-3xl font-bold">
            ${Number(product.price).toLocaleString("es-AR")}
          </p>

          {stock !== null && (
            <p className={`text-sm ${stock > 0 ? "text-success" : "text-error"}`}>
              {stock > 0 ? `Stock: ${stock} unidades` : "Sin stock"}
            </p>
          )}

          <ColorSelector variants={variants} selected={selected} onSelect={setSelected} />

          <button
            onClick={handleAdd}
            disabled={stock !== null && stock <= 0}
            className="w-full cursor-pointer rounded-lg bg-accent py-3 text-sm font-semibold text-fg transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  );
}
