import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Star, X } from "lucide-react";
import api from "../../config/api.js";

export default function AdminFeatured() {
  const [current, setCurrent] = useState(null);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    discountPercent: "",
    discountExpiresAt: "",
    subcategory: "",
  });

  const [selectedProduct, setSelectedProduct] = useState(null);

  const loadCurrent = useCallback(async () => {
    try {
      const res = await api.get("/products/featured-highlight");
      if (res.data && !res.data.empty) {
        setCurrent(res.data);
      } else {
        setCurrent(null);
      }
    } catch {
      setCurrent(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCurrent();
  }, [loadCurrent]);

  useEffect(() => {
    if (search.length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.get("/products", {
          params: { search, isActive: "true" },
        });
        setResults(res.data.slice(0, 10));
      } catch {
        setResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSelect = (product) => {
    setSelectedProduct(product);
    setSearch("");
    setResults([]);
    setForm({
      discountPercent: product.discountPercent ? String(product.discountPercent) : "",
      discountExpiresAt: product.discountExpiresAt
        ? new Date(product.discountExpiresAt).toISOString().slice(0, 16)
        : "",
      subcategory: product.subcategory || "",
    });
  };

  const handleSave = async () => {
    if (!selectedProduct) return;
    setSaving(true);
    setError("");

    try {
      const payload = { isFeatured: true };

      if (form.discountPercent) {
        payload.discountPercent = Number(form.discountPercent);
      } else {
        payload.discountPercent = null;
      }

      if (form.discountExpiresAt) {
        payload.discountExpiresAt = new Date(form.discountExpiresAt).toISOString();
      } else {
        payload.discountExpiresAt = null;
      }

      if (form.subcategory) {
        payload.subcategory = form.subcategory;
      }

      await api.patch(`/products/${selectedProduct.id}/featured`, payload);
      await loadCurrent();
      setSelectedProduct(null);
      setForm({ discountPercent: "", discountExpiresAt: "", subcategory: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    if (!current) return;
    setSaving(true);
    setError("");

    try {
      await api.patch(`/products/${current.id}/featured`, {
        isFeatured: false,
        discountPercent: null,
        discountExpiresAt: null,
      });
      setCurrent(null);
    } catch (err) {
      setError(err.response?.data?.message || "Error al quitar destacado");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 rounded bg-surface" />
        <div className="h-32 rounded-card bg-surface" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl font-bold">Producto Destacado</h1>

      {error && (
        <p className="mb-4 rounded-lg bg-error/10 px-4 py-2 text-sm text-error">
          {error}
        </p>
      )}

      {current && !selectedProduct && (
        <div className="mb-6 rounded-card border border-border bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Star size={18} className="text-accent" />
              Destacado actual
            </h2>
            <button
              onClick={handleRemove}
              disabled={saving}
              className="flex items-center gap-1 rounded-lg border border-error/30 px-3 py-1.5 text-xs text-error transition-colors hover:bg-error/10 disabled:opacity-50"
            >
              <X size={14} />
              Quitar destacado
            </button>
          </div>

          <div className="flex items-center gap-4">
            {current.imageUrl && (
              <img
                src={current.imageUrl}
                alt={current.name}
                className="h-20 w-20 rounded-lg object-cover"
              />
            )}
            <div>
              <p className="font-medium">{current.name}</p>
              <p className="text-sm text-muted">
                Precio: ${Number(current.price).toLocaleString("es-AR")}
              </p>
              {current.discountActive && (
                <p className="text-sm font-semibold text-accent-dark">
                  {Number(current.discountPercent)}% OFF → ${Number(current.discountedPrice).toLocaleString("es-AR")}
                </p>
              )}
              {current.discountExpiresAt && (
                <p className="text-xs text-muted">
                  Expira: {new Date(current.discountExpiresAt).toLocaleDateString("es-AR")}
                </p>
              )}
              {current.subcategory && (
                <p className="text-xs text-muted">Subcategoría: {current.subcategory}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="rounded-card border border-border bg-white p-5">
        <h2 className="mb-4 text-lg font-semibold">
          {current ? "Cambiar producto destacado" : "Seleccionar producto destacado"}
        </h2>

        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar producto por nombre..."
            className="w-full rounded-input border border-border bg-white py-3 pl-10 pr-4 text-sm outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </div>

        <AnimatePresence>
          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 overflow-hidden"
            >
              <div className="max-h-60 space-y-1 overflow-y-auto">
                {results.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelect(p)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-surface"
                  >
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="h-10 w-10 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded bg-surface text-xs text-muted">
                        Sin img
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-muted">
                        ${Number(p.price).toLocaleString("es-AR")}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-card border border-accent/30 bg-accent/5 p-4"
          >
            <div className="mb-4 flex items-center gap-3">
              {selectedProduct.imageUrl && (
                <img
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.name}
                  className="h-14 w-14 rounded-lg object-cover"
                />
              )}
              <div>
                <p className="font-medium">{selectedProduct.name}</p>
                <p className="text-sm text-muted">
                  ${Number(selectedProduct.price).toLocaleString("es-AR")}
                </p>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="ml-auto text-muted hover:text-fg"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-medium">
                  Descuento (%)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={form.discountPercent}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, discountPercent: e.target.value }))
                  }
                  placeholder="Ej: 20"
                  className="w-full rounded-input border border-border bg-white px-3 py-2 text-sm outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">
                  Vencimiento descuento
                </label>
                <input
                  type="datetime-local"
                  value={form.discountExpiresAt}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, discountExpiresAt: e.target.value }))
                  }
                  className="w-full rounded-input border border-border bg-white px-3 py-2 text-sm outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">
                  Subcategoría
                </label>
                <input
                  type="text"
                  value={form.subcategory}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, subcategory: e.target.value }))
                  }
                  placeholder="Ej: iPhone 13"
                  className="w-full rounded-input border border-border bg-white px-3 py-2 text-sm outline-none focus:border-accent"
                />
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-accent px-6 py-2 text-sm font-semibold text-fg transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Guardar como destacado"}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
