import { site } from "../data/site";
import { useTitle } from "../hooks/useTitle";
import PageHero from "../components/PageHero";
const docs = {
  privacy: ["Privacy Policy", "Describe what personal data you collect, why, how long you keep it, and how people can contact you. Replace this text with your reviewed policy."],
  terms: ["Terms of Use", "Describe the terms for using this website. Replace this text with your reviewed terms."],
  dpdp: ["DPDP Compliance Notice", "Describe consent, data-principal rights and grievance contact under India's Digital Personal Data Protection Act, 2023. Replace this text with a legally reviewed notice."]
} as const;
export default function Legal({ kind }: { kind: keyof typeof docs }) {
  const [title, body] = docs[kind];
  useTitle(title);
  return (<><PageHero eyebrow="Legal" title={title} />
    <section className="container-site max-w-3xl py-16 text-ink/80"><p>{body}</p><p className="mt-4">Contact: {site.email}</p></section></>);
}
