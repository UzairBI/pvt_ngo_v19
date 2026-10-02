// Safe DOM helper: text is always set via textContent / DOM nodes (never innerHTML) so data cannot inject HTML.
export function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === false || v == null) continue;
    if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else if (k === "class") el.className = v;
    else if (k === "value") el.value = v;
    else el.setAttribute(k, v === true ? "" : v);
  }
  for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  return el;
}
export const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
export const tag = (s, text) => h("span", { class: `tag ${s}` }, text || s);
export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "");
export const msg = (kind, text) => h("div", { class: `msg ${kind}`, role: kind === "err" ? "alert" : "status" }, text);
export const field = (label, input) => h("label", null, label, input);

export function modal(title, body) {
  const esc = (e) => { if (e.key === "Escape" && document.querySelector(".modal:last-of-type") === wrap) close(); };
  const close = () => { document.removeEventListener("keydown", esc); wrap.remove(); };
  const wrap = h("div", { class: "modal", onclick: (e) => e.target === wrap && close() },
    h("div", { class: "panel", role: "dialog", "aria-modal": "true", "aria-label": title }, h("div", { class: "row" }, h("h2", { class: "grow" }, title), h("button", { class: "ghost sm", type: "button", onclick: close }, "Close")), body));
  document.addEventListener("keydown", esc); document.body.append(wrap);
  wrap.querySelector("input:not([type=hidden]),select,textarea")?.focus();
  return close;
}
/** Runs an async action, shows the error (or success text) inside `box`. */
export async function run(box, fn, okText) {
  box.replaceChildren();
  try { const r = await fn(); if (okText) box.append(msg("ok", okText)); return r; }
  catch (e) { box.append(msg("err", e.message)); return undefined; }
}
export function table(cols, rows, onClick) {
  return h("div", { class: "tablewrap" }, h("table", null, h("thead", null, h("tr", null, cols.map((c) => h("th", null, c.label)))),
    h("tbody", null, rows.length ? rows.map((r) => h("tr", { class: onClick ? "click" : "", onclick: onClick && (() => onClick(r)) }, cols.map((c) => h("td", null, c.cell(r))))) : h("tr", null, h("td", { colspan: cols.length }, "Nothing here yet.")))));
}

// ======================================================================================================
// Shared building blocks for the admin pages (no libraries). Everything below is reused by every section.
// ======================================================================================================

export const fmtDateTime = (d) => (d ? new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "");
export function timeAgo(d) {
  if (!d) return "";
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 86400 * 7) return `${Math.floor(s / 86400)} d ago`;
  return fmtDate(d);
}
export const monthLabel = (m, long) => new Date(m + "-01T00:00:00").toLocaleDateString("en-IN", long ? { month: "long", year: "numeric" } : { month: "short" });
const day = (d) => String(d || "").slice(0, 10);

/** Small "Loading…" indicator. */
export const spinner = (text = "Loading…") => h("div", { class: "loading", role: "status" }, h("span", { class: "spin", "aria-hidden": "true" }), text);
/** Friendly empty state, optionally with an action button. */
export const emptyState = (text, action) => h("div", { class: "empty" }, h("p", null, text), action || null);

/** Toast message in the corner (success by default). */
export function toast(text, kind = "ok") {
  let box = document.querySelector(".toasts");
  if (!box) { box = h("div", { class: "toasts", "aria-live": "polite" }); document.body.append(box); }
  const t = h("div", { class: `toast ${kind}`, role: kind === "err" ? "alert" : "status" }, text);
  box.append(t);
  setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 300); }, kind === "err" ? 6000 : 3500);
}

/** Confirmation dialog. Resolves true (confirmed) or false (cancelled / closed). Replaces window.confirm. */
export function confirmDialog({ title = "Are you sure?", text = "", ok = "Confirm", danger = false } = {}) {
  return new Promise((resolve) => {
    const done = (v) => { document.removeEventListener("keydown", esc); wrap.remove(); resolve(v); };
    const esc = (e) => { if (e.key === "Escape") done(false); };
    const cancel = h("button", { type: "button", class: "ghost", onclick: () => done(false) }, "Cancel");
    const wrap = h("div", { class: "modal", onclick: (e) => e.target === wrap && done(false) },
      h("div", { class: "panel dialog", role: "alertdialog", "aria-modal": "true", "aria-label": title },
        h("h2", null, title), text && h("p", null, text),
        h("div", { class: "row end" }, cancel, h("button", { type: "button", class: danger ? "danger solid" : "", onclick: () => done(true) }, ok))));
    document.addEventListener("keydown", esc); document.body.append(wrap); cancel.focus();
  });
}

