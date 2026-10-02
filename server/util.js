import { httpError } from "./http.js";
export const num = (v) => { const n = Number(v); if (!Number.isFinite(n)) throw httpError(400, "Invalid number"); return n; };
export const str = (v, max = 500) => { const s = String(v ?? "").trim(); return s ? s.slice(0, max) : null; };
export const need = (v, label, max) => { const s = str(v, max); if (!s) throw httpError(400, `${label} is required`); return s; };
export const oneOf = (v, list, label) => { if (!list.includes(v)) throw httpError(400, `Invalid ${label}`); return v; };
export const isDate = (v, label = "Date") => { if (!/^\d{4}-\d{2}-\d{2}$/.test(v || "") || isNaN(Date.parse(v))) throw httpError(400, `${label} must be YYYY-MM-DD`); return v; };
export const isEmail = (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
export const id = (v) => { if (!/^\d+$/.test(String(v))) throw httpError(400, "Bad id"); return String(v); };
