// Public POST endpoints used by the website forms (replace the old browser -> Supabase calls).
import crypto from "node:crypto";
import { db, eq } from "../db.js";
import { httpError, readBody } from "../http.js";
import { rateLimit } from "../ratelimit.js";
import { need, str, isEmail, oneOf } from "../util.js";

async function body(req) {
  if (!/^application\/json/i.test(req.headers["content-type"] || "")) throw httpError(415, "Send JSON");
  let b;
  try { b = JSON.parse((await readBody(req, 20_000)).toString("utf8")); } catch (e) { throw e.status ? e : httpError(400, "Invalid JSON"); }
  if (!b || typeof b !== "object" || Array.isArray(b)) throw httpError(400, "Invalid request");
  return b;
}
const phone = (v) => { const s = need(v, "Phone", 30); if (!/^[\d+()\-.\s]{7,30}$/.test(s)) throw httpError(400, "Phone number looks invalid"); return s; };
const email = (v, required) => { const s = required ? need(v, "Email", 160) : str(v, 160); if (!isEmail(s)) throw httpError(400, "Email looks invalid"); return s; };
const newRef = () => `REQ-${new Date().getFullYear()}-${crypto.randomBytes(4).toString("hex").slice(0, 6).toUpperCase()}`;

async function uniqueRef(wanted) {
  let ref = /^REQ-\d{4}-[A-Z0-9]{6}$/.test(wanted || "") ? wanted : newRef();
  while ((await db.select("document_requests", `reference=${eq(ref)}&select=id`)).length) ref = newRef();
  return ref;
}

export default [
  ["POST", "/api/public/document-requests", async ({ req }) => {
    rateLimit(req, "document-requests", { max: 5 });
    const b = await body(req);
    if (b.website) return { ok: true }; // spam trap: pretend success, store nothing
    const delivery = str(b.delivery, 80) || "PDF by email";
    const row = {
      request_type: oneOf(b.request_type, ["Certificate", "Audit report"], "request type"),
      document_type: need(b.document_type, "Document type", 200), financial_year: str(b.financial_year, 40),
      delivery, delivery_address: delivery === "PDF by email" ? null : need(b.delivery_address, "Postal address", 400),
      name: need(b.name, "Name", 120), organisation: str(b.organisation, 160), email: email(b.email, true), phone: phone(b.phone),
      purpose: need(b.purpose, "Purpose", 120), message: str(b.message, 2000), status: "new"
    };
    row.reference = await uniqueRef(String(b.reference || ""));
    await db.insert("document_requests", row);
    return { ok: true, reference: row.reference };
  }],
  ["POST", "/api/public/volunteers", async ({ req }) => {
    rateLimit(req, "volunteers", { max: 5 });
    const b = await body(req);
    if (b.website) return { ok: true };
    await db.insert("volunteers", {
      name: need(b.name, "Name", 120), phone: phone(b.phone), email: email(b.email, false), area: str(b.area, 80), message: str(b.message, 2000), status: "pending"
    });
    return { ok: true };
  }]
];
