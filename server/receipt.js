// Donation receipt + tax certificate (80G / 501(c)(3)) as printable, email-safe HTML. Driven by org.config.json.
import { config } from "./config.js";

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const ones = "Zero One Two Three Four Five Six Seven Eight Nine Ten Eleven Twelve Thirteen Fourteen Fifteen Sixteen Seventeen Eighteen Nineteen".split(" ");
const tens = "_ _ Twenty Thirty Forty Fifty Sixty Seventy Eighty Ninety".split(" ");
const below100 = (n) => (n < 20 ? ones[n] : tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : ""));
const below1000 = (n) => (n >= 100 ? ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + below100(n % 100) : "") : below100(n));
export function rupeesInWords(amount) {
  let n = Math.floor(amount); const paise = Math.round((amount - n) * 100);
  if (n === 0 && !paise) return "Zero Rupees Only";
  const parts = [];
  for (const [div, name] of [[10000000, "Crore"], [100000, "Lakh"], [1000, "Thousand"]]) { const q = Math.floor(n / div); if (q) parts.push(below1000(q) + " " + name); n %= div; }
  if (n) parts.push(below1000(n));
  return `${parts.join(" ")} Rupees${paise ? " and " + below100(paise) + " Paise" : ""} Only`;
}
export const financialYear = (dateStr) => { const d = new Date(dateStr); const y = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1; return `${y}-${String((y + 1) % 100).padStart(2, "0")}`; };
export const receiptNo = (d, tax) => `${config.org.receiptPrefix}/${tax ? "TAX/" : ""}${financialYear(d.donated_at)}/${String(d.seq).padStart(5, "0")}`;

/** Is a tax certificate allowed for this donation? Returns { ok, reason }. */
export function taxEligibility(d) {
  const t = config.org.taxReceipt;
  if (!t.enabled) return { ok: false, reason: "Tax receipts are switched off in server/org.config.json" };
  if (d.status !== "success") return { ok: false, reason: "Only successful donations can get a tax certificate" };
  if (t.type === "80G" && d.currency === "INR" && /cash/i.test(d.method || "") && Number(d.amount) > t.cashLimit)
    return { ok: false, reason: `Cash donations above ₹${t.cashLimit} are not eligible for 80G deduction` };
  return { ok: true, reason: "" };
}

const CSS = `body{font-family:Arial,Helvetica,sans-serif;color:#1d2433;margin:0;background:#f3f5f8}.sheet{max-width:760px;margin:16px auto;background:#fff;border:1px solid #cfd6e2;padding:28px}
h1{font-size:20px;margin:0}h2{font-size:16px;margin:18px 0 6px;text-align:center;text-transform:uppercase;letter-spacing:.04em}.muted{color:#5c6679;font-size:12px}
table{width:100%;border-collapse:collapse;margin-top:10px}td{padding:7px 8px;border:1px solid #d9dfea;font-size:13px;vertical-align:top}td.k{width:34%;background:#f6f8fb;font-weight:bold}
.note{margin-top:14px;font-size:12px;line-height:1.5}.sig{margin-top:40px;text-align:right;font-size:13px}.bar{max-width:760px;margin:12px auto;text-align:right}
.bar button{padding:8px 16px;background:#1479d1;color:#fff;border:0;border-radius:6px;cursor:pointer}@media print{.bar{display:none}body{background:#fff}.sheet{border:0;margin:0}}`;

export function renderReceipt(d, { tax = false, forPage = false } = {}) {
  const o = config.org, t = o.taxReceipt, elig = taxEligibility(d);
  const isTax = tax && elig.ok;
  const row = (k, v) => (v ? `<tr><td class="k">${esc(k)}</td><td>${esc(v)}</td></tr>` : "");
  const amt = d.currency === "INR" ? `₹ ${Number(d.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : `${d.currency} ${Number(d.amount).toFixed(2)}`;
  const statement = !isTax ? "This receipt acknowledges the donation received with thanks."
    : t.type === "501c3" ? `${esc(o.name)} is a tax-exempt organization under Section 501(c)(3)${t.ein ? " (EIN " + esc(t.ein) + ")" : ""}. No goods or services were provided in exchange for this contribution.`
    : `Donation is eligible for deduction under Section 80G of the Income-tax Act, 1961 (Approval/Registration No. ${esc(t.registrationNo)}, valid ${esc(t.validity)}), subject to applicable rules. ${t.section12A ? "Section 12A Reg. No. " + esc(t.section12A) + "." : ""}`;
  const body = `<div class="sheet"><h1>${esc(o.name)}</h1><div class="muted">${esc(o.address)}<br>${esc(o.email)} · ${esc(o.phone)} · PAN ${esc(o.pan)}</div>
<h2>${isTax ? (t.type === "501c3" ? "Donation Tax Receipt" : "Donation Certificate (Section 80G)") : "Donation Receipt"}</h2>
<table>${row("Receipt No.", receiptNo(d, isTax))}${row("Date of donation", d.donated_at)}${row("Received from", d.donor_name || "Well-wisher")}${isTax || d.donor_pan ? row("Donor PAN", d.donor_pan) : ""}${row("Address", d.donor_address)}${row("Email", d.donor_email)}
${row("Amount", amt)}${d.currency === "INR" ? row("Amount in words", rupeesInWords(Number(d.amount))) : ""}${row("Mode of payment", [d.method, d.mode].filter(Boolean).join(" / "))}${row("Payment reference", d.gateway_payment_id || d.reference)}${row("Purpose", d.purpose)}</table>
<p class="note">${statement}</p><div class="sig">For ${esc(o.name)}<br><br>${esc(o.signatory)}</div></div>`;
  return forPage
    ? `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Receipt ${esc(receiptNo(d, isTax))}</title><style>${CSS}</style></head><body><div class="bar"><button id="print">Print / Save as PDF</button></div>${body}<script src="/admin/print.js"></script></body></html>`
    : `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${body}</body></html>`;
}
