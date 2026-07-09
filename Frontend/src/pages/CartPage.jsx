import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <p className="text-lg font-semibold">Tu carrito está vacío</p>
        <p className="text-sm text-muted">Agregá productos para empezar a comprar.</p>
        <Link
          to="/products"
          className="rounded-lg bg-accent px-6 py-2 text-sm font-semibold text-fg transition-colors hover:bg-accent-dark"
        >
          Ver productos
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 font-heading text-3xl font-bold">Tu Carrito</h1>

      <div className="flex flex-col gap-4">
        {items.map((item) => (
          <div
            key={item.key}
            className="flex items-center gap-4 rounded-card border border-border bg-white p-4"
          >
            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-surface">
              <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
            </div>

            <div className="flex-1">
              <p className="font-medium">{item.name}</p>
              {item.color && (
                <p className="text-sm text-muted">Color: {item.color}</p>
              )}
              <p className="text-sm font-semibold">
                ${Number(item.price).toLocaleString("es-AR")}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.key, item.quantity - 1)}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-border transition-colors hover:bg-surface"
              >
                -
              </button>
              <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.key, item.quantity + 1)}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-border transition-colors hover:bg-surface"
              >
                +
              </button>
            </div>

            <p className="w-20 text-right font-semibold">
              ${(Number(item.price) * item.quantity).toLocaleString("es-AR")}
            </p>

            <button
              onClick={() => removeItem(item.key)}
              className="cursor-pointer text-sm text-muted hover:text-error transition-colors"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between rounded-card border border-border bg-white p-4">
        <p className="text-lg font-semibold">Total</p>
        <p className="text-2xl font-bold">${totalPrice.toLocaleString("es-AR")}</p>
      </div>

      <button className="mt-4 w-full cursor-pointer rounded-lg bg-accent py-3 text-sm font-semibold text-fg transition-colors hover:bg-accent-dark">
        Finalizar Compra
      </button>
    </div>
  );
}
