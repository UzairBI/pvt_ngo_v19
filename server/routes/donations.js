import { db, eq } from "../db.js";
import { httpError, readJson } from "../http.js";
import { renderReceipt, receiptNo, taxEligibility } from "../receipt.js";
import { sendMail } from "../mailer.js";
import { num, str, need, oneOf, isDate, isEmail, id } from "../util.js";

const STATUSES = ["pending", "success", "failed", "refunded", "cancelled"];
const decorate = (d) => ({ ...d, receipt_no: receiptNo(d, false), tax: taxEligibility(d) });

function fields(b, partial = false) {
  const out = {
    donor_name: str(b.donor_name, 120), donor_email: str(b.donor_email, 160), donor_phone: str(b.donor_phone, 30),
    donor_pan: str(b.donor_pan, 10)?.toUpperCase() ?? null, donor_address: str(b.donor_address, 300),
    purpose: str(b.purpose, 160), reference: str(b.reference, 120), notes: str(b.notes, 500), method: str(b.method, 40)
  };
  if (!isEmail(out.donor_email)) throw httpError(400, "Donor email looks invalid");
  if (out.donor_pan && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(out.donor_pan)) throw httpError(400, "PAN must look like ABCDE1234F");
  if (!partial || b.amount !== undefined) { out.amount = num(b.amount); if (out.amount <= 0) throw httpError(400, "Amount must be above 0"); }
  if (!partial || b.donated_at) out.donated_at = isDate(b.donated_at, "Donation date");
  if (!partial || b.status) out.status = oneOf(b.status || "success", STATUSES, "status");
  if (!partial || b.mode) out.mode = oneOf(b.mode || "offline", ["online", "offline"], "mode");
  if (b.currency) out.currency = need(b.currency, "Currency", 3).toUpperCase();
  // partial update (e.g. only the status): keep every field that was not sent, instead of blanking it
  if (partial) for (const k of Object.keys(out)) if (b[k] === undefined) delete out[k];
  return out;
}
const loadOne = async (rid) => { const d = (await db.select("donations", `id=${eq(id(rid))}`))[0]; if (!d) throw httpError(404, "Donation not found"); return d; };

async function receiptEmail(d, tax) {
  if (!d.donor_email) throw httpError(400, "This donation has no donor email");
  const isTax = tax && taxEligibility(d).ok;
  if (tax && !isTax) throw httpError(400, taxEligibility(d).reason);
  await sendMail({ to: d.donor_email, subject: `${isTax ? "Tax receipt" : "Donation receipt"} ${receiptNo(d, isTax)}`, text: "Thank you for your donation. Your receipt is below.", html: renderReceipt(d, { tax: isTax }) });
  await db.update("donations", `id=${eq(d.id)}`, { receipt_sent_at: new Date().toISOString(), ...(isTax ? { tax_receipt_issued_at: new Date().toISOString() } : {}) });
}

export default [
  ["GET", "/api/donations", async ({ url }) => {
    const p = url.searchParams, f = ["select=*", "order=donated_at.desc,id.desc", "limit=5000"];
    if (p.get("status")) f.push(`status=${eq(oneOf(p.get("status"), STATUSES, "status"))}`);
    if (p.get("mode")) f.push(`mode=${eq(oneOf(p.get("mode"), ["online", "offline"], "mode"))}`);
    const q = (p.get("q") || "").replace(/[(),*%\\]/g, "").slice(0, 60);
    if (q) f.push(`or=(${["donor_name", "donor_email", "reference", "gateway_payment_id", "purpose"].map((c) => `${c}.ilike.*${encodeURIComponent(q)}*`).join(",")})`);
    return (await db.select("donations", f.join("&"))).map(decorate);
  }],
  ["POST", "/api/donations", async ({ req }) => decorate(await db.insert("donations", fields(await readJson(req))))],
  ["PATCH", "/api/donations/:id", async ({ req, params }) => decorate(await db.update("donations", `id=${eq(id(params.id))}`, fields(await readJson(req), true)))],
  ["GET", "/api/donations.csv", async () => {
    const rows = await db.selectAll("donations", "select=*&order=donated_at.asc,id.asc");
    const cols = ["receipt_no", "donated_at", "mode", "method", "status", "amount", "currency", "donor_name", "donor_email", "donor_pan", "purpose", "reference", "gateway_payment_id"];
    const cell = (v) => { let s = String(v ?? ""); if (/^[=+\-@]/.test(s)) s = "'" + s; return `"${s.replace(/"/g, '""')}"`; }; // blocks spreadsheet formula injection
    return { raw: { status: 200, headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="donations.csv"' }, body: [cols.join(","), ...rows.map((r) => cols.map((c) => cell(c === "receipt_no" ? receiptNo(r) : r[c])).join(","))].join("\n") } };
  }],
  ["GET", "/api/donations/:id/receipt", async ({ url, params }) => {
    const d = await loadOne(params.id), tax = url.searchParams.get("type") === "tax";
    return { raw: { status: 200, headers: { "Content-Type": "text/html; charset=utf-8", "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; script-src 'self'; frame-ancestors 'none'" }, body: renderReceipt(d, { tax, forPage: true }) } };
  }],
  ["POST", "/api/donations/:id/send-receipt", async ({ req, params }) => {
    const b = await readJson(req); await receiptEmail(await loadOne(params.id), b.type === "tax"); return { ok: true };
  }]
];