/** Disables a button and shows `label` while the async `fn` runs; restores it afterwards. */
export async function busy(btn, fn, label = "Saving…") {
  const text = btn.textContent; btn.disabled = true; btn.textContent = label; btn.classList.add("is-busy");
  try { return await fn(); } finally { btn.disabled = false; btn.textContent = text; btn.classList.remove("is-busy"); }
}

/**
 * Form validation. `rules` = { fieldName: (value, form) => "error text" | null }.
 * Shows the message under the field, marks it aria-invalid, focuses the first problem. Returns true if valid.
 */
export function validate(form, rules) {
  let first = null;
  for (const [name, rule] of Object.entries(rules)) {
    const input = form.elements[name]; if (!input) continue;
    const label = input.closest("label") || input.parentElement;
    label.querySelector(".ferr")?.remove(); input.removeAttribute("aria-invalid");
    const err = rule(String(input.value ?? "").trim(), form);
    if (err) {
      input.setAttribute("aria-invalid", "true"); label.append(h("span", { class: "ferr" }, err)); first = first || input;
      input.addEventListener("input", () => { input.removeAttribute("aria-invalid"); label.querySelector(".ferr")?.remove(); }, { once: true });
    }
  }
  first?.focus();
  return !first;
}
export const rules = {
  required: (label, max) => (v) => (!v ? `${label} is required` : max && v.length > max ? `${label} must be ${max} characters or fewer` : null),
  max: (label, max) => (v) => (v.length > max ? `${label} must be ${max} characters or fewer` : null),
  email: (v) => (v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "Enter a valid email address" : null),
  phone: (v) => (v && !/^[\d+()\-.\s]{7,30}$/.test(v) ? "Enter a valid phone number" : null),
  wholeNumber: (label) => (v) => (v !== "" && !/^\d+$/.test(v) ? `${label} must be a whole number (0 or more)` : null)
};

/**
 * Interactive table: search, filters, date range, column sorting, pagination, empty + loading states.
 *  columns: [{ label, cell(r), sort?(r) -> value, cls? }]
 *  filters: [{ label, options: [[value, text]] | (rows) => [[value, text]], test(r, value), value? }]
 *  date:    { label, get(r) -> date string }   search: (r) -> text to search in
 *  onRow(r): row click / Enter.   summary(rows): node shown above the table for the filtered rows.
 */
