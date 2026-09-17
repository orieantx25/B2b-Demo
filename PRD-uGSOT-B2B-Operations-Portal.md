# PRD — uGSOT B2B Operations Portal (Current Product Spec)

| Field | Value |
|--------|--------|
| **Product** | uGSOT B2B Operations Portal |
| **Organization** | upGrad School of Technology (uGSOT) |
| **Document type** | Product Requirements Document for engineering |
| **Based on** | Live portal as of 2026-09-17 (B2B lean + Ops MOU hub + Reports consolidated + slim Admin) |
| **Audience** | Tech / platform team |
| **Status** | Spec for production build |
| **Demo note** | The shipped demo **does not enforce login**. Authentication requirements below are for the **production** system only. |

---

## 1. Executive summary

The **uGSOT B2B Operations Portal** is the operational system of record for the consultant partner lifecycle:

```
Meeting → Consultant → MOU / WO → UTM / Coupon → First lead → Active
        → Leads / Test takers / Admissions (from existing systems)
        → Weekly + consolidated reporting
```

**Product principle:** Capture once → automate the next step → keep human approval where required.

Four workspaces share one identity model and one consultant master:

| Workspace | Job | Primary users |
|-----------|-----|----------------|
| **B2B** | Do the work (field) | B2B Member, B2B Lead |
| **Ops** | Run the process (MOU hub, ownership, targets, mapping) | Operations |
| **Reports** | Measure and decide | Leadership |
| **Admin** | Users & access only | Admin, Super Admin |

Downstream UTM/coupon **creation** hands off to the existing Admin Portal (deep-link stub). This portal owns mapping, consultant context, and lifecycle visibility.

---

## 2. Goals & non-goals

### Goals

1. Single consultant 360 with permanent **unique consultant ID** (`consultantId` + `consultantCode`).
2. Every portal user has a permanent **unique user ID** (`userId`).
3. Lean B2B: schedule, consultants, MOU visibility, create UTM/coupon — no Performance page.
4. Ops MOU hub: queue → verification (no separate Verify/Rework nav); Approved tracking with Ops-only milestones visible on B2B journey.
5. Ownership by SPOC → consultants → confirmed transfer.
6. Reports: executive views + **consolidated CSV/XLSX** + weekly email digest recipients.
7. Slim Admin: **Users & Roles** + **Access Matrix** only (targets live in Ops).
8. **Password-based login** for production (see §5).

### Non-goals (Phase 1)

- Replacing existing UTM / coupon / LMS / admissions backends.
- Real short-URL or real outbound email SMTP (stubs acceptable).
- Admin Settings / Audit UI in Phase 1 (system logging still required backend-side).
- Full CRM or marketing automation.

---

## 3. Personas & roles

| Role (`AppRole`) | Default home | Workspaces |
|------------------|--------------|------------|
| `b2b_member` | `/b2b` | B2B |
| `b2b_lead` | `/b2b` | B2B |
| `operations` | `/operations` | Ops |
| `leadership` | `/reports` | Reports |
| `admin` | `/admin` | All |
| `super_admin` | `/admin` | All |

Shell workspace switcher (B2B / Ops / Reports / Admin) for elevated roles. Shared consultant detail: `/consultants/[id]`.

---

## 4. Unique identifiers (mandatory)

### 4.1 Portal user

| Field | Rule |
|-------|------|
| **`userId`** | Globally unique, immutable (`USR-…` or UUID). |
| **`email`** | Unique; login username. |
| Soft-delete | Must not recycle IDs or emails. |

All writes store `actorUserId` / `ownerId` against this ID.

### 4.2 Consultant

| Field | Rule |
|-------|------|
| **`consultantId`** | Internal PK, immutable. |
| **`consultantCode`** | Business code `CNS-#####`, unique, immutable after issue. |
| **`existingUtmCode`** | Optional legacy counsellor code. |

UTMs, coupons, meetings, MOUs, leads FK to `consultantId`; UI shows `consultantCode`.

### 4.3 Other prefixes

