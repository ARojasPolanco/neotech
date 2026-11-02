import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import DiscountCodeBox from "../components/DiscountCodeBox.jsx";
import { useCart } from "../context/CartContext.jsx";
import api from "../config/api.js";

export default function CheckoutPage() {
  const {
    items,
    totalPrice,
    clearCart,
    appliedCode,
    clearAppliedCode,
    discountAmount,
    finalTotal,
  } = useCart();
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

    const paymentWindow = window.open("", "_blank");

    try {
      const payload = {
        ...form,
        discountCode: appliedCode?.code || null,
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
      sessionStorage.removeItem("lastOrderNumber");
      sessionStorage.removeItem("lastPreferenceId");
      sessionStorage.setItem("lastOrderNumber", res.data.orderNumber);
      sessionStorage.setItem("lastPreferenceId", res.data.preferenceId || "");
      clearCart();

      if (paymentWindow) {
        paymentWindow.location.href = res.data.initPoint;
      } else {
        window.location.href = res.data.initPoint;
      }
      navigate("/payment-result");
    } catch (err) {
      paymentWindow?.close();
      const message =
        err.response?.data?.message || "Error al procesar el pago";
      setError(message);

      if (String(message).toLowerCase().includes("código")) {
        clearAppliedCode();
      }
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <p className="text-lg font-semibold">Tu carrito está vacío</p>
        <Link
          to="/products"
          className="rounded-lg bg-accent px-6 py-2 text-sm font-semibold text-accent-fg"
        >
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
          <p className="mb-4 rounded-lg bg-error/10 px-4 py-2 text-sm text-error">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Nombre completo"
            value={form.customerName}
            onChange={update("customerName")}
            required
            className="w-full rounded-input border border-border bg-card px-4 py-3 text-sm outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent"
          />
          <input
            type="email"
            placeholder="Email"
            value={form.customerEmail}
            onChange={update("customerEmail")}
            required
            className="w-full rounded-input border border-border bg-card px-4 py-3 text-sm outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent"
          />
          <input
            type="tel"
            placeholder="Teléfono"
            value={form.customerPhone}
            onChange={update("customerPhone")}
            required
            className="w-full rounded-input border border-border bg-card px-4 py-3 text-sm outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer rounded-lg bg-accent py-3 text-sm font-semibold text-accent-fg transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Procesando..."
              : `Pagar $${finalTotal.toLocaleString("es-AR")} con Mercado Pago`}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-muted">
          Tus datos están seguros. El pago se procesa a través de Mercado Pago.
        </p>
      </div>

      <div className="md:col-span-2">
        <h2 className="mb-4 font-heading text-xl font-bold">Resumen</h2>
        <div className="flex flex-col gap-3 rounded-card border border-border bg-card p-4">
          {items.map((item) => (
            <div key={item.key} className="flex justify-between text-sm">
              <span>
                {item.name}
                {item.color ? ` (${item.color})` : ""} x{item.quantity}
                {item.discountActive && (
                  <span className="ml-2 rounded-full bg-accent px-1.5 py-0.5 text-[9px] font-bold text-accent-fg">
                    {item.discountPercent}% OFF
                  </span>
                )}
              </span>
              <span className="font-medium">
                ${(Number(item.price) * item.quantity).toLocaleString("es-AR")}
              </span>
            </div>
          ))}

          <DiscountCodeBox className="border-t border-border pt-3" />

          <div className="border-t border-border pt-3">
            <div className="flex items-center justify-between text-sm text-muted">
              <span>Subtotal</span>
              <span>${totalPrice.toLocaleString("es-AR")}</span>
            </div>
            {appliedCode && (
              <div className="flex items-center justify-between text-sm text-success">
                <span>Descuento ({appliedCode.discountPercent}%)</span>
                <span>{`-$${discountAmount.toLocaleString("es-AR")}`}</span>
              </div>
            )}
            <div className="mt-2 flex items-center justify-between text-lg font-bold">
              <span>Total</span>
              <span>${finalTotal.toLocaleString("es-AR")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
