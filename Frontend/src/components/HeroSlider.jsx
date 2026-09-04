import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SlideBranding from "./SlideBranding.jsx";
import SlideSocialMedia from "./SlideSocialMedia.jsx";
import SlideFeaturedProduct from "./SlideFeaturedProduct.jsx";

const INTERVAL = 5000;

export default function HeroSlider({ featuredProduct }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const slides = [
    { key: "branding", component: <SlideBranding /> },
    { key: "social", component: <SlideSocialMedia /> },
    {
      key: "featured",
      component: <SlideFeaturedProduct product={featuredProduct} />,
    },
  ];

  const total = slides.length;

  const go = useCallback(
    (dir) => {
      setCurrent((prev) => (prev + dir + total) % total);
    },
    [total],
  );

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => go(1), INTERVAL);
    return () => clearInterval(timer);
  }, [paused, go]);

  return (
    <div
      className="relative mb-12 mt-2 overflow-hidden rounded-2xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative h-full min-h-[280px] sm:min-h-[340px]">
        {slides.map((slide, i) => (
          <div
            key={slide.key}
            className="absolute inset-0 transition-opacity duration-500"
            style={{ opacity: i === current ? 1 : 0, pointerEvents: i === current ? "auto" : "none" }}
          >
            {slide.component}
          </div>
        ))}
      </div>

      <button
        onClick={() => go(-1)}
        className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
        aria-label="Anterior"
      >
        <ChevronLeft size={20} />
      </button>

      <button
        onClick={() => go(1)}
        className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
        aria-label="Siguiente"
      >
        <ChevronRight size={20} />
      </button>

      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {slides.map((slide, i) => (
          <button
            key={slide.key}
            onClick={() => setCurrent(i)}
            className={`h-2.5 w-2.5 rounded-full transition-colors ${
              i === current ? "bg-accent" : "bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
