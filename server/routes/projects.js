import { db, eq } from "../db.js";
import { readJson } from "../http.js";
import { id, need, num, oneOf, str } from "../util.js";

const fields = (b) => ({ name: need(b.name, "Project name", 160), area: str(b.area, 80), location: str(b.location, 120), description: str(b.description, 2000),
  status: oneOf(b.status || "ongoing", ["planned", "ongoing", "completed"], "status"), beneficiaries: Math.max(0, Math.round(num(b.beneficiaries || 0))), published: b.published !== false });

export default [
  ["GET", "/api/projects", () => db.select("projects", "select=*&order=created_at.desc")],
  ["POST", "/api/projects", async ({ req }) => db.insert("projects", fields(await readJson(req)))],
  ["PATCH", "/api/projects/:id", async ({ req, params }) => db.update("projects", `id=${eq(id(params.id))}`, fields(await readJson(req)))],
  ["DELETE", "/api/projects/:id", async ({ params }) => { await db.remove("projects", `id=${eq(id(params.id))}`); return { ok: true }; }]
];
