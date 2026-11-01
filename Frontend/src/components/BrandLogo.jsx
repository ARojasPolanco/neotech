import { Link } from "react-router-dom";

const sizes = {
  sm: "h-9",
  md: "h-12",
  lg: "h-16",
};

export default function BrandLogo({ size = "md", to = "/", className = "" }) {
  const logo = (
    <span
      className={`inline-flex ${sizes[size] || sizes.md} items-center overflow-hidden rounded-lg ${className}`}
    >
      <img
        src="/logo_light_cropped.png"
        alt="Neo Tech"
        className="h-full w-auto object-contain"
      />
    </span>
  );

  if (!to) return logo;

  return (
    <Link to={to} aria-label="Neo Tech - Inicio">
      {logo}
    </Link>
  );
}
