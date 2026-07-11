import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { registerRequest } from "../config/auth.js";

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullname: "", email: "", password: "",
    acceptedTerms: false, acceptedMarketing: false,
  });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const update = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await registerRequest(form);
      login(data.token, data.user);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Error al registrarse");
    }
  };

  return (
    <div className="mx-auto mt-12 max-w-sm">
      <div className="mb-8 rounded-card border border-accent/30 bg-accent/5 p-4 text-center">
        <p className="text-sm font-semibold text-accent-dark">
          🎁 Creá tu cuenta y obtené descuentos exclusivos, ofertas y acceso a tu historial de pedidos.
        </p>
      </div>

      <h1 className="mb-1 text-center font-heading text-3xl font-bold">Crear Cuenta</h1>
      <p className="mb-8 text-center text-sm text-muted">
        Completá tus datos para registrarte
      </p>

      {error && (
        <p className="mb-4 rounded-lg bg-error/10 px-4 py-2 text-sm text-error">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text" placeholder="Nombre completo" value={form.fullname}
          onChange={update("fullname")} required
          className="w-full rounded-input border border-border bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent"
        />
        <input
          type="email" placeholder="Email" value={form.email}
          onChange={update("email")} required
          className="w-full rounded-input border border-border bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent"
        />
        <input
          type="password" placeholder="Contraseña" value={form.password}
          onChange={update("password")} required minLength={8}
          className="w-full rounded-input border border-border bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent"
        />

        <label className="flex items-start gap-2 text-sm text-muted">
          <input
            type="checkbox" checked={form.acceptedTerms}
            onChange={update("acceptedTerms")} required
            className="mt-0.5"
          />
          Acepto los{" "}
          <a href="/terminos" className="underline underline-offset-2 hover:text-fg">
            Términos y Condiciones
          </a>{" "}
          y la{" "}
          <a href="/privacidad" className="underline underline-offset-2 hover:text-fg">
            Política de Privacidad
          </a>
        </label>

        <label className="flex items-start gap-2 text-sm text-muted">
          <input
            type="checkbox" checked={form.acceptedMarketing}
            onChange={update("acceptedMarketing")}
            className="mt-0.5"
          />
          Quiero recibir ofertas y novedades por email
        </label>

        <button
          type="submit" disabled={!form.acceptedTerms}
          className="w-full cursor-pointer rounded-lg bg-accent py-3 text-sm font-semibold text-fg transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          Crear Cuenta
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        ¿Ya tenés cuenta?{" "}
        <Link to="/login" className="font-medium text-fg underline underline-offset-2 hover:text-accent-dark">
          Iniciá sesión
        </Link>
      </p>
    </div>
  );
}
