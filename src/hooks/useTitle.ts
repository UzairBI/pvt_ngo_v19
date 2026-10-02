import { useEffect } from "react";
import { site } from "../data/site";
const setMeta = (sel: string, value: string) => document.querySelector(sel)?.setAttribute("content", value);
export function useTitle(title?: string, description?: string) {
  useEffect(() => {
    const full = title ? `${title} | ${site.name}` : site.name;
    document.title = full;
    setMeta('meta[property="og:title"]', full);
    if (description) { setMeta('meta[name="description"]', description); setMeta('meta[property="og:description"]', description); }
  }, [title, description]);
}
