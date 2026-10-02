import { api } from "./api.js";
import { h, inr, tag, timeAgo, monthLabel, barChart, statBars, statCard, panel, emptyState } from "./ui.js";
import { openDonationForm } from "./donations.js";
import { openProjectForm } from "./projects.js";

const n = (v) => Number(v || 0).toLocaleString("en-IN");
const TYPE = { donation: "Donation", volunteer: "Volunteer", request: "Request" };

const greeting = () => { const hr = new Date().getHours(); return hr < 12 ? "Good Morning" : hr < 17 ? "Good Afternoon" : "Good Evening"; };

export default async ({ me, go, reload }) => {
  const d = await api("/dashboard"), c = d.counts;
  const ongoing = d.ongoingProjects.website + d.ongoingProjects.added;

  // things waiting for an admin
  const todo = [
    c.volunteers.pending && h("a", { href: "#/volunteers", class: "chip warn" }, `${c.volunteers.pending} volunteer sign-up(s) awaiting approval`),
    d.pendingRequests && h("a", { href: "#/requests", class: "chip warn" }, `${d.pendingRequests} document request(s) pending`),
    d.funds.pending && h("a", { href: "#/donations", class: "chip warn" }, `${d.funds.pending} donation(s) with pending payment`)
  ].filter(Boolean);

  const recent = d.recent.length
    ? h("ul", { class: "feed" }, d.recent.map((r) => h("li", null, h("span", { class: `dot ${r.type}`, "aria-hidden": "true" }),
        h("div", { class: "grow" }, h("a", { href: "#/" + r.page }, r.title), h("div", { class: "mut" }, `${TYPE[r.type]} · ${r.sub}`)),
        h("div", { class: "feed-r" }, tag(r.status, r.status === "new" ? "pending" : r.status), h("div", { class: "mut" }, timeAgo(r.at))))))
    : emptyState("No donations, volunteer sign-ups or document requests yet. They appear here as soon as they arrive.");
  const activity = d.activity.length
    ? h("ul", { class: "feed" }, d.activity.map((a) => h("li", null, h("span", { class: `dot act-${a.action}`, "aria-hidden": "true" }),
        h("div", { class: "grow" }, a.summary, h("div", { class: "mut" }, a.admin_id || "")), h("div", { class: "feed-r mut" }, timeAgo(a.created_at)))))
    : emptyState("Admin changes (projects, donations, volunteers, events…) will be listed here.");

  const projStatus = [
    { label: "Ongoing", value: c.projects.website.ongoing + c.projects.added.ongoing, cls: "ok" },
    { label: "Completed", value: c.projects.website.completed + c.projects.added.completed, cls: "dark" },
    { label: "Planned", value: c.projects.added.planned, cls: "warn" },
    { label: "Not dated (website)", value: c.projects.website["not dated"], cls: "mut" }
  ];

  return h("div", null,
    h("div", { class: "page-head" }, h("div", { class: "grow" }, h("h1", null, `${greeting()}, ${me.adminId} 👋`), h("p", { class: "mut" }, `Here's an overview of your impact and activities · live from the database · updated ${new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`)),
      h("button", { class: "ghost", onclick: reload }, "Refresh")),
    h("div", { class: "row" },
      h("button", { onclick: () => openProjectForm(null, () => go("projects")) }, "+ Add project"),
      h("button", { onclick: () => go("broadcast") }, "Broadcast message"),
      h("button", { onclick: () => openDonationForm(() => go("donations")) }, "Record offline donation")),
    h("div", { class: "status-strip" },
      h("span", { class: `chip ${d.mailReady ? "ok" : "bad"}` }, d.mailReady ? "● Email sending is on" : "● Email is off (set SMTP in .env)"),
      todo.length ? todo : h("span", { class: "chip ok" }, "✓ Nothing waiting for approval")),
    h("div", { class: "cards" },
      statCard("Total funds raised", inr(d.funds.total), `Online ${inr(d.funds.online)} · Offline ${inr(d.funds.offline)}`, { href: "#/donations" }),
      statCard("Raised this month", inr(d.funds.thisMonth), d.funds.pending ? `${d.funds.pending} payment(s) pending` : "No pending payments", { href: "#/reports" }),
      statCard("Donation records", n(c.donations.records), `${n(c.donations.success)} successful · ${n(c.donations.pending)} pending · ${n(c.donations.failed + c.donations.cancelled + c.donations.refunded)} other`, { href: "#/donations" }),
      statCard("Volunteers", n(c.volunteers.total), `${n(c.volunteers.active)} active · ${n(c.volunteers.pending)} pending · ${n(c.volunteers.inactive)} inactive`, { href: "#/volunteers", tone: c.volunteers.pending ? "attn" : "" }),
      statCard("Total projects", n(c.projects.website.total + c.projects.added.total), `${n(c.projects.website.total)} on website portfolio · ${n(c.projects.added.total)} added here`, { href: "#/projects" }),
      statCard("Active projects", n(ongoing), `${n(c.projects.website.completed + c.projects.added.completed)} completed · ${n(c.projects.added.planned)} planned`, { href: "#/projects" }),
      statCard("Beneficiary reach", n(d.reach.website + d.reach.added), `Website figure ${n(d.reach.website)} + ${n(d.reach.added)} from added projects`),
      statCard("Pending document requests", n(d.pendingRequests), `${n(c.requests.total)} received in total`, { href: "#/requests", tone: d.pendingRequests ? "attn" : "" }),
      statCard("Upcoming events", n(c.events.upcoming), `${n(c.events.published)} published · ${n(c.events.total)} in total`, { href: "#/events" }),
      statCard("Admin users", n(c.admins), "People who can sign in here", { href: "#/admins" })),
    h("div", { class: "grid-2" },
      panel("Donations raised · last 12 months", barChart(d.months.map((m) => ({ label: monthLabel(m.month), title: monthLabel(m.month, true), value: m.raised })),
        { format: (v) => (v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : v >= 1000 ? `₹${Math.round(v / 1000)}k` : `₹${v}`), emptyText: "No successful donations in the last 12 months yet." }), h("a", { href: "#/reports", class: "more" }, "Full analytics →")),
      panel("Volunteer sign-ups · last 12 months", barChart(d.months.map((m) => ({ label: monthLabel(m.month), title: monthLabel(m.month, true), value: m.volunteers })), { emptyText: "No volunteer sign-ups in the last 12 months yet." }))),
    h("div", { class: "grid-3" },
      panel("Recent submissions", recent),
      panel("Recent admin activity", activity, h("a", { href: "#/admins", class: "more" }, "Full activity log →")),
      panel("Projects by status", statBars(projStatus), h("p", { class: "mut" }, "Website portfolio (src/data/portfolio.ts) + projects added in admin."))),
    h("p", { class: "mut" }, "Funds count successful INR donations only. Website figures come from public/data/live.json and src/data/portfolio.ts."));
};
