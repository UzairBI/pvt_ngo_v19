import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { nav } from "../data/navigation";
import { site } from "../data/site";
import { useLang } from "../i18n/LangContext";
import DonateButton from "./DonateButton";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [sub, setSub] = useState<string | null>(null);
  const { pathname } = useLocation();
  const { t } = useLang();
  useEffect(() => { setOpen(false); setSub(null); }, [pathname]);

  return (
    <header className="sticky top-0 z-40 bg-white/95 shadow-[0_6px_24px_-12px_rgba(11,79,156,.25)] backdrop-blur">
      <div className="container-site flex h-16 items-center justify-between sm:h-20 lg:h-[88px]">
        <Link to="/" aria-label={`${site.name} home`} className="flex shrink-0 items-center">
          <img src="/assets/images/logo.png" alt={`${site.name} logo`} className="h-12 w-auto max-w-[200px] object-contain sm:h-14 sm:max-w-[240px] md:h-16" />
        </Link>

        <nav aria-label="Main" className="hidden min-w-0 flex-1 items-center justify-between gap-3 pl-4 lg:flex xl:gap-4 xl:pl-10">
          <div className="flex flex-1 items-center justify-center gap-0.5 xl:gap-1.5">
            {nav.map((item) => (
              <div key={item.label} className="group relative">
                <NavLink to={item.href} end={item.href === "/"} className={({ isActive }) =>
                  `block whitespace-nowrap rounded-md px-2 py-2.5 text-[13px] font-medium transition-colors hover:text-brand xl:px-3.5 xl:text-[15px] xl:tracking-[0.01em] ${isActive ? "text-brand shadow-[inset_0_-2px_0_#1479d1]" : "text-ink"}`}>
                  {t(item.label)}{item.children && <span aria-hidden="true"> ▾</span>}
                </NavLink>
                {item.children && (
                  <div className="invisible absolute left-0 top-full min-w-[230px] rounded-lg border bg-white py-2 opacity-0 shadow-lg transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                    {item.children.map((c) => (
                      <Link key={c.href} to={c.href} className="block px-4 py-2 text-sm hover:bg-brand-light hover:text-brand-dark">{t(c.label)}</Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <DonateButton to="/donate" size="sm" className="shrink-0">{t("Donate")}</DonateButton>
        </nav>

        <button className="-mr-2 flex h-11 w-11 items-center justify-center rounded-md lg:hidden" aria-label="Toggle menu" aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen(!open)}>
          <span className="block text-2xl leading-none">{open ? "✕" : "☰"}</span>
        </button>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain border-t bg-white sm:max-h-[calc(100dvh-5rem)] lg:hidden">
          {nav.map((item) => (
            <div key={item.label} className="border-b">
              <div className="flex items-center justify-between">
                <Link to={item.href} className="flex-1 px-4 py-3.5 text-[15px] font-medium">{t(item.label)}</Link>
                {item.children && (
                  <button className="h-12 w-14 text-xl" aria-label={`Expand ${item.label}`} aria-expanded={sub === item.label}
                    onClick={() => setSub(sub === item.label ? null : item.label)}>{sub === item.label ? "−" : "+"}</button>
                )}
              </div>
              {item.children && sub === item.label && (
                <div className="bg-brand-light">
                  {item.children.map((c) => <Link key={c.href} to={c.href} className="block px-8 py-3 text-sm">{t(c.label)}</Link>)}
                </div>
              )}
            </div>
          ))}
          <div className="p-4"><DonateButton to="/donate" full>{t("Donate")}</DonateButton></div>
        </nav>
      )}
    </header>
  );
}
