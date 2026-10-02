import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// Minimal .env loader (no dependency). Real environment variables win.
try {
  for (const line of fs.readFileSync(path.join(ROOT, ".env"), "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i);
    if (m && !line.trim().startsWith("#") && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch { /* no .env */ }

const e = process.env;
/** ADMIN_SESSION_SECRET is optional: without it a random secret is created once and kept in server/storage/session.secret. */
function sessionSecret() {
  if (e.ADMIN_SESSION_SECRET) return e.ADMIN_SESSION_SECRET;
  const file = path.join(ROOT, "server", "storage", "session.secret");
  try { const s = fs.readFileSync(file, "utf8").trim(); if (s.length >= 32) return s; } catch { /* first run */ }
  const s = crypto.randomBytes(32).toString("hex");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, s, { mode: 0o600 });
  return s;
}
export const config = {
  port: Number(e.ADMIN_PORT || 3001),
  dbFile: path.join(ROOT, "server", "data.db"),
  schemaFile: path.join(ROOT, "server", "schema.sql"),
  trustProxy: e.TRUST_PROXY === "true", // true only behind a reverse proxy you control: rate limits then use X-Forwarded-For
  sessionSecret: sessionSecret(),
  secureCookie: e.COOKIE_SECURE ? e.COOKIE_SECURE === "true" : e.NODE_ENV === "production",
  sessionHours: Number(e.ADMIN_SESSION_HOURS || 8),
  smtp: { host: e.SMTP_HOST, port: Number(e.SMTP_PORT || 587), user: e.SMTP_USER, pass: e.SMTP_PASS, from: e.SMTP_FROM || e.SMTP_USER },
  razorpayWebhookSecret: e.RAZORPAY_WEBHOOK_SECRET || "",
  storageDir: path.join(ROOT, "server", "storage"),
  uploadsDir: path.join(ROOT, "server", "uploads"),
  liveJson: path.join(ROOT, "public", "data", "live.json"),
  portfolioTs: path.join(ROOT, "src", "data", "portfolio.ts"),
  org: JSON.parse(fs.readFileSync(path.join(ROOT, "server", "org.config.json"), "utf8"))
};

export function checkConfig() {
  const missing = [];
  if (e.ADMIN_SESSION_SECRET && e.ADMIN_SESSION_SECRET.length < 32) missing.push("ADMIN_SESSION_SECRET must be 32+ random characters (or remove it and one is generated automatically)");
  return missing;
}
