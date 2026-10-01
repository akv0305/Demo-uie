# PROGRESS TRACKER
Last updated: 2026-09-30 · Update this at the end of every session.

## Current position
**Step 11 complete — Procurement, the full chain.** Purchase Requisition →
RFQ → Vendor Quotation → Comparative Statement → Purchase Order, each with
its route, schema, columns and screen, and each backed by a pure helper
module in `lib/procurement/` (D-101). This is the first module where one
document seeds the next end to end, and the first with a derived matrix
screen (the CST).

Contract Summary (Step 10f), recorded in the previous session as issued but
not pushed, **is in the repo** — `lib/project/contract-summary.ts`,
`contract-summary-screen.tsx`, and a real route `page.tsx` (2,656 B, not the
214 B placeholder). Confirm `contract-summary-columns.tsx` and the
`t.project.cp*` terminology keys on the next typecheck.

Next action is Step 12, Stores, beginning with Goods Receipt. GRN writes
back to `PoLine.receivedQty` (D-111); it must not keep progress of its own.


The module's arithmetic lives in `lib/project/*` as pure functions — seven
files, no data-layer imports — which is the pattern later modules should copy
(D-090).

**Not in the repo:** the Contract Summary files were issued but not pushed.
Six files outstanding — `lib/project/contract-summary.ts`,
`features/project-controls/contract-summary-columns.tsx`,
`contract-summary-screen.tsx`, the route `layout.tsx`, the `page.tsx`
replacement, and the terminology additions.

