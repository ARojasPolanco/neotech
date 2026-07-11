import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import FeaturedCard from "./FeaturedCard.jsx";

export default function FeaturedCarousel({ products }) {
  const scrollRef = useRef(null);

  if (!products || products.length === 0) return null;

  const scrollBy = (dir) => {
    if (!scrollRef.current) return;
    const cardWidth = 272;
    scrollRef.current.scrollBy({ left: dir * cardWidth, behavior: "smooth" });
  };

  return (
    <div className="group relative">
      <div className="absolute -left-3 top-1/2 z-10 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={() => scrollBy(-1)}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-border bg-white shadow-md transition-colors hover:bg-surface"
        >
          <ChevronLeft size={18} />
        </button>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-2"
        style={{ scrollSnapType: "x mandatory", scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {products.map((product) => (
          <div key={product.id} style={{ scrollSnapAlign: "start" }} className="flex-shrink-0">
            <FeaturedCard product={product} />
          </div>
        ))}
      </div>

      <div className="absolute -right-3 top-1/2 z-10 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={() => scrollBy(1)}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-border bg-white shadow-md transition-colors hover:bg-surface"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
