// Admin ID + password. scrypt hashes, signed HttpOnly cookie, lockout after repeated failures.
import crypto from "node:crypto";
import { promisify } from "node:util";
import { config } from "./config.js";
import { db, eq } from "./db.js";
import { httpError, parseCookies } from "./http.js";

const scrypt = promisify(crypto.scrypt);
const b64 = (b) => Buffer.from(b).toString("base64url");
const sha = (s) => crypto.createHash("sha256").update(s).digest("hex");

export async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const key = await scrypt(password, salt, 64, { N: 16384 });
  return `scrypt$${b64(salt)}$${b64(key)}`;
}
async function verify(password, stored) {
  if (stored.startsWith("plain:")) { // password typed straight into the DB table: accepted once, then re-hashed by login()
    const a = Buffer.from(sha(password)), b = Buffer.from(sha(stored.slice(6)));
    return crypto.timingSafeEqual(a, b);
  }
  const [, salt, hash] = stored.split("$");
  if (!salt || !hash) return false;
  const key = await scrypt(password, Buffer.from(salt, "base64url"), 64, { N: 16384 });
  const want = Buffer.from(hash, "base64url");
  return key.length === want.length && crypto.timingSafeEqual(key, want);
}

const DUMMY = "scrypt$AAAAAAAAAAAAAAAAAAAAAA$" + b64(Buffer.alloc(64));
const fails = new Map(); // key -> { n, until }
const MAX_FAILS = 5, LOCK_MS = 15 * 60_000;

function sign(payload) {
  const body = b64(JSON.stringify(payload));
  return `${body}.${crypto.createHmac("sha256", config.sessionSecret).update(body).digest("base64url")}`;
}

export async function login(adminId, password, ip) {
  const key = `${ip}|${adminId.toLowerCase()}`;
  const f = fails.get(key);
  if (f && f.until > Date.now()) throw httpError(429, "Too many attempts. Try again in 15 minutes.");
  const row = (await db.select("admin_users", `admin_id=${eq(adminId)}&select=*`))[0];
  const ok = await verify(password, row ? row.password_hash : DUMMY) && !!row; // always do the work: no user enumeration by timing
  if (!ok) {
    const n = (f?.n || 0) + 1; fails.set(key, { n, until: n >= MAX_FAILS ? Date.now() + LOCK_MS : 0 });
    throw httpError(401, "Invalid admin ID or password");
  }
  fails.delete(key);
  let hash = row.password_hash;
  if (hash.startsWith("plain:")) hash = await hashPassword(hash.slice(6));
  await db.update("admin_users", `id=${eq(row.id)}`, { last_login: new Date().toISOString(), password_hash: hash });
  const exp = Date.now() + config.sessionHours * 3600_000;
  return { token: sign({ a: row.admin_id, e: exp, v: sha(hash).slice(0, 12) }), maxAge: config.sessionHours * 3600 };
}

/** Returns the admin id for a valid session, else null. Changing the password in the DB logs everyone out. */
export async function currentAdmin(req) {
  const tok = parseCookies(req).admin_session;
  if (!tok) return null;
  const [body, mac] = tok.split(".");
  if (!body || !mac) return null;
  const want = crypto.createHmac("sha256", config.sessionSecret).update(body).digest("base64url");
  if (mac.length !== want.length || !crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(want))) return null;
  let p; try { p = JSON.parse(Buffer.from(body, "base64url").toString()); } catch { return null; }
  if (!p.e || p.e < Date.now()) return null;
  const row = (await db.select("admin_users", `admin_id=${eq(p.a)}&select=password_hash`))[0];
  if (!row || sha(row.password_hash).slice(0, 12) !== p.v) return null;
  return p.a;
}

/** Mutating requests must come from our own pages (SameSite=Strict cookie + custom header + Origin check). */
export function checkCsrf(req) {
  if (["GET", "HEAD"].includes(req.method)) return;
  const origin = req.headers.origin;
  if (req.headers["x-admin-csrf"] !== "1" || (origin && new URL(origin).host !== req.headers.host)) throw httpError(403, "Blocked request");
}
