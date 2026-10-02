import { site } from "../data/site";
import { useTitle } from "../hooks/useTitle";
import { useLang } from "../i18n/LangContext";
import PageHero from "../components/PageHero";
import { contactImages } from "../data/slideshows";
import SmartForm from "../components/SmartForm";
import WorkMap from "../components/WorkMap";
export default function Contact() {
  const { t } = useLang();
  useTitle("Contact Us");
  return (
    <>
      <PageHero images={contactImages} eyebrow={t("Contact Us")} title="Contact Us & Field Office" />
      <section className="container-site grid gap-10 py-12 md:grid-cols-2 md:py-16">
        <div className="min-w-0">
          <h2 className="h2">{t("Field Office & Contact")}</h2>
          <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-ink/60">Head office</p>
          <p>{site.address}</p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-ink/60">Registered office</p>
          <p>{site.registeredOffice}</p>
          <p className="mt-4"><a className="text-brand" href={site.phoneHref}>Phone: {site.phone}</a>{site.altPhones.map((p) => <span key={p.href}> · <a className="text-brand" href={p.href}>{p.label}</a></span>)}</p>
          <p><a className="text-brand" href={`mailto:${site.email}`}>Email: {site.email}</a></p>
          <p className="text-sm text-ink/70">Alternate: {site.altEmails.map((e, i) => <span key={e}>{i > 0 && " · "}<a className="text-brand" href={`mailto:${e}`}>{e}</a></span>)}</p>
          <p className="mt-2 text-sm text-ink/70">Chairman: {site.chairman} · Fax: {site.fax} · Web: {site.website}</p>
          <p className="mt-2">Office Hours: {site.officeHours}</p>
        </div>
        <SmartForm kind="Contact message" submitLabel="Send Message" className="rounded-2xl border p-5 sm:p-6"
          fields={[{ name: "name", label: "Name", required: true }, { name: "email", label: "Email", type: "email", required: true },
            { name: "phone", label: "Phone", type: "tel" }, { name: "message", label: "Message", type: "textarea", required: true }]} />
      </section>
      <section className="container-site pb-16"><WorkMap /></section>
    </>
  );
}
