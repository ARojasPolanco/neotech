import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../config/api.js";

export default function OrderSuccessPage() {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/orders/number/${orderNumber}`)
      .then((res) => setOrder(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <div className="h-8 w-48 animate-pulse rounded bg-surface" />
        <div className="h-4 w-64 animate-pulse rounded bg-surface" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <div className="mb-6 text-5xl">✅</div>
      <h1 className="mb-2 font-heading text-3xl font-bold">
        ¡Pedido confirmado!
      </h1>

      {order ? (
        <>
          <p className="text-lg font-semibold text-accent-dark">
            {order.orderNumber}
          </p>
          <p className="mt-4 text-sm text-muted">
            Te enviamos el recibo a <strong>{order.customerEmail}</strong>.
          </p>
          <p className="mt-1 text-sm text-muted">
            Si creás una cuenta, podés seguir tu pedido y recibir ofertas exclusivas.
          </p>

          <div className="mt-8 flex justify-center gap-4">
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
        </>
      ) : (
        <p className="text-sm text-muted">
          No pudimos encontrar el pedido. Si ya pagaste, pronto recibirás el comprobante por email.
        </p>
      )}
    </div>
  );
}
