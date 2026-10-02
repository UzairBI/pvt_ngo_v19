import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { nav } from "../data/navigation";
import { site } from "../data/site";
import { useLang } from "../i18n/LangContext";
import DonateButton from "./DonateButton";

/**
 * Floating "glass" navigation pill. The header itself takes no space (h-0): the pill floats over the top of the
 * page, so the hero photo shows through it. The glass layer is blurred and its left / right ends fade out
 * (see .nav-glass in index.css). Pages that start with a photo leave room for it at the top.
 */
export default function Header() {
  const [open, setOpen] = useState(false);
  const [sub, setSub] = useState<string | null>(null);
  const { pathname } = useLocation();
  const { t } = useLang();
  useEffect(() => { setOpen(false); setSub(null); }, [pathname]);

  return (
    <header className="sticky top-0 z-40 h-0">
      <div className="container-site absolute inset-x-0 top-3 sm:top-4">
        <div className="relative flex h-14 items-center justify-between px-6 sm:h-16 sm:px-9 lg:px-9">
          <div aria-hidden="true" className="nav-glass absolute inset-0 -z-10 rounded-full" />

          <Link to="/" aria-label={`${site.name} home`} className="flex shrink-0 items-center">
            <img src="/assets/images/logo.png" alt={`${site.name} logo`} className="h-10 w-auto max-w-[170px] object-contain sm:h-12 sm:max-w-[200px] lg:h-10 xl:h-12" />
          </Link>

          <nav aria-label="Main" className="hidden min-w-0 flex-1 items-center justify-between gap-1 pl-2 lg:flex xl:gap-4 xl:pl-8">
            <div className="flex flex-1 items-center justify-center gap-0.5 xl:gap-1.5">
              {nav.map((item) => (
                <div key={item.label} className="group relative">
                  <NavLink to={item.href} end={item.href === "/"} className={({ isActive }) =>
                    `block whitespace-nowrap rounded-full px-2 py-2 text-[12.5px] font-semibold transition-all duration-300 xl:px-4 xl:py-2.5 xl:text-[15px] ${isActive
                      ? "bg-brand text-white shadow-md shadow-brand/40"
                      : "text-ink hover:bg-white/70 hover:text-brand-dark hover:shadow-sm group-hover:bg-white/70 group-hover:text-brand-dark"}`}>
                    {t(item.label)}{item.children && <span aria-hidden="true" className="ml-0.5 inline-block text-[10px] transition-transform duration-300 group-hover:rotate-180"> ▾</span>}
                  </NavLink>
                  {item.children && (
                    <div className="invisible absolute left-1/2 top-full min-w-[240px] -translate-x-1/2 translate-y-1 pt-4 opacity-0 transition duration-200 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                      <div className="overflow-hidden rounded-2xl border border-white/60 bg-white/90 py-2 shadow-xl shadow-brand-dark/20 backdrop-blur-xl">
                        {item.children.map((c) => (
                          <Link key={c.href} to={c.href} className="block px-5 py-2 text-sm text-ink transition hover:bg-brand-light hover:pl-6 hover:text-brand-dark">{t(c.label)}</Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <DonateButton to="/donate" size="sm" className="shrink-0">{t("Donate")}</DonateButton>
          </nav>

          <button className="-mr-1 flex h-11 w-11 items-center justify-center rounded-full bg-white/60 lg:hidden" aria-label="Toggle menu" aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen(!open)}>
            <span className="block text-2xl leading-none">{open ? "✕" : "☰"}</span>
          </button>
        </div>

        {open && (
          <nav id="mobile-nav" aria-label="Mobile" className="mt-2 max-h-[calc(100dvh-6rem)] overflow-y-auto overscroll-contain rounded-3xl border border-white/60 bg-white/95 shadow-xl shadow-brand-dark/25 backdrop-blur-xl lg:hidden">
            {nav.map((item) => (
              <div key={item.label} className="border-b last:border-b-0">
                <div className="flex items-center justify-between">
                  <Link to={item.href} className="flex-1 px-5 py-3.5 text-[15px] font-medium">{t(item.label)}</Link>
                  {item.children && (
                    <button className="h-12 w-14 text-xl" aria-label={`Expand ${item.label}`} aria-expanded={sub === item.label}
                      onClick={() => setSub(sub === item.label ? null : item.label)}>{sub === item.label ? "−" : "+"}</button>
                  )}
                </div>
                {item.children && sub === item.label && (
                  <div className="bg-brand-light">
                    {item.children.map((c) => <Link key={c.href} to={c.href} className="block px-9 py-3 text-sm">{t(c.label)}</Link>)}
                  </div>
                )}
              </div>
            ))}
            <div className="p-4"><DonateButton to="/donate" full>{t("Donate")}</DonateButton></div>
          </nav>
        )}
      </div>
    </header>
  );
}