export function dataTable({ columns, rows = [], search, filters = [], date, pageSize = 10, onRow, empty = "Nothing here yet.", sort = null, summary, tools = [], searchLabel = "Search" }) {
  const st = { rows, q: "", f: filters.map((f) => f.value || ""), from: "", to: "", sort, page: 1, size: pageSize, state: "ready", error: "" };
  const el = h("div", { class: "dt" });
  const qIn = search && h("input", { type: "search", placeholder: searchLabel + "…", "aria-label": searchLabel, oninput: () => { clearTimeout(qIn.t); qIn.t = setTimeout(() => { st.q = qIn.value.trim().toLowerCase(); st.page = 1; draw(); }, 200); } });
  const fSel = filters.map((f, i) => h("select", { "aria-label": f.label, onchange: (e) => { st.f[i] = e.target.value; st.page = 1; draw(); } }));
  const fromIn = date && h("input", { type: "date", "aria-label": `${date.label} from`, onchange: (e) => { st.from = e.target.value; st.page = 1; draw(); } });
  const toIn = date && h("input", { type: "date", "aria-label": `${date.label} to`, onchange: (e) => { st.to = e.target.value; st.page = 1; draw(); } });
  const clear = h("button", { type: "button", class: "ghost sm", hidden: true, onclick: () => {
    st.q = ""; st.f = filters.map(() => ""); st.from = st.to = ""; st.page = 1;
    if (qIn) qIn.value = ""; fSel.forEach((s) => (s.value = "")); if (date) fromIn.value = toIn.value = ""; draw();
  } }, "Clear filters");
  const info = h("div", { class: "dt-info" }), body = h("div"), pager = h("div", { class: "dt-pager" }), sum = h("div", { class: "dt-sum" });
  el.append(h("div", { class: "dt-tools" }, qIn && h("div", { class: "dt-search" }, qIn), ...fSel.map((s, i) => h("label", { class: "dt-f" }, filters[i].label, s)),
    date && h("label", { class: "dt-f" }, `${date.label} from`, fromIn), date && h("label", { class: "dt-f" }, "to", toIn), clear, h("div", { class: "grow" }), ...tools), sum, body, h("div", { class: "dt-foot" }, info, pager));

  const options = () => fSel.forEach((s, i) => {
    const f = filters[i], list = typeof f.options === "function" ? f.options(st.rows) : f.options;
    s.replaceChildren(h("option", { value: "" }, f.all || "All"), ...list.map(([v, t]) => h("option", { value: v }, t ?? v)));
    s.value = list.some(([v]) => v === st.f[i]) ? st.f[i] : (st.f[i] = "");
  });
  const filtered = () => {
    let out = st.rows.filter((r) => (!st.q || String(search(r) || "").toLowerCase().includes(st.q))
      && filters.every((f, i) => !st.f[i] || f.test(r, st.f[i]))
      && (!date || ((!st.from || day(date.get(r)) >= st.from) && (!st.to || day(date.get(r)) <= st.to))));
    if (st.sort) {
      const c = columns[st.sort.i], dir = st.sort.dir === "asc" ? 1 : -1;
      out = [...out].sort((a, b) => { const x = c.sort(a), y = c.sort(b); return (x == null ? 1 : y == null ? -1 : x < y ? -1 : x > y ? 1 : 0) * dir; });
    }
    return out;
  };
  function draw() {
    clear.hidden = !(st.q || st.f.some(Boolean) || st.from || st.to);
    if (st.state === "loading") { body.replaceChildren(spinner()); info.textContent = ""; pager.replaceChildren(); sum.replaceChildren(); return; }
    if (st.state === "error") { body.replaceChildren(msg("err", st.error)); info.textContent = ""; pager.replaceChildren(); sum.replaceChildren(); return; }
    const all = filtered(), pages = Math.max(1, Math.ceil(all.length / st.size));
    st.page = Math.min(st.page, pages);
    const view = all.slice((st.page - 1) * st.size, st.page * st.size);
    sum.replaceChildren(summary && all.length ? summary(all) : "");
    const head = columns.map((c, i) => {
      if (!c.sort) return h("th", { class: c.cls || "" }, c.label);
      const on = st.sort?.i === i, dir = on ? st.sort.dir : null;
      return h("th", { class: c.cls || "", "aria-sort": on ? (dir === "asc" ? "ascending" : "descending") : "none" },
        h("button", { type: "button", class: "th-sort", onclick: () => { st.sort = { i, dir: on && dir === "asc" ? "desc" : on ? "asc" : (c.firstDir || "asc") }; draw(); } },
          c.label, h("span", { class: "arrow", "aria-hidden": "true" }, on ? (dir === "asc" ? "▲" : "▼") : "↕")));
    });
    const tr = (r) => h("tr", { class: onRow ? "click" : "", tabindex: onRow ? "0" : null, onclick: onRow && ((e) => { if (!e.target.closest("button,select,a,input")) onRow(r); }),
      onkeydown: onRow && ((e) => { if (e.key === "Enter" && e.target.tagName === "TR") onRow(r); }) }, columns.map((c) => h("td", { class: c.cls || "" }, c.cell(r))));
    body.replaceChildren(h("div", { class: "tablewrap" }, h("table", null, h("thead", null, h("tr", null, head)),
      h("tbody", null, view.length ? view.map(tr) : h("tr", null, h("td", { colspan: columns.length, class: "td-empty" }, st.rows.length ? "No results match these filters." : empty))))));
    info.textContent = all.length ? `Showing ${(st.page - 1) * st.size + 1}–${(st.page - 1) * st.size + view.length} of ${all.length}${all.length !== st.rows.length ? ` (filtered from ${st.rows.length})` : ""}` : "";
    pager.replaceChildren(
      h("label", { class: "dt-size" }, "Rows", h("select", { "aria-label": "Rows per page", onchange: (e) => { st.size = +e.target.value; st.page = 1; draw(); } }, [10, 25, 50, 100].map((n) => h("option", { value: n, selected: n === st.size }, n)))),
      h("button", { type: "button", class: "ghost sm", disabled: st.page <= 1, onclick: () => { st.page--; draw(); } }, "‹ Prev"),
      h("span", { class: "mut" }, `Page ${st.page} of ${pages}`),
      h("button", { type: "button", class: "ghost sm", disabled: st.page >= pages, onclick: () => { st.page++; draw(); } }, "Next ›"));
  }
  options(); draw();
  return {
    el,
    set(rows) { st.rows = rows; st.state = "ready"; options(); draw(); },
    loading() { st.state = "loading"; draw(); },
    error(text) { st.state = "error"; st.error = text; draw(); },
    get rows() { return filtered(); }
  };
}

