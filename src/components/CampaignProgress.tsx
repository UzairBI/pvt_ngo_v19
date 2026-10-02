import { useInView } from "../hooks/useInView";
import type { Campaign } from "../hooks/useLiveData";
import { useLang } from "../i18n/LangContext";
import DonateButton from "./DonateButton";
const fmt = (n: number) => "₹" + n.toLocaleString("en-IN");

export default function CampaignProgress({ c }: { c: Campaign }) {
  const { t } = useLang();
  const [ref, seen] = useInView<HTMLDivElement>(0.3);
  const pct = Math.max(0, Math.min(100, Math.round((c.raised / c.goal) * 100)));
  return (
    <article className="rounded-2xl border bg-white p-6 shadow-sm">
      <h3 className="font-serif text-lg font-bold text-brand-dark">{c.title}</h3>
      <p className="mt-1 text-sm text-ink/70">{c.text}</p>
      <div ref={ref} className="mt-5 h-3 overflow-hidden rounded-full bg-brand-light" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${c.title} progress`}>
        <div className="h-full rounded-full bg-gradient-to-r from-brand to-accent transition-[width] duration-[1400ms] ease-out" style={{ width: seen ? `${pct}%` : "0%" }} />
      </div>
      <p className="mt-2 flex justify-between text-sm"><strong className="text-brand-dark">{fmt(c.raised)} <span className="font-normal text-ink/60">{t("raised of")} {fmt(c.goal)}</span></strong><span className="font-semibold">{pct}%</span></p>
      <DonateButton to={`/donate?cause=${encodeURIComponent(c.cause ?? "")}`} size="sm" className="mt-4">{t("Give to this cause")}</DonateButton>
    </article>
  );
}
