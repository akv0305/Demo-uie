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
| 0 | Dev environment | 🔴 BLOCKED | Codespaces or local. Verify quota. |
| 1 | Rebrand theme.config.ts | ⬜ NOT STARTED | Lost in interrupted Genspark run; regenerate |
| 1 | Logo SVG/PNG assets in /public/brand/ | ⬜ NOT STARTED | Owner to supply artwork |
| 2 | Lint rules (colour literals, adapter imports) | ⬜ NOT STARTED | |
| 3 | docs/03-DESIGN-SYSTEM.md | ⬜ NOT STARTED | |
| 3 | docs/04-DATA-CONTRACT.md | ⬜ NOT STARTED | |
| 4 | types.ts extension (UOM/HSN/Item) | ⬜ NOT STARTED | |
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

**Blocking now**
- Q-01 (Owner) Dev environment: Codespaces, local, or other?
- Q-02 (Owner) Logo artwork — SVG/PNG, full lockup + square mark?
- Q-03 (Owner-decide) Confirm client name on a public unauthenticated
  demo URL with fabricated data + noindex. Stated, accepted.

**Needed before dashboards (Step 18)**
- Q-04 Charting dependency — Recharts vs alternative. Needs approval.
- Q-05 Dashboard KPI list per dashboard (cap at 8).

**Client — commercial / phase framing**
- Q-06 Demo phase duration and whether it is billable separately.
- Q-07 Existing artefacts: current Excel registers, printed PO/WO/DPR
  formats, MB, muster roll, fuel register, director MIS. **None received
  yet — highest-value input available.**
- Q-08 Change-management ownership: client or vendor?

**Client — scope decisions carried from analysis (must resolve before build)**
- Q-09 Number of companies/SPVs/JVs live in Phase 1; real inter-company
  transactions (material transfer, equipment sharing, cost cross-charge)?
- Q-10 Own production plants (crusher, batching, hot mix, WMM):
  conversion/production entry in or out?
- Q-11 Returnable materials (shuttering, staging): inventory items with a
  returnable flag, or equipment records?
- Q-12 Lightweight client billing register to make Order Book MIS
  meaningful — in or out?
- Q-13 Which cost buckets constitute "actual cost" for budget-vs-actual?
- Q-14 Inventory valuation: weighted-average moving rate acceptable?
  Negative stock blocked? Backdated GRN effect on historical rates?
- Q-15 Payroll boundary: does Phase 1 *compute* PF/ESI/PT/TDS deductions?
- Q-16 Service/works POs and hired-equipment hire bills (certified from
  log book hours) — in Phase 1?
- Q-17 Fuel as an inventory item through GRN/store, or standalone module?
- Q-18 Fiscal year + month-lock/period control in Phase 1?
  (Recommendation: yes — required for safe Tally handover.)
- Q-19 Client-mandated document numbering formats, or we design them?
- Q-20 Approval matrix: amount slabs required? Delegation/substitute
  approvers? Self-approval prevention? Fallback when no matrix row matches?
- Q-21 Notifications: in-app only, or + transactional email? If email,
  provider and domain/DNS ownership?
- Q-22 Item UOM reality: confirm purchase/stock/issue UOM pairs and
  conversion factors (cement BAG↔MT, aggregate CUM↔MT density, steel
  MT↔RMT, bitumen MT↔LTR).
- Q-23 Material issued to subcontractor → recovery on bill: free-issue vs
  chargeable, rate basis, wastage allowance.
- Q-24 Partial GRN, over/short receipt tolerance, rejection and
  return-to-vendor, debit note capture, PO short-close, freight/other
  charges on PO — all in Phase 1?
- Q-25 RFQ sealed-bid behaviour: can internal users see rates before due
  date? Can a vendor revise a quote? Is there a hard cut-off?
- Q-26 Vendor onboarding: invite/approval flow, multiple users per vendor?
- Q-27 HSD diesel tax treatment — petroleum is outside GST (state VAT +
  excise), so `gstRate: 0` in fixtures is misleading. How does accounts
  book diesel? Affects Tally export.
- Q-28 Holiday master, shift/OT rules, labour wage categories — needed?
- Q-29 Field-level access restriction for payroll (current RBAC model of
  role + company + project + module cannot express this).
- Q-30 Production infra sizing, backup retention, VPS/domain/R2 ownership.
- Q-31 Auth approach for production: Auth.js credentials + Argon2id
  (recommended) vs hand-rolled session layer.
- Q-32 Owner's weekly review hours — the real throughput constraint.

## Session log
| Date | Session | Outcome |
|------|---------|---------|
| 2026-08-17 | Analysis + P0 audit + plan | Scope analysed; website audited (much placeholder content); Genspark P0 audited from source; co-pilot mode adopted; delivery plan + tracker created |
