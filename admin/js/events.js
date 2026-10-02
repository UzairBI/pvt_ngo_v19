import { api, upload } from "./api.js";
import { h, fmtDate, field, modal, run, tag, dataTable, confirmDialog, toast, busy, validate, rules } from "./ui.js";

function form(e, reload) {
  e = e || { images: [] };
  const box = h("div"), imgs = h("div", { class: "thumbs" });
  const save = h("button", { type: "submit" }, e.id ? "Save changes" : "Create event");
  const f = h("form", { novalidate: true, onsubmit: async (ev) => {
    ev.preventDefault();
    if (!validate(f, { title: rules.required("Event name", 160), event_date: (v) => (!v ? "Date is required" : null), event_time: rules.max("Time", 60), place: rules.max("Place", 200), description: rules.max("Description", 3000) })) return;
    const b = Object.fromEntries(new FormData(f)); b.published = f.published.checked;
    const saved = await busy(save, () => run(box, () => api(e.id ? `/events/${e.id}` : "/events", { method: e.id ? "PATCH" : "POST", body: b })));
    if (saved) { close(); toast(e.id ? "Event saved." : "Event created. You can add images now."); reload(); if (!e.id) form(saved, reload); } // after creating, reopen so images can be added
  } }, box,
    h("div", { class: "grid2" }, field("Event name", h("input", { name: "title", required: true, value: e.title || "" })), field("Date (today or later = Upcoming, earlier = Past events)", h("input", { name: "event_date", type: "date", required: true, value: e.event_date || "" })),
      field("Time (e.g. 10:00 AM - 2:00 PM)", h("input", { name: "event_time", value: e.event_time || "" })), field("Place", h("input", { name: "place", value: e.place || "" }))),
    field("Description", h("textarea", { name: "description", rows: "4" }, e.description || "")),
    h("label", { class: "chk" }, h("input", { type: "checkbox", name: "published", checked: e.id ? !!e.published : true }), "Published (visible on the website Events page)"),
    h("div", { class: "row end" }, h("button", { type: "button", class: "ghost", onclick: () => close() }, "Cancel"), save));
  const draw = (list) => imgs.replaceChildren(...list.map((n) => h("div", null, h("img", { src: `/uploads/${n}`, alt: "" }), h("button", { class: "danger sm", type: "button", onclick: async () => { const u = await run(box, () => api(`/events/${e.id}/images/${encodeURIComponent(n)}`, { method: "DELETE" })); if (u) { e.images = u.images; draw(u.images); reload(); } } }, "Remove"))));
  const picker = h("input", { type: "file", accept: ".jpg,.jpeg,.png,.webp", multiple: true, onchange: async () => {
    for (const file of picker.files) { const u = await run(box, () => upload(`/events/${e.id}/images`, file)); if (!u) break; e.images = u.images; draw(u.images); }
    picker.value = ""; reload();
  } });
  const del = e.id && h("button", { class: "danger", type: "button", onclick: async () => { if (await confirmDialog({ title: "Delete event?", text: "This event and its images will be deleted. This cannot be undone.", ok: "Delete event", danger: true }) && await run(box, () => api(`/events/${e.id}`, { method: "DELETE" }))) { close(); toast("Event deleted."); reload(); } } }, "Delete event");
  const body = h("div", null, f, e.id ? h("div", null, h("h2", null, "Images (JPG/PNG/WebP, max 5 MB, up to 6)"), imgs, field("Add image", picker), del) : h("p", { class: "mut" }, "Images can be added right after the event is created."));
  const close = modal(e.id ? "Edit event" : "New event", body); draw(e.images);
}

export default async () => {
  const wrap = h("div"), today = new Date().toISOString().slice(0, 10);
  const list = dataTable({
    columns: [
      { label: "Date", cell: (r) => fmtDate(r.event_date), sort: (r) => r.event_date },
      { label: "Event", cell: (r) => h("div", null, h("b", null, r.title), r.event_time ? h("div", { class: "mut" }, r.event_time) : null), sort: (r) => r.title.toLowerCase() },
      { label: "Place", cell: (r) => r.place || "—", sort: (r) => (r.place || "").toLowerCase() },
      { label: "Images", cell: (r) => r.images.length, sort: (r) => r.images.length, cls: "num" },
      { label: "When", cell: (r) => tag(r.event_date >= today ? "active" : "cancelled", r.event_date >= today ? "Upcoming" : "Past"), sort: (r) => (r.event_date >= today ? 0 : 1) },
      { label: "Status", cell: (r) => tag(r.published ? "active" : "pending", r.published ? "Published" : "Draft"), sort: (r) => (r.published ? 0 : 1) }],
    search: (r) => [r.title, r.place, r.description, r.event_time].join(" "), searchLabel: "Search events",
    filters: [
      { label: "When", options: [["upcoming", "Upcoming"], ["past", "Past"]], test: (r, v) => (v === "upcoming") === (r.event_date >= today) },
      { label: "Status", options: [["published", "Published"], ["draft", "Draft"]], test: (r, v) => (v === "published") === !!r.published }],
    date: { label: "Date", get: (r) => r.event_date }, sort: { i: 0, dir: "desc" }, onRow: (r) => form(r, load),
    empty: "No events yet. Published events appear on the website Events page.",
    tools: [h("button", { onclick: () => form(null, load) }, "+ New event")]
  });
  async function load() { list.loading(); try { list.set(await api("/events")); } catch (e) { list.error(e.message); } }
  wrap.append(h("div", { class: "page-head" }, h("div", { class: "grow" }, h("h1", null, "Events"), h("p", { class: "mut" }, "Click an event to edit it or add images."))), list.el);
  await load(); return wrap;
};
