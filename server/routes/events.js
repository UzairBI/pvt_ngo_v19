import fs from "node:fs";
import { config } from "../config.js";
import { db, eq } from "../db.js";
import { httpError, readJson } from "../http.js";
import { saveUpload, safeJoin } from "../files.js";
import { id, need, str, isDate } from "../util.js";

const fields = (b) => ({ title: need(b.title, "Event name", 160), event_date: isDate(b.event_date, "Date"), event_time: str(b.event_time, 60), place: str(b.place, 200), description: str(b.description, 3000), published: !!b.published });
const load = async (rid) => { const e = (await db.select("events", `id=${eq(id(rid))}`))[0]; if (!e) throw httpError(404, "Event not found"); return e; };

export default [
  ["GET", "/api/events", () => db.select("events", "select=*&order=event_date.desc")],
  ["POST", "/api/events", async ({ req }) => db.insert("events", fields(await readJson(req)))],
  ["PATCH", "/api/events/:id", async ({ req, params }) => db.update("events", `id=${eq(id(params.id))}`, fields(await readJson(req)))],
  ["DELETE", "/api/events/:id", async ({ params }) => {
    const e = await load(params.id);
    await db.remove("events", `id=${eq(e.id)}`);
    for (const f of e.images) fs.rmSync(safeJoin(config.uploadsDir, f), { force: true });
    return { ok: true };
  }],
  ["POST", "/api/events/:id/images", async ({ req, params }) => {
    const e = await load(params.id);
    if (e.images.length >= 6) throw httpError(400, "Maximum 6 images per event");
    const f = await saveUpload(req, { dir: config.uploadsDir, kind: "image" });
    return db.update("events", `id=${eq(e.id)}`, { images: [...e.images, f.stored_name] });
  }],
  ["DELETE", "/api/events/:id/images/:name", async ({ params }) => {
    const e = await load(params.id);
    if (!e.images.includes(params.name)) throw httpError(404, "Image not found");
    fs.rmSync(safeJoin(config.uploadsDir, params.name), { force: true });
    return db.update("events", `id=${eq(e.id)}`, { images: e.images.filter((n) => n !== params.name) });
  }]
];
