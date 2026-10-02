import { documents, type DocItem } from "../data/documents";
import { site } from "../data/site";
import { useLang } from "../i18n/LangContext";
import { useTitle } from "../hooks/useTitle";
import PageHero from "../components/PageHero";
import { transparencyImages } from "../data/slideshows";
import DocumentRequestForm from "../components/DocumentRequestForm";

function DocCard({ d }: { d: DocItem }) {
  const { t } = useLang();
  return (
    <article className="flex flex-col rounded-2xl border bg-white p-6 shadow-sm">
      <p className="eyebrow">PDF{d.pages ? ` · ${d.pages} pages` : ""} · {d.size}{d.year ? ` · ${d.year}` : ""}</p>
      <h3 className="mt-2 font-serif text-lg font-bold">{d.title}</h3>
      <p className="mt-2 flex-1 text-sm text-ink/70">{d.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <a href={d.file} target="_blank" rel="noreferrer" className="btn btn-brand !px-4 !py-2">{t("View PDF")}</a>
        <a href={d.file} download className="btn border-2 border-brand !px-4 !py-2 text-brand">{t("Download")}</a>
      </div>
    </article>
  );
}

export default function Transparency() {
  const { t } = useLang();
  useTitle("Transparency & Reports");
  const reports = documents.filter((d) => d.section === "reports");
  const steps = [
    ["Choose", "Pick a certificate or an audit report and the exact type you need."],
    ["Tell us who you are", "Add your contact details and the purpose, for example donor or CSR due diligence."],
    ["We reply", "Our team checks the records and sends the document to your email, or by post if you ask for a certified copy."]
  ];
  return (
    <>
      <PageHero images={transparencyImages} eyebrow={t("Transparency & Reports")} title="Transparency & Financial Reports"
        text="Our impact reports are published openly. Audit reports and registration certificates are shared on request, for donors, CSR partners, banks and the community." />

      <section id="annual-reports" className="container-site border-b py-14">
        <p className="eyebrow">{t("Annual Reports")}</p>
        <h2 className="h2 mt-2">Annual & Impact Reports</h2>
        <p className="mt-2 max-w-3xl text-ink/70">The organisation maintains statutory compliance, regular audits and annual reports. Our published impact reports set out what was done, where, for whom and with which partners.</p>
        <div className="mt-8 grid gap-5 md:grid-cols-2">{reports.map((d) => <DocCard key={d.file} d={d} />)}</div>
      </section>

      <section id="request" className="bg-slate-50 py-14">
        <div className="container-site grid items-start gap-10 lg:grid-cols-[1fr_1.35fr]">
          <div className="lg:sticky lg:top-28">
            <p className="eyebrow">{t("Request documents")}</p>
            <h2 className="h2 mt-2">Request an Audit Report or Certificate</h2>
            <p className="mt-3 text-ink/70">Registered on {site.regDate} as a society under the M.P. Societies Registration Act, 1973. Fill in the form and your request goes straight to our records team.</p>
            <ol className="mt-6 space-y-4">
              {steps.map(([title, text], i) => (
                <li key={title} className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand font-bold text-white">{i + 1}</span>
                  <span><strong className="block">{title}</strong><span className="text-sm text-ink/70">{text}</span></span>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-sm text-ink/60">Prefer to talk? Call <a className="font-semibold text-brand" href={site.phoneHref}>{site.phone}</a> or write to <a className="font-semibold text-brand" href={`mailto:${site.email}`}>{site.email}</a>. Availability depends on the records held for the year you ask for.</p>
          </div>
          <DocumentRequestForm />
        </div>
      </section>
    </>
  );
}
