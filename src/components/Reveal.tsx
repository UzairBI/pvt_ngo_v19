import type { ReactNode } from "react";
import { useInView } from "../hooks/useInView";
/** Fades + slides its children in when scrolled into view. */
export default function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const [ref, seen] = useInView<HTMLDivElement>();
  return <div ref={ref} style={{ transitionDelay: `${delay}ms` }} className={`reveal ${seen ? "is-visible" : ""} ${className}`}>{children}</div>;
}
