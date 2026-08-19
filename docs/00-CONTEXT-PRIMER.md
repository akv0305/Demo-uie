# CONTEXT PRIMER — paste this first in any new session

## Project
Web-based ERP for **Unique Infra Engineers Pvt Ltd** (Hyderabad, Telangana),
an Indian infrastructure / EPC contractor — roads, bridges, industrial parks,
warehouses. Vendor/developer: **PNM Smart Solutions**.

Team is two people: the project owner (review, build, client contact) and an
AI co-pilot (architecture, specs, code generation).

## Current phase
**DEMO / REQUIREMENT-GATHERING PHASE** (runs before the 26-week build).
We are building a *clickable specification*: real production stack, real
screens, fabricated data, no backend. Its purpose is to elicit detailed
requirements from a client who has **never used an ERP before**.

Repo: `Demo-uie` (demo only — production will be a separate repo).
Host: Netlify free plan, static export, public URL, noindex.

## Non-negotiable rules
1. Stay inside Phase 1 scope. See `01-DELIVERY-PLAN.md` §Exclusions.
2. Never invent a requirement. If unclear → add to `07-OPEN-QUESTIONS.md`
   and ask. Do not assume.
3. No hardcoded colours. Everything via `config/theme.config.ts`.
4. No hardcoded user-visible text. Everything via
   `config/terminology.config.ts`.
5. Screens read data ONLY from `lib/data` — never from `lib/data/adapters/*`.
6. Reuse the frozen components in `components/erp/`. Do not create variants.
7. No new npm dependencies without explicit approval. Allowlist lives in
   `02-ARCHITECTURE.md` §4. Approved: zod, react-hook-form,
   @hookform/resolvers.
8. Static export must keep working (`output: 'export'`). No API routes,
   no server components fetching data, no middleware.
9. **Never mention AI tooling, co-pilot usage, or vendor tool names in any
   client-facing screen, document, help text, or repo content.**
10. Never rewrite a file I have not read in this session — ask for it.
11. Presenters never fetch. Containers fetch, presenters receive props.
    See `02-ARCHITECTURE.md` §2. This is what makes the demo become the
    production app instead of being rewritten.
12. Validation lives in one Zod schema per entity and is reused in
    production for server actions and Excel import. Never hand-roll
    validation.
13. IDs are opaque. Money is rupees, never floats, never crore in the
    model. Dates are ISO strings.

## Read next, in this order
- `08-PROGRESS-TRACKER.md`  → what is done, what is next (READ THIS FIRST)
- `02-ARCHITECTURE.md → layering, carryover contract, dependency allowlist
- `01-DELIVERY-PLAN.md`     → scope, sequence, protocol
- `03-DESIGN-SYSTEM.md`     → frozen component signatures
- `04-DATA-CONTRACT.md`     → lib/data API surface and domain types
- `06-DECISION-LOG.md`      → decisions already made (do not relitigate)
- `07-OPEN-QUESTIONS.md`    → unresolved, with owners
- `docs/modules/<module>.md`→ spec for the module being worked on

## Client domain vocabulary (use their words, not ERP words)
Indent (not Purchase Requisition, pending confirmation), MB / Measurement
Book, RA Bill, chainage, GSB / WMM / DBM / BC road layers, pile / pile cap /
pier / pier cap / girder / deck slab for bridges, muster, shuttering,
staging, batching plant, hot mix plant, WMM plant, crusher, tipper,
transit mixer, paver, tandem roller. Full mapping in `05-GLOSSARY.md`.
