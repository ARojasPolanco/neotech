import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../config/api.js";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

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

  if (!order) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <h1 className="mb-2 font-heading text-2xl font-bold">Pedido no encontrado</h1>
        <p className="text-sm text-muted">
          No pudimos encontrar el pedido. Si ya pagaste, pronto recibirás el comprobante por email.
        </p>
        <Link
          to="/products"
          className="mt-6 inline-block rounded-lg bg-accent px-6 py-2 text-sm font-semibold text-fg transition-colors hover:bg-accent-dark"
        >
          Seguir comprando
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-lg py-16 text-center"
    >
      <motion.div variants={itemVariants} className="mb-6 flex justify-center">
        <SuccessCheckmark />
      </motion.div>

      <motion.h1
        variants={itemVariants}
        className="mb-2 font-heading text-3xl font-bold"
      >
        ¡Pedido confirmado!
      </motion.h1>

      <motion.p
        variants={itemVariants}
        className="text-lg font-semibold text-accent-dark"
      >
        {order.orderNumber}
      </motion.p>

      <motion.p variants={itemVariants} className="mt-4 text-sm text-muted">
        Te enviamos el recibo a <strong>{order.customerEmail}</strong>.
      </motion.p>

      <motion.p variants={itemVariants} className="mt-1 text-sm text-muted">
        Si creás una cuenta, podés seguir tu pedido y recibir ofertas exclusivas.
      </motion.p>

      <motion.div
        variants={itemVariants}
        className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
      >
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
      </motion.div>
    </motion.div>
  );
}

function SuccessCheckmark() {
  return (
    <motion.svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      initial="hidden"
      animate="visible"
    >
      <motion.circle
        cx="40"
        cy="40"
        r="36"
        stroke="#a8e05f"
        strokeWidth="4"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: {
            pathLength: 1,
            opacity: 1,
            transition: { duration: 0.6, ease: "easeInOut" },
          },
        }}
      />
      <motion.path
        d="M26 42L36 52L54 32"
        stroke="#0a0a0a"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: {
            pathLength: 1,
            opacity: 1,
            transition: { duration: 0.4, delay: 0.4, ease: "easeInOut" },
          },
        }}
      />
    </motion.svg>
  );
}
