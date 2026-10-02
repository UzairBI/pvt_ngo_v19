import { db, eq } from "../db.js";
import { httpError, readJson } from "../http.js";
import { id, need, oneOf, str, isEmail } from "../util.js";

export default [
  ["GET", "/api/volunteers", () => db.select("volunteers", "select=*&order=created_at.desc&limit=1000")],
  ["POST", "/api/volunteers", async ({ req }) => {
    const b = await readJson(req), email = str(b.email, 160);
    if (!isEmail(email)) throw httpError(400, "Email looks invalid");
    return db.insert("volunteers", { name: need(b.name, "Name", 120), phone: str(b.phone, 30), email, area: str(b.area, 80), status: "active" });
  }],
  ["PATCH", "/api/volunteers/:id", async ({ req, params }) => db.update("volunteers", `id=${eq(id(params.id))}`, { status: oneOf((await readJson(req)).status, ["pending", "active", "inactive"], "status") })],
  ["DELETE", "/api/volunteers/:id", async ({ params }) => { await db.remove("volunteers", `id=${eq(id(params.id))}`); return { ok: true }; }]
];
