import { useEffect, useRef, useState } from "react";
import api from "../config/api.js";
import BrandLogo from "./BrandLogo.jsx";

const DEFAULT_TIMEOUT_MS = 60000;
const DEFAULT_RETRY_DELAY = 2000;
const REQUEST_TIMEOUT_MS = 5000;

async function defaultHealthCheck() {
  await api.get("/health", { timeout: REQUEST_TIMEOUT_MS });
}

export default function StartupGate({
  children,
  healthCheck = defaultHealthCheck,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  retryDelay = DEFAULT_RETRY_DELAY,
}) {
  const [status, setStatus] = useState("checking");
  const [slow, setSlow] = useState(false);
  const [skip, setSkip] = useState(false);
  const attemptsRef = useRef(0);
  const deadlineRef = useRef(0);
  const timerRef = useRef(null);
  const mountedRef = useRef(true);

  const check = async () => {
    attemptsRef.current += 1;

    try {
      await healthCheck();
      if (mountedRef.current) setStatus("ready");
    } catch {
      if (!mountedRef.current) return;

      if (Date.now() >= deadlineRef.current) {
        setStatus("failed");
      } else {
        timerRef.current = setTimeout(check, retryDelay);
      }
    }
  };

  const start = () => {
    attemptsRef.current = 0;
    deadlineRef.current = Date.now() + timeoutMs;
    setStatus("checking");
    setSkip(false);
    check();
  };

  useEffect(() => {
    mountedRef.current = true;
    start();

    return () => {
      mountedRef.current = false;
      clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (status !== "checking") return;

    setSlow(false);
    const timer = setTimeout(() => setSlow(true), 3000);
    return () => clearTimeout(timer);
  }, [status]);

  if (status === "ready" || skip) return children;

  const failed = status === "failed";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-bg px-6 text-center">
      <BrandLogo size="lg" to={null} />

      {!failed ? (
        <>
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent motion-reduce:animate-none" />
          <div>
            <p className="text-sm font-medium">Conectando con la tienda...</p>
            <p className="mt-1 text-xs text-muted">
              {slow
                ? "El servidor estaba dormido. Puede tardar unos segundos en despertar."
                : "Esto toma solo un momento."}
            </p>
          </div>
        </>
      ) : (
        <>
          <div>
            <p className="text-base font-semibold">
              No pudimos conectar con el servidor
            </p>
            <p className="mt-1 text-sm text-muted">
              Revisá tu conexión o esperá unos segundos e intentá de nuevo.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={start}
              className="cursor-pointer rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-accent-fg transition-colors hover:bg-accent-dark"
            >
              Reintentar
            </button>
            <button
              type="button"
              onClick={() => setSkip(true)}
              className="cursor-pointer rounded-lg border border-border px-6 py-2.5 text-sm font-medium transition-colors hover:bg-surface"
            >
              Continuar de todos modos
            </button>
          </div>
        </>
      )}
    </div>
  );
}
