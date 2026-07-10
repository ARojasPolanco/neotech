import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../config/api.js";

const statusLabels = {
  pending: { label: "Pendiente", bg: "bg-warning/20", text: "text-warning" },
  paid: { label: "Pagado", bg: "bg-success/20", text: "text-success" },
  cancelled: { label: "Cancelado", bg: "bg-error/20", text: "text-error" },
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState(null);

  const loadOrders = () => {
    setLoading(true);
    const params = { page, limit: 15 };
    if (filter) params.status = filter;

    api
      .get("/admin/orders", { params })
      .then((res) => {
        setOrders(res.data.orders);
        setTotalPages(res.data.totalPages);
      })
      .catch(() => setError("Error al cargar pedidos"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, [page, filter]);

  const loadOrderDetail = async (orderId) => {
    try {
      const res = await api.get(`/admin/orders/${orderId}`);
      setSelected(res.data);
    } catch {
      setError("Error al cargar detalle");
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-heading text-2xl font-bold">Pedidos</h1>
        <div className="flex gap-2">
          {[
            { value: "", label: "Todos" },
            { value: "pending", label: "Pendientes" },
            { value: "paid", label: "Pagados" },
            { value: "cancelled", label: "Cancelados" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setFilter(opt.value);
                setPage(1);
              }}
              className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === opt.value
                  ? "bg-accent text-fg"
                  : "border border-border text-muted hover:bg-surface"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-error/10 px-4 py-2 text-sm text-error">
          {error}
        </p>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-card border border-border bg-white p-4"
            >
              <div className="h-5 w-32 rounded bg-surface" />
              <div className="mt-2 h-4 w-48 rounded bg-surface" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-card border border-border bg-white">
            <div className="hidden grid-cols-12 gap-4 border-b border-border bg-surface px-4 py-3 text-xs font-semibold text-muted md:grid">
              <div className="col-span-2">Pedido</div>
              <div className="col-span-3">Cliente</div>
              <div className="col-span-2">Total</div>
              <div className="col-span-2">Estado</div>
              <div className="col-span-3">Fecha</div>
            </div>

            <AnimatePresence>
              {orders.map((order) => (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid cursor-pointer grid-cols-1 gap-2 border-b border-border px-4 py-3 transition-colors last:border-0 hover:bg-surface md:grid-cols-12 md:items-center md:gap-4"
                  onClick={() => loadOrderDetail(order.id)}
                >
                  <div className="md:col-span-2">
                    <p className="font-semibold text-accent-dark">
                      {order.orderNumber}
                    </p>
                  </div>
                  <div className="md:col-span-3">
                    <p className="text-sm">{order.customerName}</p>
                    <p className="text-xs text-muted">{order.customerEmail}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="font-semibold">
                      ${Number(order.total).toLocaleString("es-AR")}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        statusLabels[order.status]?.bg || ""
                      } ${statusLabels[order.status]?.text || ""}`}
                    >
                      {statusLabels[order.status]?.label || order.status}
                    </span>
                  </div>
                  <div className="md:col-span-3">
                    <p className="text-sm text-muted">
                      {new Date(order.createdAt).toLocaleDateString("es-AR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {orders.length === 0 && (
              <p className="py-8 text-center text-sm text-muted">
                No hay pedidos {filter ? `con estado "${filter}"` : ""}.
              </p>
            )}
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="cursor-pointer rounded-lg border border-border px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="flex items-center px-3 text-sm text-muted">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="cursor-pointer rounded-lg border border-border px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}

      <AnimatePresence>
        {selected && (
          <OrderDetail order={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function OrderDetail({ order, onClose }) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/40"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto border-l border-border bg-white p-6 shadow-xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold">
            {order.orderNumber}
          </h2>
          <button
            onClick={onClose}
            className="text-2xl leading-none text-muted transition-colors hover:text-fg"
          >
            ×
          </button>
        </div>

        <div className="mb-4 rounded-card border border-border bg-surface p-4">
          <p className="text-sm">
            <span className="font-medium">Cliente:</span> {order.customerName}
          </p>
          <p className="text-sm">
            <span className="font-medium">Email:</span> {order.customerEmail}
          </p>
          <p className="text-sm">
            <span className="font-medium">Teléfono:</span>{" "}
            {order.customerPhone}
          </p>
          {order.User && (
            <p className="text-sm">
              <span className="font-medium">Cuenta:</span>{" "}
              {order.User.fullname} ({order.User.email})
            </p>
          )}
        </div>

        <div className="mb-4">
          <p className="mb-2 text-sm font-medium">Estado</p>
          <span
            className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${
              statusLabels[order.status]?.bg || ""
            } ${statusLabels[order.status]?.text || ""}`}
          >
            {statusLabels[order.status]?.label || order.status}
          </span>
        </div>

        <div className="mb-4">
          <p className="mb-2 text-sm font-medium">Productos</p>
          <div className="space-y-2">
            {order.OrderItems?.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-border bg-white p-3"
              >
                <p className="text-sm font-medium">{item.productName}</p>
                {item.color && (
                  <p className="text-xs text-muted">Color: {item.color}</p>
                )}
                <p className="text-xs text-muted">
                  x{item.quantity} · $
                  {Number(item.unitPrice).toLocaleString("es-AR")} c/u
                </p>
                <p className="text-sm font-semibold">
                  ${Number(item.subtotal).toLocaleString("es-AR")}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-2xl font-bold">
              ${Number(order.total).toLocaleString("es-AR")}
            </span>
          </div>
        </div>
      </motion.div>
    </>
  );
}
