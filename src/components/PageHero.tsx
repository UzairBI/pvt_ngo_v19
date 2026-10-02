import Wave from "./Wave";

/**
 * Banner at the top of inner pages: ONE fixed photo (no slideshow) under a blue overlay, white text,
 * and the flowing wave along the bottom edge. Without `images` it is the plain blue banner (still with the wave).
 */
export default function PageHero({ eyebrow, title, text, images }: { eyebrow: string; title: string; text?: string; images?: string[] }) {
  const img = images?.[0];
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-brand-dark to-brand pb-24 pt-28 text-white sm:pt-32 md:pb-36 md:pt-40">
      {img && <img src={img} alt="" loading="eager" decoding="async" className="absolute inset-0 -z-20 h-full w-full object-cover object-[center_35%]" />}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-[#061a36]/90 via-[#0b3d7a]/65 to-[#0b4f9c]/20" />
      <div className="container-site max-w-3xl md:max-w-site">
        <p className="inline-flex rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white backdrop-blur">{eyebrow}</p>
        <h1 className="mt-4 max-w-3xl text-[1.7rem] font-bold leading-tight sm:text-3xl md:text-5xl">{title}</h1>
        {text && <p className="mt-4 max-w-2xl text-white/90 md:text-lg">{text}</p>}
      </div>
      <Wave />
    </section>
  );
}
