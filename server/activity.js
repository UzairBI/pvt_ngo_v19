// Admin activity log: one short, human-readable line per successful admin change (plus sign-ins).
import { db, eq } from "./db.js";
import { receiptNo } from "./receipt.js";

const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
const q = (s) => `“${s}”`;
const TABLE = { projects: "projects", volunteers: "volunteers", events: "events", donations: "donations", requests: "document_requests" };
const nameOf = (r) => r && (r.name || r.title || r.donor_name || r.reference || r.subject);

/** For DELETE requests: read the row first so the log can name what was removed. */
export async function before(method, path) {
  const m = path.match(/^\/api\/(\w+)\/(\d+)$/);
  if (method !== "DELETE" || !m || !TABLE[m[1]]) return null;
  return (await db.select(TABLE[m[1]], `id=${eq(m[2])}`))[0] || null;
}

function describe(method, path, out, old) {
  const seg = path.replace(/^\/api\//, "").split("/");
  const [entity, rid, sub] = seg;
  const r = out && typeof out === "object" && !Array.isArray(out) ? out : {};
  const act = { POST: "created", PATCH: "updated", DELETE: "deleted" }[method] || method.toLowerCase();
  switch (entity) {
    case "projects":
      if (method === "POST") return ["created", `Added project ${q(r.name)}`];
      if (method === "PATCH") return ["updated", `Updated project ${q(r.name)} · status ${r.status}`];
      if (method === "DELETE") return ["deleted", `Deleted project ${q(nameOf(old) || "#" + rid)}`];
      break;
    case "donations":
      if (sub === "send-receipt") return ["emailed", `Emailed receipt for donation #${rid}`];
      if (method === "POST") return ["created", `Recorded donation ${inr(r.amount)} from ${r.donor_name || "a donor"}`];
      if (method === "PATCH") return ["updated", `Updated donation ${r.id ? receiptNo(r) : "#" + rid} · ${r.status || ""}`];
      break;
    case "volunteers":
      if (method === "POST") return ["created", `Added volunteer ${r.name || ""}`];
      if (method === "PATCH") return ["updated", `Set volunteer ${r.name || "#" + rid} to ${r.status}`];
      if (method === "DELETE") return ["deleted", `Deleted volunteer ${nameOf(old) || "#" + rid}`];
      break;
    case "events":
      if (sub === "images") return [method === "POST" ? "uploaded" : "deleted", `${method === "POST" ? "Added an image to" : "Removed an image from"} event ${q(r.title || "#" + rid)}`];
      if (method === "POST") return ["created", `Created event ${q(r.title)}`];
      if (method === "PATCH") return ["updated", `Updated event ${q(r.title)}${r.published ? " · published" : " · draft"}`];
      if (method === "DELETE") return ["deleted", `Deleted event ${q(nameOf(old) || "#" + rid)}`];
      break;
    case "requests":
      if (sub === "send") return ["emailed", `Sent documents for request #${rid}`];
      if (sub === "attachments") return [method === "POST" ? "uploaded" : "deleted", `${method === "POST" ? "Attached" : "Removed"} a document on request #${rid}`];
      if (method === "PATCH") return ["updated", `Marked request ${r.reference || "#" + rid} as ${r.status === "new" ? "pending" : r.status}`];
      break;
    case "broadcast":
      if (method === "POST") return ["emailed", `Sent a broadcast to ${r.sent ?? 0} recipient(s)`];
      break;
  }
  return [act, `${method} ${path}`];
}

export async function logActivity(adminId, method, path, out, old) {
  try {
    const [action, summary] = describe(method, path, out, old);
    const [, entity, rid] = path.match(/^\/api\/(\w+)(?:\/(\d+))?/) || [];
    await db.insert("activity_log", { admin_id: adminId, action, entity: entity || null, entity_id: rid || (out && out.id ? String(out.id) : null), summary: String(summary).slice(0, 300) });
  } catch { /* logging must never break the real action */ }
}
export const logSignIn = (adminId) => db.insert("activity_log", { admin_id: adminId, action: "signed-in", entity: "session", summary: "Signed in" }).catch(() => {});