Meeting `mtg_*` · Event `evt_*` · MOU `mou_*` + `woNumber` · UTM `utm_*` · Coupon `cpn_*` · Document `doc_*`.

---

## 5. Authentication & authorization (production — **not in demo**)

> **Demo:** Login gate removed; open access as Super Admin (`DEMO_AUTH_DISABLED` in `src/lib/auth/demo.ts`).  
> **Production:** Implement this section fully.

### 5.1 Login with password

1. `/login` → **email + password**.
2. Profile exists, `active === true`, password hash matches (argon2id/bcrypt).
3. httpOnly session cookie with `userId`, `email`, `name`, `role`, `region`, `exp`.
4. Redirect `roleHomePath(role)`; rate-limit failures.

### 5.2 Password lifecycle

Invite/reset via email token · min length 10+ · lockout · authenticated change-password.

### 5.3 Session & RBAC

Middleware on all non-public routes · `/access-denied` · `/session-expired` · logout clears session · Admin/Super Admin may switch all workspaces.

---

## 6. Information architecture (current nav)

### 6.1 B2B

| Route | Purpose |
|-------|---------|
| `/b2b` | Greeting, Schedule / Scan / Today, Needs you, 3 KPIs, upcoming |
| `/b2b/meetings` | Table + row PIP; 2-step schedule (New \| Previous searchable); no evidence on schedule |
| `/b2b/consultants` | List + Open 360 / Schedule / Materials |
| `/b2b/mou` | Needs you / In progress / Signed |
| `/b2b/utm` | Create UTM + Create Coupon PIPs only (no lists) |
| `/consultants/[id]` | 360 + journey (Ops milestones visible, not markable by B2B) |

`/b2b/performance` redirects to `/b2b` (removed from nav).

### 6.2 Operations

| Route | Purpose |
|-------|---------|
| `/operations` | Ops overview KPIs |
| `/operations/queue` | MOU / WO queue (Requested / Verification / Rework). **Row click → verification panel** |
| `/operations/verification` | Verification workspace (not a nav tab — opened from queue) |
| `/operations/signed` | **Approved tracking** — approved/in-flight consultants; Ops marks milestones |
| `/operations/consultants` | Consultant master |
| `/operations/ownership` | SPOC list → consultants under SPOC → transfer with Yes/No confirm |
| `/operations/utm` | Searchable UTM & Coupon mapping tables |
| `/operations/targets` | **User targets** (schools / consultants / meetings / coachings per B2B user) |
| `/operations/exceptions` | Exception tiles: SLA / no owner / unmapped UTM / missing docs |

Removed from Ops nav: separate Verification, Rework, Signed Documents (replaced by Approved tracking). `/operations/rework` redirects into queue.

### 6.3 Reports

| Route | Purpose |
|-------|---------|
| `/reports` | Executive overview (no “Synced systems” panel) |
| `/reports/b2b` | B2B performance |
| `/reports/targets` | Targets vs achievement (read; targets set in Ops) |
| `/reports/consultants` | Consultant performance |
| `/reports/mou` | MOU / WO efficiency |
| `/reports/weekly` | Weekly reports |
| `/reports/consolidated` | **Consolidated pack**: download CSV / XLSX; weekly email recipient list + send |

### 6.4 Admin (slim)

| Route | Purpose |
|-------|---------|
| `/admin` | Overview KPIs + tiles for Users and Access only |
| `/admin/users` | Users & roles (`userId`) |
| `/admin/access` | Access matrix |

**Removed from Admin nav:** Audit, Settings, User Targets.  
Old `/admin/targets` → `/operations/targets`; `/admin/settings` and `/admin/audit` → `/admin`.

---

## 7. System design

### 7.1 Architecture

