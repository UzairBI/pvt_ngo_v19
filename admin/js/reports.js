import { api } from "./api.js";
import { h, inr, monthLabel, barChart, statBars, statCard, panel, dataTable, spinner, msg } from "./ui.js";

const short = (v) => (v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : v >= 1000 ? `₹${Math.round(v / 1000)}k` : `₹${Math.round(v)}`);
const change = (now, prev) => (!prev ? (now ? "new this period" : "no change") : `${now >= prev ? "▲" : "▼"} ${Math.abs(Math.round(((now - prev) / prev) * 100))}% vs previous period`);
const bars = (list, money) => statBars(list.map((x) => ({ label: x.label, value: x.value })), { format: money ? inr : String });

export default async () => {
  const wrap = h("div"), body = h("div");
  const period = h("select", { "aria-label": "Period", onchange: () => load() }, [[3, "Last 3 months"], [6, "Last 6 months"], [12, "Last 12 months"], [24, "Last 24 months"]].map(([v, l]) => h("option", { value: v, selected: v === 12 }, l)));

  async function load() {
    body.replaceChildren(spinner("Calculating…"));
    let r; try { r = await api(`/reports?months=${period.value}`); } catch (e) { return body.replaceChildren(msg("err", e.message)); }
    const t = r.totals, chart = (key, opts) => barChart(r.series.map((m) => ({ label: monthLabel(m.month), title: monthLabel(m.month, true), value: m[key] })), opts);
    const csv = () => {
      const lines = [["Month", "Raised (INR)", "Donations", "Volunteer sign-ups", "Document requests", "Projects added"], ...r.series.map((m) => [m.month, m.raised, m.donations, m.volunteers, m.requests, m.projects])];
      const a = h("a", { href: URL.createObjectURL(new Blob([lines.map((l) => l.join(",")).join("\n")], { type: "text/csv" })), download: `monthly-statistics-${r.from}.csv` });
      document.body.append(a); a.click(); a.remove();
    };
    const table = dataTable({
      columns: [
        { label: "Month", cell: (m) => monthLabel(m.month, true), sort: (m) => m.month, firstDir: "desc" },
        { label: "Raised", cell: (m) => inr(m.raised), sort: (m) => m.raised, cls: "num", firstDir: "desc" },
        { label: "Donations", cell: (m) => m.donations, sort: (m) => m.donations, cls: "num", firstDir: "desc" },
        { label: "Volunteer sign-ups", cell: (m) => m.volunteers, sort: (m) => m.volunteers, cls: "num", firstDir: "desc" },
        { label: "Document requests", cell: (m) => m.requests, sort: (m) => m.requests, cls: "num", firstDir: "desc" },
        { label: "Projects added", cell: (m) => m.projects, sort: (m) => m.projects, cls: "num", firstDir: "desc" }],
      rows: r.series, sort: { i: 0, dir: "desc" }, pageSize: 12,
      summary: (rows) => h("p", { class: "mut" }, `Totals: ${inr(rows.reduce((s, m) => s + m.raised, 0))} raised · ${rows.reduce((s, m) => s + m.donations, 0)} donations · ${rows.reduce((s, m) => s + m.volunteers, 0)} sign-ups · ${rows.reduce((s, m) => s + m.requests, 0)} requests`),
      tools: [h("button", { class: "ghost", onclick: csv }, "Download CSV")]
    });
    body.replaceChildren(
      h("div", { class: "cards" },
        statCard("Raised", inr(t.raised), change(t.raised, t.raisedPrev)), statCard("Successful donations", t.donations, `${t.donors} unique donor(s)`),
        statCard("Average donation", inr(Math.round(t.average)), "Per successful donation"), statCard("New volunteers", t.volunteers, change(t.volunteers, t.volunteersPrev)),
        statCard("Document requests", t.requests, "Received in this period")),
      h("div", { class: "grid-2" },
        panel("Donations raised per month", chart("raised", { format: short, emptyText: "No successful donations in this period." })),
        panel("Number of donations per month", chart("donations", { emptyText: "No successful donations in this period." })),
        panel("Volunteer sign-ups per month", chart("volunteers", { emptyText: "No volunteer sign-ups in this period." })),
        panel("Document requests per month", chart("requests", { emptyText: "No document requests in this period." }))),
      h("div", { class: "grid-3" },
        panel("Raised by payment mode", bars(r.donations.byMode, true)), panel("Raised by payment method", bars(r.donations.byMethod, true)),
        panel("Raised by purpose / campaign", bars(r.donations.byPurpose, true)), panel("Donation records by status", bars(r.donations.byStatus)),
        panel("Volunteers by status (all time)", bars(r.volunteers.byStatus)), panel("Volunteers by area of interest (all time)", bars(r.volunteers.byArea)),
        panel("Projects added in admin, by status", bars(r.projects.byStatus)), panel("Website portfolio, by status", bars(r.projects.website)),
        panel("Document requests by status (all time)", bars(r.requests.byStatus))),
      h("h2", { class: "sec" }, "Monthly statistics"), table.el,
      h("p", { class: "mut" }, `Period: ${monthLabel(r.from, true)} to today. Money figures count successful INR donations by donation date.`));
  }
  wrap.append(h("div", { class: "page-head" }, h("div", { class: "grow" }, h("h1", null, "Analytics"), h("p", { class: "mut" }, "Calculated live from the database.")), h("label", { class: "dt-f" }, "Period", period)), body);
  await load(); return wrap;
};
