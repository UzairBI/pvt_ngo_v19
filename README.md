# Sahara Jan Kalyan Samiti: dynamic NGO website
React 18 + TypeScript + Vite 5 + Tailwind 3 + React Router 6. No extra libraries were added.

## Run
    npm install
    npm run dev          # http://localhost:5173
    npm run build        # production build -> dist/   (run "npx tsc --noEmit" first if the build fails)
    npm run preview

## Images
All images live in `public/assets/images/`:
logo.png, field-1.jpg, field-3.jpg, field-6.jpg, field-9.jpg, plantation-campaign.webp, founder-chairman.jpeg, executive-committee.jpg,
team-spirit.png (About page, "The Tree" philosophy) and solar-lantern-*.jpg (4 field photos: Solar Lantern programme, Gallery, project page).
Missing images show a teal "Add image: ..." box.

## Legal, registration and reports (where things live)
| What | File | Shown on |
|---|---|---|
| Registration numbers (Society, PAN, TAN, 12A, 80G, Darpan, FCRA, CSR-1, EPF, UEI, NCAGE) | `src/data/site.ts` -> `legalIds` | About #legal, Transparency #certificates, Donate, Footer, Get Involved |
| PDFs (Organisation Profile, Impact Report 2004-2025, Solar Lantern Impact Report) | `public/documents/` + list in `src/data/documents.ts` | Transparency (view / download), Home banner, About, Donate, Get Involved |
| 15-project portfolio + 16 partners | `src/data/portfolio.ts` | Projects #portfolio, each core project page, About #partners |
| Mission, vision, tree philosophy, thematic areas, districts, management team, CSR readiness | `src/data/content.ts` | About, Get Involved |
| Solar Lantern programme (story, benefits, reach, photos) | `src/data/content.ts` -> project `solar-lantern` | Projects, /projects/solar-lantern, Gallery, News |

To publish another document (e.g. audited accounts or a scanned certificate): copy the PDF into `public/documents/` and add one entry to
`src/data/documents.ts` with `section: "audit"` or `"certificates"`. It appears on the Transparency page automatically.

## What is dynamic
| Feature | Where |
|---|---|
| Count-up numbers, scroll-reveal, hero zoom | `components/CountUp.tsx`, `Reveal.tsx`, `index.css` |
| EN / हिं language toggle (top bar) | `i18n/hi.ts` (add lines: "English text": "हिंदी") |
| Photo gallery with filters + lightbox | `components/Gallery.tsx`, `pages/Media.tsx` |
| Testimonials section (Bravio layout: 2 feature cards + slider + summary bar) | `components/Testimonials.tsx`; text in `data/content.ts` -> `testimonials` |
| WhatsApp / Donate / Back-to-top buttons | `components/FloatingActions.tsx` |
| Campaign progress bars | `public/data/live.json` -> "campaigns" |
| Events calendar + registration + .ics | `public/data/live.json` -> "events", `pages/Events.tsx` |
| News / stories + share buttons | `data/news.ts`, `pages/News*.tsx` |
| Google map of the field office | `components/WorkMap.tsx` |
| YouTube video gallery | `pages/Media.tsx` (uses `site.youtubeChannelId`) |
| Working forms (contact, volunteer, CSR, newsletter, event) | `lib/forms.ts` + `components/SmartForm.tsx` |
| Donate page (photo + card; button opens the payment page) | `pages/Donate.tsx`; photo `public/assets/images/donate-hero.jpg`; payment link `razorpayMe` in `data/site.ts` |
| Live numbers without touching code | `public/data/live.json` |

## Setup for forms (pick one)  [step "Forms"]
1. Web3Forms (free): get an access key at web3forms.com (enter your email), then put it in `.env` as `VITE_WEB3FORMS_KEY=...`
2. Or Formspree: create a form, put its URL in `VITE_FORM_ENDPOINT=...`
3. With neither set, forms open the visitor's email app addressed to `site.email`. It works, but is less smooth.

## Setup for donations  [step "Donations"]
The Donate button on the Donate page opens the Samiti's payment page. The link lives in `src/data/site.ts` -> `razorpayMe`.
To change it, edit that one line. Donors choose UPI, bank account / net banking, cards or wallets on that page.
The amount chips on the Donate page only show what a gift can do (text from `impactTiers` in `src/data/content.ts`);
the donor types or confirms the amount on the payment page. No keys or `.env` values are needed for this.
(`src/lib/razorpay.ts` is kept for a future on-site checkout but is not used by the Donate page.)

## Live numbers, campaigns and events
Edit `public/data/live.json`, save, redeploy. Entries with `"sample": true` are shown only on your computer (dev mode)
and are hidden on the published site. Delete the sample entries and add your real ones (without "sample").
To change them WITHOUT redeploying, host the same JSON anywhere public and set `VITE_LIVE_DATA_URL` to its URL.

## Add news
Copy an object in `src/data/news.ts`, edit it, save. Newest first.


## Document requests (Transparency page)
The Transparency page keeps the Annual & Impact Reports as they were. Audit reports and registration certificates are no longer listed:
visitors fill in a request form instead (certificate type or audit type + financial year, contact details, purpose, delivery).
Edit the option lists at the top of `src/components/DocumentRequestForm.tsx`.

### Store requests in a database (built in)
Document requests and volunteer sign-ups are saved by the site's own server into `server/data.db` (SQLite, created automatically).
Run `npm run admin` (dev) or `npm start` (production). No cloud account needed. View and manage them in the admin panel at `/admin`.
Optional: set `VITE_WEB3FORMS_KEY` to also get an email for every request.
If the server is not reachable and no email key is set, the form opens the visitor's email app addressed to `site.email`.

## Buttons
- Normal buttons: `.btn` variants (`btn-primary`, `btn-brand`, `btn-white`, `btn-outline`). Hover = running ring of light + gleam sweep + small lift. Styles: `src/index.css`, search "NORMAL BUTTONS".
- Donation buttons: `src/components/DonateButton.tsx` (styles: search "DONATION BUTTONS"). Heart badge tilts and fills on hover, pops with a ring and dots on click.
  Use it for any new donate link: `<DonateButton to="/donate">Donate</DonateButton>`. Options: `variant="solid|outline"`, `size="sm|md|lg"`, `icon="heart|thumb"`, `full`.
- All motion switches off for visitors who set "reduce motion" on their device.

## Optional
`.env.example` lists every optional setting (analytics: `VITE_PLAUSIBLE_DOMAIN`).
Deploy on Vercel: add the same variables under Project -> Settings -> Environment Variables.

## Not included (needs a server / paid API)
Admin login panel, Instagram feed (needs an access token), server-verified payments, signed 80G PDFs.
