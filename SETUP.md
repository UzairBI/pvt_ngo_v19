# V15: complete setup guide

Website + admin panel for Sahara Jan Kalyan Samiti.
React 18 + Vite 5 + Tailwind 3 (website) and a small Node server with a local SQLite file (admin panel).
No cloud database or paid service is required.

Contents: 1 Requirements · 2 Website · 3 Admin panel · 4 Settings (.env) · 5 Going live · 6 Images · 7 Backups · 8 Troubleshooting

---

## 1. Requirements
- **Node.js 20 LTS** (or 22 LTS). Check with `node -v`. Download: https://nodejs.org
- npm (installed with Node)
- Windows 11 PowerShell, macOS Terminal or Linux shell. Commands below are for PowerShell.

---

## 2. Website: first run
```powershell
Expand-Archive .\UZAIR_NGO_VERSION_12.zip -DestinationPath .
cd .\UZAIR_NGO_VERSION_12
npm install
npm run dev
```
Open **http://localhost:5173**. Stop it with `Ctrl + C`.

Production build (checks types, then builds into `dist/`):
```powershell
npm run build
npm run preview      # optional: look at the built site locally
```

---

## 3. Admin panel

Everything the admin panel stores (donations, volunteers, events, document requests, admin logins) is kept
in **one file: `server/data.db`**. It is created automatically, with its tables, the first time the server runs.

### 3.1 Create your admin login (once)
```powershell
npm run admin:set -- admin
```
- `admin` is the **Admin ID** you will sign in with. Use any name you like (e.g. `uzair`).
- You are asked for a password (min **10** characters). What you type is hidden; that is normal.
- Run it again with another ID to create more admins.

### 3.2 Run the admin panel

**While working on the site (2 terminals):**
```powershell
# terminal 1
npm run admin
# terminal 2
npm run dev
```
- Website: http://localhost:5173
- Admin: **http://localhost:5173/admin** (also http://localhost:3001/admin)

Terminal 1 should print: `Admin ready: http://localhost:3001/admin (database ..., email ON/OFF)`.

**Production (1 process serves the website AND the admin):**
```powershell
npm run build
npm start
```
- Website: http://localhost:3001
- Admin: **http://localhost:3001/admin**

### 3.3 Sign in
Open `/admin`, enter your **Admin ID** and **password**, then **Sign in**.
Sections: Dashboard, Donations & finance, Volunteers, Events, Projects, document Requests, Broadcast.
You are signed out automatically after 8 hours (change with `ADMIN_SESSION_HOURS`).

### 3.4 Change a password / forgot password
```powershell
npm run admin:set -- admin
```
Enter the new password. This works offline and signs out everyone using that ID.

---

## 4. Settings (`.env`) — all optional
```powershell
Copy-Item .env.example .env
notepad .env
```
Restart `npm run admin` / `npm start` after editing. Rebuild (`npm run build`) after changing any `VITE_` value.

| Setting | What it is for |
|---|---|
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | **Needed to send emails** from the admin (documents, receipts, broadcasts). Gmail: `smtp.gmail.com`, port `587`, your Gmail address, and a Google **App Password** (not your normal password). Zoho / cPanel mail also work. |
| `COOKIE_SECURE=true` | Set when the site is live on **https://**. |
| `TRUST_PROXY=true` | Only if the server sits behind a reverse proxy you control (Nginx, Caddy, cPanel proxy). |
| `ADMIN_PORT` | Admin server port (default `3001`). |
| `ADMIN_SESSION_HOURS` | Auto sign-out time (default `8`). |
| `ADMIN_SESSION_SECRET` | Leave empty: one is generated and kept in `server/storage/session.secret`. |
| `RAZORPAY_WEBHOOK_SECRET` | Optional: record Razorpay payments automatically. Razorpay Dashboard → Settings → Webhooks → URL `https://YOUR-DOMAIN/api/webhooks/razorpay`. |
| `VITE_WEB3FORMS_KEY` or `VITE_FORM_ENDPOINT` | Website forms delivery (see README). |
| `VITE_API_URL` | Only if the website and admin server are on **different** addresses (see 5B). |

