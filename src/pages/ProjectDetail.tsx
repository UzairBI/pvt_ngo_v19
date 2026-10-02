import { Link, useParams } from "react-router-dom";
import { projects } from "../data/content";
import { portfolio } from "../data/portfolio";
import { useTitle } from "../hooks/useTitle";
import Img from "../components/Img";
import PageHero from "../components/PageHero";
import NotFound from "./NotFound";
import DonateButton from "../components/DonateButton";

export default function ProjectDetail() {
  const { slug } = useParams();
  const p = projects.find((x) => x.slug === slug);
  useTitle(p?.title, p?.text);
  if (!p) return <NotFound />;
  const d = p.detail;
  const related = portfolio.filter((x) => x.area === p.slug);
  const donateTo = `/donate${d?.donateCause ? `?cause=${encodeURIComponent(d.donateCause)}` : ""}`;
  return (
    <>
      <PageHero eyebrow={p.category} title={p.title} text={d?.tagline ? `“${d.tagline}”. ${p.text}` : p.text} />

      <section className="container-site grid items-start gap-10 py-16 lg:grid-cols-2">
        <Img file={p.image} alt={`${p.title} project activity`} className="aspect-[4/3] w-full rounded-3xl" />
        <div>
          <h2 className="h2">About this programme</h2>
          {d?.partner && <p className="mt-2 text-sm font-semibold text-brand-dark">{d.partner}</p>}
          {d?.paragraphs ? d.paragraphs.map((t, i) => <p key={i} className="mt-4 text-ink/75">{t}</p>) : <p className="mt-4 text-ink/70">{p.text}</p>}
          <div className="mt-6 flex flex-wrap gap-3">
            <DonateButton to={donateTo}>{d ? "Fund a lantern" : "Sponsor"}</DonateButton>
            {d?.report && <a href={d.report.href} target="_blank" rel="noreferrer" className="btn btn-brand">{d.report.label}</a>}
            <Link to="/projects" className="btn border-2 border-brand text-brand">All Projects</Link>
          </div>
        </div>
      </section>

      {d?.stats && (
        <section className="bg-brand-light py-10">
          <dl className="container-site grid grid-cols-2 gap-3 text-center sm:gap-4 md:grid-cols-4">
            {d.stats.map((s) => <div key={s.label} className="rounded-2xl bg-white p-4 sm:p-5"><dt className="font-serif text-2xl font-bold text-brand-dark sm:text-3xl">{s.value}</dt><dd className="text-sm text-ink/70">{s.label}</dd></div>)}
          </dl>
        </section>
      )}

      {d?.benefits && (
        <section className="container-site py-16">
          <h2 className="h2">{d.benefitsTitle}</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {d.benefits.map(([t, x], i) => <div key={t} className="rounded-2xl border p-5"><p className="text-xs text-ink/50">0{i + 1}</p><h3 className="font-semibold">{t}</h3><p className="mt-1 text-sm text-ink/70">{x}</p></div>)}
          </div>
        </section>
      )}

      {d?.gallery && (
        <section className="bg-slate-50 py-16">
          <div className="container-site">
            <h2 className="h2">Stories from the field</h2>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {d.gallery.map((g) => (
                <figure key={g.file} className="overflow-hidden rounded-2xl border bg-white">
                  <Img file={g.file} alt={g.alt} className="aspect-[4/3] w-full" />
                  <figcaption className="p-3 text-xs text-ink/70">{g.alt}</figcaption>
                </figure>
              ))}
            </div>
            {d.quote && <blockquote className="mx-auto mt-10 max-w-3xl border-l-4 border-brand bg-white p-5 font-quote text-lg italic text-brand-dark sm:p-6 sm:text-xl">“{d.quote}”<footer className="mt-2 text-sm not-italic text-ink/60">Voice from the field, Sagar district</footer></blockquote>}
          </div>
        </section>
      )}

      {d?.reach && (
        <section className="container-site py-16">
          <h2 className="h2">Programme reach</h2>
          <div className="mt-6 overflow-x-auto rounded-2xl border">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="bg-brand-dark text-white"><tr><th className="p-3">Village</th><th className="p-3">Terrain & housing</th><th className="p-3 text-right">Families</th></tr></thead>
              <tbody>{d.reach.map((r) => <tr key={r.village} className="border-t"><td className="p-3 font-semibold">{r.village}</td><td className="p-3 text-ink/70">{r.terrain}</td><td className="p-3 text-right font-semibold">{r.families}</td></tr>)}</tbody>
            </table>
          </div>
          {d.reachNote && <p className="mt-2 text-xs italic text-ink/60">{d.reachNote}</p>}
          <div className="mt-10 rounded-2xl bg-brand-dark p-6 text-center text-white sm:p-8">
            <p className="font-serif text-2xl font-bold">Light One Lamp, Change One Life.</p>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-white/85">Thousands of tribal households in Sagar district's forest belt still live without electricity. Every unit funded provides one family with a complete solar lantern and charging panel, at a one-time cost with no recurring expense.</p>
            <DonateButton to={donateTo} className="mt-4">Fund a lantern</DonateButton>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="container-site py-16">
          <p className="eyebrow">Programmes under this area</p>
          <h2 className="h2 mt-2">Our work since 2004</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {related.map((r) => (
              <article key={r.no} className="rounded-2xl border p-5">
                <p className="eyebrow">{r.period ?? "Programme"}</p>
                <h3 className="mt-1 font-serif text-lg font-bold">{r.name}</h3>
                <p className="mt-2 text-sm text-ink/70">{r.summary}</p>
                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  <div><dt className="text-ink/50">Location</dt><dd className="font-medium">{r.location}</dd></div>
                  <div><dt className="text-ink/50">Reach</dt><dd className="font-medium">{r.beneficiaries}</dd></div>
                  <div><dt className="text-ink/50">Budget</dt><dd className="font-medium">{r.budget}</dd></div>
                  <div><dt className="text-ink/50">Funding</dt><dd className="font-medium">{r.funding}</dd></div>
                </dl>
              </article>
            ))}
          </div>
          <p className="mt-6 text-sm"><Link to="/projects#portfolio" className="font-semibold text-brand">See the complete 2004–2025 portfolio →</Link></p>
        </section>
      )}
    </>
  );
}
