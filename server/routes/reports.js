// Analytics, activity log, admin list and the read-only website portfolio for the admin panel.
import { db } from "../db.js";
import { websitePortfolio } from "../portfolio.js";
import { loadAll, monthly, lastMonths, countBy, sumBy, sum, monthKey, reqStatus } from "../stats.js";

const top = (obj, n = 8) => Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, n).map(([label, value]) => ({ label, value }));

export default [
  ["GET", "/api/reports", async ({ url }) => {
    const n = Math.min(36, Math.max(3, parseInt(url.searchParams.get("months"), 10) || 12));
    const all = await loadAll(), months = lastMonths(n), from = months[0];
    const prevMonths = lastMonths(n * 2).slice(0, n);
    const inRange = (d, list) => list.includes(monthKey(d));
    const ok = all.donations.filter((d) => d.status === "success" && d.currency === "INR");
    const okNow = ok.filter((d) => inRange(d.donated_at, months)), okPrev = ok.filter((d) => inRange(d.donated_at, prevMonths));
    const donors = new Set(okNow.map((d) => (d.donor_email || d.donor_name || "").toLowerCase()).filter(Boolean));
    const volsNow = all.volunteers.filter((v) => inRange(v.created_at, months)), reqsNow = all.requests.filter((r) => inRange(r.created_at, months));
    return {
      months: n, from,
      totals: { raised: sum(okNow), raisedPrev: sum(okPrev), donations: okNow.length, donors: donors.size, average: okNow.length ? sum(okNow) / okNow.length : 0,
        volunteers: volsNow.length, volunteersPrev: all.volunteers.filter((v) => inRange(v.created_at, prevMonths)).length, requests: reqsNow.length },
      series: monthly(all, months),
      donations: { byMode: top(sumBy(okNow, "mode", (d) => Number(d.amount))), byMethod: top(sumBy(okNow, "method", (d) => Number(d.amount))),
        byPurpose: top(sumBy(okNow, "purpose", (d) => Number(d.amount))), byStatus: top(countBy(all.donations.filter((d) => inRange(d.donated_at, months)), "status")) },
      volunteers: { byStatus: top(countBy(all.volunteers, "status")), byArea: top(countBy(all.volunteers, "area")) },
      requests: { byStatus: top(countBy(all.requests, (r) => ({ new: "pending", sent: "sent", completed: "completed" }[reqStatus(r.status)]))), byType: top(countBy(reqsNow, "document_type")) },
      projects: { byStatus: top(countBy(all.projects, "status")), byArea: top(countBy(all.projects, "area")), website: top(countBy(websitePortfolio(), "status")) }
    };
  }],
  ["GET", "/api/activity", async ({ url }) => {
    const limit = Math.min(1000, Math.max(1, parseInt(url.searchParams.get("limit"), 10) || 300));
    return db.select("activity_log", `select=*&order=created_at.desc,id.desc&limit=${limit}`);
  }],
  ["GET", "/api/admins", async () => {
    const [admins, log] = await Promise.all([db.selectAll("admin_users", "select=admin_id,created_at,last_login&order=admin_id.asc"), db.selectAll("activity_log", "select=admin_id")]);
    const n = countBy(log, "admin_id");
    return admins.map((a) => ({ ...a, actions: n[a.admin_id] || 0 }));
  }],
  ["GET", "/api/portfolio", async () => websitePortfolio()]
];
