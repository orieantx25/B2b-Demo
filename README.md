# uGSOT B2B Operations Portal

Production multi-user portal for B2B field, Operations, Leadership, and Super Admin. Passwordless email login, role-based workspaces, Supabase-ready schema (local in-memory store when Supabase env is unset).

## Quick start

```bash
npm install
cp .env.example .env.local
# set AUTH_SECRET (required for signed session cookies)
npm run dev
```

Open [http://localhost:3000/login](http://localhost:3000/login)

**Demo Super Admin:** `superadmin@ugsot.edu`  
Seeded member emails use `name.surname@ugsot.upgrad.com` (see Admin → Users after login).

## Auth model

1. Enter work email on `/login`
2. Server validates email exists in `profiles` and is **active**
3. Signed httpOnly JWT cookie (`ugsot_session`) stores `userId`, `role`, `region`
4. Middleware role-gates `/b2b`, `/operations`, `/reports`, `/admin`
5. No passwords (by design)

## Supabase setup

1. Create a Supabase project
2. Apply migrations:
   - `supabase/migrations/0001_init.sql` — schema + enums + RLS stubs
   - `supabase/migrations/0002_storage.sql` — buckets `meeting-photos`, `visiting-cards`, `documents`
3. Run `supabase/seed.sql` for bootstrap profiles + settings
4. Set in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
AUTH_SECRET=...
```

Without Supabase env vars the app uses a **local server store** seeded from `src/data/seed.ts` so demos and `npm run build` work offline.

## Workspaces

| Role | Default home | Notes |
|------|--------------|-------|
| `b2b_member` / `b2b_lead` | `/b2b` | Mobile-first field portal |
| `operations` | `/operations` | Desktop verification / WO |
| `leadership` | `/reports` | Desktop insights |
| `admin` / `super_admin` | `/admin` | Users, access matrix, settings, audit; can enter all workspaces |

## Legacy Admin Portal (UTM / Coupon)

Create UTM / Coupon opens a **Continue in Admin Portal** modal and launches `legacy_portal_utm_url` / `legacy_portal_coupon_url` from Settings with query params. Synced UTMs/coupons still render in-app. Adapter: `src/lib/legacy-integration.ts`.

## Stack

Next.js 15 · TypeScript · Tailwind 4 · TanStack Query · Zustand (UI) · Zod · Web Crypto JWT · Supabase clients · Recharts · Lucide

## Scripts

```bash
npm run dev
npm run build
npm start
npm run lint
```

## Vercel

Import the repo; set the same env vars as `.env.example`. `vercel.json` is included.
