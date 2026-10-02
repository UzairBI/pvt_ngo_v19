// Razorpay webhook -> donations table (online payment + gateway status tracking).
// Dashboard: Settings -> Webhooks -> URL https://YOUR-DOMAIN/api/webhooks/razorpay, same secret as RAZORPAY_WEBHOOK_SECRET,
// events: payment.captured, payment.failed, payment.authorized, refund.processed.
import crypto from "node:crypto";
import { config } from "../config.js";
import { db, eq } from "../db.js";
import { httpError, readBody } from "../http.js";

const MAP = { captured: "success", authorized: "pending", created: "pending", failed: "failed", refunded: "refunded" };

export default [["POST", "/api/webhooks/razorpay", async ({ req }) => {
  if (!config.razorpayWebhookSecret) throw httpError(503, "Webhook secret not configured");
  const raw = await readBody(req, 200_000);
  const want = crypto.createHmac("sha256", config.razorpayWebhookSecret).update(raw).digest("hex");
  const got = String(req.headers["x-razorpay-signature"] || "");
  if (got.length !== want.length || !crypto.timingSafeEqual(Buffer.from(got), Buffer.from(want))) throw httpError(400, "Bad signature");
  const evt = JSON.parse(raw.toString("utf8"));
  const p = evt.payload?.payment?.entity;
  if (!p?.id) return { ok: true, ignored: evt.event };
  const status = evt.event === "refund.processed" ? "refunded" : MAP[p.status] || "pending";
  const row = {
    mode: "online", gateway: "Razorpay", gateway_payment_id: p.id, gateway_order_id: p.order_id || null, gateway_status: p.status, status,
    amount: p.amount / 100, currency: p.currency || "INR", method: p.method || "Razorpay", donated_at: new Date((p.created_at || Date.now() / 1000) * 1000).toISOString().slice(0, 10),
    gateway_error: p.error_description || null
  };
  if (p.email) row.donor_email = p.email;
  if (p.contact) row.donor_phone = p.contact;
  if (p.notes?.name) row.donor_name = String(p.notes.name).slice(0, 120);
  await db.upsert("donations", row, "gateway_payment_id"); // merge: admin-entered donor fields on an existing row are kept
  return { ok: true };
}]];
