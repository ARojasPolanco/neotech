import { motion, AnimatePresence } from "framer-motion";

export default function ConfirmModal({ isOpen, title, message, confirmLabel, variant, onConfirm, onCancel }) {
  const isDanger = variant === "danger";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40"
            onClick={onCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-card border border-border bg-white p-6 shadow-xl"
          >
            <h2 className="font-heading text-lg font-bold">{title}</h2>
            <p className="mt-2 text-sm text-muted">{message}</p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={onCancel}
                className="cursor-pointer rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-surface"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors ${
                  isDanger
                    ? "bg-error hover:bg-error/90"
                    : "bg-accent text-fg hover:bg-accent-dark"
                }`}
              >
                {confirmLabel || "Confirmar"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
