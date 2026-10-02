import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { site, societyReg, darpanId, reg12A, reg80G, fcraReg } from "../data/site";
import { submitForm } from "../lib/forms";
import { useLang } from "../i18n/LangContext";
import { quickNav } from "../data/navigation";
import { API_BASE } from "../hooks/useLiveData";
import SocialIcons from "./SocialIcons";

export default function Footer() {
  const [email, setEmail] = useState("");
  const { t } = useLang();
  const [state, setState] = useState<"idle" | "sending" | "sent" | "mailto" | "error">("idle");
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setState("sending");
    try { const r = await submitForm("Newsletter subscription", { email }); setState(r); if (r === "sent") setEmail(""); } catch { setState("error"); }
  };
  return (
    <footer className="bg-ink text-sm text-white/80">
      <div className="container-site grid gap-10 py-12 sm:grid-cols-2 md:py-14 lg:grid-cols-4">
        <div>
          <Link to="/" aria-label={`${site.name} home`} className="inline-block rounded-2xl bg-white px-4 py-3 shadow-lg shadow-black/20 transition hover:scale-[1.03]">
            <img src="/assets/images/logo.png" alt={`${site.name} logo`} className="h-14 w-auto max-w-[230px] object-contain" />
          </Link>
          <p className="mt-3 text-xs">{site.name} · {site.location} · {site.regLine}</p>
          <p className="mt-4">{site.tagline}</p>
          <p className="mt-4 text-xs">Society Reg: {societyReg}</p>
          <p className="text-xs">Darpan ID: {darpanId}</p>
          <p className="text-xs">12A: {reg12A.value} · 80G: {reg80G.value}</p>
          <p className="text-xs">FCRA: {fcraReg.value}</p>
          <p className="text-xs"><Link to="/transparency?request=certificate#request" className="underline hover:text-white">Request registration certificates &amp; audit reports</Link></p>
          <SocialIcons className="mt-5" />
        </div>
        <div>
          <h3 className="mb-3 font-semibold text-white">{t("Quick Navigation")}</h3>
          <ul className="space-y-2">{quickNav.map((l) => <li key={l.href}><Link to={l.href} className="hover:text-white">{t(l.label)}</Link></li>)}</ul>
        </div>
        <div>
          <h3 className="mb-3 font-semibold text-white">{t("Field Office & Contact")}</h3>
          <p>{site.address}</p>
          <p className="mt-2"><a href={site.phoneHref} className="hover:text-white">Phone: {site.phone}</a></p>
          <p><a href={`mailto:${site.email}`} className="hover:text-white">Email: {site.email}</a></p>
          <p className="mt-2">Registered Office: {site.registeredOffice}</p>
          <p className="mt-2">Office Hours: {site.officeHours}</p>
          <p className="mt-2">Chairman: {site.chairman} · Fax: {site.fax}</p>
        </div>
        <div>
          <h3 className="mb-3 font-semibold text-white">{t("Field Updates Newsletter")}</h3>
          <p>Receive monthly impact reports, field stories, and upcoming drive announcements.</p>
          <form onSubmit={submit} className="mt-3 space-y-2">
            <label htmlFor="nl-email" className="text-xs">Email</label>
            <input id="nl-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
              className="w-full rounded-md bg-white/10 px-3 py-2.5 text-white placeholder-white/50" />
            <button className="btn btn-primary w-full disabled:opacity-60" type="submit" disabled={state === "sending"}>{t("Subscribe to Updates")}</button>
            <div role="status" aria-live="polite" className="text-xs">{state === "sent" && <p className="text-green-300">Thank you for subscribing!</p>}{state === "mailto" && <p className="text-green-300">Your email app should open. Press Send to finish.</p>}{state === "error" && <p className="text-red-300">Something went wrong. Please try again.</p>}</div>
          </form>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-site flex flex-col items-center justify-between gap-3 pb-24 pt-4 text-center text-xs md:flex-row md:pb-4 md:pr-24 md:text-left 2xl:pr-6">
          <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
            <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white">Terms of Use</Link>
            <Link to="/dpdp" className="hover:text-white">DPDP Compliance Notice</Link>
            <a href={`${API_BASE}/admin`} rel="nofollow" className="hover:text-white">Admin</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