```
┌─────────────┐     HTTPS      ┌──────────────────────────────┐
│  Browser     │ ◄────────────► │  Next.js App (App Router)     │
│  B2B/Ops/    │                │  UI · Middleware · API/Actions│
│  Reports/    │                └──────────────┬───────────────┘
│  Admin       │                               │
└─────────────┘          ┌─────────────────────┼─────────────────────┐
                         ▼                     ▼                     ▼
                ┌────────────────┐   ┌──────────────────┐   ┌────────────────────┐
                │ Postgres       │   │ Object storage   │   │ Legacy Admin Portal │
                │ (Supabase)     │   │ photos / docs    │   │ UTM / Coupon create │
                └────────────────┘   └──────────────────┘   └────────────────────┘
```

### 7.2 Layers

| Layer | Demo | Production |
|-------|------|------------|
| UI | Next.js 15, React 19, Tailwind, SoT `#e31c24` / `#111` / `#f6f6f6` | Same |
| State | Zustand + seed | Server source of truth |
| Auth | Open demo Super Admin | Email + password (§5) |
| Export | `xlsx` + CSV helpers (`src/lib/consolidated-report.ts`) | Same + scheduled email job |
| Legacy | `legacy-integration` query handoff | Until real APIs |

### 7.3 Key modules

| Concern | Path |
|---------|------|
| Nav | `src/components/app-shell.tsx` |
| Store | `src/store/app-store.ts` |
| Types / `MouOpsTrack` | `src/types/index.ts` |
| Journey (Ops milestones visible) | `src/components/journey.tsx` |
| Create UTM / Coupon | `src/components/create-utm-modal.tsx`, `create-coupon-modal.tsx` |
| Consolidated export | `src/lib/consolidated-report.ts` |
| Demo auth flag | `src/lib/auth/demo.ts` |

---

## 8. Data model (core)

### 8.1 Profile / user targets

```
profiles: user_id PK, email UNIQUE, password_hash (prod), name, role, region, active
user_targets: user_id FK, schools, consultants, meetings, coachings, updated_at
report_digest_emails: email[]  -- weekly consolidated recipients (UI-persisted in demo)
```

### 8.2 Consultant & MOU

```
consultants: consultant_id, consultant_code UNIQUE, owner_user_id, status, mou_status, …

mou_requests:
  status, commercial fields, wo_number, legal/finance statuses,
  ops_track:
    sent_to_legal_at      -- auto on Approve
    finance_approved_at   -- Ops manual
    draft_shared_at       -- Ops manual
    sent_to_client_at     -- Ops manual
  signed_at               -- Ops manual (mark signed)
```

### 8.3 Relationships

```
profiles 1──* consultants (owner)
consultants 1──* meetings | mou_requests | utms | coupons | documents | ownership_history
```

---

## 9. Data flows

### 9.1 Login (production)

```
POST /api/auth/login { email, password } → session cookie → /api/auth/me → workspace shell
```

### 9.2 Schedule meeting (B2B)

```
Who (New | Previous searchable) → When/Where
  → duplicate warn → bind existing consultantId
  → calendar conflict guard
  → create meeting; photo later via meeting PIP
```

### 9.3 MOU / WO (Ops hub)

```
B2B 360 → Request MOU
  → Ops Queue (Requested / Verification / Rework)
  → Click row → Verification panel
       → Request rework → B2B “Submit rework to Ops queue” → back to Verification
       → Approve → auto mark “MoU sent to legal” → Approved tracking
  → Approved tracking (Ops only marks):
       Finance approved → Draft shared → WO/MoU sent to client → WO/MoU signed
  → Same milestones visible on B2B consultant journey (read-only)
  → On signed: materials auto-share stub
```

### 9.4 UTM / Coupon

```
B2B create PIP → zod → toast → legacy deep-link
Ops /operations/utm → mapping lists (searchable)
```

### 9.5 Ownership

```
Ops Ownership → SPOC cards → list consultants under SPOC
  → Transfer → pick B2B member → confirm “Are you trying to transfer ownership…?”
  → Yes → transferOwnership(consultantId, newOwnerId)
```

### 9.6 Targets & reports

```
Ops /operations/targets → set UserTargets per B2B userId
Reports /reports/targets → achievement vs targets
Reports /reports/consolidated → CSV | XLSX download
  → add digest emails → “Send report on email (weekly)” (queue stub)
```

