import { api, upload } from "./api.js";
import { h, tag, fmtDate, field, modal, run, msg, dataTable, confirmDialog, toast } from "./ui.js";

const kv = (k, v) => v ? h("p", null, h("b", null, k + ": "), v) : null;

async function detail(row, reload) {
  const r = await api(`/requests/${row.id}`), box = h("div"), files = h("div");
  const subject = h("input", { value: `${r.document_type || "Your request"} (Ref ${r.reference || r.id})` });
  const message = h("textarea", { rows: "9" }, r.default_message);
  const refresh = async () => {
    const x = await api(`/requests/${r.id}`);
    files.replaceChildren(h("ul", { class: "files" }, x.attachments.length ? x.attachments.map((a) => h("li", null,
      h("a", { href: `/api/requests/${r.id}/attachments/${a.id}/download` }, a.filename), h("span", { class: "mut" }, `${Math.round(a.size / 1024)} KB`),
      h("button", { class: "danger sm", onclick: async () => { await run(box, () => api(`/requests/${r.id}/attachments/${a.id}`, { method: "DELETE" })); refresh(); } }, "Remove"))) : h("li", { class: "mut" }, "No attachments yet.")));
  };
  const picker = h("input", { type: "file", multiple: true, accept: ".pdf,.jpg,.jpeg,.png,.webp,.docx,.xlsx,.zip,.mp3,.m4a,.wav,.ogg", onchange: async () => {
    for (const f of picker.files) { if (!await run(box, () => upload(`/requests/${r.id}/attachments`, f))) break; }
    picker.value = ""; refresh();
  } });
  const sendBtn = h("button", { disabled: !r.mail_ready || !r.email, onclick: async () => {
    if (!await confirmDialog({ title: "Send to requester?", text: `The message and attached documents will be emailed to ${r.email}.`, ok: "Send email" })) return;
    sendBtn.disabled = true;
    sendBtn.textContent = "Sending…";
    if (await run(box, () => api(`/requests/${r.id}/send`, { method: "POST", body: { subject: subject.value, message: message.value } }), "Sent. Status is now Sent.")) { toast("Email sent."); reload(); }
    sendBtn.disabled = false; sendBtn.textContent = "Send to requester";
  } }, "Send to requester");
  const setStatus = (s, text) => h("button", { class: "ghost", onclick: async () => { if (await run(box, () => api(`/requests/${r.id}`, { method: "PATCH", body: { status: s, message: message.value } }), text)) reload(); } }, text);
  const body = h("div", null, box,
    h("p", null, tag(r.status, r.status_label), " ", h("span", { class: "mut" }, `${r.reference || ""} · received ${fmtDate(r.created_at)}${r.sent_at ? " · sent " + fmtDate(r.sent_at) : ""}`)),
    kv("Requester", r.name), kv("Organisation", r.organisation), kv("Email", r.email), kv("Phone", r.phone),
    kv("Request", `${r.request_type || ""}: ${r.document_type || ""}${r.financial_year ? " (" + r.financial_year + ")" : ""}`), kv("Purpose", r.purpose), kv("Delivery", r.delivery), kv("Postal address", r.delivery_address), kv("Message from requester", r.message),
    h("h2", null, "Documents to send"), files, field("Add document(s) (PDF, image, audio, Office; max 15 MB each)", picker),
    h("h2", null, "Email to requester"), !r.mail_ready && msg("info", "Email is not configured on the server (SMTP_* in .env). You can still attach files and use “Mark as sent” after sending them yourself."),
    field("Subject", subject), field("Message (edit freely)", message),
    h("div", { class: "row" }, sendBtn, setStatus("sent", "Mark as sent"), setStatus("completed", "Mark completed"), r.status !== "new" && setStatus("new", "Back to pending")));
  modal("Document request", body); refresh();
}

export default async () => {
  const wrap = h("div");
  const list = dataTable({
    columns: [
      { label: "Received", cell: (r) => fmtDate(r.created_at), sort: (r) => r.created_at, firstDir: "desc" },
      { label: "Ref", cell: (r) => r.reference, sort: (r) => r.reference || "" },
      { label: "Requester", cell: (r) => h("div", null, r.name || "—", r.organisation ? h("div", { class: "mut" }, r.organisation) : null), sort: (r) => (r.name || "").toLowerCase() },
      { label: "Document", cell: (r) => h("div", null, r.document_type || "—", h("div", { class: "mut" }, [r.request_type, r.financial_year].filter(Boolean).join(" · "))), sort: (r) => r.document_type || "" },
      { label: "Files", cell: (r) => r.attachments, sort: (r) => r.attachments, cls: "num" },
      { label: "Status", cell: (r) => tag(r.status, r.status_label), sort: (r) => ["new", "sent", "completed"].indexOf(r.status) }],
    search: (r) => [r.reference, r.name, r.organisation, r.email, r.phone, r.document_type, r.purpose, r.message].join(" "), searchLabel: "Search ref, name, email, document",
    filters: [
      { label: "Status", value: "new", options: [["new", "Pending"], ["sent", "Sent"], ["completed", "Completed"]], test: (r, v) => r.status === v },
      { label: "Type", options: [["Certificate", "Certificate"], ["Audit report", "Audit report"]], test: (r, v) => r.request_type === v }],
    date: { label: "Received", get: (r) => r.created_at }, sort: { i: 0, dir: "desc" }, onRow: (r) => detail(r, load),
    empty: "No document requests yet. Requests from the website Transparency page arrive here."
  });
  async function load() { list.loading(); try { list.set(await api("/requests")); } catch (e) { list.error(e.message); } }
  wrap.append(h("div", { class: "page-head" }, h("div", { class: "grow" }, h("h1", null, "Certificate / document requests"),
    h("p", { class: "mut" }, "Showing pending requests first. Change the Status filter to see sent and completed ones."))), list.el);
  await load(); return wrap;
};
