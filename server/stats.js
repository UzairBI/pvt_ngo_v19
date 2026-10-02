// Shared statistics for the admin dashboard and analytics pages. Everything is computed from server/data.db
// (plus the website's own portfolio / live.json for the website figures).
import { db } from "./db.js";

export const monthKey = (d) => String(d || "").slice(0, 7);
/** The last `n` months as "YYYY-MM", oldest first, ending with the current month. */
export function lastMonths(n) {
  const out = [], d = new Date(); d.setDate(1);
  for (let i = n - 1; i >= 0; i--) { const x = new Date(d.getFullYear(), d.getMonth() - i, 1); out.push(`${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}`); }
  return out;
}
export const countBy = (rows, key) => rows.reduce((m, r) => { const k = (typeof key === "function" ? key(r) : r[key]) || "Not set"; m[k] = (m[k] || 0) + 1; return m; }, {});
export const sumBy = (rows, key, val) => rows.reduce((m, r) => { const k = (typeof key === "function" ? key(r) : r[key]) || "Not set"; m[k] = (m[k] || 0) + val(r); return m; }, {});
export const sum = (rows) => rows.reduce((s, d) => s + Number(d.amount), 0);
export const reqStatus = (s) => (["sent", "completed"].includes(s) ? s : "new");

export async function loadAll() {
  const [donations, projects, volunteers, requests, events, admins] = await Promise.all([
    db.selectAll("donations", "select=id,created_at,amount,status,mode,method,currency,donated_at,donor_name,donor_email,purpose"),
    db.selectAll("projects", "select=id,created_at,name,area,status,beneficiaries,published"),
    db.selectAll("volunteers", "select=id,created_at,name,area,status"),
    db.selectAll("document_requests", "select=id,created_at,reference,name,organisation,request_type,document_type,status"),
    db.selectAll("events", "select=id,created_at,title,event_date,published"),
    db.selectAll("admin_users", "select=admin_id,created_at,last_login")
  ]);
  return { donations, projects, volunteers, requests, events, admins };
}

/** Month-by-month figures. Donations use the donation date; sign-ups and requests use the date received. */
export function monthly(all, months) {
  const ok = all.donations.filter((d) => d.status === "success" && d.currency === "INR");
  return months.map((m) => {
    const dm = ok.filter((d) => monthKey(d.donated_at) === m);
    return { month: m, raised: sum(dm), donations: dm.length,
      volunteers: all.volunteers.filter((v) => monthKey(v.created_at) === m).length,
      requests: all.requests.filter((r) => monthKey(r.created_at) === m).length,
      projects: all.projects.filter((p) => monthKey(p.created_at) === m).length };
  });
}

/** Newest website submissions and records: donations, volunteer sign-ups, document requests. */
export function recentSubmissions(all, limit = 10) {
  const items = [
    ...all.donations.map((d) => ({ type: "donation", at: d.created_at, title: `Donation ₹${Number(d.amount).toLocaleString("en-IN")}`, sub: `${d.donor_name || "Unknown donor"} · ${d.mode}${d.method ? " · " + d.method : ""}`, status: d.status, page: "donations" })),
    ...all.volunteers.map((v) => ({ type: "volunteer", at: v.created_at, title: `Volunteer: ${v.name || "Unnamed"}`, sub: v.area || "Volunteer sign-up", status: v.status, page: "volunteers" })),
    ...all.requests.map((r) => ({ type: "request", at: r.created_at, title: `Request ${r.reference || "#" + r.id}`, sub: [r.name, r.document_type].filter(Boolean).join(" · "), status: reqStatus(r.status), page: "requests" }))
  ];
  return items.sort((a, b) => String(b.at).localeCompare(String(a.at))).slice(0, limit);
}
