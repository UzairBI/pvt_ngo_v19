import { useState } from "react";
import { impactTiers } from "../data/content";
import DonateButton from "./DonateButton";
const fmt = (n: number) => n.toLocaleString("en-IN");
export default function ImpactCalculator() {
  const [amount, setAmount] = useState(2500);
  const outcome = [...impactTiers].reverse().find((t) => amount >= t.min) ?? impactTiers[0];
  return (
    <div className="mx-auto max-w-2xl rounded-2xl bg-white p-5 text-ink shadow-xl sm:p-6 md:p-8">
      <p className="text-xs font-semibold uppercase text-ink/60">Select contribution: <span className="rounded bg-brand-light px-2 py-0.5 text-brand-dark">INR only</span></p>
      <p className="mt-3 text-sm">Contribution Amount: <strong className="text-2xl text-brand-dark">₹ {fmt(amount)}</strong></p>
      <input type="range" min={500} max={25000} step={500} value={amount} onChange={(e) => setAmount(Number(e.target.value))}
        aria-label="Contribution amount in rupees" className="mt-4 h-8 w-full accent-brand" />
      <div className="flex justify-between text-xs text-ink/60"><span>₹ 500</span><span>₹ 12,500</span><span>₹ 25,000</span></div>
      <div className="mt-6 rounded-xl bg-brand-light p-4" aria-live="polite">
        <p className="text-xs font-semibold uppercase text-brand-dark">Direct Impact Outcome</p>
        <h4 className="mt-1 font-semibold">{outcome.text}</h4>
      </div>
      <DonateButton to={`/donate?amount=${amount}`} full size="lg" className="mt-6">Donate ₹{fmt(amount)} Now</DonateButton>
    </div>
  );
}
