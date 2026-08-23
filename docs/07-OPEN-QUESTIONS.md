# OPEN QUESTIONS
Q-xxx numbered, never deleted. Mark answers inline and move the item to
§Closed. Owner = project owner decides · Client = needs client input.

**Blocking now**
_None._

**Open — asset and tax questions**
- Q-35 Original vector logo files (SVG or AI/EPS, transparent background) from
  the client's designer. The supplied PNG has a baked-in white box, so the mark
  cannot sit on navy and will pixelate at large sizes. *Ask at next touchpoint.*
- Q-36 Confirm current GST rates per HSN/SAC with the client's CA before UAT,
  and whether cement is procured under any concessional rate or reverse charge.
- Q-37 Does UIE need HSN rate history (rate changing from a date), or only the
  current rate? `effectiveFrom` exists but no versioning is built.


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


## Closed
- Q-01 (Owner) Dev environment: Codespaces, local, or other? -- Dev
- Q-02 (Owner) Logo artwork — SVG/PNG, full lockup + square mark? -- Ok
- Q-03 (Owner-decide) Confirm client name on a public unauthenticated
  demo URL with fabricated data + noindex. Stated, accepted. -- Client name is displayed
- Q-33 Approve Zod as a dependency? - Zod is Approved
- Q-34 Approve react-hook-form? - Approved

