import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";
import api from "../../config/api.js";
import ConfirmModal from "../../components/ConfirmModal.jsx";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadProducts = () => {
    setLoading(true);
    api
      .get("/products")
      .then((res) => setProducts(res.data))
      .catch(() => setError("Error al cargar productos"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const toggleActive = async (product) => {
    try {
      await api.patch(`/products/${product.id}`, {
        isActive: !product.isActive,
      });
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, isActive: !p.isActive } : p,
        ),
      );
    } catch {
      setError("Error al actualizar producto");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/products/${deleteTarget.id}/permanent`);
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      const msg = err.response?.data?.message || "Error al eliminar producto";
      setError(msg);
      setDeleteTarget(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-card border border-border bg-white p-4"
          >
            <div className="h-5 w-48 rounded bg-surface" />
            <div className="mt-2 h-4 w-24 rounded bg-surface" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Productos</h1>
        <Link
          to="/admin/products/new"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-fg transition-colors hover:bg-accent-dark"
        >
          Nuevo producto
        </Link>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-error/10 px-4 py-2 text-sm text-error">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-card border border-border bg-white">
        <div className="hidden grid-cols-12 gap-4 border-b border-border bg-surface px-4 py-3 text-xs font-semibold text-muted md:grid">
          <div className="col-span-4">Nombre</div>
          <div className="col-span-2">Precio</div>
          <div className="col-span-2">Estado</div>
          <div className="col-span-4 text-right">Acciones</div>
        </div>

        <AnimatePresence>
          {products.map((product) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 items-center gap-2 border-b border-border px-4 py-3 last:border-0 md:grid-cols-12 md:gap-4"
            >
              <div className="md:col-span-4">
                <p className="font-medium">{product.name}</p>
                {product.description && (
                  <p className="line-clamp-1 text-xs text-muted">
                    {product.description}
                  </p>
                )}
              </div>
              <div className="md:col-span-2">
                <p className="text-sm font-semibold">
                  ${Number(product.price).toLocaleString("es-AR")}
                </p>
              </div>
              <div className="md:col-span-2">
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                    product.isActive
                      ? "bg-success/20 text-success"
                      : "bg-error/20 text-error"
                  }`}
                >
                  {product.isActive ? "Activo" : "Inactivo"}
                </span>
              </div>
              <div className="flex gap-2 md:col-span-4 md:justify-end">
                <Link
                  to={`/admin/products/${product.id}/edit`}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-surface"
                >
                  Editar
                </Link>
                <button
                  onClick={() => toggleActive(product)}
                  className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    product.isActive
                      ? "border border-error/30 text-error hover:bg-error/10"
                      : "border border-success/30 text-success hover:bg-success/10"
                  }`}
                >
                  {product.isActive ? "Desactivar" : "Activar"}
                </button>
                <button
                  onClick={() => setDeleteTarget(product)}
                  className="cursor-pointer rounded-lg border border-error/30 px-2 py-1.5 text-xs text-error transition-colors hover:bg-error/10"
                  title="Eliminar permanentemente"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {products.length === 0 && (
          <p className="py-8 text-center text-sm text-muted">
            No hay productos todavía.
          </p>
        )}
      </div>

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Eliminar producto"
        message={`¿Estás seguro de eliminar "${deleteTarget?.name}"? Esta acción es permanente y no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
