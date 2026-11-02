import { useEffect, useState } from "react";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (!window.matchMedia) return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);

    update();

    if (media.addEventListener) {
      media.addEventListener("change", update);
    } else {
      media.addListener(update);
    }

    return () => {
      if (media.removeEventListener) {
        media.removeEventListener("change", update);
      } else {
        media.removeListener(update);
      }
    };
  }, []);

  return reduced;
}

export default function BackgroundVideo({ src, enabled = false }) {
  const [failed, setFailed] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  if (!enabled || !src || failed) return null;

  const poster = /\.(mp4|webm)(\?.*)?$/i.test(src)
    ? src.replace(/\.(mp4|webm)(\?.*)?$/i, ".jpg")
    : undefined;

  return (
    <div className="relative mb-8 overflow-hidden rounded-2xl bg-[#043f51]">
      <video
        data-testid="background-video"
        src={src}
        poster={poster}
        className="block max-h-[60vh] w-full object-contain"
        autoPlay={!reducedMotion}
        loop={!reducedMotion}
        muted
        playsInline
        controls={reducedMotion}
        preload="metadata"
        onError={() => setFailed(true)}
        aria-label="Video Neo Tech"
      />
    </div>
  );
}
