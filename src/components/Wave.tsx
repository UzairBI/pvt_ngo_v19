import { useMemo } from "react";

/**
 * Flowing animated wave for the bottom edge of a hero. Three translucent layers drift at different speeds
 * (CSS in index.css). `fill` should match the colour of the section that follows. Pure SVG, no dependencies.
 */
const W = 2880; // two copies of a 1440 tile, so translating by -50% loops seamlessly
const path = (base: number, amp: number, period: number, phase: number) => {
  let d = `M0 120`;
  for (let x = 0; x <= W; x += 40) d += ` L${x} ${(base + amp * Math.sin((2 * Math.PI * x) / period + phase)).toFixed(1)}`;
  return d + ` L${W} 120 Z`;
};
export default function Wave({ fill = "#ffffff", className = "" }: { fill?: string; className?: string }) {
  const layers = useMemo(() => [
    { d: path(52, 16, 1440, 0), o: 0.35, c: "wave-a" },
    { d: path(66, 14, 720, 1.6), o: 0.55, c: "wave-b" },
    { d: path(84, 12, 1440, 3.4), o: 1, c: "wave-c" }
  ], []);
  return (
    <div aria-hidden="true" className={`wave ${className}`}>
      {layers.map((l) => (
        <svg key={l.c} className={`wave-layer ${l.c}`} viewBox={`0 0 ${W} 120`} preserveAspectRatio="none"><path d={l.d} fill={fill} fillOpacity={l.o} /></svg>
      ))}
    </div>
  );
}
