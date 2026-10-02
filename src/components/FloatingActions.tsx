import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { site } from "../data/site";
import { useLang } from "../i18n/LangContext";
import DonateButton from "./DonateButton";

/** WhatsApp button (bottom-right), Donate pill (bottom-left) and a back-to-top button. */
export default function FloatingActions() {
  const { t } = useLang();
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 600);
    on(); window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <>
      {pathname !== "/donate" && (
        <div className={`fixed bottom-4 left-4 z-30 transition duration-300 sm:bottom-5 ${scrolled ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"}`}>
          <DonateButton to="/donate" className="dbtn-float">{t("Donate")}</DonateButton>
        </div>
      )}
      <div className="fixed bottom-4 right-4 z-30 flex flex-col items-end gap-3 sm:bottom-5">
        {scrolled && (
          <button type="button" aria-label={t("Back to top")} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="h-11 w-11 rounded-full bg-ink/80 text-lg text-white shadow-lg hover:bg-ink">↑</button>
        )}
        <a href={site.whatsappHref} target="_blank" rel="noreferrer" aria-label={t("Chat on WhatsApp")}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition hover:scale-110 sm:h-14 sm:w-14">
          <svg viewBox="0 0 32 32" className="h-7 w-7 sm:h-8 sm:w-8" fill="currentColor" aria-hidden="true"><path d="M16.04 3C9.4 3 4 8.4 4 15.03c0 2.12.56 4.19 1.62 6.01L4 28l7.13-1.87a12 12 0 0 0 4.9 1.03h.01C22.65 27.16 28 21.76 28 15.13 28 8.5 22.68 3 16.04 3Zm0 21.97h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.72.98 1-3.62-.24-.37a9.9 9.9 0 0 1-1.52-5.34c0-5.46 4.46-9.9 9.94-9.9 2.65 0 5.14 1.03 7.01 2.9a9.8 9.8 0 0 1 2.9 7.01c0 5.47-4.45 9.93-9.96 9.93Zm5.45-7.43c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" /></svg>
        </a>
      </div>
    </>
  );
}
