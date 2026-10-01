# DATA CONTRACT
Version 1.3 · 2026-09-30 · Source of truth: `lib/data/types.ts`


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
| `Equipment` | code, name, type, ownership, projectId, siteId, status, currentHmr, isActive | `status` is operational, separate from `isActive` (D-071). `type` free text (D-072) |
| `WbsNode` | projectId, code, name, parentId, level, uomCode?, budgetedQty?, budgetedCost?, isActive? | Tree via `parentId`; `level` derived (D-078). Execution fields display-only (D-080) |
| `Attachment` | entityKey, entityId, fileName, category, sizeKb, uploadedByName, uploadedOn, expiryDate?, validFrom?, companyId?, projectId?, remarks? | `entityKey`+`entityId` point at any master or document. No file bytes are stored in the demo (D-088). Optional FKs follow R7 |

## 2b. Procurement document types

All five extend `DocumentAudit` (R4) and carry `id`, `documentNo`, `date`.
Money is rupees (R2), dates ISO (R3), new fields optional (R5).

### Purchase Requisition (Indent)
| Type | Key fields | Notes |
|---|---|---|
| `PurchaseRequisition` | priority, indentedBy, requiredBy, deliverySiteId, justification?, lines[], remarks? | `PrPriority` = NORMAL / URGENT / EMERGENCY |
| `PurchaseRequisitionLine` | itemId, description, uomCode, quantity, estimatedRate?, wbsId?, orderedQty?, requiredDate?, remarks? | `description` is a **snapshot** of the item name — a later master rename must not rewrite history. `estimatedRate` is indicative only (D-101). `orderedQty` is written by the PO screen; `pendingQty = quantity − orderedQty` (D-114) |

No `itemCode` and no `purpose` on either type. Item code is resolved from the
item master at capture time; the indent's free-text reason is `justification`
on the header.

### Request for Quotation (Enquiry)
| Type | Key fields | Notes |
|---|---|---|
| `Rfq` | title, prIds[], lines[], vendors[], dueDate, quoteValidityDays?, deliveryLocationSiteId?, deliverySchedule?, paymentTermsExpected?, freightTerms?, inspectionRequired?, scopeNotes?, preparedBy? | Status mapping: DRAFT = being prepared, SUBMITTED = floated, CLOSED = window shut / compared, CANCELLED = dropped (Q-77) |
| `RfqLine` | prId?, prLineId?, itemId, itemCode?, description, specification?, uomCode, quantity, estimatedRate?, wbsId? | `prId`/`prLineId` absent on a line added directly. `estimatedRate` is internal and never printed (D-102) |
| `RfqVendor` | vendorId, vendorName, sentOn?, sentMode, response, respondedOn?, quotationId?, remarks? | `quotationId` set when the offer is captured. `sentMode` exists because purchase files are audited on equal notice |

Enums: `RfqSentMode` = EMAIL / WHATSAPP / COURIER / HAND_DELIVERY / PORTAL ·
`RfqResponse` = AWAITED / RECEIVED / REGRETTED / NO_RESPONSE ·
`FreightTerms` = FOR_SITE / EX_WORKS / EXTRA_AT_ACTUALS / INCLUSIVE.

### Vendor Quotation (Offer)
| Type | Key fields | Notes |
|---|---|---|
| `Quotation` | rfqId, vendorId, vendorName, vendorRefNo?, vendorRefDate?, validUntil?, lines[], charges, paymentTerms?, deliveryPeriodDays?, warrantyTerms?, isTechnicallyQualified?, deviations?, receivedOn? | `isTechnicallyQualified` is **tri-state**: true qualified, false rejected, undefined not yet scrutinised. Only false unranks (D-106) |
| `QuotationLine` | rfqLineId?, itemId, itemCode?, description, uomCode, quantity, basicRate, discountPct?, gstRate, makeOffered?, notQuoted?, remarks? | `notQuoted = true` ⇒ line contributes zero and the offer is partial. `gstRate` is **required** here, unlike `DocumentLine` |
| `QuotationCharges` | freightBasis, freightAmount?, loadingBasis, loadingAmount?, packingBasis, packingAmount?, chargesGstRate? | Basis is `QuotationCharge` = INCLUDED / EXTRA / NOT_APPLICABLE. Only EXTRA adds to landed value (D-104). The three bases are **required**, the amounts optional |

### Purchase Order
| Type | Key fields | Notes |
|---|---|---|
| `PurchaseOrder` | vendorId, vendorName, basis, quotationId?, rfqId?, prIds[], lines[], charges, deliveryTerms, deliverySiteId, deliveryAddress?, deliveryByDate?, paymentTerms?, warrantyTerms?, advanceAmount?, retentionPct?, ldClause?, awardJustification?, inspectionRequired?, amendmentNo?, amendmentReason?, approvedBy?, approvedOn? | `awardJustification` mandatory when `basis !== 'COMPARATIVE'` (D-110). `quotationId` absent for rate-contract and emergency orders. Retention on supply orders is unconfirmed (Q-83) |
| `PoLine` | quotationLineId?, rfqLineId?, prId?, itemId, itemCode?, description, specification?, makeApproved?, uomCode, quantity, rate, discountPct?, gstRate, wbsId?, **receivedQty?**, scheduledDate?, remarks? | `receivedQty` is the **sole** link between an order and its receipts (D-111). GRN writes here; it must not keep its own progress figure |
| `PoCharges` | freightAmount?, loadingAmount?, packingAmount?, chargesGstRate? | No basis field — by PO stage the charge is settled, so an included charge is simply absent |

Enums: `PoBasis` = COMPARATIVE / RATE_CONTRACT / SINGLE_SOURCE / EMERGENCY /
REPEAT_ORDER · `PoDeliveryTerms` = FOR_SITE / EX_WORKS / FOR_DESTINATION.

### Arithmetic ownership
Every figure above is computed in `lib/procurement/*.ts` as pure functions
(D-112) — `requisition`, `rfq`, `quotation`, `comparison`, `purchase-order`.
Screens and columns must import them, never recompute. Quotation and PO
deliberately mirror each other (`netRate → lineBasic → lineTax → lineTotal`)
so an accepted offer carries the same value into the order.


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

| `PurchaseRequisitionLine.orderedQty` comment reads "Rupees ordered against this line" | DEF-051 — the field is a **quantity**, not money. Comment only; no code depends on it |
| `DocumentLine.gstRate` is optional but `QuotationLine.gstRate` / `PoLine.gstRate` are required | Intentional divergence, recorded so nobody "harmonises" it |
| GRN has no type yet; `PoLine.receivedQty` is fixture-seeded | Closes when Step 12a lands (D-111) |


## 5. Known gaps (deliberate)
| Gap | Decision |
|---|---|
| No `revisionNo` on `DocumentSummary` yet | Add when the first revisable document screen is built |
| Valuation policy (weighted average, negative stock) | Q-14 unanswered by client |
| `UomConversion` typed but never built or seeded | DEF-025 — build in Step 8 or drop from the contract |
| | `Equipment` does not extend `MasterAudit` | Last type outstanding from D-044; fix when the Equipment screen is built |
| Optional FKs must be cleared to `''`, not `undefined` | D-067 — `JSON.stringify` drops undefined keys, so the patch merge keeps the stale value |

