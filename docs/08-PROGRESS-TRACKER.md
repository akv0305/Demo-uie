# PROGRESS TRACKER
Last updated: 2026-08-21 · Update this at the end of every session.

## Current position
**Step 2 complete. Foundation is green: `lint`, `typecheck` and `build` all pass
locally on Node 20 / VS Code.** Next action is Step 3 — `docs/03-DESIGN-SYSTEM.md`,
the frozen component catalogue that every later screen references.

## Phase status
| Step | Item | Status | Notes |
|------|------|--------|-------|
| P0 | Shell + design system + 19 components + fixtures | ✅ DONE | In repo, audited, quality good |
| P0 | Audit of P0 output | ✅ DONE | See §Defect register |
| 0 | Dev environment | ✅ DONE | Local, Node 20, VS Code + ESLint/Tailwind IntelliSense/Error Lens (D-007, D-008) |
| 1 | Rebrand theme.config.ts | ✅ DONE | Navy palette, appName = Unique Infra Engineers |
| 1 | Logo assets in /public/brand/ | ✅ DONE | PNG supplied; vector still wanted (Q-35) |
| 1 | BrandLogo + login logo integration | ✅ DONE | D-011, D-013 |
| 2 | Lint rules (colour literals, adapter/data imports) | ✅ DONE | D-014, D-015; verified firing; closes DEF-009 |
| 2b | next/font self-hosting | ✅ DONE | D-016 |
| 2c | next-env.d.ts tracked | ✅ DONE | D-017; closes DEF-017 |
| 3 | docs/03-DESIGN-SYSTEM.md | ⬜ NOT STARTED | Next action |
| 3 | docs/04-DATA-CONTRACT.md | ⬜ NOT STARTED | |
| 4 | types.ts extension (UOM/HSN/Item) | ⬜ NOT STARTED | Closes DEF-002..006, 012, 013 |
| 4b | Zod + RHF + reference schema | 🟡 PARTIAL | Packages installed; no schema written yet |
| 4c | features/ folder structure | ⬜ NOT STARTED | Adopt at UOM Master |
| 5 | UOM Master | ⬜ NOT STARTED | |
| 6 | HSN/SAC Master | ⬜ NOT STARTED | |
| 7 | Item Master (GOLDEN PATH) | ⬜ NOT STARTED | |
| 8–20 | See 01-DELIVERY-PLAN §6 | ⬜ NOT STARTED | |

## Defect register (from P0 audit)
| ID | Severity | Item | Status |
|----|----------|------|--------|
| DEF-001 | High | Rebrand absent from repo; `theme.config.ts` still `appName: 'Infra ERP'`, neutral palette | Closed — Step 1 |
| DEF-002 | High | `Item` type has ~11 fields; Item Master form needs ~30. Missing itemType, purchase/issue UOM + conversion, min/max, shelf life, batch, QC flag, negative-stock flag, returnable fields, produced fields, rate refs, preferred vendors | Open — Step 4 |
| DEF-003 | Med | `Uom` has no category and no base-UOM flag → conversions cannot be dimension-validated | Open — Step 4 |
| DEF-004 | Med | `HsnSac` has no CGST/SGST/IGST split, no effectiveFrom, no isActive | Open — Step 4 |
| DEF-005 | Med | `Uom` and `HsnSac` lack active/inactive flags (required by scope §7 for all masters) | Open — Step 4 |
| DEF-006 | Med | `ItemGroup` is a closed TS union — missing scaffolding/staging, spares, tools, services. In production, item groups must be master data, not a type | Open — Step 4 (demo), carry to production |
| DEF-007 | High (production) | `DocumentSummary.projectId` is non-nullable, but centralised (non-project) procurement is in scope → must be nullable | Open |
| DEF-008 | Low | `DocumentKind` union missing purchase invoice, stock adjustment, opening stock, log book, maintenance, breakdown, attendance, payroll, order book, export batch | Open |
| DEF-009 | Med | `eslint: { ignoreDuringBuilds: true }` → architectural rules unenforced | Closed — Step 2 |
| DEF-010 | Low | `'var(--heading-weight)' as unknown as string` cast in tailwind.config | Open |
| DEF-011 | Low | `ApprovalAction` mixes actions with states (PENDING, NOT_STARTED) — acceptable in demo, wrong for production schema | Deferred to production |
| DEF-012 | Med | Vestigial `isAsset: boolean` on `Item` maps to nothing; replace with `itemType` | Open — Step 4 |
| DEF-013 | Med | `Project.contractValueCr: number` — display unit (crore) leaks into the data model and money stored as float. Violates D-010/R2. | Open — Step 4 |
| DEF-014 | Med | Login brand panel used `text-foreground`/`text-muted-foreground` on a navy surface → unreadable text. Rule: any surface that is not `bg-background`/`bg-surface` must use its paired `-foreground` token. | Closed 2026-08-20 by revert (D-013) |
| DEF-015 | High | Uppercase `.PNG` in brand asset paths would 404 on Netlify's case-sensitive filesystem | Closed 2026-08-21 — files renamed lowercase |
| DEF-016 | Low | `BrandLogo` hard-codes `/brand/logo.svg|png` instead of reading `themeConfig.brand.logoPath`, weakening the "one config file" promise | Open — fix on next touch of that file |
| DEF-017 | Med | `next-env.d.ts` was gitignored while `tsconfig.json` includes it → TS2882 on CSS side-effect import in a fresh clone | Closed 2026-08-21 (D-017) |


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

## Registers (kept in separate files)
- Decisions → `06-DECISION-LOG.md` (D-001 … D-017 and DEF-001 … DEF-017)
- Open questions → `07-OPEN-QUESTIONS.md` (Q-01 … Q-34; Q-01, Q-02, Q-03, Q-33, Q-34 closed)
- Session history → `09-SESSION-LOG.md`

