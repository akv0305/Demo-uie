# PROGRESS TRACKER
Last updated: 2026-08-21 · Update this at the end of every session.

## Current position
**Step 7 complete. UOM, HSN/SAC and Item masters are built and verified.**
Item Master is the frozen golden path (D-024, D-035). `lint`, `typecheck` and
`build` pass on Node 20. Next action is Step 8 — replicating the pattern
across the remaining masters, starting with Vendors.


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
| 3 | docs/03-DESIGN-SYSTEM.md | ✅ DONE | v1.0 |
| 3 | docs/04-DATA-CONTRACT.md | ✅ DONE | v1.0 |
| 4 | types.ts extension (UOM/HSN/Item) | ✅ DONE | Closes DEF-002..006, DEF-012 |
| 4b | Zod + RHF + reference schema | ✅ DONE | uom-schema.ts is the reference |
| 4c | features/ folder structure | ✅ DONE | D-024 |
| 5 | UOM Master | ✅ DONE | 17 fixtures, D-022/023/024 |
| 6 | HSN/SAC Master | ✅ DONE | 22 fixtures, derived tax split (D-028), isNonGst (D-029) |
| 7 | Item Master | ✅ DONE | 9 cross-field rules, 12 columns, 6-section dialog, GST derived from HSN (D-034), static import route (D-036) |
| 8 | Remaining masters | ⬜ NOT STARTED | Vendors → Subcontractors → Sites/Stores → Employees → Departments → Equipment → Projects → Companies |
| 8–20 | See 01-DELIVERY-PLAN §6 | ⬜ NOT STARTED | |

## Defect register (from P0 audit)
| ID | Severity | Item | Status |
|----|----------|------|--------|
| DEF-001 | High | Rebrand absent from repo; `theme.config.ts` still `appName: 'Infra ERP'` | Closed — Step 1 |
| DEF-002 | High | `Item` type had ~11 fields; Item Master needs ~30 | Closed 2026-08-21 — verified: 40 fields in `types.ts` |
| DEF-003 | Med | `Uom` has no category and no base-UOM flag | Closed 2026-08-21 — verified: `category`, `isBaseUnit` present |
| DEF-004 | Med | `HsnSac` has no CGST/SGST/IGST split, no effectiveFrom | Closed 2026-08-21 — verified present |
| DEF-005 | Med | `Uom` and `HsnSac` lack active/inactive flags | Closed 2026-08-21 — verified `isActive?` on both |
| DEF-006 | Med | `ItemGroup` is a closed union; groups must be master data | Closed 2026-08-21 — `ItemGroupDef` exists; constant is its seed (D-032) |
| DEF-007 | High | `DocumentSummary.projectId` non-nullable | Closed 2026-08-21 — verified `string \| null` (D-020) |
| DEF-008 | Low | `DocumentKind` union incomplete | Closed 2026-08-21 — verified 25 members (D-020) |
| DEF-009 | Med | `eslint: { ignoreDuringBuilds: true }` | Closed — Step 2 (D-014) |
| DEF-010 | Low | `'var(--heading-weight)' as unknown as string` cast in tailwind.config | Open |
| DEF-011 | Low | `ApprovalAction` mixes actions with states | Deferred to production |
| DEF-012 | Med | `Item.isAsset` duplicated `isCapitalItem` | Closed 2026-08-22 — `isAsset` removed from the type and all 28 fixtures; `isCapitalItem` is the single field (D-038) |
| DEF-013 | Med | `Project.contractValueCr: number` — display unit in the model, money as float. Violates R2/D-010 | Open |
| DEF-014 | Med | Login brand panel used `text-foreground` on navy → unreadable | Closed 2026-08-20 by revert (D-013) |
| DEF-015 | High | Uppercase `.PNG` would 404 on Netlify | Closed 2026-08-21 |
| DEF-016 | Low | `BrandLogo` asset paths | Closed 2026-08-21 — component reads `themeConfig.brand`; source arrays are an intentional SVG→PNG→monogram fallback chain (D-011) |
| DEF-017 | Med | `next-env.d.ts` gitignored → TS2882 on fresh clone | Closed 2026-08-21 (D-017) |
| DEF-018 | Low | `placeholder-page.tsx` not in the `components/erp` barrel | Closed 2026-08-22 — imported directly by ~40 routes; no defect |
| DEF-019 | Low | `PageAction.variant` lacks `'success'` although Button supports it | Open |
| DEF-020 | Med | `FilterState` is closed; module filters have no home | Closed 2026-08-21 by D-022 |
| DEF-021 | Low | `listItems` sorts by string coercion; numeric columns sort lexically | Open — acceptable for demo |
| DEF-022 | Med | Optional numeric fields typed `number \| ''` end to end; each container repeats the strip logic in `toItem()`. Extract a shared helper before Step 8 replicates it | Open |
| DEF-023 | Low | Item import wizard shows fixed preview rows; does not read the uploaded file | Open — blocked on xlsx decision |
| DEF-024 | — | Withdrawn 2026-08-22. Claimed `toItem()` erases `Item.lastPurchaseDate` on edit; it does not — the key is absent from the patch object, so the original survives the spread. The field is written by goods-receipt posting, which is out of Phase 1 scope | Not a defect |
| DEF-025 | Low | `UomConversion` type has no screen and no fixtures — dead type | Open — build in Step 8 or drop from the contract |
| DEF-026 | Med | `MasterAudit.updatedBy`/`updatedOn` never written on edit. Client will ask "who changed this" during walkthroughs | Open |


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
- Decisions → `06-DECISION-LOG.md` (D-001 … D-037)
- Defects → this file, §Defect register (DEF-001 … DEF-026)
- Open questions → `07-OPEN-QUESTIONS.md` (Q-01 … Q-37; Q-01, Q-02, Q-03, Q-33, Q-34 closed)
- Session history → `09-SESSION-LOG.md`
