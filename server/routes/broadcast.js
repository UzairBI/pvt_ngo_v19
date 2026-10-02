import { db } from "../db.js";
import { httpError, readJson } from "../http.js";
import { sendMail } from "../mailer.js";
import { need, oneOf } from "../util.js";

async function recipients(audience) {
  const set = new Set();
  if (audience !== "donors") (await db.selectAll("volunteers", "select=email&status=eq.active")).forEach((v) => v.email && set.add(v.email.toLowerCase()));
  if (audience !== "volunteers") (await db.selectAll("donations", "select=donor_email&status=eq.success")).forEach((d) => d.donor_email && set.add(d.donor_email.toLowerCase()));
  return [...set];
}
const AUD = ["volunteers", "donors", "all"];

export default [
  ["GET", "/api/broadcast", async () => ({
    counts: Object.fromEntries(await Promise.all(AUD.map(async (a) => [a, (await recipients(a)).length]))),
    history: await db.select("broadcasts", "select=*&order=created_at.desc&limit=20")
  })],
  ["POST", "/api/broadcast", async ({ req }) => {
    const b = await readJson(req), audience = oneOf(b.audience, AUD, "audience");
    const subject = need(b.subject, "Subject", 200), message = need(b.message, "Message", 5000);
    const list = await recipients(audience);
    if (!list.length) throw httpError(400, "No recipients with an email address in that audience");
    let failed = 0;
    for (let i = 0; i < list.length; i += 40) { // BCC in batches: recipients never see each other
      try { await sendMail({ to: undefined, bcc: list.slice(i, i + 40), subject, text: message + "\n\n--\nYou receive this because you volunteered with or donated to us. Reply to this email to opt out." }); }
      catch (e) { if (i === 0 && /not configured/.test(e.message)) throw e; failed += Math.min(40, list.length - i); }
    }
    await db.insert("broadcasts", { audience, subject, body: message, recipients: list.length - failed, failed });
    return { sent: list.length - failed, failed };
  }]
];
