import { api, AuthError } from "./api.js";
import { h, field, msg, run, spinner } from "./ui.js";
import dashboard from "./dashboard.js";
import reports from "./reports.js";
import donations from "./donations.js";
import requests from "./requests.js";
import events from "./events.js";
import projects from "./projects.js";
import volunteers from "./volunteers.js";
import broadcast from "./broadcast.js";
import admins from "./admins.js";

// [label, page, badge key from /api/dashboard]
const pages = {
  dashboard: ["Dashboard", dashboard], reports: ["Analytics", reports], projects: ["Projects", projects],
  donations: ["Donations", donations, (d) => d.funds.pending], volunteers: ["Volunteers", volunteers, (d) => d.pendingVolunteers],
  requests: ["Document requests", requests, (d) => d.pendingRequests], events: ["Events", events], broadcast: ["Broadcast", broadcast],
  admins: ["Admins & activity", admins]
};
const app = document.getElementById("app");
let signedIn = false;

function loginView() {
  signedIn = false; window.onhashchange = null;
  const box = h("div"), id = h("input", { autocomplete: "username", required: true }), pw = h("input", { type: "password", autocomplete: "current-password", required: true });
  const btn = h("button", { type: "submit" }, "Sign in");
  const form = h("form", { class: "panel", onsubmit: async (e) => {
    e.preventDefault(); btn.disabled = true; btn.textContent = "Signing in…";
    const ok = await run(box, () => api("/login", { method: "POST", body: { adminId: id.value, password: pw.value } }));
    btn.disabled = false; btn.textContent = "Sign in"; pw.value = ""; if (ok) start();
  } }, h("h1", null, "Admin sign in"), box, field("Admin ID", id), field("Password", pw), btn);
  app.replaceChildren(h("div", { class: "login" }, form));
  id.focus();
}
// any request that finds the session expired sends the admin back to sign in
window.addEventListener("admin:signed-out", () => { if (signedIn) loginView(); });

async function start() {
  let me;
  try { me = await api("/me"); } catch { return loginView(); }
  signedIn = true;
  const main = h("main", { id: "main", tabindex: "-1" });
  const links = Object.entries(pages).map(([k, [label]]) => h("a", { href: "#/" + k, "data-k": k }, h("span", null, label), h("span", { class: "badge", hidden: true })));
  const menu = h("div", { class: "side-links" }, links,
    h("a", { href: "/", target: "_blank", rel: "noopener" }, "View website ↗"),
    h("button", { class: "ghost", onclick: async () => { await api("/logout", { method: "POST" }).catch(() => {}); loginView(); } }, `Sign out (${me.adminId})`));
  const toggle = h("button", { class: "menu-btn ghost sm", "aria-expanded": "false", "aria-controls": "side-links", onclick: () => {
    const open = nav.classList.toggle("open"); toggle.setAttribute("aria-expanded", String(open));
  } }, "Menu");
  menu.id = "side-links";
  const nav = h("nav", { class: "side", "aria-label": "Admin" }, h("div", { class: "side-top" }, h("a", { href: "#/dashboard", class: "brand" }, h("img", { src: "/assets/images/logo.png", alt: "", onerror: (e) => e.target.remove() }), h("b", null, "NGO Admin")), toggle), menu,
    h("div", { class: "side-card" }, h("img", { src: "/assets/images/field-9.jpg", alt: "", onerror: (e) => e.target.remove() }), h("strong", null, "Creating Brighter Futures"), h("span", null, "Your work helps empower communities.")));
  const crumb = h("span", { class: "crumb" });
  const topbar = h("header", { class: "topbar" }, crumb, h("div", { class: "grow" }), h("div", { class: "who" }, h("span", { class: "avatar", "aria-hidden": "true" }, (me.adminId || "A")[0].toUpperCase()), h("span", null, h("b", null, me.adminId), h("small", null, "Administrator"))));
  app.replaceChildren(h("div", { class: "shell" }, nav, h("div", { class: "content" }, topbar, main)));

  // "needs attention" counters next to the menu items
  const badges = async () => {
    try {
      const d = await api("/dashboard");
      links.forEach((a) => { const f = pages[a.dataset.k][2], n = f ? f(d) : 0, b = a.querySelector(".badge"); b.hidden = !n; b.textContent = n || ""; b.title = n ? `${n} need attention` : ""; });
    } catch { /* badges are optional */ }
  };
  const route = async () => {
    const key = (location.hash.match(/^#\/(\w+)/) || [])[1];
    const k = pages[key] ? key : "dashboard";
    links.forEach((a) => { const on = a.dataset.k === k; a.classList.toggle("on", on); on ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current"); });
    nav.classList.remove("open"); toggle.setAttribute("aria-expanded", "false");
    document.title = `${pages[k][0]} · Admin`; crumb.textContent = pages[k][0];
    main.replaceChildren(spinner());
    try { main.replaceChildren(await pages[k][1]({ me, go: (p) => (location.hash = "#/" + p), reload: route, badges })); }
    catch (e) { if (e instanceof AuthError) return loginView(); main.replaceChildren(msg("err", e.message), h("button", { class: "ghost", onclick: route }, "Try again")); }
    badges();
  };
  window.onhashchange = route; route();
}
start();
