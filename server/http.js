import { config } from "./config.js";

export const httpError = (status, message) => Object.assign(new Error(message), { status });

export function send(res, status, body, headers = {}) {
  const isObj = typeof body === "object" && !Buffer.isBuffer(body);
  res.writeHead(status, { "Content-Type": isObj ? "application/json; charset=utf-8" : "text/plain; charset=utf-8", ...headers });
  res.end(isObj ? JSON.stringify(body) : body);
}

export function readBody(req, limit = 1_000_000) {
  return new Promise((resolve, reject) => {
    const chunks = []; let size = 0;
    req.on("data", (c) => { size += c.length; if (size > limit) { reject(httpError(413, "File or request too large")); req.destroy(); } else chunks.push(c); });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}
export async function readJson(req) {
  const raw = await readBody(req);
  try { return raw.length ? JSON.parse(raw.toString("utf8")) : {}; } catch { throw httpError(400, "Invalid JSON"); }
}

export const parseCookies = (req) => Object.fromEntries((req.headers.cookie || "").split(";").map((p) => p.trim().split("=")).filter((p) => p[0]).map(([k, ...v]) => [k, decodeURIComponent(v.join("="))]));
export const sessionCookie = (value, maxAge) =>
  `admin_session=${encodeURIComponent(value)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAge}${config.secureCookie ? "; Secure" : ""}`;

export const securityHeaders = {
  "X-Content-Type-Options": "nosniff", "X-Frame-Options": "DENY", "Referrer-Policy": "same-origin",
  "Content-Security-Policy": "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; frame-ancestors 'none'; form-action 'self'"
};
export const clientIp = (req) => (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.socket.remoteAddress || "";
