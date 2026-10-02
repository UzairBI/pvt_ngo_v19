/* Minimal Razorpay Checkout wrapper (client side). */
declare global { interface Window { Razorpay?: new (opts: Record<string, unknown>) => { open: () => void; on: (ev: string, cb: (r: unknown) => void) => void } } }

export const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || "";

let loading: Promise<boolean> | null = null;
export function loadRazorpay(): Promise<boolean> {
  if (window.Razorpay) return Promise.resolve(true);
  if (loading) return loading;
  loading = new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => { loading = null; resolve(false); };
    document.body.appendChild(s);
  });
  return loading;
}

export interface PayOptions {
  amountRupees: number; name: string; description: string;
  prefill: { name: string; email: string; contact: string };
  notes: Record<string, string>;
  onSuccess: (paymentId: string) => void;
  onDismiss?: () => void;
}

export async function openCheckout(o: PayOptions): Promise<boolean> {
  if (!razorpayKey || !(await loadRazorpay()) || !window.Razorpay) return false;
  const rz = new window.Razorpay({
    key: razorpayKey,
    amount: Math.round(o.amountRupees * 100),
    currency: "INR",
    name: o.name,
    description: o.description,
    prefill: o.prefill,
    notes: o.notes,
    theme: { color: "#1479d1" },
    handler: (r: { razorpay_payment_id: string }) => o.onSuccess(r.razorpay_payment_id),
    modal: { ondismiss: () => o.onDismiss?.() }
  });
  rz.open();
  return true;
}
