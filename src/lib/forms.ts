import { site } from "../data/site";
import { API_BASE } from "../hooks/useLiveData";

export type SubmitResult = "sent" | "mailto";
interface Opts {
  /** Stores the submission in the local database through the site's own server ("document_requests" or "volunteers"). */
  table?: string;
  /** Called with the server's reply when the row was saved (document requests return the final reference number). */
  onSaved?: (reply: { reference?: string }) => void;
}

const ENDPOINTS: Record<string, string> = { document_requests: "/api/public/document-requests", volunteers: "/api/public/volunteers" };

/** Returns the server reply when saved, null when the server is not reachable (so the email fallback can take over). Throws when the server rejects the data. */
async function saveToServer(path: string, data: Record<string, string>): Promise<{ reference?: string } | null> {
  let res: Response;
  try {
    res = await fetch(API_BASE + path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  } catch { return null; }
  if (res.ok) return res.json().catch(() => ({}));
  if (res.status === 400 || res.status === 415 || res.status === 429) throw new Error("Rejected");
  return null; // 404 / 5xx: server missing or failing
}

/**
 * Sends a form. What happens, in order:
 *  1. DATABASE  - if `opts.table` is given, the row is saved by the server (POST /api/public/...) into server/data.db.
 *  2. EMAIL     - Web3Forms (VITE_WEB3FORMS_KEY) or any JSON endpoint such as Formspree (VITE_FORM_ENDPOINT).
 *                 If the database saved the row, a failed email is ignored; otherwise the email must succeed.
 *  3. FALLBACK  - with nothing configured, the visitor's email app opens, addressed to the Samiti.
 */
export async function submitForm(kind: string, data: Record<string, string>, opts: Opts = {}): Promise<SubmitResult> {
  const key = import.meta.env.VITE_WEB3FORMS_KEY;
  const endpoint = import.meta.env.VITE_FORM_ENDPOINT;
  const subject = `[${site.shortName} website] ${kind}`;
  let saved = false;

  const path = opts.table ? ENDPOINTS[opts.table] : undefined;
  if (path) {
    const reply = await saveToServer(path, data);
    if (reply) { saved = true; opts.onSaved?.(reply); }
  }

  const sendEmail = async (): Promise<boolean> => {
    if (key) {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ access_key: key, subject, from_name: data.name || site.shortName, ...data })
      });
      if (!res.ok) throw new Error("Form service error");
      return true;
    }
    if (endpoint) {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ _subject: subject, form: kind, ...data })
      });
      if (!res.ok) throw new Error("Form service error");
      return true;
    }
    return false;
  };

  if (saved) { try { await sendEmail(); } catch { /* the database already has it */ } return "sent"; }
  if (await sendEmail()) return "sent";

  const body = Object.entries(data).map(([k, v]) => `${k}: ${v}`).join("\n");
  window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return "mailto";
}
