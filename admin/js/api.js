export class AuthError extends Error {}
export async function api(path, { method = "GET", body, raw, headers = {} } = {}) {
  const res = await fetch("/api" + path, {
    method, credentials: "same-origin",
    headers: { "X-Admin-CSRF": "1", ...(body && !raw ? { "Content-Type": "application/json" } : {}), ...headers },
    body: raw ?? (body ? JSON.stringify(body) : undefined)
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && path !== "/login") { window.dispatchEvent(new Event("admin:signed-out")); throw new AuthError(data.error || "Please sign in"); }
  if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
  return data;
}
/** Uploads one file as raw bytes (filename in a header). */
export const upload = (path, file) => api(path, { method: "POST", raw: file, headers: { "X-Filename": encodeURIComponent(file.name), "Content-Type": "application/octet-stream" } });
