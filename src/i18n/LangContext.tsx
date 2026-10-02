import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { hi } from "./hi";

export type Lang = "en" | "hi";
interface Ctx { lang: Lang; setLang: (l: Lang) => void; t: (en: string) => string }
const LangCtx = createContext<Ctx>({ lang: "en", setLang: () => {}, t: (s) => s });

/** Use t("English text"). If a Hindi entry exists in src/i18n/hi.ts it is shown, otherwise the English text. */
export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try { return localStorage.getItem("lang") === "hi" ? "hi" : "en"; } catch { return "en"; }
  });
  const setLang = (l: Lang) => { setLangState(l); try { localStorage.setItem("lang", l); } catch { /* ignore */ } };
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  const t = (en: string) => (lang === "hi" ? hi[en] ?? en : en);
  return <LangCtx.Provider value={{ lang, setLang, t }}>{children}</LangCtx.Provider>;
}
export const useLang = () => useContext(LangCtx);
