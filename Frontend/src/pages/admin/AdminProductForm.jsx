import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../config/api.js";

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    imageUrl: "",
    isActive: true,
  });
  const [variants, setVariants] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState("");
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [variantForm, setVariantForm] = useState({
    color: "",
    colorHex: "#000000",
    stock: "0",
    imageUrl: "",
  });
  const [variantImageFile, setVariantImageFile] = useState(null);
  const [variantImagePreview, setVariantImagePreview] = useState("");

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    Promise.all([
      api.get(`/products/${id}`),
      api.get(`/products/${id}/variants`),
    ])
      .then(([prodRes, varRes]) => {
        const p = prodRes.data;
        setForm({
          name: p.name,
          description: p.description || "",
          price: String(p.price),
          imageUrl: p.imageUrl || "",
          isActive: p.isActive,
        });
        if (p.imageUrl) setImagePreview(p.imageUrl);
        setVariants(varRes.data);
      })
      .catch(() => setError("Error al cargar producto"))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const update = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    const res = await api.post("/admin/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.url;
  };

  const handleVariantImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVariantImageFile(file);
    setVariantImagePreview(URL.createObjectURL(file));
  };

  const handleSaveVariant = async () => {
    let imageUrl = variantForm.imageUrl;
    if (variantImageFile) {
      imageUrl = await uploadImage(variantImageFile);
    }

    const payload = {
      color: variantForm.color,
      colorHex: variantForm.colorHex,
      stock: Number(variantForm.stock),
      imageUrl,
    };

    if (editingVariant) {
      if (isEdit) {
        const res = await api.patch(`/products/variants/${editingVariant.id}`, payload);
        setVariants((prev) =>
          prev.map((v) => (v.id === editingVariant.id ? res.data : v)),
        );
      } else {
        setVariants((prev) =>
          prev.map((v) =>
            v.id === editingVariant.id ? { ...v, ...payload } : v,
          ),
        );
      }
    } else {
      if (isEdit) {
        const res = await api.post(`/products/${id}/variants`, payload);
        setVariants((prev) => [...prev, res.data]);
      } else {
        setVariants((prev) => [
          ...prev,
          { ...payload, id: `temp-${Date.now()}` },
        ]);
      }
    }

    setShowVariantForm(false);
    setEditingVariant(null);
    setVariantForm({ color: "", colorHex: "#000000", stock: "0", imageUrl: "" });
    setVariantImageFile(null);
    setVariantImagePreview("");
  };

  const handleDeleteVariant = async (variant) => {
    if (isEdit && !String(variant.id).startsWith("temp-")) {
      await api.delete(`/products/variants/${variant.id}`);
    }
    setVariants((prev) => prev.filter((v) => v.id !== variant.id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setUploading(true);

    try {
      let imageUrl = form.imageUrl;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        imageUrl,
        isActive: form.isActive,
      };

      let productId;
      if (isEdit) {
        await api.patch(`/products/${id}`, payload);
        productId = id;
      } else {
        const res = await api.post("/products", payload);
        productId = res.data.id;

        for (const v of variants) {
          await api.post(`/products/${productId}/variants`, {
            color: v.color,
            colorHex: v.colorHex,
            stock: Number(v.stock),
            imageUrl: v.imageUrl,
          });
        }
      }

      navigate("/admin/products");
    } catch (err) {
      setError(err.response?.data?.message || "Error al guardar producto");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl animate-pulse space-y-4">
        <div className="h-8 w-48 rounded bg-surface" />
        <div className="h-10 w-full rounded bg-surface" />
        <div className="h-10 w-full rounded bg-surface" />
        <div className="h-10 w-full rounded bg-surface" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <Link
          to="/admin/products"
          className="text-sm text-muted transition-colors hover:text-fg"
        >
          &larr; Volver
        </Link>
        <h1 className="font-heading text-2xl font-bold">
          {isEdit ? "Editar producto" : "Nuevo producto"}
        </h1>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-error/10 px-4 py-2 text-sm text-error">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="mb-1 block text-sm font-medium">Nombre</label>
          <input
            type="text"
            value={form.name}
            onChange={update("name")}
            required
            className="w-full rounded-input border border-border bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Descripción</label>
          <textarea
            value={form.description}
            onChange={update("description")}
            rows={3}
            className="w-full rounded-input border border-border bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Precio (ARS)</label>
            <input
              type="number"
              value={form.price}
              onChange={update("price")}
              required
              min="0"
              step="0.01"
              className="w-full rounded-input border border-border bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={update("isActive")}
              />
              <span className="text-sm">Producto activo</span>
            </label>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Imagen principal</label>
          <div className="flex items-start gap-4">
            <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-surface">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-muted">
                  Sin imagen
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="text-sm"
            />
          </div>
        </div>

        <div className="border-t border-border pt-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold">Variantes</h2>
            <button
              type="button"
              onClick={() => {
                setEditingVariant(null);
                setVariantForm({
                  color: "",
                  colorHex: "#000000",
                  stock: "0",
                  imageUrl: "",
                });
                setVariantImageFile(null);
                setVariantImagePreview("");
                setShowVariantForm(true);
              }}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-surface"
            >
              Agregar variante
            </button>
          </div>

          {variants.length > 0 && (
            <div className="mb-4 space-y-2">
              {variants.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-white p-3"
                >
                  <div
                    className="h-8 w-8 flex-shrink-0 rounded-full border border-border"
                    style={{ backgroundColor: v.colorHex }}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{v.color}</p>
                    <p className="text-xs text-muted">Stock: {v.stock}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingVariant(v);
                      setVariantForm({
                        color: v.color,
                        colorHex: v.colorHex,
                        stock: String(v.stock),
                        imageUrl: v.imageUrl || "",
                      });
                      setVariantImagePreview(v.imageUrl || "");
                      setShowVariantForm(true);
                    }}
                    className="rounded-lg border border-border px-2 py-1 text-xs transition-colors hover:bg-surface"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteVariant(v)}
                    className="rounded-lg border border-error/30 px-2 py-1 text-xs text-error transition-colors hover:bg-error/10"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}

          <AnimatePresence>
            {showVariantForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="rounded-card border border-accent/30 bg-accent/5 p-4">
                  <h3 className="mb-3 text-sm font-semibold">
                    {editingVariant ? "Editar variante" : "Nueva variante"}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium">
                        Color
                      </label>
                      <input
                        type="text"
                        value={variantForm.color}
                        onChange={(e) =>
                          setVariantForm((p) => ({
                            ...p,
                            color: e.target.value,
                          }))
                        }
                        placeholder="Ej: Negro"
                        className="w-full rounded-input border border-border bg-white px-3 py-2 text-sm outline-none focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium">
                        Hex
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={variantForm.colorHex}
                          onChange={(e) =>
                            setVariantForm((p) => ({
                              ...p,
                              colorHex: e.target.value,
                            }))
                          }
                          className="h-9 w-9 cursor-pointer rounded border border-border"
                        />
                        <input
                          type="text"
                          value={variantForm.colorHex}
                          onChange={(e) =>
                            setVariantForm((p) => ({
                              ...p,
                              colorHex: e.target.value,
                            }))
                          }
                          className="w-full rounded-input border border-border bg-white px-3 py-2 text-sm outline-none focus:border-accent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium">
                        Stock
                      </label>
                      <input
                        type="number"
                        value={variantForm.stock}
                        onChange={(e) =>
                          setVariantForm((p) => ({
                            ...p,
                            stock: e.target.value,
                          }))
                        }
                        min="0"
                        className="w-full rounded-input border border-border bg-white px-3 py-2 text-sm outline-none focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium">
                        Imagen
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded border border-border bg-surface">
                          {variantImagePreview ? (
                            <img
                              src={variantImagePreview}
                              alt="Preview"
                              className="h-full w-full object-cover"
                            />
                          ) : null}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleVariantImageChange}
                          className="text-xs"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={handleSaveVariant}
                      className="rounded-lg bg-accent px-4 py-1.5 text-xs font-semibold text-fg transition-colors hover:bg-accent-dark"
                    >
                      {editingVariant ? "Guardar" : "Agregar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowVariantForm(false);
                        setEditingVariant(null);
                      }}
                      className="rounded-lg border border-border px-4 py-1.5 text-xs font-medium transition-colors hover:bg-surface"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="w-full cursor-pointer rounded-lg bg-accent py-3 text-sm font-semibold text-fg transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading
            ? "Guardando..."
            : isEdit
              ? "Guardar cambios"
              : "Crear producto"}
        </button>
      </form>
    </div>
  );
}
