import ProductImage from "./ProductImage.jsx";

export default function ColorSelector({ product, variants, selected, onSelect, onDeselect }) {
  const hasVariants = variants && variants.length > 0;

  if (!hasVariants) {
    if (!product.color) return null;

    return (
      <div>
        <p className="mb-2 text-sm font-medium text-muted">
          Color: <span className="text-fg">{product.color}</span>
        </p>
        <div className="flex items-center gap-2">
          <span
            className="h-8 w-8 rounded-full border border-border"
            style={{ backgroundColor: product.colorHex || "var(--color-border)" }}
          />
          <span className="text-sm text-muted">{product.color}</span>
        </div>
      </div>
    );
  }

  const baseColor = product.color || "Producto original";

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-muted">
        Color: <span className="text-fg">{selected?.color || baseColor}</span>
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onDeselect}
          className={`group relative cursor-pointer overflow-hidden rounded-lg border-2 transition-all ${
            !selected
              ? "border-fg"
              : "border-border hover:border-muted"
          }`}
          title={baseColor}
        >
          {product.imageUrl ? (
            <>
              <ProductImage
                src={product.imageUrl}
                alt={baseColor}
                className="h-12 w-12"
                logoClassName="h-9 w-9"
              />
              {product.colorHex && (
                <span
                  className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border border-white shadow"
                  style={{ backgroundColor: product.colorHex }}
                />
              )}
            </>
          ) : product.colorHex ? (
            <span
              className="block h-12 w-12"
              style={{ backgroundColor: product.colorHex }}
            />
          ) : (
            <ProductImage
              src={null}
              alt={baseColor}
              className="h-12 w-12"
              logoClassName="h-9 w-9"
            />
          )}
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
