import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { testimonials, type Testimonial } from "../data/content";
import { useLiveData } from "../hooks/useLiveData";
import { useLang } from "../i18n/LangContext";
import CountUp from "./CountUp";
import Reveal from "./Reveal";

/**
 * Testimonials section (layout after the "Bravio - Testimonials Section" design):
 *  1. label pill + headline + one-line intro
 *  2. two large feature cards, each with a big figure, a short quote and the speaker
 *  3. a sliding row of smaller quote cards with back / next arrows
 *  4. a summary bar with two buttons
 * No photos: every speaker gets a round letter badge, a name line and a programme line.
 * Content comes from src/data/content.ts -> testimonials (first two = feature cards, rest = slider).
 */

function Speaker({ item }: { item: Testimonial }) {
  return (
    <figcaption className="flex items-center gap-3">
      <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand text-base font-semibold text-white">{item.initial}</span>
      <span className="min-w-0 text-left">
        <strong className="block text-sm font-semibold leading-snug text-ink">{item.name}</strong>
        <span className="block text-xs leading-snug text-ink/60">{item.program}</span>
      </span>
    </figcaption>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={dir === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
    </svg>
  );
}

export default function Testimonials() {
  const { t } = useLang();
  const { stats } = useLiveData();
  const features = testimonials.slice(0, 2);
  const slides = testimonials.slice(2);
  const total = stats.find((s) => s.label.startsWith("Direct"));

  // slider state: arrows are disabled at either end and hidden if everything already fits
  const track = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false, overflow: true });
  const measure = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setEdge({
      start: el.scrollLeft <= 4,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
      overflow: el.scrollWidth > el.clientWidth + 4
    });
  }, []);
  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);
  const slide = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const step = card ? card.offsetWidth + 20 : el.clientWidth;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * step, behavior: calm ? "auto" : "smooth" });
  };

  return (
    <section id="testimonials" className="bg-white py-16 md:py-24" aria-labelledby="testimonials-title">
      <div className="container-site">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-4 py-1.5 text-sm font-medium text-ink/80 shadow-sm">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-brand" />
            {t("Testimonials")}
          </span>
          <h2 id="testimonials-title" className="mt-5 text-[1.7rem] font-semibold sm:text-3xl leading-tight tracking-tight text-ink md:text-5xl md:leading-[1.1]">
            {t("Stories of Hope, Empowerment & Transformation")}
          </h2>
          <p className="mt-4 text-base text-ink/65 md:text-lg">{t("Hear from the families and communities our programmes have reached.")}</p>
        </Reveal>

        {/* two large feature cards */}
        <Reveal className="mt-10 grid gap-5 md:mt-16 md:grid-cols-2">
          {features.map((f) => {
            const stat = f.statLabel ? stats.find((s) => s.label === f.statLabel) : undefined;
            return (
              <figure key={f.name} className="flex flex-col justify-between gap-8 rounded-[28px] bg-[#f3f6fa] p-6 sm:min-h-[22rem] sm:gap-10 sm:p-7 md:p-10">
                <div>
                  {stat && (
                    <>
                      <p className="text-5xl font-semibold leading-none tracking-tight text-brand sm:text-6xl md:text-7xl"><CountUp stat={stat} /></p>
                      <p className="mt-3 text-sm text-ink/60">{t(stat.label)}</p>
                    </>
                  )}
                  <blockquote className="mt-6 font-quote text-lg italic sm:mt-8 leading-relaxed text-ink/85 md:text-xl">“{f.quote}”</blockquote>
                </div>
                <Speaker item={f} />
              </figure>
            );
          })}
        </Reveal>

        {/* sliding row of smaller cards */}
        <div className="mt-5">
          <div
            ref={track}
            onScroll={measure}
            role="region"
            aria-label={t("More testimonials")}
            tabIndex={0}
            className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth"
          >
            {slides.map((s) => (
              <figure key={s.name} className="flex shrink-0 basis-full snap-start flex-col justify-between gap-8 rounded-3xl border border-ink/10 bg-white p-6 sm:p-7 md:basis-[calc(50%-10px)]">
                <blockquote className="font-quote text-base italic leading-relaxed text-ink/85 md:text-lg">“{s.quote}”</blockquote>
                <Speaker item={s} />
              </figure>
            ))}
          </div>
          {edge.overflow && (
            <div className="mt-5 flex justify-center gap-3">
              <button type="button" aria-label="Previous testimonial" disabled={edge.start} onClick={() => slide(-1)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 bg-white text-ink hover:bg-brand-light disabled:cursor-not-allowed disabled:opacity-35">
                <Chevron dir="left" />
              </button>
              <button type="button" aria-label="Next testimonial" disabled={edge.end} onClick={() => slide(1)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 bg-white text-ink hover:bg-brand-light disabled:cursor-not-allowed disabled:opacity-35">
                <Chevron dir="right" />
              </button>
            </div>
          )}
        </div>

        {/* summary bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-6 rounded-[28px] bg-[#f3f6fa] px-6 py-6 text-center md:flex-row md:px-10 md:text-left">
          <p className="flex flex-col items-center gap-1 md:flex-row md:gap-4">
            {total && <strong className="text-3xl font-semibold tracking-tight text-brand md:text-4xl"><CountUp stat={total} /></strong>}
            <span className="max-w-xs text-sm text-ink/65 md:text-base">{t("people reached through our programmes")}</span>
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/news" className="btn border border-ink/15 bg-white text-ink">{t("Read more stories")}</Link>
            <Link to="/donate" className="btn btn-primary">{t("Support our work")}</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
