export default function ColorSelector({ variants, selected, onSelect }) {
  if (!variants || variants.length === 0) return null;

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-muted">
        Color: <span className="text-fg">{selected?.color || "Seleccionar"}</span>
      </p>
      <div className="flex gap-2">
        {variants.map((v) => (
          <button
            key={v.id}
            onClick={() => onSelect(v)}
            className={`cursor-pointer rounded-full border-2 p-0.5 transition-all ${
              selected?.id === v.id
                ? "border-fg"
                : "border-border hover:border-muted"
            }`}
            title={v.color}
          >
            <span
              className="block h-6 w-6 rounded-full"
              style={{ backgroundColor: v.colorHex }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
