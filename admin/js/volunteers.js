import { api } from "./api.js";
import { h, fmtDate, field, modal, run, tag, dataTable, confirmDialog, toast, busy, validate, rules } from "./ui.js";

const STATUSES = ["pending", "active", "inactive"];

export default async () => {
  const wrap = h("div");
  const setStatus = async (v, status) => {
    try { await api(`/volunteers/${v.id}`, { method: "PATCH", body: { status } }); toast(`${v.name || "Volunteer"} is now ${status}.`); }
    catch (e) { toast(e.message, "err"); }
    load();
  };
  const remove = async (v) => {
    if (!await confirmDialog({ title: "Delete volunteer?", text: `${v.name || "This volunteer"} will be removed permanently.`, ok: "Delete", danger: true })) return false;
    try { await api(`/volunteers/${v.id}`, { method: "DELETE" }); toast("Volunteer deleted."); load(); return true; } catch (e) { toast(e.message, "err"); return false; }
  };
  const actions = (r, after) => [
    r.status !== "active" && h("button", { class: "sm", onclick: () => { after?.(); setStatus(r, "active"); } }, r.status === "pending" ? "Approve" : "Activate"),
    r.status === "active" && h("button", { class: "ghost sm", onclick: () => { after?.(); setStatus(r, "inactive"); } }, "Deactivate"),
    h("button", { class: "danger sm", onclick: async () => { if (await remove(r)) after?.(); } }, "Delete")];
  const view = (r) => {
    const kv = (k, v) => h("div", { class: "kv" }, h("span", { class: "mut" }, k), h("span", null, v || "—"));
    const close = modal(r.name || "Volunteer", h("div", null, h("p", null, tag(r.status)),
      h("div", { class: "kvs" }, kv("Phone", r.phone), kv("Email", r.email), kv("Area of interest", r.area), kv("Signed up", fmtDate(r.created_at))),
      r.message ? h("div", null, h("h2", null, "Message"), h("p", { class: "pre" }, r.message)) : h("p", { class: "mut" }, "No message."),
      h("div", { class: "row end" }, actions(r, () => close()))));
  };
  const list = dataTable({
    columns: [
      { label: "Joined", cell: (r) => fmtDate(r.created_at), sort: (r) => r.created_at, firstDir: "desc" },
      { label: "Name", cell: (r) => h("b", null, r.name || "—"), sort: (r) => (r.name || "").toLowerCase() },
      { label: "Contact", cell: (r) => [r.phone, r.email].filter(Boolean).join(" · ") || "—" },
      { label: "Interest", cell: (r) => r.area || "—", sort: (r) => (r.area || "").toLowerCase() },
      { label: "Status", cell: (r) => tag(r.status), sort: (r) => STATUSES.indexOf(r.status) },
      { label: "", cls: "actions", cell: (r) => h("span", { class: "row nowrap" }, actions(r)) }],
    search: (r) => [r.name, r.phone, r.email, r.area, r.message].join(" "), searchLabel: "Search name, phone, email",
    filters: [
      { label: "Status", options: [["pending", "Pending approval"], ["active", "Active"], ["inactive", "Inactive"]], test: (r, v) => r.status === v },
      { label: "Interest", options: (rs) => [...new Set(rs.map((r) => r.area).filter(Boolean))].sort().map((a) => [a, a]), test: (r, v) => r.area === v }],
    date: { label: "Joined", get: (r) => r.created_at }, sort: { i: 0, dir: "desc" }, onRow: view,
    summary: (rows) => h("p", { class: "mut" }, `${rows.length} volunteer(s) · ${rows.filter((r) => r.status === "active").length} active · ${rows.filter((r) => r.status === "pending").length} pending`),
    empty: "No volunteers yet. Sign-ups from the website Get Involved form arrive here as “pending”.",
    tools: [h("button", { onclick: () => add() }, "+ Add volunteer")]
  });
  async function load() { list.loading(); try { list.set(await api("/volunteers")); } catch (e) { list.error(e.message); } }
  const add = () => {
    const b = h("div"), save = h("button", { type: "submit" }, "Add active volunteer");
    const f = h("form", { novalidate: true, onsubmit: async (e) => {
      e.preventDefault();
      if (!validate(f, { name: rules.required("Name", 120), phone: rules.phone, email: rules.email, area: rules.max("Area of interest", 80) })) return;
      if (await busy(save, () => run(b, () => api("/volunteers", { method: "POST", body: Object.fromEntries(new FormData(f)) })))) { close(); toast("Volunteer added."); load(); }
    } }, b,
      field("Name *", h("input", { name: "name", required: true, maxlength: "120" })), h("div", { class: "grid2" }, field("Phone", h("input", { name: "phone", inputmode: "tel" })), field("Email", h("input", { name: "email", type: "email" }))),
      field("Area of interest", h("input", { name: "area", maxlength: "80" })),
      h("div", { class: "row end" }, h("button", { type: "button", class: "ghost", onclick: () => close() }, "Cancel"), save));
    const close = modal("Add volunteer", f);
  };
  wrap.append(h("div", { class: "page-head" }, h("div", { class: "grow" }, h("h1", null, "Volunteers"),
    h("p", { class: "mut" }, "Sign-ups from the website Get Involved form arrive as “pending”; approve them to count them as active."))), list.el);
  await load(); return wrap;
};
