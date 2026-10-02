import { api } from "./api.js";
import { h, field, modal, run, tag, fmtDate, dataTable, confirmDialog, toast, busy, validate, rules, emptyState } from "./ui.js";

const STATUSES = ["planned", "ongoing", "completed"];
const statusTag = (s) => tag(s === "ongoing" ? "active" : s === "completed" ? "completed" : "pending", s);
const AREA_NAMES = { "child-education": "Child education", "health-nutrition": "Health & nutrition", "women-empowerment": "Women empowerment", environment: "Environment", "social-welfare": "Social welfare" };
const distinct = (rows, key) => [...new Set(rows.map((r) => r[key]).filter(Boolean))].sort().map((v) => [v, AREA_NAMES[v] || v]);
const body = (p, patch = {}) => ({ name: p.name, area: p.area, location: p.location, description: p.description, beneficiaries: p.beneficiaries, status: p.status, published: p.published, ...patch });

/** Add / edit form (also used by the dashboard quick action). `done` runs after a successful save or delete. */
export function openProjectForm(p, done) {
  p = p || {}; const box = h("div");
  const save = h("button", { type: "submit" }, p.id ? "Save changes" : "Add project");
  const f = h("form", { novalidate: true, onsubmit: async (ev) => {
    ev.preventDefault();
    if (!validate(f, { name: rules.required("Project name", 160), area: rules.max("Area", 80), location: rules.max("Location", 120),
      beneficiaries: rules.wholeNumber("Beneficiaries"), description: rules.max("Description", 2000) })) return;
    const b = Object.fromEntries(new FormData(f)); b.published = f.published.checked; b.beneficiaries = b.beneficiaries || 0;
    const saved = await busy(save, () => run(box, () => api(p.id ? `/projects/${p.id}` : "/projects", { method: p.id ? "PATCH" : "POST", body: b })));
    if (saved) { close(); toast(p.id ? "Project saved." : "Project added."); done?.(saved); }
  } }, box,
    h("div", { class: "grid2" },
      field("Project name *", h("input", { name: "name", required: true, maxlength: "160", value: p.name || "" })),
      field("Area / category (e.g. Child education)", h("input", { name: "area", maxlength: "80", list: "proj-areas", value: p.area || "" })),
      field("Location", h("input", { name: "location", maxlength: "120", value: p.location || "" })),
      field("Beneficiaries reached", h("input", { name: "beneficiaries", type: "number", min: "0", step: "1", inputmode: "numeric", value: p.beneficiaries ?? 0 })),
      field("Status", h("select", { name: "status" }, STATUSES.map((s) => h("option", { value: s, selected: s === (p.status || "ongoing") }, s))))),
    field("Description", h("textarea", { name: "description", rows: "4", maxlength: "2000" }, p.description || "")),
    h("label", { class: "chk" }, h("input", { type: "checkbox", name: "published", checked: p.published !== false }), "Show on the website Projects page"),
    h("datalist", { id: "proj-areas" }, Object.values(AREA_NAMES).map((a) => h("option", { value: a }))),
    h("div", { class: "row end" }, h("button", { type: "button", class: "ghost", onclick: () => close() }, "Cancel"), save));
  const close = modal(p.id ? "Edit project" : "Add project", f);
}

async function remove(p, done) {
  if (!await confirmDialog({ title: "Delete project?", text: `“${p.name}” will be removed from the admin and from the website. This cannot be undone.`, ok: "Delete project", danger: true })) return false;
  try { await api(`/projects/${p.id}`, { method: "DELETE" }); toast("Project deleted."); done?.(); return true; }
  catch (e) { toast(e.message, "err"); return false; }
}
async function setStatus(p, status, done) {
  try { await api(`/projects/${p.id}`, { method: "PATCH", body: body(p, { status }) }); toast(`Status changed to ${status}.`); done?.(); }
  catch (e) { toast(e.message, "err"); done?.(); }
}

function view(p, reload) {
  const kv = (k, v) => h("div", { class: "kv" }, h("span", { class: "mut" }, k), h("span", null, v || "—"));
  const el = h("div", null,
    h("p", null, statusTag(p.status), " ", tag(p.published ? "active" : "pending", p.published ? "Shown on website" : "Hidden from website")),
    h("div", { class: "kvs" }, kv("Area", p.area), kv("Location", p.location), kv("Beneficiaries", Number(p.beneficiaries).toLocaleString("en-IN")), kv("Added", fmtDate(p.created_at))),
    p.description ? h("p", { class: "pre" }, p.description) : h("p", { class: "mut" }, "No description."),
    h("div", { class: "row" }, "Change status:", STATUSES.filter((s) => s !== p.status).map((s) => h("button", { class: "ghost sm", onclick: async () => { close(); await setStatus(p, s, reload); } }, s))),
    h("div", { class: "row end" },
      h("button", { class: "danger", onclick: async () => { if (await remove(p, reload)) close(); } }, "Delete"),
      h("button", { onclick: () => { close(); openProjectForm(p, reload); } }, "Edit")));
  const close = modal(p.name, el);
}

function portfolioView(p) {
  const kv = (k, v) => h("div", { class: "kv" }, h("span", { class: "mut" }, k), h("span", null, v || "—"));
  modal(p.name, h("div", null, h("p", null, statusTag(p.status === "not dated" ? "planned" : p.status), " ", h("span", { class: "mut" }, `Portfolio no. ${p.no}`)),
    h("div", { class: "kvs" }, kv("Area", AREA_NAMES[p.area] || p.area), kv("Period", p.period), kv("Location", p.location), kv("Beneficiaries", p.beneficiaries), kv("Budget", p.budget), kv("Funding", p.funding)),
    h("p", { class: "pre" }, p.summary || ""), h("p", { class: "msg info" }, "Website portfolio projects are edited in src/data/portfolio.ts (then rebuild the site).")));
}

