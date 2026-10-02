// Email via your own SMTP server/account. nodemailer is loaded only when SMTP is configured.
import { config } from "./config.js";
import { httpError } from "./http.js";

let transport;
export const mailReady = () => !!(config.smtp.host && config.smtp.from);

async function getTransport() {
  if (!mailReady()) throw httpError(503, "Email is not configured. Set SMTP_HOST / SMTP_USER / SMTP_PASS / SMTP_FROM in .env and restart.");
  if (!transport) {
    const nodemailer = (await import("nodemailer")).default;
    transport = nodemailer.createTransport({ host: config.smtp.host, port: config.smtp.port, secure: config.smtp.port === 465, auth: config.smtp.user ? { user: config.smtp.user, pass: config.smtp.pass } : undefined });
  }
  return transport;
}
export async function sendMail({ to, bcc, subject, text, html, attachments }) {
  const t = await getTransport();
  return t.sendMail({ from: config.smtp.from, to, bcc, subject, text, html, attachments, replyTo: config.org.email });
}
