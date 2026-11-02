import { useState, useEffect, useMemo } from "react";
import { Check, Copy, Megaphone, Search, Ticket } from "lucide-react";
import api from "../../config/api.js";
import ProductImage from "../../components/ProductImage.jsx";

function formatDate(value) {
  if (!value) return "sin vencimiento";
  return new Date(value).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getCodeStatus(code) {
  if (!code.isActive) {
    return { label: "Inactivo", className: "bg-surface text-muted" };
  }
  if (new Date(code.expiresAt) <= new Date()) {
    return { label: "Vencido", className: "bg-error/15 text-error" };
  }
  if (Number(code.uses) >= Number(code.maxUses)) {
    return { label: "Agotado", className: "bg-warning/15 text-warning" };
  }
  return { label: "Activo", className: "bg-success/15 text-success" };
}

function getCampaignStatus(campaign) {
  if (!campaign.isActive) {
    return { label: "Finalizada", className: "bg-surface text-muted" };
  }
  if (campaign.expiresAt && new Date(campaign.expiresAt) <= new Date()) {
    return { label: "Vencida", className: "bg-error/15 text-error" };
  }
  return { label: "Activa", className: "bg-success/15 text-success" };
}

export default function AdminDiscounts() {
  const [tab, setTab] = useState("codes");
  const [codes, setCodes] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState("");

  const [codeForm, setCodeForm] = useState({
    discountPercent: "10",
    maxUses: "1",
    expiresInHours: "24",
  });
  const [creatingCode, setCreatingCode] = useState(false);

  const [campaignForm, setCampaignForm] = useState({
    name: "",
    discountPercent: "10",
    expiresAt: "",
  });
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [creatingCampaign, setCreatingCampaign] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    setError("");

    try {
      const [codesRes, campaignsRes, productsRes] = await Promise.all([
        api.get("/admin/discount-codes"),
        api.get("/admin/discount-campaigns"),
        api.get("/products", { params: { isActive: "true" } }),
      ]);

      setCodes(codesRes.data);
      setCampaigns(campaignsRes.data);
      setProducts(productsRes.data);
    } catch {
      setError("Error al cargar los descuentos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const filteredProducts = useMemo(() => {
    const term = productSearch.trim().toLowerCase();
    if (!term) return products;
    return products.filter((product) =>
      product.name.toLowerCase().includes(term),
    );
  }, [products, productSearch]);

  const handleCreateCode = async (e) => {
    e.preventDefault();
    setCreatingCode(true);
    setError("");
    setNotice("");

    try {
      const res = await api.post("/admin/discount-codes", {
        discountPercent: Number(codeForm.discountPercent),
        maxUses: Number(codeForm.maxUses),
        expiresInHours: Number(codeForm.expiresInHours),
      });

      setCodes((prev) => [res.data, ...prev]);
      setNotice(`Código generado: ${res.data.code}`);
    } catch (err) {
      setError(
        err.response?.data?.message || "Error al generar el código",
      );
    } finally {
      setCreatingCode(false);
    }
  };

  const handleToggleCode = async (code) => {
    setError("");

    try {
      const res = await api.patch(`/admin/discount-codes/${code.id}`, {
        isActive: !code.isActive,
      });
      setCodes((prev) =>
        prev.map((item) => (item.id === code.id ? res.data : item)),
      );
    } catch {
      setError("Error al actualizar el código");
    }
  };

  const handleCopy = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setError("No se pudo copiar el código");
    }
  };

  const toggleProduct = (id) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((productId) => productId !== id) : [...prev, id],
    );
  };

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");

    if (selectedProductIds.length === 0) {
      setError("Seleccioná al menos un producto");
      return;
    }

    const confirmed = window.confirm(
      "Esto reemplaza los descuentos individuales de los productos seleccionados. ¿Continuar?",
    );
    if (!confirmed) return;

    setCreatingCampaign(true);

    try {
      const res = await api.post("/admin/discount-campaigns", {
        name: campaignForm.name,
        discountPercent: Number(campaignForm.discountPercent),
        expiresAt: campaignForm.expiresAt
          ? new Date(campaignForm.expiresAt).toISOString()
          : null,
        productIds: selectedProductIds,
      });

      setCampaigns((prev) => [
        {
          ...res.data,
          productCount: selectedProductIds.length,
          productIds: selectedProductIds,
        },
        ...prev,
      ]);
      setCampaignForm({ name: "", discountPercent: "10", expiresAt: "" });
      setSelectedProductIds([]);
      setNotice("Campaña aplicada a los productos seleccionados");

      const productsRes = await api.get("/products", {
        params: { isActive: "true" },
      });
      setProducts(productsRes.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Error al crear la campaña",
      );
    } finally {
      setCreatingCampaign(false);
    }
  };

  const handleEndCampaign = async (campaign) => {
    const confirmed = window.confirm(
      `Finalizar la campaña "${campaign.name}" y quitar el descuento?`,
    );
    if (!confirmed) return;

    setError("");
    setNotice("");

    try {
      await api.post(`/admin/discount-campaigns/${campaign.id}/end`);
      setCampaigns((prev) =>
        prev.map((item) =>
          item.id === campaign.id ? { ...item, isActive: false } : item,
        ),
      );
      setNotice("Campaña finalizada");

      const productsRes = await api.get("/products", {
        params: { isActive: "true" },
      });
      setProducts(productsRes.data);
    } catch {
      setError("Error al finalizar la campaña");
    }
  };

  return (
    <div>
      <h1 className="mb-4 font-heading text-2xl font-bold">Descuentos</h1>

      <div className="mb-6 flex gap-1 rounded-card border border-border bg-card p-1">
        <button
          onClick={() => setTab("codes")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            tab === "codes"
              ? "bg-accent text-accent-fg"
              : "text-muted hover:bg-surface hover:text-fg"
          }`}
        >
          <Ticket size={16} />
          Códigos
        </button>
        <button
          onClick={() => setTab("campaigns")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            tab === "campaigns"
              ? "bg-accent text-accent-fg"
              : "text-muted hover:bg-surface hover:text-fg"
          }`}
        >
          <Megaphone size={16} />
          Campañas
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-error/10 px-4 py-2 text-sm text-error">
          {error}
        </p>
      )}

      {notice && (
        <p className="mb-4 rounded-lg bg-success/10 px-4 py-2 text-sm text-success">
          {notice}
        </p>
      )}

      {loading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-24 rounded-card bg-surface" />
          <div className="h-40 rounded-card bg-surface" />
        </div>
      ) : tab === "codes" ? (
        <div className="space-y-6">
          <form
            onSubmit={handleCreateCode}
            className="rounded-card border border-border bg-card p-5"
          >
            <h2 className="mb-4 text-lg font-semibold">Generar código</h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-medium">
                  Descuento (%)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={codeForm.discountPercent}
                  onChange={(e) =>
                    setCodeForm((prev) => ({
                      ...prev,
                      discountPercent: e.target.value,
                    }))
                  }
                  className="w-full rounded-input border border-border bg-card px-3 py-2 text-sm outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Usos</label>
                <select
                  value={codeForm.maxUses}
                  onChange={(e) =>
                    setCodeForm((prev) => ({
                      ...prev,
                      maxUses: e.target.value,
                    }))
                  }
                  className="w-full rounded-input border border-border bg-card px-3 py-2 text-sm outline-none focus:border-accent"
                >
                  <option value="1">1 uso</option>
                  <option value="10">10 usos</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">
                  Vencimiento
                </label>
                <select
                  value={codeForm.expiresInHours}
                  onChange={(e) =>
                    setCodeForm((prev) => ({
                      ...prev,
                      expiresInHours: e.target.value,
                    }))
                  }
                  className="w-full rounded-input border border-border bg-card px-3 py-2 text-sm outline-none focus:border-accent"
                >
                  <option value="24">24 horas</option>
                  <option value="48">48 horas</option>
                  <option value="72">72 horas</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={creatingCode}
              className="mt-4 rounded-lg bg-accent px-6 py-2 text-sm font-semibold text-accent-fg transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {creatingCode ? "Generando..." : "Generar código"}
            </button>
          </form>

          <div className="rounded-card border border-border bg-card p-5">
            <h2 className="mb-3 text-lg font-semibold">Códigos generados</h2>

            <div className="divide-y divide-border">
              {codes.map((code) => {
                const status = getCodeStatus(code);

                return (
                  <div
                    key={code.id}
                    className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold">
                          {code.code}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted">
                        {Number(code.discountPercent)}% OFF · {code.uses}/
                        {code.maxUses} usos · vence{" "}
                        {formatDate(code.expiresAt)}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopy(code.code)}
                        className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-surface"
                      >
                        {copied === code.code ? (
                          <Check size={14} />
                        ) : (
                          <Copy size={14} />
                        )}
                        {copied === code.code ? "Copiado" : "Copiar"}
                      </button>
                      <button
                        onClick={() => handleToggleCode(code)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                          code.isActive
                            ? "border border-error/30 text-error hover:bg-error/10"
                            : "border border-success/30 text-success hover:bg-success/10"
                        }`}
                      >
                        {code.isActive ? "Desactivar" : "Activar"}
                      </button>
                    </div>
                  </div>
                );
              })}

              {codes.length === 0 && (
                <p className="py-6 text-center text-sm text-muted">
                  Todavía no generaste códigos.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <form
            onSubmit={handleCreateCampaign}
            className="rounded-card border border-border bg-card p-5"
          >
            <h2 className="mb-4 text-lg font-semibold">Nueva campaña</h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-medium">
                  Nombre
                </label>
                <input
                  type="text"
                  value={campaignForm.name}
                  onChange={(e) =>
                    setCampaignForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Ej: Black Friday"
                  required
                  className="w-full rounded-input border border-border bg-card px-3 py-2 text-sm outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">
                  Descuento (%)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={campaignForm.discountPercent}
                  onChange={(e) =>
                    setCampaignForm((prev) => ({
                      ...prev,
                      discountPercent: e.target.value,
                    }))
                  }
                  className="w-full rounded-input border border-border bg-card px-3 py-2 text-sm outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">
                  Vencimiento (opcional)
                </label>
                <input
                  type="datetime-local"
                  value={campaignForm.expiresAt}
                  onChange={(e) =>
                    setCampaignForm((prev) => ({
                      ...prev,
                      expiresAt: e.target.value,
                    }))
                  }
                  className="w-full rounded-input border border-border bg-card px-3 py-2 text-sm outline-none focus:border-accent"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-1 block text-xs font-medium">
                Productos ({selectedProductIds.length} seleccionados)
              </label>

              <div className="relative mb-2">
                <Search
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  type="search"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Buscar producto..."
                  className="w-full rounded-input border border-border bg-card py-2 pl-9 pr-3 text-sm outline-none focus:border-accent"
                />
              </div>

              <div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
                {filteredProducts.map((product) => (
                  <label
                    key={product.id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-surface"
                  >
                    <input
                      type="checkbox"
                      checked={selectedProductIds.includes(product.id)}
                      onChange={() => toggleProduct(product.id)}
                    />
                    <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-lg bg-surface">
                      <ProductImage
                        src={product.imageUrl || null}
                        alt={product.name}
                        className="h-full w-full"
                        imgClassName="h-full w-full object-cover"
                        logoClassName="h-6 w-6"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">{product.name}</p>
                      {product.discountActive && (
                        <p className="text-[10px] font-medium text-accent-dark">
                          {Number(product.discountPercent)}% OFF actual
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-muted">
                      ${Number(product.price).toLocaleString("es-AR")}
                    </span>
                  </label>
                ))}

                {filteredProducts.length === 0 && (
                  <p className="py-4 text-center text-xs text-muted">
                    No hay productos con ese nombre.
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={creatingCampaign}
              className="mt-4 rounded-lg bg-accent px-6 py-2 text-sm font-semibold text-accent-fg transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {creatingCampaign ? "Aplicando..." : "Aplicar campaña"}
            </button>
          </form>

          <div className="rounded-card border border-border bg-card p-5">
            <h2 className="mb-3 text-lg font-semibold">Campañas</h2>

            <div className="divide-y divide-border">
              {campaigns.map((campaign) => {
                const status = getCampaignStatus(campaign);

                return (
                  <div
                    key={campaign.id}
                    className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{campaign.name}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted">
                        {Number(campaign.discountPercent)}% OFF ·{" "}
                        {campaign.productCount ?? campaign.productIds?.length ?? 0}{" "}
                        productos · vence {formatDate(campaign.expiresAt)}
                      </p>
                    </div>

                    {campaign.isActive && (
                      <button
                        onClick={() => handleEndCampaign(campaign)}
                        className="rounded-lg border border-error/30 px-3 py-1.5 text-xs font-medium text-error transition-colors hover:bg-error/10"
                      >
                        Finalizar campaña
                      </button>
                    )}
                  </div>
                );
              })}

              {campaigns.length === 0 && (
                <p className="py-6 text-center text-sm text-muted">
                  Todavía no creaste campañas.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