export default async () => {
  const wrap = h("div");
  let rows = [];
  const load = async () => {
    added.loading();
    try { rows = await api("/projects"); added.set(rows); tabs.querySelector("[data-t=added] .count").textContent = rows.length; }
    catch (e) { added.error(e.message); }
  };
  const statusSel = (r) => h("select", { class: "inline-sel", "aria-label": `Status of ${r.name}`, onchange: (e) => setStatus(r, e.target.value, load) }, STATUSES.map((s) => h("option", { value: s, selected: s === r.status }, s)));
  const added = dataTable({
    columns: [
      { label: "Project", cell: (r) => h("div", null, h("b", null, r.name), r.area ? h("div", { class: "mut" }, r.area) : null), sort: (r) => r.name.toLowerCase() },
      { label: "Location", cell: (r) => r.location || "—", sort: (r) => (r.location || "").toLowerCase() },
      { label: "Beneficiaries", cell: (r) => Number(r.beneficiaries).toLocaleString("en-IN"), sort: (r) => r.beneficiaries, cls: "num", firstDir: "desc" },
      { label: "Status", cell: statusSel, sort: (r) => STATUSES.indexOf(r.status) },
      { label: "Website", cell: (r) => tag(r.published ? "active" : "pending", r.published ? "Shown" : "Hidden"), sort: (r) => (r.published ? 0 : 1) },
      { label: "Added", cell: (r) => fmtDate(r.created_at), sort: (r) => r.created_at, firstDir: "desc" },
      { label: "", cls: "actions", cell: (r) => h("span", { class: "row nowrap" },
        h("button", { class: "ghost sm", onclick: () => view(r, load) }, "View"), h("button", { class: "ghost sm", onclick: () => openProjectForm(r, load) }, "Edit"),
        h("button", { class: "danger sm", onclick: () => remove(r, load) }, "Delete")) }],
    search: (r) => [r.name, r.area, r.location, r.description].join(" "), searchLabel: "Search projects",
    filters: [
      { label: "Status", options: STATUSES.map((s) => [s, s]), test: (r, v) => r.status === v },
      { label: "Area", options: (rs) => distinct(rs, "area"), test: (r, v) => r.area === v },
      { label: "Website", options: [["shown", "Shown"], ["hidden", "Hidden"]], test: (r, v) => (v === "shown") === !!r.published }],
    date: { label: "Added", get: (r) => r.created_at }, sort: { i: 5, dir: "desc" }, onRow: (r) => view(r, load),
    empty: "No projects added yet. Use “+ Add project” — they appear on the website under “Latest projects”.",
    tools: [h("button", { onclick: () => openProjectForm(null, load) }, "+ Add project")]
  });

  const site = dataTable({
    columns: [
      { label: "No.", cell: (r) => r.no, sort: (r) => r.no, cls: "num" },
      { label: "Project", cell: (r) => h("b", null, r.name), sort: (r) => r.name.toLowerCase() },
      { label: "Area", cell: (r) => AREA_NAMES[r.area] || r.area, sort: (r) => r.area },
      { label: "Period", cell: (r) => r.period || "—" },
      { label: "Status", cell: (r) => statusTag(r.status === "not dated" ? "planned" : r.status), sort: (r) => r.status },
      { label: "Beneficiaries", cell: (r) => r.beneficiaries || "—" }],
    search: (r) => [r.name, r.area, r.location, r.summary, r.funding].join(" "), searchLabel: "Search portfolio",
    filters: [{ label: "Status", options: [["ongoing", "Ongoing"], ["completed", "Completed"], ["not dated", "Not dated"]], test: (r, v) => r.status === v },
      { label: "Area", options: (rs) => distinct(rs, "area"), test: (r, v) => r.area === v }],
    sort: { i: 0, dir: "asc" }, onRow: portfolioView, empty: "The website portfolio could not be read."
  });

  const panes = { added: added.el, site: h("div", null, h("p", { class: "msg info" }, "Read-only: these 15 programmes come from the website file src/data/portfolio.ts."), site.el) };
  const body = h("div");
  const tabs = h("div", { class: "tabs", role: "tablist" }, [["added", "Added in admin"], ["site", "Website portfolio"]].map(([k, l]) =>
    h("button", { type: "button", role: "tab", "data-t": k, class: "tab", onclick: () => show(k) }, l, " ", h("span", { class: "count" }, "…"))));
  const show = (k) => { tabs.querySelectorAll(".tab").forEach((t) => { const on = t.dataset.t === k; t.classList.toggle("on", on); t.setAttribute("aria-selected", String(on)); }); body.replaceChildren(panes[k]); };

  wrap.append(h("div", { class: "page-head" }, h("div", { class: "grow" }, h("h1", null, "Projects"),
    h("p", { class: "mut" }, "Projects added here appear on the website Projects page under “Latest projects” (unless hidden)."))), tabs, body);
  show("added");
  api("/portfolio").then((p) => { site.set(p); tabs.querySelector("[data-t=site] .count").textContent = p.length; }).catch((e) => site.error(e.message));
  await load();
  return wrap;
};
