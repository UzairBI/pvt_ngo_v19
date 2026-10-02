import fs from "node:fs";
import path from "node:path";
import { config } from "../config.js";
import { db, eq } from "../db.js";
import { httpError, readJson } from "../http.js";
import { saveUpload, safeJoin } from "../files.js";
import { sendMail, mailReady } from "../mailer.js";
import { id, need, oneOf, str } from "../util.js";

const DIR = path.join(config.storageDir, "requests");
const status = (s) => (["sent", "completed"].includes(s) ? s : "new"); // existing table uses "new" = Pending
const label = { new: "Pending", sent: "Sent", completed: "Completed" };
const defaultMessage = (r) => config.org.defaultRequestMessage.replace(/{{(\w+)}}/g, (_, k) => ({ name: r.name || "Sir/Madam", org: config.org.name, reference: r.reference || "", document_type: r.document_type || "the requested document" }[k] ?? ""));
const load = async (rid) => { const r = (await db.select("document_requests", `id=${eq(id(rid))}`))[0]; if (!r) throw httpError(404, "Request not found"); return r; };

export default [
  ["GET", "/api/requests", async ({ url }) => {
    const rows = await db.selectAll("document_requests", "select=*&order=created_at.desc");
    const att = await db.selectAll("request_attachments", "select=request_id");
    const count = att.reduce((m, a) => ((m[a.request_id] = (m[a.request_id] || 0) + 1), m), {});
    const want = url.searchParams.get("status");
    return rows.map((r) => ({ ...r, status: status(r.status), status_label: label[status(r.status)], attachments: count[r.id] || 0 })).filter((r) => !want || r.status === want);
  }],
  ["GET", "/api/requests/:id", async ({ params }) => {
    const r = await load(params.id);
    const attachments = await db.select("request_attachments", `request_id=${eq(r.id)}&select=id,filename,size,mime,uploaded_at&order=id.asc`);
    return { ...r, status: status(r.status), status_label: label[status(r.status)], attachments, default_message: r.admin_message || defaultMessage(r), mail_ready: mailReady() };
  }],
  ["POST", "/api/requests/:id/attachments", async ({ req, params }) => {
    const r = await load(params.id);
    const f = await saveUpload(req, { dir: DIR, kind: "doc" });
    return db.insert("request_attachments", { request_id: r.id, ...f });
  }],
  ["GET", "/api/requests/:id/attachments/:aid/download", async ({ params }) => {
    const a = (await db.select("request_attachments", `id=${eq(id(params.aid))}&request_id=${eq(id(params.id))}`))[0];
    if (!a) throw httpError(404, "Attachment not found");
    return { raw: { status: 200, headers: { "Content-Type": a.mime || "application/octet-stream", "Content-Disposition": `attachment; filename="${a.filename.replace(/"/g, "")}"` }, body: fs.readFileSync(safeJoin(DIR, a.stored_name)) } };
  }],
  ["DELETE", "/api/requests/:id/attachments/:aid", async ({ params }) => {
    const a = (await db.select("request_attachments", `id=${eq(id(params.aid))}&request_id=${eq(id(params.id))}`))[0];
    if (!a) throw httpError(404, "Attachment not found");
    await db.remove("request_attachments", `id=${eq(a.id)}`);
    fs.rmSync(safeJoin(DIR, a.stored_name), { force: true });
    return { ok: true };
  }],
  ["POST", "/api/requests/:id/send", async ({ req, params }) => {
    const r = await load(params.id), b = await readJson(req);
    const to = need(r.email, "Requester email"), subject = need(b.subject, "Subject", 200), message = need(b.message, "Message", 5000);
    const atts = await db.select("request_attachments", `request_id=${eq(r.id)}`);
    if (!atts.length) throw httpError(400, "Attach at least one document before sending");
    if (atts.reduce((s, a) => s + a.size, 0) > 20_000_000) throw httpError(400, "Attachments exceed 20 MB in total. Remove some or send a download link instead.");
    await sendMail({ to, subject, text: message, attachments: atts.map((a) => ({ filename: a.filename, path: safeJoin(DIR, a.stored_name), contentType: a.mime })) });
    await db.update("document_requests", `id=${eq(r.id)}`, { status: "sent", sent_at: new Date().toISOString(), admin_message: message });
    return { ok: true };
  }],
  ["PATCH", "/api/requests/:id", async ({ req, params }) => {
    const b = await readJson(req), r = await load(params.id);
    const s = oneOf(b.status, ["new", "sent", "completed"], "status");
    return db.update("document_requests", `id=${eq(r.id)}`, { status: s, completed_at: s === "completed" ? new Date().toISOString() : null, ...(b.message !== undefined ? { admin_message: str(b.message, 5000) } : {}) });
  }]
];
