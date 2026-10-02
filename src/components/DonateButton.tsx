import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";

interface Props {
  /** internal page, e.g. "/donate?amount=500" */ to?: string;
  /** external link (UPI, Razorpay page ...) */ href?: string;
  type?: "button" | "submit"; disabled?: boolean;
  variant?: "solid" | "outline"; size?: "sm" | "md" | "lg"; full?: boolean;
  icon?: "heart" | "thumb"; className?: string; children: ReactNode;
}

const Heart = () => (
  <svg viewBox="0 0 24 24" className="dbtn-svg" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
);
const Thumb = () => (
  <svg viewBox="0 0 24 24" className="dbtn-svg" aria-hidden="true"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" /></svg>
);
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Donation button: a heart (or thumb) badge that tilts and fills on hover, and pops with a ring
 * and a burst of dots when clicked. Links wait ~0.45 s so the click animation is seen before the page changes.
 */
export default function DonateButton({ to, href, type = "button", disabled, variant = "solid", size = "md", full, icon = "heart", className = "", children }: Props) {
  const nav = useNavigate();
  const [burst, setBurst] = useState(false);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);
  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)); };
  const play = () => { if (reduced()) return; setBurst(false); later(() => setBurst(true), 10); later(() => setBurst(false), 950); };

  const cls = `dbtn dbtn-${variant} dbtn-${size} ${full ? "w-full" : ""} ${burst ? "is-burst" : ""} ${className}`;
  const inner = (
    <>
      <span className="dbtn-ico">
        {icon === "thumb" ? <Thumb /> : <Heart />}
        <span className="dbtn-burst" aria-hidden="true">{Array.from({ length: 8 }, (_, i) => <i key={i} style={{ "--a": `${i * 45}deg` } as CSSProperties} />)}</span>
      </span>
      <span className="dbtn-label">{children}</span>
    </>
  );

  if (to) {
    return (
      <Link to={to} className={cls} onClick={(e) => {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || reduced()) return;
        e.preventDefault(); play(); later(() => nav(to), 450);
      }}>{inner}</Link>
    );
  }
  if (href) {
    const ext = /^https?:/.test(href);
    return <a href={href} className={cls} onClick={play} {...(ext ? { target: "_blank", rel: "noreferrer" } : {})}>{inner}</a>;
  }
  return <button type={type} disabled={disabled} className={cls} onClick={play}>{inner}</button>;
}