/** Vertical bar chart (SVG, no library). data: [{ label, value, title? }] */
export function barChart(data, { format = (v) => String(v), height = 190, emptyText = "No data for this period yet." } = {}) {
  const max = Math.max(0, ...data.map((d) => d.value));
  if (!max) return emptyState(emptyText);
  const NS = "http://www.w3.org/2000/svg", W = 640, H = height, top = 18, bottom = 26, left = 6, bw = (W - left * 2) / data.length;
  const s = (tag, attrs, text) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); if (text != null) e.textContent = text; return e; };
  const svg = s("svg", { viewBox: `0 0 ${W} ${H}`, class: "chart", role: "img", "aria-label": data.map((d) => `${d.title || d.label}: ${format(d.value)}`).join("; ") });
  [0.5, 1].forEach((f) => svg.append(s("line", { x1: 0, x2: W, y1: top + (H - top - bottom) * (1 - f), y2: top + (H - top - bottom) * (1 - f), class: "grid" })));
  data.forEach((d, i) => {
    const bh = (H - top - bottom) * (d.value / max), x = left + i * bw + bw * 0.18, w = bw * 0.64, y = H - bottom - bh;
    const g = s("g", { class: "bar" });
    g.append(s("title", {}, `${d.title || d.label}: ${format(d.value)}`), s("rect", { x, y, width: w, height: Math.max(bh, d.value ? 2 : 0), rx: 3 }));
    if (d.value) g.append(s("text", { x: x + w / 2, y: y - 5, class: "val" }, format(d.value)));
    g.append(s("text", { x: x + w / 2, y: H - 8, class: "lbl" }, d.label));
    svg.append(g);
  });
  return svg;
}

/** Horizontal bars for breakdowns. items: [{ label, value, cls? }] */
export function statBars(items, { format = (v) => String(v), emptyText = "No data yet." } = {}) {
  const max = Math.max(0, ...items.map((i) => i.value));
  if (!max) return emptyState(emptyText);
  return h("div", { class: "sbars" }, items.map((i) => {
    const fill = h("span", { class: `sbar-fill ${i.cls || ""}` });
    fill.style.width = `${Math.max(2, (i.value / max) * 100)}%`; // CSSOM (allowed by the admin's strict CSP)
    return h("div", { class: "sbar" }, h("span", { class: "sbar-l" }, i.label), h("span", { class: "sbar-t" }, fill), h("span", { class: "sbar-v" }, format(i.value)));
  }));
}

/** Dashboard stat card. */
export const statCard = (label, value, sub, opts = {}) => h(opts.href ? "a" : "div", { class: `card${opts.tone ? " " + opts.tone : ""}`, href: opts.href || null },
  h("div", { class: "n" }, value), h("div", { class: "l" }, label), sub ? h("div", { class: "s" }, sub) : null);
/** A titled panel. */
export const panel = (title, ...kids) => h("section", { class: "panel" }, title ? h("h2", null, title) : null, ...kids);
