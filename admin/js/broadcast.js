import { api } from "./api.js";
import { h, field, run, fmtDate, dataTable, confirmDialog, toast, validate, rules } from "./ui.js";

export default async () => {
  const info = await api("/broadcast"), box = h("div");
  const audience = h("select", null, [["volunteers", "Active volunteers"], ["donors", "Donors (successful donations)"], ["all", "Volunteers + donors"]].map(([v, l]) => h("option", { value: v }, `${l} (${info.counts[v]} with email)`)));
  const subject = h("input", { name: "subject", maxlength: "200" }), message = h("textarea", { name: "message", rows: "8", maxlength: "5000" });
  const form = h("form", { novalidate: true, onsubmit: (e) => e.preventDefault() });
  const btn = h("button", { type: "button", onclick: async () => {
    box.replaceChildren();
    if (!validate(form, { subject: rules.required("Subject", 200), message: rules.required("Message", 5000) })) return;
    if (!info.counts[audience.value]) return box.replaceChildren(h("div", { class: "msg err" }, "Nobody in this audience has an email address yet."));
    if (!await confirmDialog({ title: "Send broadcast?", text: `This email goes to ${info.counts[audience.value]} recipient(s) and cannot be undone.`, ok: "Send now" })) return;
    btn.disabled = true; btn.textContent = "Sending…";
    const r = await run(box, () => api("/broadcast", { method: "POST", body: { audience: audience.value, subject: subject.value, message: message.value } }));
    btn.disabled = false; btn.textContent = "Send broadcast";
    if (r) { box.replaceChildren(h("div", { class: "msg ok" }, `Sent to ${r.sent} recipient(s)${r.failed ? `, ${r.failed} failed` : ""}.`)); toast("Broadcast sent."); subject.value = message.value = ""; }
  } }, "Send broadcast");
  form.append(box, field("Audience", audience), field("Subject *", subject), field("Message *", message), btn);
  const hist = dataTable({ columns: [{ label: "Sent", cell: (r) => fmtDate(r.created_at), sort: (r) => r.created_at, firstDir: "desc" }, { label: "Audience", cell: (r) => r.audience, sort: (r) => r.audience },
    { label: "Subject", cell: (r) => r.subject, sort: (r) => (r.subject || "").toLowerCase() }, { label: "Recipients", cell: (r) => r.recipients, sort: (r) => r.recipients, cls: "num" }],
    rows: info.history, search: (r) => [r.subject, r.body, r.audience].join(" "), searchLabel: "Search broadcasts", sort: { i: 0, dir: "desc" }, pageSize: 10,
    empty: "No broadcasts sent yet." });
  return h("div", null, h("div", { class: "page-head" }, h("div", { class: "grow" }, h("h1", null, "Broadcast message"), h("p", { class: "mut" }, "Email active volunteers and/or donors. Recipients never see each other (BCC)."))),
    h("div", { class: "panel" }, form), h("h2", { class: "sec" }, "Recent broadcasts"), hist.el);
};
