// SQLite (better-sqlite3) replacement for the old Supabase/PostgREST client.
// Same API: select, selectAll, insert, update, remove, upsert, eq. Queries are the same PostgREST-style strings:
//   "status=eq.active&select=id,name&order=created_at.desc,id.desc&limit=20&or=(a.ilike.*x*,b.eq.y)"
// Filters: eq neq gt gte lt lte like ilike is in, with an optional "not." prefix; or=(...) / and=(...) groups.
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { config } from "./config.js";

fs.mkdirSync(path.dirname(config.dbFile), { recursive: true });
const sqlite = new Database(config.dbFile);
sqlite.pragma("busy_timeout = 5000");
sqlite.pragma("foreign_keys = ON");
sqlite.exec(fs.readFileSync(config.schemaFile, "utf8")); // creates every table on first run, no-op afterwards
process.on("exit", () => { try { sqlite.close(); } catch { /* already closed */ } });

const bad = (msg) => Object.assign(new Error(msg), { status: 400 });
const kindOf = (type) => { const t = String(type).toUpperCase(); return t.includes("BOOL") ? "bool" : t.includes("JSON") ? "json" : t.includes("INT") ? "int" : /REAL|NUM|FLOA|DOUB|DEC/.test(t) ? "real" : "text"; };

const metaCache = new Map();
function meta(table) {
  let m = metaCache.get(table);
  if (m) return m;
  if (!/^\w+$/.test(table) || table.startsWith("sqlite_")) throw bad("Unknown table");
  const cols = sqlite.prepare(`PRAGMA table_xinfo("${table}")`).all();
  if (!cols.length) throw bad(`Unknown table ${table}`);
  m = { table, cols: new Map(cols.map((c) => [c.name, { name: c.name, kind: kindOf(c.type), writable: c.hidden === 0 }])) };
  metaCache.set(table, m);
  return m;
}
const col = (m, name) => { const c = m.cols.get(name); if (!c) throw bad(`Unknown column "${name}"`); return c; };
const Q = (c) => `"${c.name}"`;

// ---------- reading a query string ----------
function coerce(c, raw) {
  if (c.kind === "bool") return /^(true|1)$/i.test(raw) ? 1 : 0;
  if ((c.kind === "int" || c.kind === "real") && raw.trim() !== "" && Number.isFinite(Number(raw))) return Number(raw);
  return raw;
}
function splitTop(s) { // split on commas that are not inside parentheses
  const out = []; let depth = 0, cur = "";
  for (const ch of s) {
    if (ch === "(") depth++; else if (ch === ")") depth--;
    if (ch === "," && depth === 0) { out.push(cur); cur = ""; } else cur += ch;
  }
  if (cur) out.push(cur);
  return out;
}
function cond(m, colName, spec, params) {
  const c = col(m, colName);
  let neg = false;
  if (spec.startsWith("not.")) { neg = true; spec = spec.slice(4); }
  const i = spec.indexOf(".");
  const op = i < 0 ? spec : spec.slice(0, i), val = i < 0 ? "" : spec.slice(i + 1);
  const cmp = { eq: "=", neq: "<>", gt: ">", gte: ">=", lt: "<", lte: "<=" };
  let sql;
  if (cmp[op]) { sql = `${Q(c)} ${cmp[op]} ?`; params.push(coerce(c, val)); }
  else if (op === "like" || op === "ilike") { sql = `${Q(c)} LIKE ?`; params.push(val.replace(/\*/g, "%")); } // SQLite LIKE ignores ASCII case
  else if (op === "is") sql = val === "null" ? `${Q(c)} IS NULL` : val === "true" ? `${Q(c)} = 1` : val === "false" ? `${Q(c)} = 0` : (() => { throw bad("Bad 'is' value"); })();
  else if (op === "in") {
    const list = splitTop(val.replace(/^\(|\)$/g, "")).map((v) => v.trim().replace(/^"|"$/g, ""));
    sql = list.length ? `${Q(c)} IN (${list.map(() => "?").join(",")})` : "0";
    params.push(...list.map((v) => coerce(c, v)));
  } else throw bad(`Unsupported filter "${op}"`);
  return neg ? `NOT (${sql})` : sql;
}
function logic(m, inner, joiner, params) {
  const parts = splitTop(inner).map((item) => {
    const g = item.match(/^(not\.)?(and|or)\(([\s\S]*)\)$/);
    if (g) { const s = `(${logic(m, g[3], g[2].toUpperCase(), params)})`; return g[1] ? `NOT ${s}` : s; }
    const dot = item.indexOf(".");
    if (dot < 1) throw bad("Bad filter");
    return cond(m, item.slice(0, dot), item.slice(dot + 1), params);
  });
  return parts.join(` ${joiner} `);
}
function parse(m, query) {
  const params = [], where = [], q = { cols: "*", order: "", limit: null, offset: null };
  for (const kv of String(query || "").split("&").filter(Boolean)) {
    const i = kv.indexOf("=");
    let k, v;
    try { k = decodeURIComponent(i < 0 ? kv : kv.slice(0, i)); v = i < 0 ? "" : decodeURIComponent(kv.slice(i + 1)); } catch { throw bad("Bad query string"); }
    if (k === "select") { if (v && v !== "*") q.cols = v.split(",").map((n) => Q(col(m, n.trim()))).join(", "); }
    else if (k === "order") q.order = " ORDER BY " + v.split(",").map((o) => { const [n, ...rest] = o.split("."); const dir = rest.map((r) => r.toLowerCase()); return `${Q(col(m, n))}${dir.includes("desc") ? " DESC" : ""}${dir.includes("nullsfirst") ? " NULLS FIRST" : dir.includes("nullslast") ? " NULLS LAST" : ""}`; }).join(", ");
    else if (k === "limit") q.limit = Math.max(0, parseInt(v, 10) || 0);
    else if (k === "offset") q.offset = Math.max(0, parseInt(v, 10) || 0);
    else if (k === "on_conflict") continue;
    else if (k === "or" || k === "and") where.push(`(${logic(m, v.replace(/^\(|\)$/g, ""), k.toUpperCase(), params)})`);
    else where.push(cond(m, k, v, params));
  }
  q.where = where.length ? " WHERE " + where.join(" AND ") : "";
  q.params = params;
  q.page = q.limit !== null ? ` LIMIT ${q.limit}${q.offset ? ` OFFSET ${q.offset}` : ""}` : q.offset ? ` LIMIT -1 OFFSET ${q.offset}` : "";
  return q;
}

