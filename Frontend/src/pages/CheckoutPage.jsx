import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import api from "../config/api.js";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        ...form,
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          productName: i.name,
          color: i.color,
          unitPrice: i.price,
          quantity: i.quantity,
        })),
      };

      const res = await api.post("/payments/create-preference", payload);
      sessionStorage.setItem("lastOrderNumber", res.data.orderNumber);
      clearCart();
      window.location.href = res.data.initPoint;
    } catch (err) {
      setError(err.response?.data?.message || "Error al procesar el pago");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <p className="text-lg font-semibold">Tu carrito está vacío</p>
        <Link to="/products" className="rounded-lg bg-accent px-6 py-2 text-sm font-semibold text-fg">
          Ver productos
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-5">
      <div className="md:col-span-3">
        <h1 className="mb-6 font-heading text-3xl font-bold">Checkout</h1>

        {error && (
          <p className="mb-4 rounded-lg bg-error/10 px-4 py-2 text-sm text-error">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text" placeholder="Nombre completo" value={form.customerName}
            onChange={update("customerName")} required
            className="w-full rounded-input border border-border bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent"
          />
          <input
            type="email" placeholder="Email" value={form.customerEmail}
            onChange={update("customerEmail")} required
            className="w-full rounded-input border border-border bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent"
          />
          <input
            type="tel" placeholder="Teléfono" value={form.customerPhone}
            onChange={update("customerPhone")} required
            className="w-full rounded-input border border-border bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer rounded-lg bg-accent py-3 text-sm font-semibold text-fg transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Procesando..." : "Pagar con Mercado Pago"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-muted">
          Tus datos están seguros. El pago se procesa a través de Mercado Pago.
        </p>
      </div>

      <div className="md:col-span-2">
        <h2 className="mb-4 font-heading text-xl font-bold">Resumen</h2>
        <div className="flex flex-col gap-3 rounded-card border border-border bg-white p-4">
          {items.map((item) => (
            <div key={item.key} className="flex justify-between text-sm">
              <span>
                {item.name}{item.color ? ` (${item.color})` : ""} x{item.quantity}
              </span>
              <span className="font-medium">
                ${(Number(item.price) * item.quantity).toLocaleString("es-AR")}
              </span>
            </div>
          ))}
          <div className="border-t border-border pt-3 text-lg font-bold">
            Total: ${totalPrice.toLocaleString("es-AR")}
          </div>
        </div>
      </div>
    </div>
  );
}
