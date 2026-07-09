import { Link } from "react-router-dom";

const featured = [
  { name: "Auriculares", desc: "Sumergite en el sonido", emoji: "🎧" },
  { name: "Teclados", desc: "Precisión y estilo", emoji: "⌨️" },
  { name: "Micrófonos", desc: "Sonido profesional", emoji: "🎙️" },
  { name: "Parlantes", desc: "Potencia y claridad", emoji: "🔊" },
  { name: "Cargadores", desc: "Carga rápida y segura", emoji: "⚡" },
  { name: "Accesorios", desc: "Todo lo que necesitás", emoji: "🔌" },
];

export default function HomePage() {
  return (
    <div>
      <section className="mb-12 mt-8 text-center">
        <h1 className="font-heading text-5xl font-bold leading-tight tracking-tight md:text-6xl">
          Tecnología para{" "}
          <span className="text-accent">todo</span>
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-lg text-muted">
          Descubrí nuestra selección de audio, gaming, carga y accesorios. Calidad y precio justo.
        </p>
        <Link
          to="/products"
          className="mt-8 inline-block rounded-lg bg-accent px-8 py-3 text-sm font-semibold text-fg transition-colors hover:bg-accent-dark"
        >
          Ver Productos
        </Link>
      </section>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {featured.map((cat) => (
          <div
            key={cat.name}
            className="flex flex-col items-center rounded-card border border-border bg-white p-6 text-center transition-shadow hover:shadow-md"
          >
            <span className="text-3xl">{cat.emoji}</span>
            <h3 className="mt-3 font-heading text-lg font-semibold">{cat.name}</h3>
            <p className="mt-1 text-xs text-muted">{cat.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
