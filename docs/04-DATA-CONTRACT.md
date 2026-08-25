# DATA CONTRACT
Version 1.1 · 2026-08-25 · Source of truth: `lib/data/types.ts`


## 1. Rules
| # | Rule |
|---|------|
| R1 | IDs are opaque. Never parse, sort or display them. Display `code`. |
| R2 | Money is rupees, `number` in the demo, `Decimal(18,2)` in production. No crore/lakh in a field name or value — that is formatting only. |
| R3 | Dates are ISO strings (`YYYY-MM-DD`), timestamps ISO 8601. Never `Date` in a DTO. |
| R4 | Every document type carries: companyId, projectId, siteId, status, revisionNo, createdBy/On, updatedBy/On. |
| R5 | New fields on existing types are OPTIONAL. Fixtures must keep compiling. |
| R6 | Fixture field names = future Prisma field names. Renaming later costs a migration. |
| R7 | A cleared optional foreign key is written as `''`, never `undefined`. Prisma will map `''` to `null` at handover. | 


## 2. Master types
| Type | Key fields | Notes |
|---|---|---|
| `Uom` | code, name, decimals, category, isBaseUnit, isActive | 3 decimals for quantities |
| `UomConversion` | fromUomCode, toUomCode, factor, itemCode? | itemCode set = item-specific override |
| `HsnSac` | code, kind, gstRate, cgst/sgst/igst, effectiveFrom, isNonGst | cgst=sgst=gst/2, igst=gst |
| `Item` | 8 mandatory legacy fields + 6 optional groups | See §3 |
| `ItemGroupDef` | code, name, subGroups[] | Groups rendered from data, not hard-coded |
| `Company` | code, name, legalName, type, gstin, pan, cin, isActive? | CIN required for PARENT/SPV, optional for JV (D-050) |
| `Department` | code, name, headEmployeeId?, isActive? | Group-wide, no `companyId` — see Q-44 |
| `Employee` | code, name, designation, departmentId, companyId, projectId, isActive | `projectId: null` = not posted to a project |
| `Project` | code, name, shortName, type, client, contractValue, status | `status`, not `isActive` (D-058). Value in rupees (D-059) |
| `Site` | code, name, type, companyId, projectId, location, storeKeeperId?, isStore, isActive? | `projectId: null` only for MAIN_STORE (D-065) |

## 3. Item field groups
Identification · Type & behaviour · Units · Stock control · Costing reference · Classification.
The Item Master form has one FormSection per group, in that order.

## 4. Cross-module rules
- Item with `isReturnable` = shuttering/staging. Issued to a subcontractor, expected back. Not an Equipment record.
- Item with `isProduced` = plant output (RMC, WMM, hot mix). Enters stock via PRODUCTION, not GRN.
- Fuel (HSD) is an Item with `itemType: 'FUEL'` and `isNonGst: true` on its HSN. Issued to Equipment, not to WBS.
- `DocumentSummary.projectId` is nullable — head-office documents have no project.
- `Item.gstRate` is stored but derived: the Item Master fills it from the selected HSN code and disables the input (D-034). The HSN master owns the rate.
- `Item.isCapitalItem` is the single flag for capital items. The former `isAsset` was removed in D-038 — do not reintroduce it.


## 5. Known gaps (deliberate)
| Gap | Decision |
|---|---|
| No `revisionNo` on `DocumentSummary` yet | Add when the first revisable document screen is built |
| Valuation policy (weighted average, negative stock) | Q-14 unanswered by client |
| `UomConversion` typed but never built or seeded | DEF-025 — build in Step 8 or drop from the contract |
| | `Equipment` does not extend `MasterAudit` | Last type outstanding from D-044; fix when the Equipment screen is built |
| Optional FKs must be cleared to `''`, not `undefined` | D-067 — `JSON.stringify` drops undefined keys, so the patch merge keeps the stale value |

