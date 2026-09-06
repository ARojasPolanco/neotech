import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { loginRequest } from "../config/auth.js";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await loginRequest(email, password);
      login(data.token, data.user);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Error al iniciar sesión");
    }
  };

  return (
    <div className="mx-auto mt-12 max-w-sm">
      <h1 className="mb-1 text-center font-heading text-3xl font-bold">Iniciar Sesión</h1>
      <p className="mb-8 text-center text-sm text-muted">
        Ingresá tu email y contraseña
      </p>

      {error && (
        <p className="mb-4 rounded-lg bg-error/10 px-4 py-2 text-sm text-error">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-input border border-border bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent"
        />
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-input border border-border bg-white px-4 py-3 pr-12 text-sm outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted transition-colors hover:text-fg"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <button
          type="submit"
          className="w-full cursor-pointer rounded-lg bg-accent py-3 text-sm font-semibold text-fg transition-colors hover:bg-accent-dark"
        >
          Ingresar
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        ¿No tenés cuenta?{" "}
        <Link to="/register" className="font-medium text-fg underline underline-offset-2 hover:text-accent-dark">
          Registrate
        </Link>
      </p>
    </div>
  );
}
