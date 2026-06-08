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
# Switch to PostgreSQL
DATABASE_URL="postgresql://user:pass@localhost:5432/mailflow"

npm run build
npm start
```

Run the email worker as a background process or cron job hitting `POST /api/worker`.

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
