export default function VariantDots({ variants, currentIndex, onSelect, size = "md" }) {
  if (!variants || variants.length === 0) return null;

  const dotSize = size === "sm" ? "h-3 w-3" : "h-4 w-4";
  const borderWidth = size === "sm" ? "border" : "border-2";

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={(e) => {
          e.preventDefault();
          onSelect(-1);
        }}
        className={`${dotSize} rounded-full ${borderWidth} transition-all ${
          currentIndex === -1
            ? "border-fg bg-fg/20"
            : "border-muted/40 hover:border-muted"
        }`}
        title="Producto"
      />
      {variants
        .filter((v) => v.imageUrl)
        .map((v, i) => (
          <button
            key={v.id}
            onClick={(e) => {
              e.preventDefault();
              onSelect(i);
            }}
            className={`${dotSize} rounded-full ${borderWidth} transition-all ${
              currentIndex === i
                ? "border-fg"
                : "border-muted/40 hover:border-muted"
            }`}
            style={{ backgroundColor: v.colorHex }}
            title={v.color}
          />
        ))}
    </div>
  );
}
