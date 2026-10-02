// Admin + public-API server. Run: npm run admin   (serves /admin, /api/*, /uploads/* and the built site from dist/ if present)
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { config, checkConfig, ROOT } from "./config.js";
import { send, readJson, sessionCookie, securityHeaders, clientIp, httpError } from "./http.js";
import { login, currentAdmin, checkCsrf } from "./auth.js";
import { mailReady } from "./mailer.js";
import { mimeFor } from "./files.js";
import dashboard from "./routes/dashboard.js";
import donations from "./routes/donations.js";
import requests from "./routes/requests.js";
import events from "./routes/events.js";
import projects from "./routes/projects.js";
import volunteers from "./routes/volunteers.js";
import broadcast from "./routes/broadcast.js";
import pub from "./routes/public.js";
import webhooks from "./routes/webhooks.js";
import siteForms from "./routes/site-forms.js";
import reports from "./routes/reports.js";
import { before, logActivity, logSignIn } from "./activity.js";
import "./db.js"; // opens server/data.db and creates the tables on first run

const missing = checkConfig();
if (missing.length) { console.error("Problem in .env:\n  - " + missing.join("\n  - ") + "\nSee ADMIN_SETUP.md"); process.exit(1); }

const compile = (list) => list.map(([method, pattern, handler]) => ({ method, handler, keys: [...pattern.matchAll(/:(\w+)/g)].map((m) => m[1]), re: new RegExp("^" + pattern.replace(/:\w+/g, "([^/]+)") + "$") }));
const adminRoutes = compile([...dashboard, ...donations, ...requests, ...events, ...projects, ...volunteers, ...broadcast, ...reports]);
const publicRoutes = compile([...pub, ...webhooks, ...siteForms]);
const CORS = { "Access-Control-Allow-Origin": "*" }; // site may be hosted on another address than this server
const match = (table, method, p) => { for (const r of table) { const m = r.method === method && p.match(r.re); if (m) return { r, params: Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])])) }; } };

const MIME_TEXT = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".svg": "image/svg+xml", ".json": "application/json", ".ico": "image/x-icon", ".woff2": "font/woff2", ".txt": "text/plain" };
function serveFile(res, file, headers = {}) {
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return false;
  const ext = path.extname(file).toLowerCase();
  res.writeHead(200, { "Content-Type": MIME_TEXT[ext] || mimeFor(file), ...headers }); fs.createReadStream(file).pipe(res); return true;
}
const inside = (dir, rel) => { const f = path.join(dir, rel); return f.startsWith(dir + path.sep) ? f : null; };

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://x"); const p = url.pathname;
  try {
    // ---- public API: read-only GETs + the website form POSTs (CORS open so a separately hosted site can use it) ----
    if (p.startsWith("/api/public/") || p === "/api/webhooks/razorpay") {
      const isPublic = p.startsWith("/api/public/");
      if (isPublic && req.method === "OPTIONS") return send(res, 204, "", { ...CORS, "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Max-Age": "86400" });
      const m = match(publicRoutes, req.method, p);
      if (!m) throw httpError(404, "Not found");
      const out = await m.r.handler({ req, res, url, params: m.params });
      return send(res, 200, out, isPublic ? { ...CORS, "Cache-Control": "no-store" } : {});
    }
    // ---- admin API ----
    if (p.startsWith("/api/")) {
      const headers = { ...securityHeaders, "Cache-Control": "no-store" };
      checkCsrf(req);
      if (p === "/api/login" && req.method === "POST") {
        const b = await readJson(req);
        const adminId = String(b.adminId || "").slice(0, 80);
        const { token, maxAge } = await login(adminId, String(b.password || "").slice(0, 200), clientIp(req));
        await logSignIn(adminId);
        return send(res, 200, { ok: true }, { ...headers, "Set-Cookie": sessionCookie(token, maxAge) });
      }
      if (p === "/api/logout" && req.method === "POST") return send(res, 200, { ok: true }, { ...headers, "Set-Cookie": sessionCookie("", 0) });
      const admin = await currentAdmin(req);
      if (!admin) throw httpError(401, "Please sign in");
      if (p === "/api/me") return send(res, 200, { adminId: admin, mailReady: mailReady() }, headers);
      const m = match(adminRoutes, req.method, p);
      if (!m) throw httpError(404, "Not found");
      const old = await before(req.method, p).catch(() => null);
      const out = await m.r.handler({ req, res, url, params: m.params, admin });
      if (req.method !== "GET") await logActivity(admin, req.method, p, out, old);
      if (out?.raw) return send(res, out.raw.status, out.raw.body, { ...headers, ...out.raw.headers });
      return send(res, 200, out ?? { ok: true }, headers);
    }
    // ---- static ----
    if (p === "/admin" || p === "/admin/") return serveFile(res, path.join(ROOT, "admin", "index.html"), { ...securityHeaders, "Cache-Control": "no-store" }) || send(res, 404, "Missing admin/index.html");
    if (p.startsWith("/admin/")) { const f = inside(path.join(ROOT, "admin"), p.slice(7)); return (f && serveFile(res, f, { ...securityHeaders, "Cache-Control": "no-cache" })) || send(res, 404, "Not found"); }
    if (p.startsWith("/uploads/")) { const f = inside(config.uploadsDir, p.slice(9)); return (f && serveFile(res, f, { "X-Content-Type-Options": "nosniff", "Cache-Control": "public, max-age=86400", "Access-Control-Allow-Origin": "*" })) || send(res, 404, "Not found"); }
    const dist = path.join(ROOT, "dist");
    if (fs.existsSync(dist)) { // optional: serve the built website too (single-server deployment)
      const f = inside(dist, p === "/" ? "index.html" : p.slice(1));
      if (f && serveFile(res, f)) return;
      return serveFile(res, path.join(dist, "index.html")) || send(res, 404, "Not found");
    }
    send(res, 404, "Not found. This server provides /admin and /api. Run the website with: npm run dev");
  } catch (e) {
    if (!e.status) console.error(e);
    send(res, e.status || 500, { error: e.status ? e.message : "Server error" }, p.startsWith("/api/public/") ? { ...CORS, "Cache-Control": "no-store" } : p.startsWith("/api/") ? { "Cache-Control": "no-store" } : {});
  }
});
server.listen(config.port, () => console.log(`Admin ready: http://localhost:${config.port}/admin  (database ${config.dbFile}, email ${mailReady() ? "ON" : "OFF - set SMTP_* in .env"})`));
