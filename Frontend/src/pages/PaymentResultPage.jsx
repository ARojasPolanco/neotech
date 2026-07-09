import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../config/api.js";

export default function PaymentResultPage() {
  const [status, setStatus] = useState("checking");
  const [order, setOrder] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [whatsappNumber, setWhatsappNumber] = useState("");

  useEffect(() => {
    api.get("/config/whatsapp").then((res) => {
      setWhatsappNumber(res.data.number);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const orderNumber = sessionStorage.getItem("lastOrderNumber");
    if (!orderNumber) {
      setStatus("no-order");
      return;
    }

    let cancelled = false;
    let timer;

    async function poll() {
      if (cancelled) return;
      try {
        const res = await api.get(`/payments/verify/${orderNumber}`);
        if (res.data.status === "paid" && !cancelled) {
          const orderRes = await api.get(`/orders/number/${orderNumber}`);
          setOrder(orderRes.data);
          setStatus("found");
          sessionStorage.removeItem("lastOrderNumber");
          return;
        }
      } catch {
        // keep polling
      }

      setAttempts((prev) => prev + 1);

      if (!cancelled) {
        timer = setTimeout(poll, 3000);
      }
    }

    poll();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  if (status === "no-order") {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <p className="text-lg text-muted">No hay una compra reciente para mostrar.</p>
        <Link
          to="/products"
          className="rounded-lg bg-accent px-6 py-2 text-sm font-semibold text-fg"
        >
          Ver productos
        </Link>
      </div>
    );
  }

  if (status === "checking") {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        <p className="text-lg font-semibold">Verificando tu pago...</p>
        <p className="text-sm text-muted">
          Esto puede tomar unos segundos. No cierres esta ventana.
        </p>
        {attempts > 3 && (
          <p className="mt-2 max-w-sm text-xs text-muted">
            Si Mercado Pago ya aprobó tu pago pero no ves la confirmación,
            probá refrescar la página.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <div className="mb-6 text-5xl">✅</div>
      <h1 className="mb-2 font-heading text-3xl font-bold">
        ¡Pedido confirmado!
      </h1>
      <p className="text-lg font-semibold text-accent-dark">{order.orderNumber}</p>
      <p className="mt-4 text-sm text-muted">
        Te enviamos el recibo a <strong>{order.customerEmail}</strong>.
      </p>
      <p className="mt-1 text-sm text-muted">
        Si creás una cuenta, podés seguir tu pedido y recibir ofertas exclusivas.
      </p>

      <div className="mt-8 flex flex-col items-center gap-3">
        <a
          href={`https://wa.me/${whatsappNumber}?text=Hola,%20quiero%20informar%20mi%20compra.%20N%C3%BAmero%20de%20pedido:%20${order.orderNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg bg-[#25D366] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1ebe57]"
        >
          💬 Informar mi compra por WhatsApp
        </a>
        <div className="flex gap-4">
          <Link
            to="/register"
            className="rounded-lg border border-border px-6 py-2 text-sm font-medium transition-colors hover:bg-surface"
          >
            Crear cuenta
          </Link>
          <Link
            to="/products"
            className="rounded-lg bg-accent px-6 py-2 text-sm font-semibold text-fg transition-colors hover:bg-accent-dark"
          >
            Seguir comprando
          </Link>
        </div>
      </div>
    </div>
  );
}
