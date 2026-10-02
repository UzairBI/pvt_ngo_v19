import { Link } from "react-router-dom";
import { ways, csrReadiness } from "../data/content";
import { reg12A, reg80G, fcraReg, darpanId, legalIds } from "../data/site";
import { useTitle } from "../hooks/useTitle";
import { useLang } from "../i18n/LangContext";
import PageHero from "../components/PageHero";
import SmartForm from "../components/SmartForm";
export default function GetInvolved() {
  const { t } = useLang();
  useTitle("Get Involved");
  return (
    <>
      <PageHero eyebrow={t("Get Involved")} title="Volunteer & CSR Partnerships" text="Whether you donate, volunteer, partner via corporate CSR, or sponsor a cause, your involvement reaches lives directly." />
      <section className="container-site grid gap-5 py-16 sm:grid-cols-2 lg:grid-cols-4">
        {ways.map((w) => <Link key={w.title} to={w.href} className="rounded-2xl border p-6 hover:shadow-lg"><h2 className="font-serif text-lg font-bold text-brand-dark">{w.title}</h2><p className="mt-2 text-sm text-ink/70">{w.text}</p><span className="mt-3 inline-block text-sm font-semibold text-brand">{w.cta} →</span></Link>)}
      </section>
      <section id="csr-readiness" className="bg-brand-light py-14">
        <div className="container-site">
          <p className="eyebrow">{t("CSR & Donor Readiness")}</p>
          <h2 className="h2 mt-2">Compliance-ready for corporate, foundation and international partners</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[["12A", reg12A.value], ["80G", reg80G.value], ["FCRA", fcraReg.value], ["CSR-1", legalIds.find((l) => l.title.startsWith("CSR"))!.value], ["NGO Darpan", darpanId], ["UEI (SAM.gov)", legalIds.find((l) => l.title.startsWith("Unique"))!.value]].map(([k, v]) => (
              <div key={k} className="rounded-xl bg-white px-4 py-3"><p className="text-xs text-ink/60">{k}</p><p className="break-all font-mono text-sm font-semibold text-brand-dark">{v}</p></div>
            ))}
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {csrReadiness.map(([k, v]) => <div key={k} className="rounded-2xl bg-white p-5"><h3 className="font-semibold">{k}</h3><p className="mt-1 text-sm text-ink/70">{v}</p></div>)}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/transparency?request=certificate#request" className="btn btn-brand">View registrations &amp; certificates</Link>
            <a href="/documents/SJKS-Impact-Report-2004-2025.pdf" target="_blank" rel="noreferrer" className="btn border-2 border-brand text-brand">Impact Report 2004–2025 (PDF)</a>
          </div>
        </div>
      </section>
      <section className="container-site grid gap-8 py-16 lg:grid-cols-2">
        <div id="volunteer" className="rounded-2xl border p-6">
          <h2 className="font-serif text-2xl font-bold">{t("Volunteer with us")}</h2>
          <p className="mb-4 mt-1 text-sm text-ink/70">Tell us how you would like to help and our team will contact you.</p>
          <SmartForm kind="Volunteer sign-up" submitLabel="Volunteer with us" table="volunteers"
            fields={[{ name: "name", label: "Full name", required: true }, { name: "phone", label: "Phone", type: "tel", required: true }, { name: "email", label: "Email", type: "email" },
              { name: "area", label: "Area of interest", type: "select", options: ["Child education", "Health camps", "Women empowerment", "Tree plantation", "Relief drives", "Anywhere needed"] },
              { name: "message", label: "Message", type: "textarea" }]} />
        </div>
        <div id="csr" className="rounded-2xl border p-6">
          <h2 className="font-serif text-2xl font-bold">Corporate CSR enquiry</h2>
          <p className="mb-4 mt-1 text-sm text-ink/70">Partner with us for verified, reportable impact.</p>
          <SmartForm kind="CSR enquiry" submitLabel="Send enquiry"
            fields={[{ name: "company", label: "Company name", required: true }, { name: "name", label: "Contact person", required: true }, { name: "email", label: "Email", type: "email", required: true },
              { name: "phone", label: "Phone", type: "tel" }, { name: "message", label: "How would you like to partner?", type: "textarea" }]} />
        </div>
      </section>
    </>
  );
}
