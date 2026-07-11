import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function Toast({ id, message, actionLabel, actionHref, onClose }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="pointer-events-auto flex min-w-[280px] items-center gap-3 rounded-card border border-border bg-white p-4 shadow-lg"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/20 text-lg">
        ✓
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-fg">{message}</p>
        {actionHref && (
          <Link
            to={actionHref}
            onClick={() => onClose(id)}
            className="mt-1 inline-block text-xs font-semibold text-accent-dark hover:underline"
          >
            {actionLabel || "Ver más"}
          </Link>
        )}
      </div>
      <button
        onClick={() => onClose(id)}
        className="text-lg leading-none text-muted transition-colors hover:text-fg"
        aria-label="Cerrar"
      >
        ×
      </button>
    </motion.div>
  );
}
