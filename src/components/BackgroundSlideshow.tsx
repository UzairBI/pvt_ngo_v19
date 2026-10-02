import { useEffect, useState } from "react";

interface Props {
  /** Image paths in display order (see src/data/slideshows.ts). */
  images: string[];
  /** Time each image stays on screen, in ms. */
  interval?: number;
  /** Crossfade length, in ms. */
  duration?: number;
  /** Optional image shown underneath while the slides load (keeps the original look, no blank flash). */
  fallback?: string;
  /** Classes for the wrapper (it fills its parent by default). */
  className?: string;
  /** Classes for each <img>, e.g. an object-position. */
  imgClassName?: string;
  /** Extra classes for single images, keyed by image path (e.g. a different object-position per photo). */
  imgClassNames?: Record<string, string>;
  /** "fade" = crossfade (default). "shift" = the old photo slides out to the left while the next slides in from the right. */
  effect?: "fade" | "shift";
  /** Optional overlay classes drawn above the images (e.g. a blue gradient). */
  overlayClassName?: string;
}

/** Loads one image; resolves to its path, or null if the file is missing. */
const load = (src: string) => new Promise<string | null>((resolve) => {
  const img = new Image();
  img.onload = () => resolve(src);
  img.onerror = () => resolve(null);
  img.src = src;
});

/**
 * Background slideshow with a smooth crossfade (or a sideways shift). Fills its positioned parent and never changes its size,
 * so text on top stays still. Missing files are skipped; motion stops for visitors who prefer reduced motion.
 */
export default function BackgroundSlideshow({ images, interval = 5000, duration = 1200, fallback, className = "", imgClassName = "", imgClassNames = {}, effect = "fade", overlayClassName }: Props) {
  const [slides, setSlides] = useState<string[]>([]);
  // index = slide fading in / on screen (-1 before the first one appears); prev = slide still showing underneath it
  const [{ index, prev }, setPos] = useState({ index: -1, prev: -1 });
  const key = images.join("|");

  // preload every image first, so a slide is never shown half-loaded
  useEffect(() => {
    let alive = true;
    setPos({ index: -1, prev: -1 });
    Promise.all(images.map(load)).then((found) => {
      if (alive) setSlides(found.filter((s): s is string => !!s));
    });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // first slide fades in one frame after it is mounted
  useEffect(() => {
    if (!slides.length) return;
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setPos({ index: 0, prev: -1 })));
    return () => cancelAnimationFrame(id);
  }, [slides]);

  // advance every `interval` ms (not for visitors who prefer reduced motion)
  useEffect(() => {
    if (slides.length < 2) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setPos((p) => ({ prev: p.index, index: (p.index + 1) % slides.length })), interval);
    return () => window.clearInterval(id);
  }, [slides, interval]);

  // once the fade has finished, the slide underneath can be hidden
  useEffect(() => {
    if (prev < 0) return;
    const id = window.setTimeout(() => setPos((p) => ({ ...p, prev: -1 })), duration + 100);
    return () => window.clearTimeout(id);
  }, [prev, index, duration]);

  return (
    <div aria-hidden="true" className={`bg-slideshow ${effect === "shift" ? "is-shift" : ""} ${className}`} style={{ ["--slide-fade" as string]: `${duration}ms` }}>
      {fallback && <img src={fallback} alt="" className={`bg-slide is-base ${imgClassName} ${imgClassNames[fallback] ?? ""}`} />}
      {slides.map((src, i) => (
        <img key={src} src={src} alt="" decoding="async"
          className={`bg-slide ${imgClassName} ${imgClassNames[src] ?? ""} ${i === index ? "is-active" : i === prev ? "is-prev" : ""}`} />
      ))}
      {overlayClassName && <div className={`bg-slide-overlay ${overlayClassName}`} />}
    </div>
  );
}
