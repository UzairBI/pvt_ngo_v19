import { useEffect, useState } from "react";
import { useInView } from "../hooks/useInView";
import type { Stat } from "../data/content";

/** Counts from 0 to the stat value when scrolled into view. Text-only stats are shown as-is. */
export default function CountUp({ stat }: { stat: Stat }) {
  const [ref, seen] = useInView<HTMLSpanElement>(0.4);
  const [n, setN] = useState(0);
  const target = stat.value ?? 0;
  useEffect(() => {
    if (!seen || stat.value === undefined || stat.plain) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setN(target); return; }
    const start = performance.now(), dur = 1600;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min((t - start) / dur, 1);
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, target, stat.value, stat.plain]);

  if (stat.value === undefined) return <span ref={ref}>{stat.text}</span>;
  if (stat.plain) return <span ref={ref}>{stat.value}{stat.suffix}</span>;
  return <span ref={ref}>{(seen ? n : 0).toLocaleString("en-IN")}{stat.suffix}</span>;
}
