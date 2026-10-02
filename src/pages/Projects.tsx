import { useState } from "react";
import { Link } from "react-router-dom";
import { projects } from "../data/content";
import { portfolio, type Area } from "../data/portfolio";
import { useTitle } from "../hooks/useTitle";
import { useAdminProjects } from "../hooks/useLiveData";
import { useLang } from "../i18n/LangContext";
import Img from "../components/Img";
import PageHero from "../components/PageHero";
import { projectsImages } from "../data/slideshows";
import DonateButton from "../components/DonateButton";

const core = projects.filter((p) => !p.featured);
const featured = projects.filter((p) => p.featured);
const areaLabel = (a: Area) => projects.find((p) => p.slug === a)?.category ?? a;

export default function Projects() {
  const { t } = useLang();
  useTitle("Our Projects");
  const [area, setArea] = useState<Area | "all">("all");
  const latest = useAdminProjects();
  const list = area === "all" ? portfolio : portfolio.filter((p) => p.area === area);
  return (
    <>
      <PageHero images={projectsImages} eyebrow="Our Projects" title="Our 5 Core Projects" text="Comprehensive interventions designed for long-term community resilience." />
      <section className="container-site grid gap-6 py-12 sm:grid-cols-2 md:py-16 lg:grid-cols-3">
        {core.map((p, i) => (
          <article key={p.slug} className="overflow-hidden rounded-2xl border shadow-sm">
            <Img file={p.image} alt={p.title} className="h-52 w-full" />
            <div className="p-5"><p className="eyebrow">0{i + 1} · {p.category}</p>
              <h2 className="mt-2 font-serif text-xl font-bold">{p.title}</h2><p className="mt-2 text-sm text-ink/70">{p.text}</p>
              <div className="mt-4 flex flex-wrap gap-2"><Link to={`/projects/${p.slug}`} className="btn btn-brand !px-4 !py-2">Learn Details</Link>
                <DonateButton to="/donate" variant="outline" size="sm">Sponsor</DonateButton></div></div>
          </article>
        ))}
      </section>

      {featured.map((p) => (
        <section key={p.slug} id="featured" className="bg-brand-light py-14">
          <div className="container-site grid items-center gap-8 lg:grid-cols-2">
            <Img file={p.image} alt={p.title} className="aspect-[4/3] w-full rounded-3xl" />
            <div>
              <p className="eyebrow">{t("Featured Programme")} · {p.category}</p>
              <h2 className="h2 mt-2">{p.title}</h2>
              {p.detail?.tagline && <p className="mt-1 font-serif italic text-brand-dark">“{p.detail.tagline}”</p>}
              <p className="mt-3 text-ink/75">{p.text}</p>
              {p.detail?.stats && (
                <dl className="mt-5 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
                  {p.detail.stats.map((s) => <div key={s.label} className="rounded-xl bg-white p-3"><dt className="text-lg font-bold text-brand-dark">{s.value}</dt><dd className="text-[11px] text-ink/60">{s.label}</dd></div>)}
                </dl>
              )}
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to={`/projects/${p.slug}`} className="btn btn-brand">Learn Details</Link>
                <DonateButton to={`/donate?cause=${encodeURIComponent(p.detail?.donateCause ?? "")}`}>Fund a lantern</DonateButton>
              </div>
            </div>
          </div>
        </section>
      ))}

      {latest.length > 0 && (
        <section id="latest" className="container-site pt-16">
          <p className="eyebrow">{t("Latest projects")}</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {latest.map((p) => (
              <article key={p.id} className="rounded-2xl border bg-white p-5">
                <p className="eyebrow">{[p.area, p.status].filter(Boolean).join(" · ")}</p>
                <h3 className="mt-1 font-serif text-lg font-bold">{p.name}</h3>
                {p.description && <p className="mt-2 text-sm text-ink/70">{p.description}</p>}
                <p className="mt-3 text-xs text-ink/60">{[p.location, p.beneficiaries ? `${p.beneficiaries.toLocaleString("en-IN")} beneficiaries` : ""].filter(Boolean).join(" · ")}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      <section id="portfolio" className="container-site py-16">
        <p className="eyebrow">{t("Project Portfolio")}</p>
        <h2 className="h2 mt-2">Complete Project Portfolio 2004 – 2025</h2>
        <p className="mt-2 max-w-3xl text-ink/70">All 15 projects implemented by the Samiti since 2004, with location, reach, budget and funding source, as reported in our <Link to="/transparency#annual-reports" className="font-semibold text-brand">Comprehensive Impact Report</Link>.</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {(["all", ...core.map((c) => c.slug)] as (Area | "all")[]).map((a) => (
            <button key={a} type="button" aria-pressed={a === area} onClick={() => setArea(a)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition sm:py-1.5 ${a === area ? "border-brand bg-brand text-white" : "hover:bg-brand-light"}`}>{a === "all" ? t("All") : areaLabel(a)}</button>
          ))}
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {list.map((p) => (
            <article key={p.no} className="rounded-2xl border bg-white p-5">
              <p className="eyebrow">{String(p.no).padStart(2, "0")} · {areaLabel(p.area)}{p.period ? ` · ${p.period}` : ""}</p>
              <h3 className="mt-1 font-serif text-lg font-bold">{p.name}</h3>
              <p className="mt-2 text-sm text-ink/70">{p.summary}</p>
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <div><dt className="text-ink/50">Location</dt><dd className="font-medium">{p.location}</dd></div>
                <div><dt className="text-ink/50">Reach</dt><dd className="font-medium">{p.beneficiaries}</dd></div>
                <div><dt className="text-ink/50">Budget</dt><dd className="font-medium">{p.budget}</dd></div>
                <div><dt className="text-ink/50">Funding</dt><dd className="font-medium">{p.funding}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