**Never** put `VITE_` in front of the admin settings above: anything starting with `VITE_` is published inside the website code.

---

## 5. Going live

The admin panel needs a host that keeps **Node.js running** all the time.

**A. One server for everything (simplest)** — VPS (Hostinger/DigitalOcean/AWS Lightsail…) or cPanel with "Setup Node.js App":
1. Upload the project (without `node_modules`), then `npm install`.
2. `npm run admin:set -- admin` to create the login on the server.
3. In `.env`: `COOKIE_SECURE=true` (and `TRUST_PROXY=true` behind a proxy) + your SMTP details.
4. `npm run build`, then `npm start` (keep it running with your host's Node app manager, or `pm2 start "npm start"`).
5. Point your domain at it with HTTPS. Website = `https://your-domain/`, admin = `https://your-domain/admin`.

**B. Website on Vercel + admin on a Node server:**
1. Deploy the admin server as in A (it can live at e.g. `https://admin.your-domain`).
2. On Vercel, set `VITE_API_URL=https://admin.your-domain` (Project → Settings → Environment Variables), redeploy.
3. Admin is then at `https://admin.your-domain/admin`. Vercel alone cannot run the admin panel.

---

## 6. Images (V12 slideshows)
All slideshow photos are in `public/images/`, one folder per set; the lists are in `src/data/slideshows.ts`.

| Folder | Used on | Photo shape |
|---|---|---|
| `public/images/featured/` | Separate reusable set (not shown on Home) | Landscape |
| `public/images/home/` | Home hero: ONE static photo (`home-hero-01.jpg`) | Landscape |
| **`public/images/donation/`** | **Donate page only** | **Vertical / portrait** (e.g. 1200 x 1600) |
| `public/images/about/`, `projects/`, `media/`, `transparency/`, `contact/` | Blue banner on that page | Landscape |

- **Replace a photo:** save the new file over the old one with the same name (e.g. `donation-02.jpg`).
- **Add a photo:** put the file in the folder and add its path to the matching list in `src/data/slideshows.ts`.
- **4th featured photo:** save as `public/images/featured/featured-04.jpg`, then remove the `//` in front of its line in `src/data/slideshows.ts`.
- The featured photos are never used on the Donate page.
- After adding images on a live server, run `npm run build` again (the server shows the built copy in `dist/`).

More detail: `IMAGES.md`.

---

## 7. Backups
Stop the server, then copy:
- `server/data.db` (if the server is running, also copy `server/data.db-wal`)
- `server/storage/`
- `server/uploads/`
- your `.env`

To restore, put them back in the same places and start the server.

---

## 8. Troubleshooting
| Problem | Fix |
|---|---|
| `npm install` fails on **better-sqlite3** | Use Node **20 or 22 LTS** (prebuilt files exist for these). Delete `node_modules`, run `npm install` again. |
| `/admin` shows "Not found" on port 5173 | Terminal 1 (`npm run admin`) is not running. Start it. |
| "Port 3001 is already in use" | Another copy is running. Close it, or set `ADMIN_PORT=3002` in `.env`. |
| Can't sign in | Reset the password: `npm run admin:set -- <your Admin ID>`. |
| Emails don't send | Terminal shows `email OFF`: fill in `SMTP_*` in `.env`, restart. Gmail needs an App Password. |
| Signed out immediately on the live site | Site is on http but `COOKIE_SECURE=true`, or the reverse: match it to http/https. |
| New slideshow photo doesn't appear | Check the file name/extension matches the path in `src/data/slideshows.ts` exactly (`.jpg` vs `.jpeg`), then rebuild if live. |
| `npm run build` fails | Run `npx tsc --noEmit` to see the exact error. |
