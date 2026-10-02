import { api } from "./api.js";
import { h, fmtDateTime, timeAgo, tag, panel, dataTable, statCard } from "./ui.js";

const ACTION = { created: "Created", updated: "Updated", deleted: "Deleted", emailed: "Emailed", uploaded: "Uploaded", "signed-in": "Signed in" };
const tone = (a) => ({ created: "active", updated: "new", deleted: "cancelled", emailed: "completed", uploaded: "completed", "signed-in": "" }[a] || "");

export default async ({ me }) => {
  const [admins, log] = await Promise.all([api("/admins"), api("/activity?limit=1000")]);
  const people = dataTable({
    columns: [
      { label: "Admin ID", cell: (a) => h("b", null, a.admin_id, a.admin_id === me.adminId ? h("span", { class: "mut" }, " (you)") : null), sort: (a) => a.admin_id },
      { label: "Created", cell: (a) => fmtDateTime(a.created_at), sort: (a) => a.created_at },
      { label: "Last sign-in", cell: (a) => (a.last_login ? `${fmtDateTime(a.last_login)} · ${timeAgo(a.last_login)}` : "Never"), sort: (a) => a.last_login || "", firstDir: "desc" },
      { label: "Logged actions", cell: (a) => a.actions, sort: (a) => a.actions, cls: "num", firstDir: "desc" }],
    rows: admins, sort: { i: 0, dir: "asc" }, pageSize: 10, empty: "No admins found."
  });
  const activity = dataTable({
    columns: [
      { label: "When", cell: (r) => h("span", { title: fmtDateTime(r.created_at) }, fmtDateTime(r.created_at)), sort: (r) => r.created_at + String(r.id).padStart(9, "0"), firstDir: "desc" },
      { label: "Admin", cell: (r) => r.admin_id || "—", sort: (r) => r.admin_id || "" },
      { label: "Action", cell: (r) => tag(tone(r.action), ACTION[r.action] || r.action), sort: (r) => r.action },
      { label: "What happened", cell: (r) => r.summary }],
    rows: log, search: (r) => [r.summary, r.admin_id, r.entity].join(" "), searchLabel: "Search activity",
    filters: [
      { label: "Admin", options: (rs) => [...new Set(rs.map((r) => r.admin_id).filter(Boolean))].sort().map((a) => [a, a]), test: (r, v) => r.admin_id === v },
      { label: "Section", options: (rs) => [...new Set(rs.map((r) => r.entity).filter(Boolean))].sort().map((e) => [e, e === "session" ? "sign-ins" : e]), test: (r, v) => r.entity === v },
      { label: "Action", options: Object.entries(ACTION), test: (r, v) => r.action === v }],
    date: { label: "Date", get: (r) => r.created_at }, sort: { i: 0, dir: "desc" }, pageSize: 25,
    empty: "No admin activity recorded yet. Changes made in this admin panel are logged here from now on."
  });
  return h("div", null,
    h("div", { class: "page-head" }, h("div", { class: "grow" }, h("h1", null, "Admins & activity"), h("p", { class: "mut" }, "Who can sign in, and every change made in this admin panel."))),
    h("div", { class: "cards" },
      statCard("Signed in as", me.adminId, "Sessions end automatically after the configured hours"),
      statCard("Admin users", admins.length, "Accounts that can open this panel"),
      statCard("Email sending", me.mailReady ? "On" : "Off", me.mailReady ? "Receipts, documents and broadcasts can be emailed" : "Set SMTP_* in .env to send emails", { tone: me.mailReady ? "" : "attn" })),
    panel("Admin users", people.el, h("p", { class: "mut" }, "To add an admin or change a password, run  npm run admin:set -- <admin ID>  on the server (see SETUP.md). Changing a password signs that admin out everywhere.")),
    h("h2", { class: "sec" }, "Activity log"), activity.el);
};
