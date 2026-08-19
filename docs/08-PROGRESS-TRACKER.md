# PROGRESS TRACKER
Last updated: 2026-08-17 · Update this at the end of every session.

## Current position
**Step 0 — Dev environment setup. BLOCKED: no local or cloud dev instance.**
Nothing new can be built until `npm run typecheck` and `npm run build`
pass on the owner's machine.

## Phase status
| Step | Item | Status | Notes |
|------|------|--------|-------|
| P0 | Shell + design system + 19 components + fixtures | ✅ DONE | In repo, audited, quality good |
| P0 | Audit of P0 output | ✅ DONE | See §Defect register |
| 0 | Dev environment | 🟡 IN PROGRESS | Local install; IDE = VS Code (D-008) |
| 1 | Rebrand theme.config.ts | 🟡 DELIVERED, AWAITING PASTE | File issued |
| 1 | Logo SVG/PNG assets in /public/brand/ | ⬜ NOT STARTED | Owner to supply artwork |
| 2 | Lint rules (colour literals, adapter imports) | ⬜ NOT STARTED | |
| 3 | docs/03-DESIGN-SYSTEM.md | ⬜ NOT STARTED | |
| 3 | docs/04-DATA-CONTRACT.md | ⬜ NOT STARTED | |
| 4 | types.ts extension (UOM/HSN/Item) | ⬜ NOT STARTED | |
| 4b | Zod + RHF + reference schema | ⬜ NOT STARTED | Approved Q-33/Q-34 |
| 4c | features/ folder structure | ⬜ NOT STARTED | Adopt at UOM Master |
| 5 | UOM Master | ⬜ NOT STARTED | |
| 6 | HSN/SAC Master | ⬜ NOT STARTED | |
| 7 | Item Master (GOLDEN PATH) | ⬜ NOT STARTED | |
| 8–20 | See 01-DELIVERY-PLAN §6 | ⬜ NOT STARTED | |

## Defect register (from P0 audit)
| ID | Severity | Item | Status |
|----|----------|------|--------|
| DEF-001 | High | Rebrand absent from repo; `theme.config.ts` still `appName: 'Infra ERP'`, neutral palette | Open — Step 1 |
| DEF-002 | High | `Item` type has ~11 fields; Item Master form needs ~30. Missing itemType, purchase/issue UOM + conversion, min/max, shelf life, batch, QC flag, negative-stock flag, returnable fields, produced fields, rate refs, preferred vendors | Open — Step 4 |
| DEF-003 | Med | `Uom` has no category and no base-UOM flag → conversions cannot be dimension-validated | Open — Step 4 |
| DEF-004 | Med | `HsnSac` has no CGST/SGST/IGST split, no effectiveFrom, no isActive | Open — Step 4 |
| DEF-005 | Med | `Uom` and `HsnSac` lack active/inactive flags (required by scope §7 for all masters) | Open — Step 4 |
| DEF-006 | Med | `ItemGroup` is a closed TS union — missing scaffolding/staging, spares, tools, services. In production, item groups must be master data, not a type | Open — Step 4 (demo), carry to production |
| DEF-007 | High (production) | `DocumentSummary.projectId` is non-nullable, but centralised (non-project) procurement is in scope → must be nullable | Open |
| DEF-008 | Low | `DocumentKind` union missing purchase invoice, stock adjustment, opening stock, log book, maintenance, breakdown, attendance, payroll, order book, export batch | Open |
| DEF-009 | Med | `eslint: { ignoreDuringBuilds: true }` → architectural rules unenforced | Open — Step 2 |
| DEF-010 | Low | `'var(--heading-weight)' as unknown as string` cast in tailwind.config | Open |
| DEF-011 | Low | `ApprovalAction` mixes actions with states (PENDING, NOT_STARTED) — acceptable in demo, wrong for production schema | Deferred to production |
| DEF-012 | Med | Vestigial `isAsset: boolean` on `Item` maps to nothing; replace with `itemType` | Open — Step 4 |

## Confirmed good (do not re-audit)
Theme token plumbing (HSL triplets → CSS vars → Tailwind semantic names,
opacity modifiers work, density scale wired as real utilities).
Data-access contract (all async, typed, `ListParams`/`Paged<T>`, 90ms
artificial latency for loading states). `store.ts` localStorage layer
(generic, SSR-guarded, change event, no business rules). Dependency
discipline (Next 14.2.15, React 18, Radix primitives, date-fns,
lucide-react, cva/clsx/tailwind-merge — nothing else). `next.config.mjs`
static export config. `DataTable` API. Fixture domain fidelity (real IS
and MoRTH specifications).

## Open questions register
Owner = who must answer. Client = needs client input. Owner-decide = the
project owner decides.
