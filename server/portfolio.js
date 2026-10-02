// Reads the website's project portfolio (src/data/portfolio.ts) so the admin can show it read-only.
import fs from "node:fs";
import { config } from "./config.js";

const statusOf = (period) => !period ? "not dated" : /present|ongoing/i.test(period) ? "ongoing" : "completed";
export function websitePortfolio() {
  let src = "";
  try { src = fs.readFileSync(config.portfolioTs, "utf8"); } catch { return []; }
  const start = src.indexOf("export const portfolio");
  if (start < 0) return [];
  return src.slice(start).split(/\{\s*no:\s*/).slice(1).map((chunk) => {
    const item = { no: parseInt(chunk, 10) };
    for (const m of chunk.matchAll(/(\w+):\s*"((?:[^"\\]|\\.)*)"/g)) if (!(m[1] in item)) item[m[1]] = m[2];
    item.status = statusOf(item.period);
    return item;
  }).filter((p) => p.name);
}
