import { site } from "../data/site";
import { ticker } from "../data/content";
import LanguageToggle from "./LanguageToggle";
import { useLang } from "../i18n/LangContext";
export default function TopBar() {
  const { t } = useLang();
  return (
    <div className="border-b border-sky-200 bg-gradient-to-r from-[#dff1ff] via-[#eaf6ff] to-[#dff1ff] text-xs text-brand-dark">
      <div className="container-site flex items-center gap-4 py-2">
        <span className="hidden shrink-0 font-semibold uppercase tracking-wider sm:inline">● {t("Live Impact")}</span>
        <div className="relative flex-1 overflow-hidden" aria-label="Live impact summary">
          <div className="animate-ticker flex w-max whitespace-nowrap">
            <span className="pr-12">{ticker}</span><span className="pr-12" aria-hidden="true">{ticker}</span>
          </div>
        </div>
        <span className="hidden shrink-0 text-brand-dark/70 lg:inline">{site.taxNotice}</span>
        <a href={site.phoneHref} className="hidden shrink-0 font-semibold hover:underline md:inline">{site.phone}</a>
        <LanguageToggle />
        <a href={site.whatsappHref} target="_blank" rel="noreferrer" className="shrink-0 rounded-full bg-green-500 px-3 py-1 font-semibold text-white transition hover:scale-105 hover:shadow-lg hover:shadow-green-500/40">WhatsApp</a>
      </div>
    </div>
  );
}
