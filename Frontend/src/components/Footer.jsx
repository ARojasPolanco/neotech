import { Link } from "react-router-dom";
import BrandLogo from "./BrandLogo.jsx";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface py-8">
      <div className="mx-auto max-w-7xl px-5">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <BrandLogo size="md" />
            <p className="mt-2 text-sm text-muted">
              Tecnología al alcance de todos
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted">
            <Link to="/terminos" className="transition-colors hover:text-fg">
              Términos y condiciones
            </Link>
            <Link to="/privacidad" className="transition-colors hover:text-fg">
              Política de privacidad
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          &copy; {new Date().getFullYear()} LIER. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
