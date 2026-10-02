import { useCallback, useEffect, useRef, useState } from "react";
import Img from "./Img";
import { useLang } from "../i18n/LangContext";

export interface Photo { file: string; alt: string; cat: string }

/** Filterable photo grid with a full-screen lightbox (arrows, Esc, arrow keys, and left / right swipe on touch screens). */
export default function Gallery({ photos }: { photos: Photo[] }) {
  const { t } = useLang();
  const cats = ["All", ...Array.from(new Set(photos.map((p) => p.cat)))];
  const [cat, setCat] = useState("All");
  const [open, setOpen] = useState<number | null>(null);
  const list = cat === "All" ? photos : photos.filter((p) => p.cat === cat);
  const step = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + list.length) % list.length)), [list.length]);

  useEffect(() => {
    if (open === null) return;
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(null); if (e.key === "ArrowRight") step(1); if (e.key === "ArrowLeft") step(-1); };
    document.addEventListener("keydown", key);
    const prev = document.body.style.overflow; document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", key); document.body.style.overflow = prev; };
  }, [open, step]);

  const touchX = useRef<number | null>(null);
  const cur = open !== null ? list[open] : null;
  return (
    <>
      <div className="mt-6 flex flex-wrap gap-2">
        {cats.map((c) => (
          <button key={c} type="button" onClick={() => { setCat(c); setOpen(null); }} aria-pressed={c === cat}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition sm:py-1.5 ${c === cat ? "border-brand bg-brand text-white" : "hover:bg-brand-light"}`}>{c === "All" ? t("All") : c}</button>
        ))}
      </div>
      <div className="mt-6 grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-3">
        {list.map((p, i) => (
          <button key={p.file} type="button" onClick={() => setOpen(i)} aria-label={`Open photo: ${p.alt}`} className="group relative block overflow-hidden rounded-xl sm:rounded-2xl">
            <Img file={p.file} alt={p.alt} className="h-36 w-full transition min-[420px]:h-44 sm:h-64 duration-500 group-hover:scale-105" />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 p-3 text-left text-xs text-white opacity-0 transition group-hover:opacity-100">{p.alt}</span>
          </button>
        ))}
      </div>
      {cur && (
        <div role="dialog" aria-modal="true" aria-label={cur.alt} className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setOpen(null)}
          onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            const dx = touchX.current === null ? 0 : e.changedTouches[0].clientX - touchX.current;
            touchX.current = null;
            if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
          }}>
          <button type="button" aria-label="Close" onClick={() => setOpen(null)} className="absolute right-4 top-4 z-10 h-11 w-11 rounded-full bg-white/10 text-2xl text-white hover:bg-white/20">×</button>
          <button type="button" aria-label="Previous photo" onClick={(e) => { e.stopPropagation(); step(-1); }} className="absolute bottom-5 left-4 z-10 h-12 w-12 rounded-full sm:bottom-auto sm:left-3 bg-white/10 text-2xl text-white hover:bg-white/20">‹</button>
          <figure className="max-h-full max-w-5xl pb-16 sm:pb-0" onClick={(e) => e.stopPropagation()}>
            <img src={`/assets/images/${cur.file}`} alt={cur.alt} className="mx-auto max-h-[66vh] w-auto rounded-xl object-contain sm:max-h-[80vh]" />
            <figcaption className="mt-3 text-center text-sm text-white/90">{cur.alt} · {(open ?? 0) + 1}/{list.length}</figcaption>
          </figure>
          <button type="button" aria-label="Next photo" onClick={(e) => { e.stopPropagation(); step(1); }} className="absolute bottom-5 right-4 z-10 h-12 w-12 rounded-full sm:bottom-auto sm:right-3 bg-white/10 text-2xl text-white hover:bg-white/20">›</button>
        </div>
      )}
    </>
  );
}
