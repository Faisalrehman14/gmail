# MailFlow - Professional Email Marketing Platform

A full-featured email marketing web application built with Next.js 15, Prisma, and modern SaaS UI patterns.

## Features

- **Contact Management** - Import CSV, Excel, TXT files with email validation
- **Campaigns** - Create, schedule, and send personalized email campaigns
- **Drag-and-Drop Editor** - GrapesJS-powered email template builder
- **Personalization** - Dynamic variables (First Name, Company, etc.)
- **Analytics Dashboard** - Opens, clicks, bounces, unsubscribes with charts
- **List Management** - Tags, segments, and groups
- **SMTP Integration** - Multiple email provider support
- **Background Queue** - Individual email delivery with automatic retry
- **Tracking** - Open pixels, click tracking, unsubscribe links
- **Authentication** - Role-based access (Admin, Manager, Viewer)
- **Activity Logs** - Full audit trail
- **Dark/Light Mode** - System-aware theme switching
- **Virtualized Tables** - Performant contact lists at scale

## Quick Start

```bash
# Install dependencies
npm install

# Set up database
npm run db:push
npm run db:seed

# Start development server
npm run dev

# Start email worker (separate terminal)
npm run worker
```

Open [http://localhost:3000](http://localhost:3000)

### Demo Accounts

| Role    | Email                  | Password    |
|---------|------------------------|-------------|
| Admin   | admin@mailflow.com     | admin123    |
| Manager | manager@mailflow.com   | manager123  |
| Viewer  | viewer@mailflow.com    | viewer123   |

## SMTP Configuration

1. Go to **Settings** in the app
2. Add your SMTP provider (Gmail, SendGrid, Mailgun, etc.)
3. Test the connection
4. Set as default provider

For testing, use [Mailtrap](https://mailtrap.io) or [Ethereal](https://ethereal.email).

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: SQLite (dev) / PostgreSQL (production)
- **ORM**: Prisma
- **UI**: Tailwind CSS, Radix UI, Framer Motion
- **Charts**: Recharts
- **Email Editor**: GrapesJS
- **Email Sending**: Nodemailer
- **Auth**: JWT with HTTP-only cookies

## Production

```bash
DATABASE_URL="postgresql://user:pass@localhost:5432/mailflow"
npm run build
npm start
```

## Deploy on Railway

### Step 1 — Railway account
1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **New Project** → **Deploy from GitHub repo**
3. Select `Faisalrehman14/gmail`

### Step 2 — Add PostgreSQL database
1. In your project, click **+ New** → **Database** → **PostgreSQL**
2. Railway creates `DATABASE_URL` automatically

### Step 3 — Link database to web service
1. Click your **web service** (the app, not the database)
2. Go to **Variables** tab
3. Click **Add Reference** → select `DATABASE_URL` from PostgreSQL service

### Step 4 — Set environment variables
Add these in the web service **Variables** tab:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Reference from PostgreSQL (Step 3) |
| `JWT_SECRET` | Long random string (e.g. `openssl rand -base64 32`) |
| `NEXT_PUBLIC_APP_URL` | Your Railway app URL (e.g. `https://gmail-production.up.railway.app`) |
| `ENABLE_INLINE_WORKER` | `true` |
| `WORKER_INTERVAL_MS` | `5000` |
| `NODE_ENV` | `production` |

> **Important:** After first deploy, copy your public URL from **Settings → Networking → Generate Domain**, then set `NEXT_PUBLIC_APP_URL` to that exact URL and redeploy.

### Step 5 — Generate public domain
1. Web service → **Settings** → **Networking**
2. Click **Generate Domain**
3. Update `NEXT_PUBLIC_APP_URL` with this URL → redeploy

### Step 6 — Seed demo data (first time only)
Install Railway CLI and run seed:

```bash
npm i -g @railway/cli
railway login
railway link          # select your project
railway run npm run db:seed
```

### Step 7 — SMTP for real emails
1. Open your deployed app → **Settings**
2. Add your SMTP provider (Gmail, SendGrid, Mailtrap, etc.)
3. Test connection → set as default

### Railway architecture

```
┌─────────────────┐     ┌──────────────────┐
│  Next.js App    │────▶│   PostgreSQL     │
│  (web service)  │     │   (database)     │
│  + email worker │     └──────────────────┘
└─────────────────┘
```

The email worker runs inside the web service automatically on Railway.

### Troubleshooting

| Problem | Fix |
|---------|-----|
| Build fails | Ensure Node 20+ (set in `package.json` engines) |
| Login doesn't work | Run `railway run npm run db:seed` |
| Emails not sending | Add SMTP in Settings; check `NEXT_PUBLIC_APP_URL` |
| Tracking links broken | `NEXT_PUBLIC_APP_URL` must match your Railway domain |

## Project Structure

```
src/
├── app/              # Pages and API routes
├── components/       # UI components
├── lib/              # Business logic
└── workers/          # Background email processor
prisma/
├── schema.prisma     # Database schema
└── seed.ts           # Demo data
```