---

## 10. Functional requirements

### Identity

1. **FR-UID-1** Immutable unique `userId` on every profile (Admin → Users).
2. **FR-UID-2** Immutable unique `consultantCode` + `consultantId`.
3. **FR-UID-3** UTM/Coupon always store `consultantId`.

### Auth (production)

4. **FR-AUTH-1** Email + password login.
5. **FR-AUTH-2** Session required except public/login.
6. **FR-AUTH-3** Role gates per workspace matrix.

### B2B

7. **FR-B2B-1** Lean overview; no Performance nav.
8. **FR-B2B-2** Two-step schedule; evidence only from meeting PIP.
9. **FR-B2B-3** Previous-consultant search for 100+ owned rows.
10. **FR-B2B-4** Duplicate detection does not force-create.
11. **FR-B2B-5** `/b2b/utm` create-only.
12. **FR-B2B-6** Journey shows Ops milestones; B2B cannot mark them.

### Ops

13. **FR-OPS-1** No separate Verification/Rework nav tabs; verification opens from queue.
14. **FR-OPS-2** Rework resubmit returns MOU to Verification in queue.
15. **FR-OPS-3** Approve auto-sets sent-to-legal; post-legal steps Ops-manual in order.
16. **FR-OPS-4** Ownership: SPOC → consultants → confirm transfer.
17. **FR-OPS-5** User targets managed under Ops (not Admin).
18. **FR-OPS-6** UTM/Coupons and Exceptions are searchable / tile-driven as implemented.

### Reports

19. **FR-REP-1** No Synced systems panel on executive overview.
20. **FR-REP-2** Consolidated CSV and XLSX multi-sheet export.
21. **FR-REP-3** Manage weekly digest emails + send action.

### Admin

22. **FR-ADM-1** Admin nav = Overview + Users & Roles + Access Matrix only.
23. **FR-ADM-2** No Settings / Audit / User Targets tabs in Admin UI.

---

## 11. Non-functional requirements

| Area | Requirement |
|------|-------------|
| Mobile | B2B touch targets ≥44px |
| Theme | SoT `#e31c24`, `#111`, `#f6f6f6` |
| Security | Password hashing; httpOnly cookies; RLS |
| Audit (backend) | Log login, MOU milestones, ownership, exports, digest sends — even without Admin Audit UI |
| Performance | Consultant/UTM search at 100+ rows |
| Availability | Demo offline via seed; production managed Postgres |

---

## 12. Integrations

| System | Direction | Notes |
|--------|-----------|--------|
| Legacy Admin Portal | Out | UTM/Coupon create deep-link |
| Existing UTM System | In | Mapped codes in Ops |
| Leads / Exam / Admissions | In | Metrics on 360 + reports |
| CardX | Assist | Visiting card extract |
| Object storage | Bi | Photos, cards, docs |
| Email (digest) | Out | Weekly consolidated report to recipient list |

---

## 13. Demo vs production

| Item | Demo | Production |
|------|------|------------|
| Login | Removed | Email + password |
| Session | Open Super Admin | Enforced middleware |
| User / consultant IDs | Seed + `USR-SUPERADMIN` / `CNS-#####` | Strict unique constraints |
| Weekly email | Toast stub | Real mailer + schedule |
| XLSX/CSV | Client download | Same + optional server job |
| Admin Settings/Audit | Redirected away | Optional later; logging still required |

---

## 14. Success metrics

1. Time meeting → MOU request ↓ vs spreadsheet.
2. 100% ownership history coverage on transfers.
3. % Active consultants with mapped UTM ↑.
4. Ops time on Standard path ↓ vs Non-Standard.
5. Consolidated / weekly digest used without manual Excel builds.

---

## 15. Open questions

1. Production email provider for password reset + weekly digest?
2. SSO later without changing `userId`?
3. Consultant code: sequential vs region-prefixed?
4. Ops queue: polling vs realtime?

---


