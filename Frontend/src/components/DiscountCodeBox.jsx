import { useId, useState } from "react";
import api from "../config/api.js";
import { useCart } from "../context/CartContext.jsx";

export default function DiscountCodeBox({ className = "" }) {
  const { appliedCode, setAppliedCode, clearAppliedCode } = useCart();
  const inputId = useId();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    const normalized = code.trim().toUpperCase();
    if (!normalized) return;

    setLoading(true);
    setError("");

    try {
      const res = await api.post("/discount-codes/validate", {
        code: normalized,
      });
      setAppliedCode(res.data);
      setCode(res.data.code);
    } catch (err) {
      setError(
        err.response?.data?.message || "No pudimos validar el código",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      <label
        htmlFor={inputId}
        className="mb-1 block text-xs font-medium text-muted"
      >
        Código de descuento
      </label>

      {appliedCode ? (
        <div className="flex items-center justify-between rounded-lg bg-success/10 px-3 py-2">
          <span className="text-sm font-semibold text-success">
            {appliedCode.code} · -{appliedCode.discountPercent}%
          </span>
          <button
            type="button"
            onClick={clearAppliedCode}
            className="cursor-pointer text-xs text-muted transition-colors hover:text-error"
          >
            Quitar
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            id={inputId}
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="NEO-XXXXXX"
            className="w-full rounded-input border border-border bg-card px-3 py-2 text-sm uppercase outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent"
          />
          <button
            type="button"
            onClick={handleApply}
            disabled={loading || !code.trim()}
            className="shrink-0 cursor-pointer rounded-lg border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "..." : "Aplicar"}
          </button>
        </div>
      )}

      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  );
}
