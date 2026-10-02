import { useEffect } from "react";
import { useLocation } from "react-router-dom";
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        const el = document.getElementById(hash.slice(1));
        if (!el) return;
        el.scrollIntoView();
        // gentle slide-in for the section that was linked to
        el.classList.remove("section-enter"); void el.offsetWidth; el.classList.add("section-enter");
        const done = (e: AnimationEvent) => { if (e.target === el) { el.classList.remove("section-enter"); el.removeEventListener("animationend", done); } };
        el.addEventListener("animationend", done);
      }, 50);
    }
    else window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}
