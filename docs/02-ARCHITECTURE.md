# ARCHITECTURE & CARRYOVER CONTRACT
Version 1.0 · Living document.

## 1. Governing principle
The demo is not a throwaway prototype. It is **the same application**
running against a different data adapter. Everything below exists to make
the demo → production transition a substitution, never a rewrite.

Demo repo: `Demo-uie` (public, static export, fixtures).
Production repo: created later by **tag + clone**, never from scratch (D-004).

## 2. Layer model

┌─ app/(app)/**/page.tsx ── CONTAINER (thin, disposable) ─────────┐
│  Demo:       'use client' + useEffect → lib/data                │
│  Production: server component + await → lib/data                │
│  ~15 lines. This is the ONLY layer that gets rewritten.         │
└──────────────────────────────┬──────────────────────────────────┘
                               │ props
┌──────────────────────────────▼──────────────────────────────────┐
│  features/<module>/*-screen.tsx ── PRESENTER (survives 100%)    │
│  Pure. Receives data as props. Never fetches. Never imports     │
│  from lib/data.                                                 │
└──────────────────────────────┬──────────────────────────────────┘
                               │ uses
┌──────────────────────────────▼──────────────────────────────────┐
│  components/erp/  (frozen 19)   components/ui/  (shadcn)        │
└─────────────────────────────────────────────────────────────────┘

┌─ lib/data/index.ts ── DATA CONTRACT (interface survives) ───────┐
│  Demo:       fixtures adapter + localStorage store              │
│  Production: Prisma adapter. Same function names, same types.   │
└─────────────────────────────────────────────────────────────────┘

**Hard rule:** a presenter never imports `lib/data`. If a screen needs
data, the container passes it in. This is what makes the static→server
transition mechanical.

## 3. Folder structure (adopted at Step 5, UOM Master)

app/(app)/masters/items/page.tsx container only features/masters/items/ item-list-screen.tsx presenter item-form-screen.tsx presenter item-detail-screen.tsx presenter item.schema.ts Zod — survives to production item.columns.tsx ColumnDef[] item.constants.ts option lists, labels via terminology

Files must NOT move at handover. Establish this now, not in month three.

## 4. Approved dependencies (allowlist)
Adding anything not on this list requires explicit owner approval.

Runtime: next 14.2.15 · react 18.3.1 · react-dom 18.3.1 · lucide-react ·
date-fns · class-variance-authority · clsx · tailwind-merge ·
tailwindcss-animate · @radix-ui/* (shadcn primitives only) ·
**zod (approved Q-33)** · **react-hook-form (approved Q-34)** ·
**@hookform/resolvers** (required bridge between the two).

Dev: typescript · @types/* · tailwindcss · postcss · autoprefixer ·
eslint · eslint-config-next · serve.

Deferred, decision required before Step 18: charting library (Q-04).

- zod 4.4.3 (v4 syntax: field messages use `{ message: '…' }`; `invalid_type_error` was removed)
- react-hook-form 7.85.0
- @hookform/resolvers 5.9.1 (v5 is required for zod v4; v3/v4 resolvers will not typecheck)


## 5. Zod usage contract (this is why Zod was adopted)
One schema per entity in `features/<module>/<entity>.schema.ts`.
Demo use: form validation via `@hookform/resolvers/zod`.
Production use, **same file, unchanged**:
  - server action input validation
  - Excel import row-level validation
  - `z.infer<>` as the source of truth for the DTO type

Therefore: schemas must never import anything browser-specific, must
never reference React, and error messages must be human-readable because
they will surface in Excel import error reports.

## 6. Four production-safety rules (apply from today)

**R1 — IDs are opaque.** Never parse, sort by, slice or display an `id`.
Fixtures use readable IDs (`PRJ-SH19`); production uses cuid. Display the
`code` field. Also satisfies "do not expose internal IDs in portal screens".

**R2 — No float money, no display units in the model.** Money is stored
in rupees; production column type is `Decimal(18,2)`. Crore/lakh is a
*formatting* concern handled in `lib/format.ts`. (See DEF-013:
`Project.contractValueCr: number` violates both halves of this rule and is
fixed in the Step 4 types extension.)

**R3 — Dates are ISO strings in all DTOs.** Serialization-safe across the
server/client boundary. `Date` objects never enter the data layer.

**R4 — Common transactional fields from scope §22 exist from day one** on
every document-like type: `companyId`, `projectId` (nullable — centralised
procurement has no project, DEF-007), `siteId?`, `documentNo`, `status`,
`revisionNo`, `createdById`, `createdAt`, `updatedAt`, `submittedAt?`,
`approvedAt?`, `cancelledAt?`, `cancellationReason?`, `remarks?`.
This makes the Prisma model a transcription, not a redesign.

## 7. Fixtures are future seed data (D-006)
Fixture objects must use the **exact field names** the Prisma model will
use. Any divergence buys a mapper later. The existing fixture corpus
(60+ items with real IS/MoRTH specs, GSTIN-valid vendors, WBS hierarchies)
becomes the dev/UAT seed script — treat it as an asset, not scaffolding.

## 8. Handover procedure (when requirement gathering closes)
1. Tag demo repo `demo-v1`.
2. Clone → push to new **private** production repo (full history retained).
3. Additive commits only, in order: Prisma + Postgres → Auth.js + Argon2id
   → RBAC middleware → database adapter behind existing `lib/data`
   interface → convert containers to server components → seed script from
   fixtures → **delete fixtures adapter and `store.ts` last**.
4. Demo repo stays live and frozen for continued client walkthroughs.

## 9. Carryover estimate (honest)
100%: theme.config, terminology.config, components/ui, lib/format,
lib/utils, Zod schemas, column defs, fixtures (repurposed as seed),
screen inventory & specs.
~95%: components/erp (may gain optional props).
~90%: screen presenters (submit handlers swap to server actions).
~80%: lib/data function signatures (implementation swaps).
~70%: lib/data/types.ts (becomes the DTO layer over Prisma models).
0% by design: page containers (~15 lines each), store.ts.
