import { useEffect, useMemo, useRef, useState } from "react";
import { INDIA_EDGES, INDIA_NODES, SAGAR_XY } from "../data/indiaMesh";
import { useLang } from "../i18n/LangContext";

const [SX, SY] = SAGAR_XY;
const CX = 320, CY = 300; // centre of the 640x600 map space

/**
 * Scroll steps. Step 0 shows all of India with Sagar beaming; every other step
 * zooms the camera into Sagar and lights up one field location.
 * `zoom` = camera zoom, `x`/`y` = position in map space (Sagar is SAGAR_XY).
 * The three local markers are nudged apart a little so they stay distinguishable.
 * To add another state/city: push a step with its own x/y (and zoom).
 */
const steps = [
  { label: "Sagar, Madhya Pradesh", detail: "Our headquarters and the heart of every field programme", zoom: 1, x: SX, y: SY },
  { label: "Field Office", detail: "Behind TCPC, Khurai Road, Sagar, Madhya Pradesh", zoom: 3.4, x: SX - 16, y: SY + 12 },
  { label: "Khurai Road, Sagar", detail: "Tree plantation drives", zoom: 3.4, x: SX + 6, y: SY - 2 },
  { label: "Sagar district", detail: "Community outreach", zoom: 3.4, x: SX + 22, y: SY - 20 }
];

const SKY = "#38bdf8", GLOW = "#7dd3fc", WHITE = "#e0f2fe";

