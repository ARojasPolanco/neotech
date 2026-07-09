export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface py-8">
      <div className="mx-auto max-w-7xl px-5 text-center">
        <p className="font-heading text-lg font-semibold">
          NEO <span className="text-accent">TECH</span>
        </p>
        <p className="mt-1 text-sm text-muted">
          Tecnología al alcance de todos
        </p>
        <p className="mt-4 text-xs text-muted">
          &copy; {new Date().getFullYear()} Neo Tech. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
