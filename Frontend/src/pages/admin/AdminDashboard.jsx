import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../config/api.js";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, type: "spring", stiffness: 300, damping: 24 },
  }),
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/stats")
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-card border border-border bg-white p-5">
            <div className="h-4 w-24 rounded bg-surface" />
            <div className="mt-3 h-8 w-16 rounded bg-surface" />
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <p className="text-center text-sm text-muted">
        No se pudieron cargar las estadísticas.
      </p>
    );
  }

  const cards = [
    { label: "Productos totales", value: stats.totalProducts, color: "text-fg" },
    { label: "Productos activos", value: stats.activeProducts, color: "text-success" },
    { label: "Pedidos totales", value: stats.totalOrders, color: "text-fg" },
    { label: "Pedidos pendientes", value: stats.pendingOrders, color: "text-warning" },
    {
      label: "Ingresos totales",
      value: `$${stats.totalRevenue.toLocaleString("es-AR")}`,
      color: "text-accent-dark",
    },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="rounded-card border border-border bg-white p-5"
          >
            <p className="text-xs font-medium text-muted">{card.label}</p>
            <p className={`mt-1 text-2xl font-bold ${card.color}`}>{card.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          to="/admin/products"
          className="rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-fg transition-colors hover:bg-accent-dark"
        >
          Gestionar productos
        </Link>
        <Link
          to="/admin/orders"
          className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium transition-colors hover:bg-surface"
        >
          Ver pedidos
        </Link>
      </div>
    </div>
  );
}
