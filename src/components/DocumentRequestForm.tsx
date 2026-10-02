import { FormEvent, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { legalIds } from "../data/site";
import { submitForm } from "../lib/forms";
import { useLang } from "../i18n/LangContext";

type ReqType = "certificate" | "audit";

/** Options for "Certificate type". Built from the registrations listed in src/data/site.ts, plus two extras. */
const certificateTypes = [
  ...legalIds.map((l) => l.title),
  "Organisation profile (all registrations & tax details)",
  "Other certificate (describe in the message)"
];
const auditTypes = [
  "Audited financial statements (Balance Sheet + Income & Expenditure)",
  "Statutory auditor's report",
  "Audit report under the Income Tax Act (Form 10B)",
  "Receipts & Payments account",
  "Utilisation certificate",
  "FCRA annual return (FC-4) and audit statements",
  "CSR project-wise utilisation report",
  "Income Tax Return acknowledgement",
  "Other audit document (describe in the message)"
];
const purposes = ["Donor due diligence", "CSR partner verification", "Government / regulatory requirement", "Bank / KYC", "Research / media", "Other"];
const deliveries = ["PDF by email", "Certified hard copy by post / courier"];

/** Last 12 completed financial years (India: April to March), newest first. */
function financialYears() {
  const now = new Date();
  const currentStart = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1; // FY in progress
  const list: string[] = [];
  for (let y = currentStart - 1; y > currentStart - 13; y--) list.push(`FY ${y}-${String(y + 1).slice(2)}`);
  return list;
}

const field = "mt-1 w-full rounded-md border bg-white px-3 py-2 focus:border-brand focus:outline-none focus:ring-2 focus:ring-sky/40";
const makeRef = () => `REQ-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

export default function DocumentRequestForm() {
  const { t } = useLang();
  const [params] = useSearchParams();
  const [type, setType] = useState<ReqType>("certificate");
  const [docType, setDocType] = useState(certificateTypes[0]);
  const [delivery, setDelivery] = useState(deliveries[0]);
  const [state, setState] = useState<"idle" | "sending" | "sent" | "mailto" | "error">("idle");
  const [ref, setRef] = useState("");
  const years = useMemo(financialYears, []);
  const options = type === "audit" ? auditTypes : certificateTypes;

  const choose = (next: ReqType) => { setType(next); setDocType((next === "audit" ? auditTypes : certificateTypes)[0]); };
  // /transparency?request=audit  or  ?request=certificate  pre-selects the tab
  useEffect(() => {
    const q = params.get("request");
    if (q === "audit" || q === "certificate") choose(q);
  }, [params]);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    if (fd.get("website")) return; // spam trap
    const reference = makeRef();
    const g = (k: string) => String(fd.get(k) ?? "").trim();
    const data: Record<string, string> = {
      reference, request_type: type === "audit" ? "Audit report" : "Certificate", document_type: docType,
      financial_year: type === "audit" ? g("financial_year") : "", delivery, delivery_address: delivery === deliveries[0] ? "" : g("delivery_address"),
      name: g("name"), organisation: g("organisation"), email: g("email"), phone: g("phone"), purpose: g("purpose"), message: g("message")
    };
    setState("sending");
    try {
      let finalRef = reference; // the server may issue a different number if this one is already taken
      const r = await submitForm(`Document request: ${data.request_type}`, data, { table: "document_requests", onSaved: (reply) => { if (reply.reference) finalRef = reply.reference; } });
      setRef(finalRef); setState(r);
      if (r === "sent") form.reset();
    } catch { setState("error"); }
  };

  if (state === "sent" || state === "mailto") {
    return (
      <div role="status" className="rounded-2xl border-2 border-brand bg-white p-6 text-center shadow-sm sm:p-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand text-2xl text-white">✓</div>
        <h3 className="mt-4 font-serif text-2xl font-bold text-brand-dark">{state === "sent" ? "Request submitted" : "Almost done"}</h3>
        <p className="mt-2 text-ink/75">{state === "sent"
          ? "Thank you. Our team will review your request and reply on the email or phone number you gave."
          : "Your email app should have opened with the request ready. Press Send there to finish."}</p>
        <p className="mt-4 text-sm text-ink/60">Your reference number</p>
        <p className="font-mono text-xl font-bold text-brand-dark">{ref}</p>
        <p className="mt-1 text-xs text-ink/60">Please quote it if you contact us about this request.</p>
        <button type="button" className="btn btn-brand mt-6" onClick={() => setState("idle")}>Make another request</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5 rounded-2xl border bg-white p-5 shadow-sm sm:p-6 md:p-8">
      <fieldset className="min-w-0">
        <legend className="text-sm font-semibold">{t("What do you need?")}</legend>
        <div role="radiogroup" className="mt-2 grid grid-cols-2 gap-1 rounded-2xl bg-brand-light p-1 sm:gap-2 sm:rounded-full">
          {([["certificate", "Certificate / registration"], ["audit", "Audit report"]] as const).map(([v, label]) => (
            <button key={v} type="button" role="radio" aria-checked={type === v} onClick={() => choose(v)}
              className={`rounded-xl px-2 py-2.5 text-[13px] font-semibold leading-tight transition sm:rounded-full sm:px-4 sm:text-sm ${type === v ? "bg-brand text-white shadow" : "text-brand-dark hover:bg-white"}`}>{t(label)}</button>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className={type === "audit" ? "" : "sm:col-span-2"}>
          <label htmlFor="dr-doc" className="text-sm font-medium">{type === "audit" ? t("Audit type") : t("Certificate type")} *</label>
          <select id="dr-doc" value={docType} onChange={(e) => setDocType(e.target.value)} required className={field}>{options.map((o) => <option key={o}>{o}</option>)}</select>
        </div>
        {type === "audit" && (
          <div>
            <label htmlFor="dr-fy" className="text-sm font-medium">{t("Financial year")} *</label>
            <select id="dr-fy" name="financial_year" required className={field}><option>All available years</option>{years.map((y) => <option key={y}>{y}</option>)}</select>
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div><label htmlFor="dr-name" className="text-sm font-medium">{t("Full name")} *</label><input id="dr-name" name="name" required autoComplete="name" className={field} /></div>
        <div><label htmlFor="dr-org" className="text-sm font-medium">{t("Organisation")}</label><input id="dr-org" name="organisation" autoComplete="organization" className={field} placeholder="Company / foundation / bank (optional)" /></div>
        <div><label htmlFor="dr-email" className="text-sm font-medium">{t("Email")} *</label><input id="dr-email" name="email" type="email" required autoComplete="email" className={field} /></div>
        <div><label htmlFor="dr-phone" className="text-sm font-medium">{t("Phone")} *</label><input id="dr-phone" name="phone" type="tel" required autoComplete="tel" className={field} /></div>
        <div><label htmlFor="dr-purpose" className="text-sm font-medium">{t("Purpose of request")} *</label><select id="dr-purpose" name="purpose" required className={field}>{purposes.map((p) => <option key={p}>{p}</option>)}</select></div>
        <div><label htmlFor="dr-delivery" className="text-sm font-medium">{t("Preferred delivery")}</label><select id="dr-delivery" value={delivery} onChange={(e) => setDelivery(e.target.value)} className={field}>{deliveries.map((d) => <option key={d}>{d}</option>)}</select></div>
      </div>
      {delivery !== deliveries[0] && (
        <div><label htmlFor="dr-addr" className="text-sm font-medium">{t("Postal address")} *</label><textarea id="dr-addr" name="delivery_address" required rows={2} className={field} /></div>
      )}
      <div><label htmlFor="dr-msg" className="text-sm font-medium">{t("Message")}</label><textarea id="dr-msg" name="message" rows={3} className={field} placeholder="Anything we should know, for example the exact document or deadline" /></div>

      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      <label className="flex items-start gap-2 text-xs text-ink/70">
        <input type="checkbox" required className="mt-0.5 h-4 w-4 shrink-0" />
        <span>I agree that my details may be used only to process this request, as described in the DPDP Compliance Notice.</span>
      </label>
      <button className="btn btn-primary w-full !py-3.5 text-base disabled:opacity-60" type="submit" disabled={state === "sending"}>{state === "sending" ? "Submitting…" : t("Submit Request")}</button>
      <div role="status" aria-live="polite" className="text-sm">{state === "error" && <p className="text-red-700">Sorry, the request could not be sent. Please try again or write to us by email.</p>}</div>
    </form>
  );
}
