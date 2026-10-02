import { useState } from "react";
import { site } from "../data/site";
import { useLang } from "../i18n/LangContext";

const places = [
  { label: "Field Office", q: site.address },
  { label: "Khurai Road, Sagar (tree plantation)", q: "Khurai Road, Sagar, Madhya Pradesh" },
  { label: "Sagar district (community outreach)", q: "Sagar, Madhya Pradesh" }
];

/** Google Maps embed (no API key needed) with quick place chips. */
export default function WorkMap() {
  const { t } = useLang();
  const [i, setI] = useState(0);
  return (
    <div>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Locations">
        {places.map((p, k) => (
          <button key={p.label} type="button" role="tab" aria-selected={k === i} onClick={() => setI(k)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${k === i ? "border-brand bg-brand text-white" : "hover:bg-brand-light"}`}>{p.label}</button>
        ))}
      </div>
      <div className="mt-4 overflow-hidden rounded-2xl border shadow-sm">
        <iframe key={i} title={`Map: ${places[i].label}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps?q=${encodeURIComponent(places[i].q)}&output=embed`} className="block h-[320px] w-full sm:h-[360px] md:h-[420px]" />
      </div>
      <a className="mt-3 inline-block text-sm font-semibold text-brand" target="_blank" rel="noreferrer"
        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(site.address)}`}>{t("Get directions")} →</a>
    </div>
  );
}
