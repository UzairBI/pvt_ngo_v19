// Read-only endpoints the website uses. Only published rows, only public fields.
import { db } from "../db.js";

export default [
  ["GET", "/api/public/events", async () => (await db.select("events", "published=eq.true&select=id,title,event_date,event_time,place,description,images&order=event_date.asc")).map((e) => ({
    id: `db-${e.id}`, title: e.title, date: e.event_date, time: e.event_time || undefined, place: e.place || "", text: e.description || "", images: e.images.map((n) => `/uploads/${n}`)
  }))],
  ["GET", "/api/public/projects", async () => (await db.select("projects", "published=eq.true&select=id,name,area,location,description,status,beneficiaries&order=created_at.desc")).map((p) => ({ ...p, id: `db-${p.id}` }))]
];
