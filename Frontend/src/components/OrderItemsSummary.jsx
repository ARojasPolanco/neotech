import ProductImage from "./ProductImage.jsx";

export default function OrderItemsSummary({ items = [], total }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="rounded-card border border-border bg-card p-4 text-left">
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-surface">
              <ProductImage
                src={item.imageUrl || null}
                alt={item.productName}
                className="h-full w-full"
                imgClassName="h-full w-full object-cover"
                logoClassName="h-9 w-9"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{item.productName}</p>
              <p className="text-xs text-muted">
                {item.color ? `${item.color} · ` : ""}x{item.quantity}
              </p>
            </div>
            <p className="text-sm font-semibold">
              ${Number(item.subtotal).toLocaleString("es-AR")}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <span className="text-sm font-medium">Total</span>
        <span className="text-lg font-bold">
          ${Number(total).toLocaleString("es-AR")}
        </span>
      </div>
    </div>
  );
}
