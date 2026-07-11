import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const messages = [
  "Verificando tu pago...",
  "Confirmando disponibilidad...",
  "Preparando tu recibo...",
];

export default function PaymentSpinner() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.4, 1, 0.4],
              backgroundColor: ["#d5d5d5", "#a8e05f", "#d5d5d5"],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
            className="h-3 w-3 rounded-full"
          />
        ))}
      </div>

      <div className="h-6 overflow-hidden text-center">
        <AnimatePresence mode="wait">
          <AnimateText key={index} index={index} />
        </AnimatePresence>
      </div>
    </div>
  );
}

function AnimateText({ index }) {
  return (
    <motion.p
      key={index}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="text-sm text-muted"
    >
      {messages[index]}
    </motion.p>
  );
}
