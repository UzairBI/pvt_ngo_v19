# Admin panel setup (local SQLite, no cloud service)

> V12: the full step-by-step guide (website + admin + going live + images + troubleshooting) is in **SETUP.md**. This page is the short version.

Everything is stored in one file: `server/data.db` (created automatically on first run, tables included).

## First time (Windows 11 PowerShell, Node 20+)
```powershell
npm install
npm run admin:set -- admin        # asks for a password (min 10 chars)
```

## Run
- Development (2 terminals): `npm run admin` and `npm run dev` -> site http://localhost:5173, admin http://localhost:5173/admin (or :3001/admin)
- Production (1 process): `npm run build; npm start` -> http://localhost:3001 and http://localhost:3001/admin

## Optional settings (`.env`, copy from `.env.example`)
`ADMIN_SESSION_SECRET` (auto-generated if empty), `SMTP_*` (sending documents/receipts/broadcasts), `RAZORPAY_WEBHOOK_SECRET`, `COOKIE_SECURE`, `TRUST_PROXY`.

## Passwords
Change or create an admin any time: `npm run admin:set -- <adminId>`. Existing sessions are signed out.

## Backup
Copy `server/data.db`, `server/storage/` and `server/uploads/` (stop the server first, or copy the `data.db-wal` file too).

## What the admin panel does (v14)
Sign in at `/admin`. Every section reads and writes the same database (`server/data.db`), so changes stay after a refresh.

| Section | What you can do |
|---|---|
| Dashboard | Live totals (funds, donations, volunteers, projects, requests, events, admins), 12-month charts, items waiting for approval, recent submissions, recent admin activity |
| Analytics | Pick 3/6/12/24 months: money raised and donations per month, volunteer sign-ups, requests, breakdowns by payment mode/method/purpose and status, monthly table + CSV download |
| Projects | Search, filter (status, area, shown/hidden, date), sort, view, add, edit, change status in the table, delete (with confirmation). A read-only tab lists the 15 website portfolio programmes (edit those in `src/data/portfolio.ts`). |
| Donations | Search, filter (status, mode, method, date), sort, totals for the filtered list, record offline donations, receipts / 80G certificates, CSV export |
| Volunteers | Search, filter, approve / deactivate / delete, view sign-up messages, add volunteers |
| Document requests | Filter (pending first), attach documents, email them, mark sent / completed |
| Events | Search, filter (upcoming/past, published/draft), add, edit, images, delete |
| Broadcast | Email active volunteers and/or donors (needs SMTP) |
| Admins & activity | Admin accounts with last sign-in, and a searchable log of every change made in the panel |

Numbers next to menu items show what needs attention (pending volunteers, requests, payments).
Adding an admin or changing a password is still done on the server: `npm run admin:set -- <admin ID>`.
