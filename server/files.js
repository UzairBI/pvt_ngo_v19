import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { httpError, readBody } from "./http.js";

const DOCS = [".pdf", ".jpg", ".jpeg", ".png", ".webp", ".docx", ".xlsx", ".zip", ".mp3", ".m4a", ".wav", ".ogg"];
const IMAGES = [".jpg", ".jpeg", ".png", ".webp"];
const MIME = { ".pdf": "application/pdf", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".mp3": "audio/mpeg", ".m4a": "audio/mp4", ".wav": "audio/wav", ".ogg": "audio/ogg", ".zip": "application/zip", ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" };
export const mimeFor = (name) => MIME[path.extname(name).toLowerCase()] || "application/octet-stream";

/** Raw-body upload: the browser sends the file bytes with an X-Filename header (no multipart parser needed). */
export async function saveUpload(req, { dir, kind }) {
  const original = path.basename(decodeURIComponent(String(req.headers["x-filename"] || ""))).replace(/[^\w.\- ()]/g, "_");
  const ext = path.extname(original).toLowerCase();
  if (!(kind === "image" ? IMAGES : DOCS).includes(ext)) throw httpError(400, `File type ${ext || "(none)"} is not allowed`);
  const buf = await readBody(req, kind === "image" ? 5_000_000 : 15_000_000);
  if (!buf.length) throw httpError(400, "Empty file");
  const stored = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, stored), buf);
  return { filename: original, stored_name: stored, mime: mimeFor(original), size: buf.length };
}
export const safeJoin = (dir, name) => path.join(dir, path.basename(name));
