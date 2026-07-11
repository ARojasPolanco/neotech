export default function ColorSelector({ product, variants, selected, onSelect, onDeselect }) {
  if (!variants || variants.length === 0) return null;

  const placeholder = "https://placehold.co/48x48/e0e0e0/666?text=Img";

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-muted">
        Color: <span className="text-fg">{selected?.color || "Producto original"}</span>
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onDeselect}
          className={`group relative cursor-pointer overflow-hidden rounded-lg border-2 transition-all ${
            !selected
              ? "border-fg"
              : "border-border hover:border-muted"
          }`}
          title="Producto original"
        >
          <img
            src={product.imageUrl || placeholder}
            alt="Producto"
            className="h-12 w-12 object-cover"
          />
          {!selected && (
            <span className="absolute inset-0 border-2 border-fg rounded-lg" />
          )}
        </button>

        {variants.map((v) => (
          <button
            key={v.id}
            onClick={() => onSelect(v)}
            className={`group relative cursor-pointer overflow-hidden rounded-lg border-2 transition-all ${
              selected?.id === v.id
                ? "border-fg"
                : "border-border hover:border-muted"
            }`}
            title={v.color}
          >
            {v.imageUrl ? (
              <img
                src={v.imageUrl}
                alt={v.color}
                className="h-12 w-12 object-cover"
              />
            ) : (
              <span
                className="block h-12 w-12"
                style={{ backgroundColor: v.colorHex }}
              />
            )}
            {selected?.id === v.id && (
              <span className="absolute inset-0 border-2 border-fg rounded-lg" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
