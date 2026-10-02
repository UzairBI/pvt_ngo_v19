import fs from "node:fs";
import { config } from "../config.js";
import { db } from "../db.js";
import { mailReady } from "../mailer.js";
import { websitePortfolio } from "../portfolio.js";
import { loadAll, monthly, lastMonths, recentSubmissions, sum, reqStatus } from "../stats.js";

function websiteReach() {
  try { return Number(JSON.parse(fs.readFileSync(config.liveJson, "utf8")).stats?.[0]?.value) || 0; } catch { return 0; }
}
const tally = (rows, key, keys) => Object.fromEntries(keys.map((k) => [k, rows.filter((r) => (typeof key === "function" ? key(r) : r[key]) === k).length]));

export default [[
  "GET", "/api/dashboard", async () => {
    const all = await loadAll();
    const { donations, projects, volunteers: vols, requests: reqs, events, admins } = all;
    const ok = donations.filter((d) => d.status === "success" && d.currency === "INR");
    const month = new Date().toISOString().slice(0, 7), today = new Date().toISOString().slice(0, 10);
    const site = websitePortfolio();
    const added = projects.reduce((s, p) => s + p.beneficiaries, 0);
    return {
      // ---- original fields (kept unchanged) ----
      funds: { total: sum(ok), online: sum(ok.filter((d) => d.mode === "online")), offline: sum(ok.filter((d) => d.mode === "offline")), thisMonth: sum(ok.filter((d) => d.donated_at.startsWith(month))), pending: donations.filter((d) => d.status === "pending").length },
      activeVolunteers: vols.filter((v) => v.status === "active").length, pendingVolunteers: vols.filter((v) => v.status === "pending").length,
      ongoingProjects: { website: site.filter((p) => p.status === "ongoing").length, added: projects.filter((p) => p.status === "ongoing").length },
      reach: { website: websiteReach(), added },
      pendingRequests: reqs.filter((r) => reqStatus(r.status) === "new").length,
      // ---- detailed counts ----
      counts: {
        admins: admins.length,
        donations: { records: donations.length, ...tally(donations, "status", ["success", "pending", "failed", "refunded", "cancelled"]) },
        projects: { added: { total: projects.length, ...tally(projects, "status", ["planned", "ongoing", "completed"]) },
          website: { total: site.length, ...tally(site, "status", ["ongoing", "completed", "not dated"]) } },
        volunteers: { total: vols.length, ...tally(vols, "status", ["active", "pending", "inactive"]) },
        requests: { total: reqs.length, ...tally(reqs, (r) => reqStatus(r.status), ["new", "sent", "completed"]) },
        events: { total: events.length, upcoming: events.filter((e) => e.event_date >= today).length, published: events.filter((e) => e.published).length }
      },
      months: monthly(all, lastMonths(12)),
      recent: recentSubmissions(all, 8),
      activity: await db.select("activity_log", "select=*&order=created_at.desc,id.desc&limit=8"),
      mailReady: mailReady()
    };
  }
]];