Next action is Step 11, Procurement.


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
| 8h | Equipment Master | ✅ DONE | 21 fixtures. Closes D-044 — last MasterAudit gap. Status independent of isActive (D-071), type free text (D-072) |
| 8i | WBS Master | ✅ DONE | 27 fixtures, 4 projects. Per-project selector (D-076), indent column (D-077), level derived (D-078) |
| 9 | Document Management — Library, Upload, Expiry Tracker | ✅ DONE | D-081..D-088. First module outside masters. Upload stores metadata only (DEF-041) |
| 10 | Project Controls — Daily Progress Report | ✅ DONE | 5 fixtures. Weather, progress/labour/equipment lines, safety incidents |
| 10b | Project Controls — Hindrance Register | ✅ DONE | 7 fixtures. Open-ended events count to today (D-091). Responsibility split drives the EOT case |
| 10c | Project Controls — WBS Budget | ✅ DONE | Leaf-only pricing, parents total descendants (D-089). Masks the DEF-035 fixture gap rather than fixing it |
| 10d | Project Controls — Variation Register | ✅ DONE | 10 fixtures. Proposed vs approved kept separate (D-092); `effectiveAmount` is the single read |
| 10e | Project Controls — Claim Register | ✅ DONE | 8 fixtures. Links to hindrances and variations (D-093) — the demo's best traceability story |
| 10f | Project Controls — Contract Summary | ⚠️ NOT PUSHED | Code issued and reviewed; six files not in the repo. Derived, read-only (D-094) |
| 10g | Project Controls — BG & Retention Register | ✅ DONE | 6 BG + 8 retention fixtures. Two types, one tabbed screen (D-095). Retention balance computed, never stored (D-096) |
| 10h | Project Controls — Dashboard | ✅ DONE | CSS/SVG visuals, no chart dependency (D-098). Derived read-only with drill-downs (D-099) |
| 11a | Purchase Requisition (Indent) | ✅ DONE | `lib/procurement/requisition.ts`; pending-qty model (D-102) |
| 11b | RFQ / Enquiry | ✅ DONE | `rfq.ts`; `MIN_QUOTES_EXPECTED = 3`, flag not block (D-103) |
| 11c | Vendor Quotation | ✅ DONE | `quotation.ts`; landed value is the comparison basis (D-104, D-105, D-106) |
| 11d | Comparative Statement (CST) | ✅ DONE | `comparison.ts`; rejects stay unranked (D-107), split-award saving (D-108) |
| 11e | Purchase Order | ✅ DONE | `purchase-order.ts`; value-weighted progress (D-109), justification gate (D-110) |
| 11f | Purchase Invoice Capture | ⬜ PLACEHOLDER | Last stub in the Procurement menu; `page.tsx` is 214 B `PlaceholderPage`. Needs PO + GRN for a three-way match |
| 12 | Stores: GRN, Issue, Return, Transfer, Adjustment, Ledger, Opening Stock, Summary | ⬜ NOT STARTED | All eight route folders exist; contents unverified |
| 13–20 | See 01-DELIVERY-PLAN §6 | ⬜ NOT STARTED | |


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
| DEF-035 | Med | `WBS-SH19-01` (Road Works) does not equal the sum of its six children: budget 1,684,000,000 against 1,333,105,000 (short ₹35.09 Cr), actual 712,400,000 against 561,458,200. The other four parent nodes balance exactly on both figures | Open 2026-08-25 — correct the parent to the child sums, or confirm per Q-61 that parents hold unitemised scope |
| DEF-036 | Every attachment expiry fixture had lapsed relative to the demo date, so all four rendered red | Fixtures rebased to Oct 2026 – Aug 2027 | CLOSED |
| DEF-037 | `listExpiringAttachments` had no lower bound — expired documents were returned as "expiring soon" | Rewritten under D-083 | CLOSED |
| DEF-038 | Bare calls to paged DAL functions silently truncate at 25 rows | Document containers fixed under D-086. **Audit the eleven master containers for the same mistake — Employees is the likely victim** | OPEN |
| DEF-039 | The three document containers log fetch failures to the console instead of rendering the frozen `ErrorState` | A rejected `Promise.all` leaves the screen blank with no message. Wire `ErrorState` before client walkthroughs | OPEN |
| DEF-040 | `AttachmentsPanel` Download button is inert, as is the Download row action in the Document Library | Frozen P0 component. Decide whether to hide or stub before a walkthrough | OPEN |
| DEF-041 | The Upload screen implies the file was stored when only its details were kept | Accepted knowingly (D-088). Terminology and banner text drafted in session but not applied | OPEN — deferred by owner |
| DEF-042 | High | Register containers hard-coded `companyId: 'CMP-UIE'`, so a hindrance raised on a `CMP-UIRPL` project was booked to the wrong legal entity | Closed 2026-09-30 — every Project Controls container now derives company from the selected project. Audit the eleven master containers and the three document containers for the same literal |
| DEF-043 | Med | `allAttachments()` was dead code — consumers read the fixture array directly, so an uploaded document never appeared in the library | Open — logged only, deferred by owner. Fix drafted: point `listDocumentFiles`, `listAttachmentCategories` and `listExpiringAttachments` at the helper |
| DEF-044 | High | `store.update` only touches rows the store created, so editing a seeded fixture row silently reverted on reload | Open — logged only, deferred by owner. Pattern fixed forward in the Project Controls DAL (D-091): `save<Entity>` copies a fixture row into the store on first edit. The masters and documents layers still have the original bug |
| DEF-045 | High | `toRecord` rewrote audit fields on edit, so editing an approved record reset it to draft and cleared `createdBy` | Open — logged only, deferred by owner. Project Controls containers avoid it by patching named fields only |
| DEF-046 | Med | `createdBy` in the new fixtures referenced employees that do not exist (`EMP-0004`, `EMP-0009`, `EMP-0012`, `EMP-0015`; real ids are `EMP-1001`–`EMP-1060`) | Open — logged only, deferred by owner. Confirmed still present in `progress.ts` (all five DPRs carry `EMP-0004`) |
| DEF-047 | Med | `HIN-0004` and `HIN-0005` carry `companyId: 'CMP-UIE'` on a `CMP-UIRPL` project | Open — logged only, deferred by owner |
| DEF-048 | Med | Code comments in `lib/project/contract-summary.ts`, `bg-retention.ts` and `dashboard.ts` cite `Q-28`–`Q-32`, which are existing unrelated questions. The intended questions are Q-69–Q-74 | Closed 2026-09-30 — comments corrected (see §5 of the Step 10 doc update). Root cause: question numbers assigned from memory instead of read from `07-OPEN-QUESTIONS.md`, the same failure mode as DEF-034 and D-039 |
| DEF-049 | Med | Six build errors in Step 11 from APIs and keys written from memory: `Paged<T>` treated as an array (D-086 already covers it); `itemCode`/`purpose` assumed onto `PurchaseRequisitionLine`/`PurchaseRequisition`; `CheckboxField` given `value` instead of `checked`; `Rfq[]` mixed into a `PurchaseRequisition[]` aggregate; Badge variant `destructive` when the set is `danger`; three terminology keys assumed into `t.common`. Fourth instance of the D-039 root cause | Closed 2026-09-30 by D-112 and by this entry. Prevention is unchanged: read the file |
| DEF-050 | Med | **jsDelivr serves stale snapshots of this repo.** `cdn.jsdelivr.net/gh/.../@main/docs/08-PROGRESS-TRACKER.md` returned a 5,468-byte August copy of a file GitHub reports as 15.6 KB, causing a full session of analysis against five-week-old docs | Open 2026-09-30 — read docs from `github.com/akv0305/Demo-uie/raw/refs/heads/main/<path>`; confirm freshness via `api.github.com/repos/.../commits?path=<file>` |
| DEF-051 | Low | `PurchaseRequisitionLine.orderedQty` doc comment says "Rupees ordered against this line so far" — it is a quantity. Misleading to anyone implementing GRN or PO write-back | Open 2026-09-30 — correct the comment to "Quantity ordered against this line so far" |


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
- Decisions → `06-DECISION-LOG.md` (D-001 … D-112; D-012, D-053 and D-060 superseded)
- Defects → this file, §Defect register (DEF-001 … DEF-050)
- Open questions → `07-OPEN-QUESTIONS.md` (Q-01 … Q-81; Q-01, Q-02, Q-03, Q-04, Q-33, Q-34 closed)
