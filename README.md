# uGSOT B2B Operations Portal

Multi-workspace portal for B2B field, Operations, Leadership, and Super Admin.

**Engineering PRD (give to tech team):** [`PRD-uGSOT-B2B-Operations-Portal.md`](./PRD-uGSOT-B2B-Operations-Portal.md)  
Includes system design, data flows, **password login**, and **unique IDs** for every consultant and B2B user.

## Demo note (current product)

**Login is removed from this demo build.** Opening the app goes straight to `/b2b` as Super Admin so stakeholders can explore all workspaces. Production authentication (email + password) is specified in the PRD only — flip `DEMO_AUTH_DISABLED` in `src/lib/auth/demo.ts` and restore session middleware when shipping for real users.

## Quick start

```bash
npm install
cp .env.example .env.local
# AUTH_SECRET still used if you re-enable cookie sessions
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → redirects to `/b2b`.

## Workspaces

| Role | Default home | Notes |
|------|--------------|-------|
| `b2b_member` / `b2b_lead` | `/b2b` | Mobile-first field portal |
| `operations` | `/operations` | Desktop verification / WO |
| `leadership` | `/reports` | Desktop insights |
| `admin` / `super_admin` | `/admin` | Users, access matrix, settings, audit; can enter all workspaces |

## Unique IDs (product rule)

- **User:** immutable unique `userId` (demo Super Admin: `USR-SUPERADMIN`)
- **Consultant:** immutable unique `consultantCode` (`CNS-#####`) + internal `consultantId`

Full rules are in the PRD §4.

## Supabase setup

1. Create a Supabase project
2. Apply migrations:
   - `supabase/migrations/0001_init.sql`
   - `supabase/migrations/0002_storage.sql`
3. Run `supabase/seed.sql`
4. Set in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
AUTH_SECRET=...
```

Without Supabase env vars the app uses a **local server store** seeded from `src/data/seed.ts`.

## Legacy Admin Portal (UTM / Coupon)

Create flows use in-app PIPs then hand off via `legacy_portal_utm_url` / `legacy_portal_coupon_url` (`src/lib/legacy-integration.ts`).

## Stack

Next.js 15 · TypeScript · Tailwind 4 · TanStack Query · Zustand · Zod · Web Crypto JWT (prod sessions) · Supabase · Recharts · Lucide