/** Scroll-driven, animated network map of India. */
export default function IndiaNetworkMap() {
  const { t } = useLang();
  const wrap = useRef<HTMLDivElement>(null);
  const chips = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = wrap.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      const p = total > 0 ? Math.min(0.999, Math.max(0, -r.top / total)) : 0;
      setI(Math.floor(p * steps.length));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, []);

  const goTo = (k: number) => {
    const el = wrap.current;
    if (!el) return;
    const total = el.offsetHeight - window.innerHeight;
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + ((k + 0.5) / steps.length) * total, behavior: "smooth" });
  };

  // phones: the location buttons sit in one swipeable row, so keep the active one in view
  useEffect(() => {
    const row = chips.current, chip = row?.children[i] as HTMLElement | undefined;
    if (!row || !chip || row.scrollWidth <= row.clientWidth) return;
    row.scrollTo({ left: chip.offsetLeft - (row.clientWidth - chip.offsetWidth) / 2, behavior: "smooth" });
  }, [i]);

  const s = steps[i];
  const z = s.zoom;
  const k = 1 / z; // keeps markers a constant on-screen size while the camera zooms
  const camera = `translate(${CX - z * s.x}px, ${CY - z * s.y}px) scale(${z})`;
  const camFix = i === 0 ? `translate(0px, 0px) scale(1)` : camera;

  // Links near the active spot glow.
  const lit = useMemo(() => {
    const set = new Set<number>();
    const r = i === 0 ? 85 : 38;
    INDIA_EDGES.forEach(([a, b], n) => {
      const A = INDIA_NODES[a], B = INDIA_NODES[b];
      if (Math.hypot((A[0] + B[0]) / 2 - s.x, (A[1] + B[1]) / 2 - s.y) < r) set.add(n);
    });
    return set;
  }, [i, s.x, s.y]);

  // Radar-wave delay per node (distance from Sagar) so a ripple travels across India.
  const delays = useMemo(() => INDIA_NODES.map(([x, y]) => (Math.hypot(x - SX, y - SY) / 55).toFixed(2)), []);

  // "Data packets" that travel along the network links.
  const packets = useMemo(() => {
    const out: { d: string; dur: number; begin: number }[] = [];
    for (let n = 0; n < 26; n++) {
      const e = INDIA_EDGES[(n * 37 + 11) % INDIA_EDGES.length];
      const A = INDIA_NODES[e[0]], B = INDIA_NODES[e[1]];
      out.push({ d: `M${A[0]} ${A[1]} L${B[0]} ${B[1]}`, dur: 1.6 + (n % 4) * 0.5, begin: (n * 0.43) % 5 });
    }
    return out;
  }, []);

  const nodeR = 1.9 * Math.pow(k, 0.45);

  return (
    <div ref={wrap} style={{ height: `${steps.length * 65 + 40}vh` }} className="relative">
      <div className="sticky top-16 overflow-hidden rounded-3xl sm:top-20 lg:top-[88px] bg-gradient-to-br from-[#04173a] via-[#0a3d7a] to-[#1479d1] text-white shadow-xl">
        {/* soft moving glow behind the map */}
        <div aria-hidden="true" className="ngo-aurora pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-sky-400/25 blur-3xl" />
        <div aria-hidden="true" className="ngo-aurora pointer-events-none absolute -bottom-28 right-0 h-96 w-96 rounded-full bg-blue-300/20 blur-3xl [animation-delay:-6s]" />

        <div className="relative grid items-center gap-3 p-4 sm:gap-4 sm:p-5 md:grid-cols-2 md:p-10">
          <div className="ngo-float">
            <svg viewBox="0 0 640 600" role="img" aria-label="Animated network map of India with field presence highlighted"
              className="mx-auto max-h-[34vh] w-full sm:max-h-[52vh] md:max-h-[70vh]">
              <defs>
                <radialGradient id="ngoGlow"><stop offset="0" stopColor={SKY} stopOpacity=".95" /><stop offset="1" stopColor={SKY} stopOpacity="0" /></radialGradient>
              </defs>

              {/* camera */}
              <g style={{ transform: camFix, transformOrigin: "0 0", transition: "transform 1.4s cubic-bezier(.65,0,.25,1)" }}>
                {INDIA_EDGES.map(([a, b], n) => {
                  const on = lit.has(n);
                  return (
                    <line key={n} x1={INDIA_NODES[a][0]} y1={INDIA_NODES[a][1]} x2={INDIA_NODES[b][0]} y2={INDIA_NODES[b][1]}
                      vectorEffect="non-scaling-stroke" stroke={on ? WHITE : "#5bc0ff"} strokeOpacity={on ? 0.85 : 0.28}
                      strokeWidth={on ? 1.3 : 0.7} style={{ transition: "stroke-opacity .8s, stroke-width .8s" }} />
                  );
                })}

                {INDIA_NODES.map(([x, y], n) => (
                  <circle key={n} cx={x} cy={y} r={nodeR} fill="#9fdcff" className="ngo-node" style={{ animationDelay: `${delays[n]}s` }} />
                ))}

                {/* packets running along links */}
                <g className="ngo-packets">
                  {packets.map((p, n) => (
                    <circle key={n} r={2.2 * Math.pow(k, 0.5)} fill={WHITE} opacity="0">
                      <animateMotion path={p.d} dur={`${p.dur}s`} begin={`${p.begin}s`} repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.15;.85;1" dur={`${p.dur}s`} begin={`${p.begin}s`} repeatCount="indefinite" />
                    </circle>
                  ))}
                </g>

                {/* radar rings from Sagar (overview) */}
                {i === 0 && [0, 1, 2].map((n) => (
                  <circle key={n} cx={SX} cy={SY} r={10} fill="none" stroke={SKY} strokeWidth={1.5} vectorEffect="non-scaling-stroke"
                    className="ngo-ring" style={{ animationDelay: `${n * 1.2}s` }} />
                ))}

                {/* all location markers (dim) */}
                {steps.slice(1).map((p, n) => n + 1 !== i && (
                  <g key={p.label} transform={`translate(${p.x} ${p.y})`}>
                    <circle r={4.5 * k} fill={SKY} fillOpacity=".6" />
                    <circle r={9 * k} fill="none" stroke={SKY} strokeOpacity=".35" strokeWidth={1 * k} />
                  </g>
                ))}

                {/* active marker */}
                <g transform={`translate(${s.x} ${s.y})`}>
                  <g style={{ transformBox: "fill-box" }}>
                    <circle r={44 * k} fill="url(#ngoGlow)" className="ngo-breathe" />
                    {[0, 1, 2].map((n) => (
                      <circle key={n} r={7 * k} fill="none" stroke={GLOW} strokeWidth={1.6 * k} className="ngo-pulse" style={{ animationDelay: `${n * 0.6}s` }} />
                    ))}
                    <circle r={6 * k} fill={SKY} />
                    <circle r={2.4 * k} fill="#fff" />
                  </g>
                </g>
              </g>
            </svg>
          </div>

          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-sky-300">{t("Where we work")}</p>
            <h3 key={s.label} className="ngo-fade mt-1 font-serif text-xl font-bold sm:mt-2 sm:text-2xl md:text-3xl">{t(s.label)}</h3>
            <p key={s.detail} className="ngo-fade mt-1 text-sm text-white/80 sm:mt-2 sm:text-base">{t(s.detail)}</p>
            <p className="mt-1 hidden text-sm text-white/60 sm:block">Sagar, Madhya Pradesh, India</p>

            <div ref={chips} className="no-scrollbar relative -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 py-1 sm:mx-0 sm:mt-6 sm:flex-wrap sm:overflow-visible sm:p-0" role="tablist" aria-label="Locations">
              {steps.map((p, n) => (
                <button key={p.label} type="button" role="tab" aria-selected={n === i} onClick={() => goTo(n)}
                  className={`btn-light btn-light-sm shrink-0 ${n === i ? "is-active" : ""}`}>{t(p.label)}</button>
              ))}
            </div>

            <div className="mt-3 flex items-center gap-3 sm:mt-5" aria-hidden="true">
              {steps.map((_, n) => (
                <span key={n} className={`h-1.5 rounded-full transition-all duration-500 ${n === i ? "w-10 bg-sky-300" : "w-4 bg-white/30"}`} />
              ))}
            </div>
            <p className="mt-2 text-xs text-white/50 sm:mt-3">{i + 1} / {steps.length} · {t("Scroll to explore")}</p>
          </div>
        </div>
      </div>
      <style>{`
        .ngo-node{opacity:.6}
        .ngo-pulse{transform-box:fill-box;transform-origin:center;animation:ngoPulse 2.2s ease-out infinite}
        .ngo-ring{transform-box:fill-box;transform-origin:center;animation:ngoRing 3.6s ease-out infinite;opacity:0}
        .ngo-breathe{transform-box:fill-box;transform-origin:center;animation:ngoBreathe 2.4s ease-in-out infinite}
        .ngo-fade{animation:ngoFade .5s ease both}
        @media (prefers-reduced-motion:no-preference){
          .ngo-node{animation:ngoWave 6s ease-in-out infinite}
          .ngo-float{animation:ngoFloat 9s ease-in-out infinite}
          .ngo-aurora{animation:ngoAurora 16s ease-in-out infinite}
        }
        @media (prefers-reduced-motion:reduce){.ngo-pulse,.ngo-ring,.ngo-breathe,.ngo-fade{animation:none}.ngo-packets{display:none}}
        @keyframes ngoWave{0%,100%{opacity:.45;fill:#9fdcff}12%{opacity:1;fill:#ffffff}30%{opacity:.6;fill:#9fdcff}}
        @keyframes ngoPulse{0%{transform:scale(1);opacity:.9}100%{transform:scale(5);opacity:0}}
        @keyframes ngoRing{0%{transform:scale(1);opacity:.8}100%{transform:scale(22);opacity:0}}
        @keyframes ngoBreathe{0%,100%{transform:scale(.85);opacity:.7}50%{transform:scale(1.15);opacity:1}}
        @keyframes ngoFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes ngoAurora{0%,100%{transform:translate(0,0)}50%{transform:translate(60px,40px)}}
        @keyframes ngoFade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
      `}</style>
    </div>
  );
}
