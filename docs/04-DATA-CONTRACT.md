# DATA CONTRACT
Version 1.0 · 2026-08-21 · Source of truth: `lib/data/types.ts`

## 1. Rules
| # | Rule |
|---|------|
| R1 | IDs are opaque. Never parse, sort or display them. Display `code`. |
| R2 | Money is rupees, `number` in the demo, `Decimal(18,2)` in production. No crore/lakh in a field name or value — that is formatting only. |
| R3 | Dates are ISO strings (`YYYY-MM-DD`), timestamps ISO 8601. Never `Date` in a DTO. |
| R4 | Every document type carries: companyId, projectId, siteId, status, revisionNo, createdBy/On, updatedBy/On. |
| R5 | New fields on existing types are OPTIONAL. Fixtures must keep compiling. |
| R6 | Fixture field names = future Prisma field names. Renaming later costs a migration. |

## 2. Master types
| Type | Key fields | Notes |
|---|---|---|
| `Uom` | code, name, decimals, category, isBaseUnit, isActive | 3 decimals for quantities |
| `UomConversion` | fromUomCode, toUomCode, factor, itemCode? | itemCode set = item-specific override |
| `HsnSac` | code, kind, gstRate, cgst/sgst/igst, effectiveFrom, isNonGst | cgst=sgst=gst/2, igst=gst |
| `Item` | 8 mandatory legacy fields + 6 optional groups | See §3 |
| `ItemGroupDef` | code, name, subGroups[] | Groups rendered from data, not hard-coded |

## 3. Item field groups
Identification · Type & behaviour · Units · Stock control · Costing reference · Classification.
The Item Master form has one FormSection per group, in that order.

## 4. Cross-module rules
- Item with `isReturnable` = shuttering/staging. Issued to a subcontractor, expected back. Not an Equipment record.
- Item with `isProduced` = plant output (RMC, WMM, hot mix). Enters stock via PRODUCTION, not GRN.
- Fuel (HSD) is an Item with `itemType: 'FUEL'` and `isNonGst: true` on its HSN. Issued to Equipment, not to WBS.
- `DocumentSummary.projectId` is nullable — head-office documents have no project.

## 5. Known gaps (deliberate)
| Gap | Decision |
|---|---|
| `Project.contractValueCr` leaks crore into the model (violates R2) | DEF-013 open — rename to `contractValue` in rupees when fixtures are next edited |
| No `revisionNo` on `DocumentSummary` yet | Add when the first revisable document screen is built |
| Valuation policy (weighted average, negative stock) | Q-06 unanswered by client |
