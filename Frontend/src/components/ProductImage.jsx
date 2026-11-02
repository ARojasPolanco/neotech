export default function ProductImage({
  src,
  alt = "Neo Tech",
  className = "",
  imgClassName = "",
  logoClassName = "h-1/2 w-1/2",
}) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${className} ${imgClassName}`.trim()}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={`${alt} sin imagen`}
      data-testid="product-placeholder"
      className={`flex items-center justify-center bg-surface ${className}`.trim()}
    >
      <img
        src="/logo_light_cropped.png"
        alt=""
        aria-hidden="true"
        className={`${logoClassName} object-contain dark:hidden`}
      />
      <img
        src="/logo_dark.png"
        alt=""
        aria-hidden="true"
        className={`${logoClassName} hidden object-contain dark:block`}
      />
    </div>
  );
}
