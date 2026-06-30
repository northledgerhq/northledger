# NorthLedger

NorthLedger is an open-source billing, invoicing, expenses, payments, and simple accounting platform for freelancers, individuals, and small businesses.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma
- Docker
- Zod validation
- PDF invoice export with PDFKit
- Local cookie authentication with bcrypt password hashing

## MVP Modules

- Login/logout with protected application routes
- Dashboard with invoice totals, paid amounts, outstanding balances, expenses, profit, latest clients, and latest invoices
- Clients with create, edit, delete, search, and profile views
- Products / services with create, edit, delete, search, unit price, and tax rate
- Invoices with multiple lines, automatic invoice numbers, discount, tax, totals, status, and PDF download
- Payments with partial payment support, payment methods, and invoice status updates
- Expenses with category, amount, date, vendor, and notes
- Settings for company details and invoice defaults
- Monthly reports with CSV export

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment values:

```bash
cp .env.example .env
```

3. Start PostgreSQL:

```bash
docker compose up -d db
```

4. Run migrations and seed demo data:

```bash
npm run prisma:migrate
npm run seed
```

5. Start the app:

```bash
npm run dev
```

Open http://localhost:3000.

Demo login:

```text
Email: admin@northledger.local
Password: admin123456
```

Set `AUTH_SECRET` to a long random value before deploying.

## Docker App Build

After creating and applying migrations locally, build and run the production app with:

```bash
docker compose up --build
```

The app service runs `prisma migrate deploy` on startup.

## Useful Commands

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio
npm run seed
npm run build
```

## Project Structure

```text
app/          Next.js routes, pages, and exports
components/   Reusable UI shell and cards
lib/          Prisma client, validation, calculations, and server actions
prisma/       Database schema and seed data
```

## Notes

This first version keeps multi-tenant workspaces, bank feeds, recurring invoices, and double-entry accounting out of scope. The schema and route boundaries are intentionally small so those pieces can be added later without replacing the MVP.
