import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../config/api.js";
import PaymentSpinner from "../components/PaymentSpinner.jsx";

const MAX_ATTEMPTS = 15;

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

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("checking");
  const [order, setOrder] = useState(null);
  const [orderNumber, setOrderNumber] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [error, setError] = useState(null);

  const paymentId = searchParams.get("payment_id") || searchParams.get("collection_id") || "";

  useEffect(() => {
    api.get("/config/whatsapp").then((res) => {
      setWhatsappNumber(res.data.number);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const storedOrderNumber = sessionStorage.getItem("lastOrderNumber");
    if (!storedOrderNumber) {
      setStatus("no-order");
      return;
    }

    setOrderNumber(storedOrderNumber);

    let cancelled = false;
    let timedOut = false;
    let timer;

    async function poll() {
      if (cancelled || timedOut) return;
      try {
        const url = `/payments/verify/${storedOrderNumber}${paymentId ? `?paymentId=${paymentId}` : ""}`;
        const res = await api.get(url);
        if (res.data.status === "paid" && !cancelled) {
          const orderRes = await api.get(`/orders/number/${storedOrderNumber}`);
          setOrder(orderRes.data);
          setStatus("found");
          sessionStorage.removeItem("lastOrderNumber");
          return;
        }
      } catch (err) {
        if (!cancelled) {
          setError("No pudimos contactar al servidor. Intentando de nuevo...");
        }
      }

      setAttempts((prev) => prev + 1);

      if (!cancelled && !timedOut) {
        timer = setTimeout(poll, 3000);
      }
    }

    const maxAttemptsTimer = setTimeout(() => {
      timedOut = true;
      clearTimeout(timer);
      setStatus("delayed");
    }, MAX_ATTEMPTS * 3000);

    poll();

    return () => {
      cancelled = true;
      timedOut = true;
      clearTimeout(timer);
      clearTimeout(maxAttemptsTimer);
    };
  }, [paymentId]);

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
      <div className="flex flex-col items-center gap-5 py-20 text-center">
        <PaymentSpinner />
        <p className="text-lg font-semibold">Verificando tu pago...</p>
        {orderNumber && (
          <p className="text-sm font-medium text-accent-dark">
            Número de pedido: {orderNumber}
          </p>
        )}
        {error && (
          <p className="text-xs text-warning">{error}</p>
        )}
        {attempts > 3 && (
          <p className="mt-2 max-w-sm text-xs text-muted">
            Si Mercado Pago ya aprobó tu pago pero no ves la confirmación,
            probá refrescar la página.
          </p>
        )}
      </div>
    );
  }

  if (status === "delayed") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-md py-20 text-center"
      >
        <div className="mb-6 flex justify-center">
          <DelayedPaymentIcon />
        </div>
        <h1 className="mb-2 font-heading text-2xl font-bold">
          Tu pago está siendo procesado
        </h1>
        <p className="text-lg font-semibold text-accent-dark">{orderNumber}</p>
        <p className="mt-4 text-sm text-muted">
          Todavía no detectamos la confirmación de Mercado Pago. Guardá tu número de pedido.
        </p>
        <p className="mt-2 text-sm text-muted">
          Te enviaremos el recibo por mail apenas se confirme el pago.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3">
          {whatsappNumber && (
            <a
              href={`https://wa.me/${whatsappNumber}?text=Hola,%20quiero%20informar%20mi%20compra.%20N%C3%BAmero%20de%20pedido:%20${orderNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg bg-[#25D366] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1ebe57]"
            >
              💬 Informar mi compra por WhatsApp
            </a>
          )}
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-lg bg-accent px-6 py-2 text-sm font-semibold text-fg transition-colors hover:bg-accent-dark"
          >
            Refrescar estado
          </button>
        </div>
      </motion.div>
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

      <motion.div variants={itemVariants} className="mt-8 flex flex-col items-center gap-3">
        <a
          href={`https://wa.me/${whatsappNumber}?text=Hola,%20quiero%20informar%20mi%20compra.%20N%C3%BAmero%20de%20pedido:%20${order.orderNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg bg-[#25D366] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1ebe57]"
        >
          💬 Informar mi compra por WhatsApp
        </a>
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
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

function DelayedPaymentIcon() {
  return (
    <motion.svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
    >
      <motion.circle
        cx="40"
        cy="40"
        r="36"
        stroke="#d5d5d5"
        strokeWidth="4"
      />
      <motion.circle
        cx="40"
        cy="40"
        r="36"
        stroke="#a8e05f"
        strokeWidth="4"
        strokeLinecap="round"
        initial={{ pathLength: 0, rotate: -90 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "center" }}
      />
      <motion.path
        d="M40 22V40L52 52"
        stroke="#0a0a0a"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />
    </motion.svg>
  );
}
