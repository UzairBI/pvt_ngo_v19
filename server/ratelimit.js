// Small in-memory rate limiter for the public form endpoints (resets when the server restarts).
import { config } from "./config.js";
import { httpError } from "./http.js";

const hits = new Map(); // "bucket|ip" -> [timestamps]
const ipOf = (req) => (config.trustProxy && String(req.headers["x-forwarded-for"] || "").split(",")[0].trim()) || req.socket.remoteAddress || "unknown";

/** Allows `max` calls per `windowMs` per IP in each bucket; also `globalMax` per bucket across all IPs. */
export function rateLimit(req, bucket, { max = 5, windowMs = 15 * 60_000, globalMax = 300 } = {}) {
  const now = Date.now();
  const touch = (key, limit) => {
    const list = (hits.get(key) || []).filter((t) => now - t < windowMs);
    if (list.length >= limit) { hits.set(key, list); return false; }
    list.push(now); hits.set(key, list); return true;
  };
  if (!touch(`${bucket}|${ipOf(req)}`, max) || !touch(`${bucket}|*`, globalMax)) throw httpError(429, "Too many requests. Please try again in a few minutes.");
}
setInterval(() => { const cut = Date.now() - 3600_000; for (const [k, v] of hits) if (!v.some((t) => t > cut)) hits.delete(k); }, 600_000).unref();
