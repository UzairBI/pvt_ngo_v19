import { useEffect, useState } from "react";
import { stats as defaultStats, type Stat } from "../data/content";

export interface Campaign { id: string; title: string; text: string; goal: number; raised: number; cause?: string; sample?: boolean }
export interface EventItem { id: string; title: string; date: string; time?: string; place: string; text: string; images?: string[]; sample?: boolean }
interface Live { stats: Stat[]; campaigns: Campaign[]; events: EventItem[] }

/** Base URL of the admin server. Empty = same address as the site (dev proxy / single-server deploy). */
export const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const URL_ = import.meta.env.VITE_LIVE_DATA_URL || "/data/live.json";
let cache: Live | null = null;

/** Today as YYYY-MM-DD in the visitor's own time zone (not UTC), so an event dated today stays "upcoming" all day. */
export const todayLocal = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };

/** Sample entries are shown while developing but hidden on the published site. */
const visible = <T extends { sample?: boolean }>(list: T[] = []) => (import.meta.env.DEV ? list : list.filter((x) => !x.sample));

/** Events published in the admin panel. Empty list if the admin server is not running. */
async function fetchAdminEvents(): Promise<EventItem[]> {
  try {
    const r = await fetch(`${API_BASE}/api/public/events`, { cache: "no-store" });
    if (!r.ok) return [];
    const list = (await r.json()) as EventItem[];
    return Array.isArray(list) ? list.map((e) => ({ ...e, images: e.images?.map((u) => API_BASE + u) })) : [];
  } catch { return []; }
}
async function fetchFile(): Promise<Partial<Live>> {
  try { const r = await fetch(URL_, { cache: "no-store" }); return r.ok ? await r.json() : {}; } catch { return {}; }
}
/** The two sources are independent: if live.json fails, admin events still show (and the other way round). */
async function loadAll(): Promise<Live> {
  const [j, extra] = await Promise.all([fetchFile(), fetchAdminEvents()]);
  return {
    stats: Array.isArray(j.stats) && j.stats.length ? j.stats : defaultStats,
    campaigns: visible<Campaign>(j.campaigns),
    events: [...visible<EventItem>(j.events), ...extra]
  };
}

/** Runs `fn` now, whenever the tab becomes visible again, and every minute, so admin changes appear without a manual reload. */
function useRefresh(fn: () => void) {
  useEffect(() => {
    fn();
    const onShow = () => { if (document.visibilityState === "visible") fn(); };
    document.addEventListener("visibilitychange", onShow);
    window.addEventListener("focus", onShow);
    const timer = window.setInterval(onShow, 60_000);
    return () => { document.removeEventListener("visibilitychange", onShow); window.removeEventListener("focus", onShow); window.clearInterval(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/** Loads stats, campaigns and events from live.json (or VITE_LIVE_DATA_URL) plus events published in the admin panel. */
export function useLiveData(): Live & { loaded: boolean } {
  const [data, setData] = useState<Live>(cache ?? { stats: defaultStats, campaigns: [], events: [] });
  const [loaded, setLoaded] = useState(!!cache);
  useRefresh(() => {
    loadAll().then((next) => { cache = next; setData(next); setLoaded(true); }).catch(() => setLoaded(true));
  });
  return { ...data, loaded };
}

export interface AdminProject { id: string; name: string; area?: string; location?: string; description?: string; status: string; beneficiaries: number }
/** Projects added in the admin panel and marked "show on website". Empty list if the admin server is not reachable. */
export function useAdminProjects(): AdminProject[] {
  const [list, setList] = useState<AdminProject[]>([]);
  useRefresh(() => {
    fetch(`${API_BASE}/api/public/projects`, { cache: "no-store" }).then((r) => (r.ok ? r.json() : [])).then((l) => setList(Array.isArray(l) ? l : [])).catch(() => { /* keep what is shown */ });
  });
  return list;
}
