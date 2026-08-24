# uGSOT B2B Operations Portal

Production-quality frontend demo for leadership walkthroughs. Mock data only — no real auth, OCR, email, or APIs.

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Build / deploy

```bash
npm run build
npm start
```

Vercel: import the repo; `vercel.json` is included. Copy `.env.example` → `.env.local` if you want local env vars (optional).

Demo state persists in `sessionStorage` (`ugsot-b2b-demo`) so refresh keeps your walkthrough. Use **Reset demo** on the error fallback, or clear that key, to restore seed data.

## Stack

Next.js 15 · TypeScript · Tailwind 4 · Zustand (session persist) · Recharts · Lucide · shadcn/Radix primitives

## Workspaces

| View | Path | Audience |
|------|------|----------|
| B2B Portal View | `/b2b` | Field / B2B members |
| Operations View | `/operations` | Ops verification & WO |
| Reports & Insights View | `/reports` | Leadership |

Use the persona switcher in the header (B2B / Operations / Leadership / Admin).

---

## Demo script (20 scenarios)

Walk these in order for a ~25-minute leadership demo. Start as **B2B** persona unless noted.

1. **Landing** — Open `/`, pick a workspace chip, land in B2B Overview KPIs.
2. **Schedule meeting** — Meetings & Events → schedule a consultant meeting (name/org/phone).
3. **Complete meeting** — Mark the meeting Completed (unlocks MOU gate).
4. **Create consultant** — My Consultants → add from meeting; note duplicate detection if name/phone collide.
5. **Duplicate / merge** — Force a near-duplicate; request merge; switch to Ops/Admin to resolve if shown.
6. **Consultant 360** — Open a consultant; sticky actions + tabs (Overview → Journey → Documents).
7. **Request MOU (Standard)** — Request MOU → pick completed meeting → Standard slab; note **locked** payout fields.
8. **Request MOU (Non-Standard)** — Second consultant → Non-Standard; payout fields become **editable**.
9. **Ops queue** — Switch persona to **Operations** → MOU / WO Queue; open Verification.
10. **Verify docs** — Verification workspace: Match / Missing / Needs Review chips; Approve & continue.
11. **Rework loop** — Request rework with GST selected; as B2B re-upload / submit rework path.
12. **Generate & send WO** — Approve Standard MOU → Generate WO → Preview → Send WO.
13. **Mark signed** — Mark signed copy received; consultant MOU status updates to Signed.
14. **UTM & coupon** — On 360: Request UTM, Create Coupon; Ops → UTM / Coupon Mapping.
15. **Ownership transfer** — Admin/Ops: Transfer ownership; check Ownership History tab.
16. **First lead / activate** — Simulate first lead; confirm Active status and journey step.
17. **B2B MOU status strip** — B2B → MOU / WO: Total / Requested / Verification / Rework / In progress / Signed.
18. **Performance** — B2B My Performance + Reports → B2B / Consultant performance tables.
19. **Weekly report** — Reports → Weekly Reports → mark reviewed / add notes.
20. **Executive funnel** — Reports Overview funnel + refresh persistence (reload page; actions remain).

### Smoke checklist (primary buttons)

- [ ] Persona switcher updates shell + default workspace
- [ ] Schedule / complete / reschedule meeting
- [ ] Create consultant + duplicate flag
- [ ] Request MOU (meeting mandatory)
- [ ] Ops verify / rework / approve / WO / signed
- [ ] UTM request + coupon create
- [ ] Ownership transfer
- [ ] Simulate first lead
- [ ] Weekly report review
- [ ] CardX extract toast (where exposed in meetings flow)

## Editable vs locked fields

- **Editable** — white inputs, red focus ring (`Field` / `Editable*`)
- **Locked** — muted `#fafafa`, lock icon, helper “Management approved / system synced” (`LockedField`)

Standard commercial payout is locked; Non-Standard is editable.

## Out of scope

Real auth, live OCR/email, finance/ROI engines, production APIs.
