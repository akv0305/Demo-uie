# PROGRESS TRACKER
Last updated: 2026-08-25 · Update this at the end of every session.

## Current position
**Step 8 in progress. Ten masters built: UOM, HSN/SAC, Item, Vendor,
Subcontractor (+ Labour Contractor view), Company, Department, Employee,
Project, Site & Store.** Item Master is the frozen golden path (D-024, D-035);
`useMasterCollection` (D-042) is the shared container. Next action is Equipment,
then WBS, which closes Step 8.


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
| 8 | Vendor Master | ✅ DONE | 10 fixtures. GSTIN/PAN/IFSC validation with PAN-in-GSTIN and state-code cross-checks (D-045). Container is 45 lines on the shared hook |
| 8b | Subcontractor Master (+ Labour Contractor view) | ✅ DONE | 9 fixtures, 3 flagged labour. One type, two routes (D-046). Tax validators extracted (D-047) |
| 8c | Company Master | ✅ DONE | 3 fixtures. CIN required for PARENT/SPV, optional for JV (D-050). Closes DEF-028 |
| 8d | Department Master | ✅ DONE | 8 fixtures. First foreign key in a table; column factories (D-052). Head rule advisory (D-053) |
| 8e | Employee Master | ✅ DONE | Company→project interlock (D-055), cross-company reporting advisory (D-056), reporting cycles blocked (D-057). Closes DEF-029 |
| 8f | Project Master | ✅ DONE | `status` not `isActive` (D-058). Closes DEF-013 — `contractValue` in rupees (D-059). Chainage for linear types only (D-061) |
| 8g | Site & Store Master | ✅ DONE | 7 fixtures. Main store is company-level (D-065), store types forced to hold stock (D-066), hyphens allowed in codes (D-069) |
| 8h | Equipment Master | ⬜ NOT STARTED | Needs the `MasterAudit` change still outstanding from D-044 |
| 8i | WBS Master | ⬜ NOT STARTED | Hierarchical — first master that is not a flat list |
| 9–20 | See 01-DELIVERY-PLAN §6 | ⬜ NOT STARTED | |


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
| DEF-013 | High | `Project.contractValueCr` stores crore, embedding a display unit in the model against R2/D-010 | Closed 2026-08-25 — renamed to `contractValue` in rupees, fixtures migrated, form converts at the edge (D-059, D-060). |
| DEF-014 | Med | Login brand panel used `text-foreground` on navy → unreadable | Closed 2026-08-20 by revert (D-013) |
| DEF-015 | High | Uppercase `.PNG` would 404 on Netlify | Closed 2026-08-21 |
| DEF-016 | Low | `BrandLogo` asset paths | Closed 2026-08-21 — component reads `themeConfig.brand`; source arrays are an intentional SVG→PNG→monogram fallback chain (D-011) |
| DEF-017 | Med | `next-env.d.ts` gitignored → TS2882 on fresh clone | Closed 2026-08-21 (D-017) |
| DEF-018 | Low | `placeholder-page.tsx` not in the `components/erp` barrel | Closed 2026-08-22 — imported directly by ~40 routes; no defect |
| DEF-019 | Low | `PageAction.variant` lacks `'success'` although Button supports it | Open |
| DEF-020 | Med | `FilterState` is closed; module filters have no home | Closed 2026-08-21 by D-022 |
| DEF-021 | Low | `listItems` sorts by string coercion; numeric columns sort lexically | Open — acceptable for demo |
| DEF-022 | Med | Optional numeric fields typed `number \| ''` with per-screen conversion | Closed 2026-08-22 — extracted to `lib/forms.ts` (D-041). Note: only Items had the pattern; UOM and HSN use required numbers |
| DEF-023 | Low | Item import wizard shows fixed preview rows; does not read the uploaded file | Open — blocked on xlsx decision |
| DEF-024 | — | Withdrawn 2026-08-22. Claimed `toItem()` erases `Item.lastPurchaseDate` on edit; it does not — the key is absent from the patch object, so the original survives the spread. The field is written by goods-receipt posting, which is out of Phase 1 scope | Not a defect |
| DEF-025 | Low | `UomConversion` type has no screen and no fixtures — dead type | Open — build in Step 8 or drop from the contract |
| DEF-026 | Med | `MasterAudit.updatedBy`/`updatedOn` never written on edit | Closed 2026-08-22 — stamped by `useMasterCollection` (D-043) |
| DEF-027 | High | Patch upsert replaced the whole patch object instead of merging, so toggling a fixture row's status discarded any earlier field edit. Present in all three master containers | Closed 2026-08-22 — hook merges `{ ...hit.patch, ...values }` (D-042) |
| DEF-028 | Low | Display filler (`'—'`) stored in fixture data — `Company.cin` on the JV row | Closed 2026-08-24 — fixture set to `''`, dash moved to the column renderer (D-050). Worth a sweep for the same pattern elsewhere. |
| DEF-029 | Med | Department fixtures reference employee ids not verified to exist | Closed 2026-08-25 — false alarm. All eight heads (`EMP-1001/1005/1020/1010/1030/1040/1050/1060`) exist in the employee fixtures, and each sits in the department they head, so the Q-45 convention holds throughout. |
| DEF-030 | High | `useMasterCollection.toggleActive` guarded with `'isActive' in row`, a runtime key-presence test. Fixture rows for departments, companies and sites omit the optional flag, so deactivating any of them threw instead of working | Closed 2026-08-25 — replaced by the explicit `supportsActiveToggle` option (D-068). Projects pass `false` |
| DEF-031 | Med | Optional foreign keys cleared to `undefined` are dropped by `JSON.stringify`, so the patch never overwrites the stored value and the cleared lookup reverts on reload. Confirmed pattern risk on `Department.headEmployeeId` | Open 2026-08-25 — Sites store `''` per D-067. Check the Department container's `toDomain` and change it to `''` if it maps blank to `undefined` |
| DEF-032 | Low | `06-DECISION-LOG.md` rows D-046..D-057 were written with four cells in a five-column table, so the Status column rendered empty | Closed 2026-08-25 — trailing `ACTIVE` added to all twelve |
| DEF-033 | Low | `07-OPEN-QUESTIONS.md` held Q-40..Q-53 as table rows inside a bulleted section with no header row, rendering as literal pipe text | Closed 2026-08-25 — moved under a new "master data model" section with a header |
| DEF-034 | Med | `D-060` recorded three money helpers (`asCrore`, `asShortMoney`, `asRupees`) that were never written to `lib/format.ts`; a decision described intent rather than code | Closed 2026-08-25 — D-063 supersedes and records the real exports. Same root cause as DEF-024 and D-039 |


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
- Decisions → `06-DECISION-LOG.md` (D-001 … D-069; D-012 and D-060 superseded)
- Defects → this file, §Defect register (DEF-001 … DEF-034)
- Open questions → `07-OPEN-QUESTIONS.md` (Q-01 … Q-56; Q-01, Q-02, Q-03, Q-33, Q-34 closed)
- Session history → `09-SESSION-LOG.md`

