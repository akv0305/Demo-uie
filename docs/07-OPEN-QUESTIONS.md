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
- Q-38 (Client) MSME vendors: payments to registered micro and small enterprises
  carry a statutory time limit, and non-compliance has tax consequences for the
  buyer. Should the system flag MSME vendors at payment run and warn on overdue
  MSME payables, or is `msmeNo` captured for reference only? Confirm the current
  limit with the client's CA before building any logic.
- Q-39 (Client) Vendor codes are currently `UIE/V/0001`. Is that the real house
  format, and should new codes auto-number or stay manual?

**Open — master data model (Step 8)**
| Q-40 | Is a labour contractor a flag on the subcontractor record, or a separate party master? | Demo treats it as a flag (D-046). If labour contractors carry PF/ESI codes, wage rates or gang composition that subcontractors do not, they need their own master. | Client — HR/Accounts | Open |
| Q-41 | Should the labour licence expiry date be tracked, not just the licence number? | The fixture holds a licence number only. Licences under the Contract Labour Act expire, and the Document Expiry Tracker screen already exists to flag such dates. | Client — Compliance | Open |
| Q-42 | Can a company ever be deactivated, given projects, sites and employees point at it? | The toggle exists for consistency with other masters and warns about dependents, but it may need to be removed or restricted to entities with no linked records. | Client — Accounts | Open |
| Q-43 | Do SPVs and JVs need separate GST registrations per state of operation? | The contract holds one GSTIN per company. A company working across state lines needs one registration per state, which would make GSTIN a child collection rather than a field. | Client — Accounts | Open |
| Q-44 | Are departments shared across all companies, or defined per company? | `Department` has no `companyId`, so the demo treats the eight departments as group-wide. An SPV or JV with its own Accounts function would need departments scoped per company. | Client — HR/Accounts | Open |
| Q-45 | Must a department head be an employee already posted to that department? | The fixtures follow that convention but it cannot be enforced without blocking the creation of a new department. Currently advisory. | Client — HR | Open |
| Q-46 | Should approval routing point at the department head post, or at a named employee? | Routing by post survives a change of personnel; routing by name does not. Affects how the approval matrix screen is modelled. | Client — Management | Open |
| Q-47 | Should an employee's project posting be a single field or a history? | The contract holds one `projectId`. Site transfers are routine, and payroll or cost allocation across a transfer month needs the dates, which a single field cannot express. | Client — HR/Accounts | Open |
| Q-48 | Are PF and ESI mandatory above a wage threshold? | Both optional in the demo. ESI applies below a wage ceiling and PF above a headcount threshold, so the rule is conditional on data the contract does not carry. | Client — HR | Open |
| Q-49 | Should deactivating an employee be blocked while they are a department head or project manager? | `DEP-PRJ` names `EMP-1001` as head and `PRJ-SH19` names him as manager. Deactivating him today leaves both pointing at an inactive record. | Client — HR | Open |
| Q-50 | Are variations and escalation separate documents, or do they revise the contract value in place? | The demo treats `contractValue` as the awarded figure and does not edit it. A revised-value field or a variation register may be needed for the order book MIS. | Client — Commercial | Open |
| Q-51 | Which project types are measured in chainage besides roads? | `LINEAR_TYPES` currently holds ROAD only. Pipelines, canals and transmission lines are also chainage-measured but are not in `ProjectType`. | Client — Planning | Open |
| Q-52 | Should a project have more than one manager, or a manager history? | One `projectManagerId` today. A two-year contract usually sees a handover, and approval routing by project manager would follow the current holder. | Client — Projects | Open |
| Q-53 | Can a project belong to more than one company (JV sharing)? | `companyId` is single. A JV project is billed by the JV entity, which the fixtures model as its own company, so this may already be sufficient. | Client — Accounts | Open |
| Q-54 | Should a plant or yard hold stock, and can it do so without a named store keeper? | `SITE-SH19-HMP` (hot mix plant) is flagged as holding stock with no keeper. A plant consumes aggregate and produces mix, so it holds material even if nobody is formally posted there. If plants need a keeper, the field becomes conditionally required. | Client — Stores/Plant | Open |
| Q-55 | Must a store keeper belong to the Stores department? | The employee lookup currently offers every active employee. `DEP-STR` exists, so the restriction is expressible, but a small site store is often run by the site engineer. | Client — Stores/HR | Open |
| Q-56 | Should deactivating a site be blocked while it holds non-zero stock? | Stock balances are held per site. Deactivating a location with material still on the books hides that stock from every screen without writing it off. The warning currently says balances stay on record. | Client — Stores/Accounts | Open |


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