// ---------- values in / out ----------
function toDb(c, v) {
  if (v === null || v === undefined) return null;
  if (c.kind === "json") return typeof v === "string" ? v : JSON.stringify(v);
  if (c.kind === "bool") return v === true || v === 1 || v === "true" || v === "1" ? 1 : 0;
  if (typeof v === "boolean") return v ? 1 : 0;
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "object") return JSON.stringify(v);
  return v;
}
function fromDb(m, row) {
  if (!row) return undefined;
  for (const k of Object.keys(row)) {
    const c = m.cols.get(k);
    if (!c || row[k] === null) continue;
    if (c.kind === "bool") row[k] = !!row[k];
    else if (c.kind === "json" && typeof row[k] === "string") { try { row[k] = JSON.parse(row[k]); } catch { /* leave as text */ } }
  }
  return row;
}
function writeRow(m, row) {
  const names = [], vals = [];
  for (const [k, v] of Object.entries(row || {})) {
    if (v === undefined) continue;
    const c = col(m, k);
    if (!c.writable) throw bad(`Column "${k}" is read-only`);
    names.push(k); vals.push(toDb(c, v));
  }
  return [names, vals];
}
const list = (names) => names.map((n) => `"${n}"`).join(", ");
const needFilter = (q, what) => { if (!q.where) throw bad(`Refusing to ${what} without a filter`); };

function guard(table, fn) {
  try { return fn(); } catch (e) {
    if (e.status) throw e;
    const err = new Error(`Database error (${table}): ${String(e.message).slice(0, 200)}`);
    err.status = /^SQLITE_CONSTRAINT/.test(e.code || "") || /constraint failed/i.test(e.message) ? 400 : 500;
    throw err;
  }
}
function insertOne(m, row) {
  const [names, vals] = writeRow(m, row);
  const sql = names.length ? `INSERT INTO "${m.table}" (${list(names)}) VALUES (${names.map(() => "?").join(", ")}) RETURNING *` : `INSERT INTO "${m.table}" DEFAULT VALUES RETURNING *`;
  return fromDb(m, sqlite.prepare(sql).all(...vals)[0]);
}
function selectRows(table, query) {
  return guard(table, () => {
    const m = meta(table), q = parse(m, query);
    return sqlite.prepare(`SELECT ${q.cols} FROM "${table}"${q.where}${q.order}${q.page}`).all(...q.params).map((r) => fromDb(m, r));
  });
}

export const db = {
  select: async (table, query = "") => selectRows(table, query),
  /** Reads every row (no 1000-row page limit in SQLite). */
  selectAll: async (table, query = "") => selectRows(table, query),
  insert: async (table, row) => guard(table, () => {
    const m = meta(table);
    return sqlite.transaction(() => (Array.isArray(row) ? row : [row]).map((r) => insertOne(m, r)))()[0];
  }),
  update: async (table, query, patch) => guard(table, () => {
    const m = meta(table), q = parse(m, query);
    needFilter(q, "update");
    const [names, vals] = writeRow(m, patch);
    if (!names.length) return fromDb(m, sqlite.prepare(`SELECT * FROM "${table}"${q.where}`).all(...q.params)[0]);
    return fromDb(m, sqlite.prepare(`UPDATE "${table}" SET ${names.map((n) => `"${n}" = ?`).join(", ")}${q.where} RETURNING *`).all(...vals, ...q.params)[0]);
  }),
  remove: async (table, query) => guard(table, () => {
    const m = meta(table), q = parse(m, query);
    needFilter(q, "delete");
    sqlite.prepare(`DELETE FROM "${table}"${q.where}`).run(...q.params);
    return [];
  }),
  /** Insert, or merge the given columns into the existing row that has the same `onConflict` column(s). */
  upsert: async (table, row, onConflict) => guard(table, () => {
    const m = meta(table);
    const keys = String(onConflict).split(",").map((s) => col(m, s.trim()).name);
    const [names, vals] = writeRow(m, row);
    const upd = names.filter((n) => !keys.includes(n));
    const sets = (upd.length ? upd : keys).map((n) => `"${n}" = excluded."${n}"`).join(", ");
    return fromDb(m, sqlite.prepare(`INSERT INTO "${table}" (${list(names)}) VALUES (${names.map(() => "?").join(", ")}) ON CONFLICT (${list(keys)}) DO UPDATE SET ${sets} RETURNING *`).all(...vals)[0]);
  })
};
export const eq = (v) => "eq." + encodeURIComponent(v);
