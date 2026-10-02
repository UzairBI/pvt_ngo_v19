import { useLang } from "../i18n/LangContext";
/** One EN | HI switch: click (or Space/Enter) to flip between English and Hindi. The highlighted side is the active language. */
export default function LanguageToggle() {
  const { lang, setLang } = useLang();
  const isHi = lang === "hi";
  return (
    <button type="button" role="switch" aria-checked={isHi} aria-label="Hindi language" title={isHi ? "Switch to English" : "हिंदी में बदलें"}
      onClick={() => setLang(isHi ? "en" : "hi")}
      className="relative flex shrink-0 items-center rounded-full border border-brand/30 bg-white/70 p-0.5 text-xs font-semibold">
      <span aria-hidden="true" className={`absolute inset-y-0.5 left-0.5 w-[calc(50%-2px)] rounded-full bg-brand shadow transition-transform duration-300 ease-out motion-reduce:transition-none ${isHi ? "translate-x-full" : "translate-x-0"}`} />
      <span className={`relative z-10 w-8 py-0.5 text-center transition-colors duration-300 ${isHi ? "text-brand-dark/70" : "text-white"}`}>EN</span>
      <span className={`relative z-10 w-8 py-0.5 text-center transition-colors duration-300 ${isHi ? "text-white" : "text-brand-dark/70"}`}>HI</span>
    </button>
  );
}
