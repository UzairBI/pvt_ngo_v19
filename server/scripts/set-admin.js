// Create or change an admin login:   npm run admin:set -- <adminId> [password]
// Without a password argument you are asked for one (typed text is hidden). Works offline: uses server/data.db only.
import readline from "node:readline";
import { db, eq } from "../db.js";
import { hashPassword } from "../auth.js";

const [adminId, argPw] = process.argv.slice(2);
if (!adminId) { console.error("Usage: npm run admin:set -- <adminId> [password]"); process.exit(1); }

function ask(q) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl._writeToOutput = (s) => { if (s.includes(q)) process.stdout.write(s); }; // hide typing
    rl.question(q, (a) => { rl.close(); process.stdout.write("\n"); resolve(a); });
  });
}
const pw = argPw || (await ask("New password (min 10 chars): "));
if (pw.length < 10) { console.error("Password must be at least 10 characters."); process.exit(1); }
const hash = await hashPassword(pw);
const existing = (await db.select("admin_users", `admin_id=${eq(adminId)}`))[0];
if (existing) await db.update("admin_users", `id=${eq(existing.id)}`, { password_hash: hash });
else await db.insert("admin_users", { admin_id: adminId, password_hash: hash });
console.log(existing ? `Password changed for "${adminId}". Existing sessions are signed out.` : `Admin "${adminId}" created.`);
