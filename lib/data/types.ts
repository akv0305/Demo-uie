/**
 * Domain types for the ERP. These are the contract between the data access
 * layer and every screen. Adapters (fixtures now, database later) must satisfy
 * these types exactly.
 */

// ===========================================================================
// Workflow
// ===========================================================================
export type DocumentStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'RETURNED'
  | 'REVISED'
  | 'CANCELLED'
  | 'CLOSED';

export type UserRole =
  | 'ADMINISTRATOR'
  | 'PROJECT_MANAGER'
  | 'SITE_ENGINEER'
  | 'STORE_KEEPER'
  | 'PROCUREMENT_OFFICER'
  | 'ACCOUNTS'
  | 'MANAGEMENT'
  | 'VENDOR'
  | 'SUBCONTRACTOR';

export type ApprovalAction = 'APPROVED' | 'REJECTED' | 'RETURNED' | 'PENDING' | 'NOT_STARTED';

export interface ApprovalStep {
  level: number;
  approverName: string;
  approverRole: string;
  action: ApprovalAction;
  actionedOn?: string; // ISO date
  remarks?: string;
}

/** R4: every transaction document carries these. Masters use MasterAudit instead. */
export interface DocumentAudit {
  companyId: string;
  projectId: string;
  siteId: string;
  status: DocumentStatus;
  revisionNo: number;
  createdBy: string;
  createdOn: string;
  updatedBy?: string;
  updatedOn?: string;
}

// ===========================================================================
// Organisation
// ===========================================================================
export type CompanyType = 'PARENT' | 'SPV' | 'JV';

export interface Company extends MasterAudit {
  id: string;
  code: string;
  name: string;
  legalName: string;
  type: CompanyType;
  gstin: string;
  pan: string;
  cin: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  contactPerson: string;
  phone: string;
  email: string;
  isActive?: boolean;
}

export type ProjectType =
  | 'ROAD'
  | 'BRIDGE'
  | 'INDUSTRIAL_PARK'
  | 'WAREHOUSE'
  | 'BUILDING';

export interface Project extends MasterAudit {
  id: string;
  companyId: string;
  code: string;
  name: string;
  shortName: string;
  type: ProjectType;
  client: string;
  location: string;
  /** Rupees. Crore/lakh is a formatting concern only (R2, D-010). */
  contractValue: number;
  startDate: string;
  endDate: string;
  /** Execution data, maintained from DPRs — display-only on the master form. */
  physicalProgressPct: number;
  financialProgressPct: number;
  projectManagerId: string;
  /** Linear works only (road, pipeline). Blank for bridges and buildings. */
  chainageFrom?: string;
  chainageTo?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ON_HOLD';
}

export type SiteType = 'MAIN_STORE' | 'SITE_STORE' | 'SITE_OFFICE' | 'PLANT';

export interface Site extends MasterAudit {
  id: string;
  companyId: string;
  /** Null = company-level, e.g. the central store serving every project. */
  projectId: string | null;
  code: string;
  name: string;
  type: SiteType;
  location: string;
  /** Empty string or absent = not assigned. */
  storeKeeperId?: string;
  isStore: boolean;
  /** Absent on fixture rows; treat missing as active. */
  isActive?: boolean;
}

export interface Department extends MasterAudit {
  id: string;
  code: string;
  name: string;
  headEmployeeId?: string;
  /** Absent on fixture rows; treat missing as active. */
  isActive?: boolean;
}

// ===========================================================================
// People
// ===========================================================================
export interface Employee extends MasterAudit {
  id: string;
  code: string;
  name: string;
  designation: string;
  departmentId: string;
  companyId: string;
  projectId: string | null;
  dateOfJoining: string;
  reportingToId?: string;
  phone: string;
  email: string;
  pfNumber?: string;
  esiNumber?: string;
  isActive: boolean;
}

export interface CurrentUser {
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  designation: string;
  companyId: string;
  projectId: string | null;
  siteId: string | null;
  avatarInitials: string;
  isExternal: boolean;
}

// ===========================================================================
// Vendors / Subcontractors
// ===========================================================================
export type VendorCategory =
  | 'CEMENT'
  | 'STEEL'
  | 'AGGREGATE'
  | 'BITUMEN'
  | 'DIESEL'
  | 'HARDWARE'
  | 'EQUIPMENT_HIRE'
  | 'TRANSPORT'
  | 'ELECTRICAL'
  | 'RMC';

export interface Vendor extends MasterAudit {
  id: string;
  code: string;
  name: string;
  category: VendorCategory;
  gstin: string;
  pan: string;
  address: string;
  city: string;
  state: string;
  contactPerson: string;
  phone: string;
  email: string;
  paymentTerms: string;
  creditDays: number;
  msmeNo?: string;
  bankAccount: string;
  ifsc: string;
  isActive: boolean;
}

export type SubcontractorTrade =
  | 'EARTHWORK'
  | 'SHUTTERING'
  | 'BAR_BENDING'
  | 'CONCRETING'
  | 'BLOCKWORK_PLASTER'
  | 'BITUMINOUS'
  | 'ELECTRICAL'
  | 'PLUMBING';

export interface Subcontractor extends MasterAudit {
  id: string;
  code: string;
  name: string;
  trade: SubcontractorTrade;
  gstin: string;
  pan: string;
  contactPerson: string;
  phone: string;
  city: string;
  state: string;
  isLabourContractor: boolean;
  licenceNo?: string;
  isActive: boolean;
}

// ===========================================================================
// Items / Inventory masters
// ===========================================================================
export type ItemGroup =
  | 'CEMENT'
  | 'STEEL'
  | 'AGGREGATE'
  | 'SAND'
  | 'GRANULAR'
  | 'BITUMEN'
  | 'RMC'
  | 'MASONRY'
  | 'SHUTTERING'
  | 'CONSUMABLE'
  | 'FUEL'
  | 'ADMIXTURE'
  | 'PIPES_FITTINGS'
  | 'ELECTRICAL'
  | 'SAFETY';

/** Item group as master data (list rendered from this, not from the union). */
export interface ItemGroupDef {
  id: string;
  code: ItemGroup;
  name: string;
  subGroups: string[];
  isActive: boolean;
}

/** Audit fields carried by every master record. All optional in the demo. */
export interface MasterAudit {
  createdBy?: string;
  createdOn?: string;
  updatedBy?: string;
  updatedOn?: string;
}

export type UomCategory =
  | 'COUNT'
  | 'WEIGHT'
  | 'VOLUME'
  | 'LENGTH'
  | 'AREA'
  | 'TIME'
  | 'OTHER';

export interface Uom extends MasterAudit {
  id: string;
  code: string;
  name: string;
  decimals: number;
  category?: UomCategory;
  /** Base unit of its category (KG for WEIGHT, etc.). */
  isBaseUnit?: boolean;
  isActive?: boolean;
  remarks?: string;
}

/** 1 fromUom = factor x toUom. Both must share a UomCategory. */
export interface UomConversion {
  id: string;
  fromUomCode: string;
  toUomCode: string;
  factor: number;
  itemCode?: string;
  isActive?: boolean;
}

export interface HsnSac extends MasterAudit {
  id: string;
  code: string;
  description: string;
  gstRate: number;
  kind: 'HSN' | 'SAC';
  /** Derived: cgst = sgst = gstRate / 2; igst = gstRate. Stored for export fidelity. */
  cgstRate?: number;
  sgstRate?: number;
  igstRate?: number;
  cessRate?: number;
  effectiveFrom?: string;
  /** TRUE where the commodity sits outside GST (HSD, petrol) — state VAT applies. */
  isNonGst?: boolean;
  isActive?: boolean;
}

export type ItemType =
  | 'MATERIAL'
  | 'CONSUMABLE'
  | 'SPARE'
  | 'FUEL'
  | 'RETURNABLE'
  | 'PRODUCED'
  | 'SERVICE'
  | 'ASSET';

export type ValuationMethod = 'WEIGHTED_AVERAGE' | 'FIFO' | 'STANDARD';

export interface Item extends MasterAudit {
  id: string;
  code: string;
  name: string;
  group: ItemGroup;
  specification: string;
  stockUomCode: string;
  hsnCode: string;
  gstRate: number;
  reorderLevel: number;
  isActive: boolean;

  // --- Identification ---
  shortName?: string;
  subGroup?: string;
  oldCode?: string;
  brandPreference?: string;
  makeOrGrade?: string;

  // --- Type & behaviour ---
  itemType?: ItemType;
  /** Shuttering, staging, scaffolding: issued and expected back. */
  isReturnable?: boolean;
  /** Output of a plant (RMC, WMM, hot mix) rather than a purchase. */
  isProduced?: boolean;
  isBatchTracked?: boolean;
  isSerialTracked?: boolean;
  requiresQc?: boolean;
  shelfLifeDays?: number;

  // --- Units ---
  purchaseUomCode?: string;
  /** 1 purchase UOM = factor x stock UOM (1 BAG = 50 KG). */
  purchaseToStockFactor?: number;
  issueUomCode?: string;
  issueToStockFactor?: number;

  // --- Stock control ---
  minStockLevel?: number;
  maxStockLevel?: number;
  leadTimeDays?: number;
  allowNegativeStock?: boolean;
  defaultStoreSiteId?: string;
  binLocation?: string;

  // --- Costing reference (display only in Phase 1) ---
  valuationMethod?: ValuationMethod;
  /** Rupees. Never crore/lakh — display units are a formatting concern (R2). */
  standardRate?: number;
  lastPurchaseRate?: number;
  lastPurchaseDate?: string;
  budgetRateRef?: number;

  // --- Classification ---
  isCapitalItem?: boolean;
  isHazardous?: boolean;
  tags?: string[];
  remarks?: string;
}

export interface StockBalance {
  itemId: string;
  itemCode: string;
  itemName: string;
  siteId: string;
  siteName: string;
  uomCode: string;
  quantity: number;
  rate: number;
  value: number;
  reorderLevel: number;
  lastReceiptDate?: string;
}

// ===========================================================================
// Plant & Fleet
// ===========================================================================
export type EquipmentOwnership = 'OWNED' | 'HIRED';

export type EquipmentStatus = 'WORKING' | 'IDLE' | 'BREAKDOWN' | 'UNDER_MAINTENANCE';

export interface Equipment extends MasterAudit {
  id: string;
  code: string;
  name: string;
  /** Free text, not a union — see Q-57. Existing values: 'Excavator', 'Tipper', … */
  type: string;
  registrationNo?: string;
  ownership: EquipmentOwnership;
  hireVendorId?: string;
  /** Rupees per hireRateUnit (R2). */
  hireRate?: number;
  hireRateUnit?: string;
  projectId: string | null;
  siteId: string | null;
  operatorEmployeeId?: string;
  status: EquipmentStatus;
  /** Hour-meter for plant, odometer km for vehicles — see Q-58. */
  currentHmr: number;
  nextServiceDueHmr?: number;
  nextServiceDueDate?: string;
  isActive: boolean;
}

// ===========================================================================
// WBS / Cost codes
// ===========================================================================
export interface WbsNode extends MasterAudit {
  id: string;
  projectId: string;
  code: string;
  name: string;
  parentId: string | null;
  /** Derived from parentId depth. Stored for query convenience — see Q-61. */
  level: number;
  uomCode?: string;
  budgetedQty?: number;
  budgetedCost?: number;
  /** Execution data from measurement books — display-only on the master form (D-062). */
  executedQty?: number;
  actualCost?: number;
  /** Absent on fixture rows; treat missing as active. */
  isActive?: boolean;
}

// ===========================================================================
// Documents / transactions (headers only at this stage)
// ===========================================================================
export type DocumentKind =
  | 'PR'
  | 'RFQ'
  | 'QUOTE'
  | 'PO'
  | 'WORK_ORDER_PO'
  | 'GRN'
  | 'PURCHASE_INVOICE'
  | 'DEBIT_NOTE'
  | 'ISSUE'
  | 'RETURN'
  | 'TRANSFER'
  | 'STOCK_ADJUSTMENT'
  | 'PRODUCTION'
  | 'WO'
  | 'MEASUREMENT'
  | 'BILL'
  | 'DPR'
  | 'FUEL'
  | 'LOGBOOK'
  | 'MAINTENANCE'
  | 'EXPENSE'
  | 'ADVANCE'
  | 'ATTENDANCE'
  | 'PAYROLL'
  | 'CLIENT_BILL';

export interface DocumentSummary {
  id: string;
  kind: DocumentKind;
  documentNo: string;
  date: string;
  companyId: string;
  projectId: string | null; // null = head office / company-level document
  siteId: string | null;
  partyName?: string;
  title: string;
  amount?: number;
  status: DocumentStatus;
  createdByName: string;
  createdOn: string;
  approvals: ApprovalStep[];
  route: string;
}

export interface DocumentLine {
  id: string;
  itemCode?: string;
  description: string;
  uomCode: string;
  quantity: number;
  rate: number;
  discountPct?: number;
  gstRate?: number;
  amount: number;
  wbsCode?: string;
  remarks?: string;
}

// ===========================================================================
// Attachments & audit
// ===========================================================================
export interface Attachment {
  id: string;
  /** Owning entity collection: 'documents' | 'vendors' | 'subcontractors' | 'equipment' | … */
  entityKey: string;
  entityId: string;
  fileName: string;
  category: string;
  sizeKb: number;
  uploadedByName: string;
  uploadedOn: string;
  /** Statutory documents only. Absent = nothing to track. */
  expiryDate?: string;
  /** Optional (R5). Absent on fixture rows — see Q-65. */
  validFrom?: string;
  companyId?: string;
  projectId?: string | null;
  remarks?: string;
}

export interface AuditEntry {
  id: string;
  entityKey: string;
  entityId: string;
  userName: string;
  userRole: string;
  timestamp: string;
  action: string;
  changes: { field: string; from: string; to: string }[];
}

// ===========================================================================
// Home page task feed
// ===========================================================================
export interface PendingApprovalGroup {
  kind: DocumentKind;
  label: string;
  count: number;
  route: string;
  oldestDate: string;
  totalAmount?: number;
}

export type TaskSeverity = 'INFO' | 'WARNING' | 'DANGER';

export interface PendingTask {
  id: string;
  label: string;
  detail: string;
  count: number;
  route: string;
  severity: TaskSeverity;
}

export interface AlertItem {
  id: string;
  label: string;
  detail: string;
  count: number;
  route: string;
  severity: TaskSeverity;
}

export interface KpiValue {
  id: string;
  label: string;
  value: string;
  unit?: string;
  comparison?: string;
  trend?: 'UP' | 'DOWN' | 'FLAT';
  trendIsGood?: boolean;
  route?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  detail: string;
  timestamp: string;
  isRead: boolean;
  route: string;
}

// ===========================================================================
// Query params
// ===========================================================================
export interface ListParams {
  companyId?: string;
  projectId?: string;
  siteId?: string;
  search?: string;
  status?: DocumentStatus | 'ALL';
  /** Generic bucket filter: item group, vendor category, subcontractor trade. */
  group?: string;
  /** Second-level bucket: item sub-group. */
  subGroup?: string;
  /** Master-screen filters. */
  itemType?: ItemType | 'ALL';
  category?: string;
  kind?: DocumentKind | 'ALL';
  /** undefined = all, true = active only, false = inactive only. */
  isActive?: boolean;
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface Paged<T> {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ===========================================================================
// Daily progress
// ===========================================================================
export type WeatherCondition = 'CLEAR' | 'CLOUDY' | 'LIGHT_RAIN' | 'HEAVY_RAIN' | 'EXTREME_HEAT';

export interface DprProgressLine {
  id: string;
  wbsId: string;
  uomCode: string;
  todayQty: number;
  /** Including today. Site staff record this against the measurement book. */
  cumulativeQty: number;
  /** Chainage or structure reference, in the client's own words. */
  location?: string;
  remarks?: string;
}

export interface DprLabourLine {
  id: string;
  trade: string;
  /** Absent = departmental labour on own muster. */
  subcontractorId?: string;
  skilledCount: number;
  unskilledCount: number;
}

export interface DprEquipmentLine {
  id: string;
  equipmentId: string;
  hoursWorked: number;
  idleHours: number;
  breakdownHours: number;
  dieselIssued?: number;
}

export interface DailyProgressReport extends DocumentAudit {
  id: string;
  documentNo: string;
  /** One report per site per day — see Q-70. */
  date: string;
  weather: WeatherCondition;
  rainfallMm?: number;
  hoursLost?: number;
  progressLines: DprProgressLine[];
  labourLines: DprLabourLine[];
  equipmentLines: DprEquipmentLine[];
  hindranceRemarks?: string;
  safetyIncidents?: number;
  generalRemarks?: string;
  preparedByName: string;
  approvals?: ApprovalStep[];
}

// ===========================================================================
// Hindrance register
// ===========================================================================
export type HindranceCategory =
  | 'LAND_ACQUISITION'
  | 'DRAWINGS_APPROVAL'
  | 'UTILITY_SHIFTING'
  | 'STATUTORY_PERMISSION'
  | 'WEATHER'
  | 'CLIENT_MATERIAL'
  | 'PAYMENT_DELAY'
  | 'LABOUR_SHORTAGE'
  | 'EQUIPMENT_BREAKDOWN'
  | 'LAW_AND_ORDER'
  | 'OTHER';

/** Who caused it. Drives whether an extension of time can be claimed. */
export type HindranceResponsibility = 'CLIENT' | 'CONTRACTOR' | 'EXTERNAL';

export interface Hindrance extends DocumentAudit {
  id: string;
  documentNo: string;
  fromDate: string;
  /** Absent = the hindrance is still running. */
  toDate?: string;
  category: HindranceCategory;
  responsibility: HindranceResponsibility;
  description: string;
  /** Activity held up, when it maps to one work item. */
  wbsId?: string;
  location?: string;
  /** Work fully stopped, as against slowed down. */
  isWorkStopped: boolean;
  isEotClaimable: boolean;
  /** Days formally claimed, which need not equal elapsed days. */
  eotClaimDays?: number;
  actionTaken?: string;
  resolvedRemarks?: string;
}

// ===========================================================================
// Variations / deviation orders
// ===========================================================================
export type VariationCategory =
  | 'EXTRA_ITEM'
  | 'DEVIATION_QTY'
  | 'SUBSTITUTED_ITEM'
  | 'DESIGN_CHANGE'
  | 'SCOPE_ADDITION'
  | 'OMISSION';

export type VariationOrigin =
  | 'CLIENT_INSTRUCTION'
  | 'SITE_CONDITION'
  | 'DESIGN_REVISION'
  | 'STATUTORY'
  | 'CONTRACTOR_PROPOSAL';

/**
 * A deviation from the agreement BOQ. Indian practice: the proposed value is
 * what the contractor claims, the approved value is what the client admits,
 * and the two rarely match — both are kept.
 */
export interface Variation extends DocumentAudit {
  id: string;
  documentNo: string;
  date: string;
  category: VariationCategory;
  origin: VariationOrigin;
  description: string;
  /** BOQ item the deviation sits against. Blank for a wholly new item. */
  wbsId?: string;
  location?: string;
  uomCode?: string;
  quantity?: number;
  /** Rupees per UOM (R2). Agreement rate for a deviation, analysed rate for an extra item. */
  rate?: number;
  /** Rupees. What the contractor has put up. */
  proposedAmount: number;
  /** Rupees. What the client has admitted. Absent until decided; 0 when rejected. */
  approvedAmount?: number;
  /** Client letter or instruction that gave rise to the variation. */
  clientRefNo?: string;
  clientRefDate?: string;
  /** Beyond the agreement deviation limit, so a fresh rate analysis is needed. */
  needsRateAnalysis: boolean;
  /** Time impact, if any — links to the extension-of-time position. */
  timeExtensionDays?: number;
  remarks?: string;
}

// ===========================================================================
// Contractual claims
// ===========================================================================
export type ClaimType =
  | 'EOT'
  | 'PROLONGATION'
  | 'IDLE_RESOURCES'
  | 'PRICE_ESCALATION'
  | 'DELAYED_PAYMENT_INTEREST'
  | 'CHANGE_IN_LAW'
  | 'OTHER';

/** Where the claim has reached in the contract's dispute ladder. */
export type ClaimStage =
  | 'NOTICE_GIVEN'
  | 'PARTICULARS_SUBMITTED'
  | 'UNDER_REVIEW'
  | 'ENGINEER_DECISION'
  | 'CONCILIATION'
  | 'ARBITRATION'
  | 'SETTLED'
  | 'WITHDRAWN';

/**
 * A claim on the client for time or money. Distinct from a variation: a
 * variation prices a change in the work, a claim seeks compensation for its
 * consequences. Most contracts require notice within a stated period, so the
 * notice date is tracked separately from the date particulars were submitted.
 */
export interface Claim extends DocumentAudit {
  id: string;
  documentNo: string;
  date: string;
  type: ClaimType;
  stage: ClaimStage;
  title: string;
  description: string;
  /** The hindrance that gave rise to the claim, where there is one. */
  hindranceId?: string;
  /** The variation this claim rides on, where there is one. */
  variationId?: string;
  /** Contractual notice — the date the client was first put on notice. */
  noticeDate?: string;
  noticeRefNo?: string;
  /** Date the detailed particulars and costing went in. */
  particularsDate?: string;
  /** Rupees. Nil for a purely time-based claim. */
  claimedAmount: number;
  /** Rupees. What the client has admitted so far; absent until decided. */
  settledAmount?: number;
  /** Days of extension sought, for a time claim. */
  claimedDays?: number;
  settledDays?: number;
  settledDate?: string;
  remarks?: string;
}

// ===========================================================================
// Bank guarantees & retention
// ===========================================================================
export type BgType =
  | 'PERFORMANCE'
  | 'MOBILISATION_ADVANCE'
  | 'RETENTION_MONEY'
  | 'ADVANCE_PAYMENT'
  | 'SECURITY_DEPOSIT'
  | 'EMD';

/**
 * Where the instrument stands. Separate from DocumentStatus, which tracks the
 * approval of the register entry rather than the life of the guarantee itself.
 */
export type BgStatus =
  | 'LIVE'
  | 'UNDER_EXTENSION'
  | 'EXPIRED'
  | 'RELEASED'
  | 'INVOKED';

/**
 * A guarantee issued by a bank in the client's favour. The commercial risk
 * here is lapse: an unextended guarantee can be invoked, and margin money
 * stays locked until the original is returned and cancelled.
 */
export interface BankGuarantee extends DocumentAudit {
  id: string;
  /** Internal register number. */
  documentNo: string;
  /** The bank's own guarantee number, as printed on the instrument. */
  bgNumber: string;
  /** Date of issue. */
  date: string;
  type: BgType;
  bgStatus: BgStatus;
  bankName: string;
  branch?: string;
  /** In whose favour it is issued — normally the client. */
  beneficiary: string;
  /** Rupees. For a reducing guarantee this is the value standing today. */
  amount: number;
  validUpto: string;
  /** Most formats allow claims for a further period beyond validity. */
  claimPeriodUpto?: string;
  /** Margin money or FDR the bank holds against the guarantee. */
  marginPct?: number;
  marginAmount?: number;
  fdrNo?: string;
  /** Bank commission, percent per annum. */
  commissionPct?: number;
  purpose?: string;
  releasedOn?: string;
  remarks?: string;
}

/** Retention is deducted from bills, and leaves either by release or by BG. */
export type RetentionEvent = 'DEDUCTED' | 'RELEASED' | 'SUBSTITUTED_BY_BG';

/**
 * One movement on the retention account. Balance is the running total, not a
 * stored figure, so the register can never disagree with its own entries.
 */
export interface RetentionEntry extends DocumentAudit {
  id: string;
  documentNo: string;
  date: string;
  event: RetentionEvent;
  /**
   * Running account bill the movement relates to. Plain text until the client
   * billing module lands, when this becomes a reference — Q-29.
   */
  billNo: string;
  /** Rupees. Gross value of the bill the deduction was made from. */
  billAmount?: number;
  retentionPct?: number;
  /** Rupees, always positive. The event decides the direction. */
  amount: number;
  /** The guarantee furnished, where retention was substituted by a BG. */
  bgId?: string;
  remarks?: string;
}

// ===========================================================================
// Procurement — Purchase Requisition (Indent)
// ===========================================================================
export type PrPriority = 'NORMAL' | 'URGENT' | 'EMERGENCY';

export interface PurchaseRequisitionLine {
  id: string;
  itemId: string;
  /** Snapshot of the item name, so an later master rename does not rewrite history. */
  description: string;
  uomCode: string;
  quantity: number;
  /**
   * Indicative rate in rupees, for the approver's benefit only. An indent is
   * not a priced document — the real rate comes from the quotation (D-101).
   */
  estimatedRate?: number;
  /** Cost code the material is being drawn against. */
  wbsId?: string;
  /** Rupees ordered against this line so far. Maintained by the PO screen. */
  orderedQty?: number;
  requiredDate?: string;
  remarks?: string;
}

export interface PurchaseRequisition extends DocumentAudit {
  id: string;
  documentNo: string;
  date: string;
  priority: PrPriority;
  /** Employee raising the indent. */
  indentedBy: string;
  /** Date the material is wanted at site. */
  requiredBy: string;
  /** Where it must be delivered — normally a site store. */
  deliverySiteId: string;
  /** Why it is needed. The approver's main read on an urgent indent. */
  justification?: string;
  lines: PurchaseRequisitionLine[];
  remarks?: string;
}

// ===========================================================================
// Procurement — Request for Quotation (enquiry)
// ===========================================================================

/** How the enquiry reached the vendor. Kept on record because Indian
 *  purchase files are audited on "was every vendor given equal notice". */
export type RfqSentMode = 'EMAIL' | 'WHATSAPP' | 'COURIER' | 'HAND_DELIVERY' | 'PORTAL';

export type RfqResponse = 'AWAITED' | 'RECEIVED' | 'REGRETTED' | 'NO_RESPONSE';

/** Freight basis asked for in the enquiry, so offers are comparable. */
export type FreightTerms = 'FOR_SITE' | 'EX_WORKS' | 'EXTRA_AT_ACTUALS' | 'INCLUSIVE';

export interface RfqVendor {
  vendorId: string;
  vendorName: string;
  sentOn?: string;
  sentMode: RfqSentMode;
  response: RfqResponse;
  respondedOn?: string;
  /** Set once the offer is captured on the Vendor Quotations screen. */
  quotationId?: string;
  remarks?: string;
}

export interface RfqLine {
  id: string;
  /** Indent this line was pulled from. Free lines added directly are allowed. */
  prId?: string;
  prLineId?: string;
  itemId: string;
  itemCode?: string;
  description: string;
  specification?: string;
  uomCode: string;
  quantity: number;
  /** Internal estimate only — never printed on the enquiry sent to vendors (D-102). */
  estimatedRate?: number;
  wbsId?: string;
}

/**
 * Q-77: status mapping. DRAFT = being prepared, SUBMITTED = floated to vendors,
 * CLOSED = quoting window shut / comparison done, CANCELLED = dropped.
 * Confirm whether an internal approval is needed before an enquiry may be floated.
 */
export interface Rfq extends DocumentAudit {
  id: string;
  documentNo: string;
  date: string;
  title: string;
  prIds: string[];
  lines: RfqLine[];
  vendors: RfqVendor[];
  /** Last date for receipt of quotations. */
  dueDate: string;
  quoteValidityDays?: number;
  deliveryLocationSiteId?: string;
  deliverySchedule?: string;
  paymentTermsExpected?: string;
  freightTerms?: FreightTerms;
  inspectionRequired?: boolean;
  scopeNotes?: string;
  remarks?: string;
  preparedBy?: string;
}

// ===========================================================================
// Procurement — Vendor Quotation (offer)
// ===========================================================================

/** Who bears freight, per the offer as received — may differ from what was asked. */
export type QuotationCharge = 'INCLUDED' | 'EXTRA' | 'NOT_APPLICABLE';

export interface QuotationLine {
  id: string;
  rfqLineId?: string;
  itemId: string;
  itemCode?: string;
  description: string;
  uomCode: string;
  quantity: number;
  /** Rate as quoted, before any charge or tax. */
  basicRate: number;
  discountPct?: number;
  gstRate: number;
  /** Vendor's own make/brand offered against the specification. */
  makeOffered?: string;
  /** Set when the vendor has not quoted this line at all. */
  notQuoted?: boolean;
  remarks?: string;
}

/**
 * Charges quoted at the document level rather than per line. Indian offers
 * routinely add freight, loading and P&F after the rate, which is why a
 * bare rate comparison misleads (D-104).
 */
export interface QuotationCharges {
  freightBasis: QuotationCharge;
  freightAmount?: number;
  loadingBasis: QuotationCharge;
  loadingAmount?: number;
  packingBasis: QuotationCharge;
  packingAmount?: number;
  /** GST applied on the charges themselves, where the vendor has shown it. */
  chargesGstRate?: number;
}

export interface Quotation extends DocumentAudit {
  id: string;
  documentNo: string;
  date: string;
  rfqId: string;
  vendorId: string;
  vendorName: string;
  /** The vendor's own reference on their letterhead — what accounts will cite. */
  vendorRefNo?: string;
  vendorRefDate?: string;
  validUntil?: string;
  lines: QuotationLine[];
  charges: QuotationCharges;
  paymentTerms?: string;
  deliveryPeriodDays?: number;
  warrantyTerms?: string;
  /** Set once the technical scrutiny is done, before rates are opened. */
  isTechnicallyQualified?: boolean;
  /** Where the offer departs from the enquiry — the reason offers rarely compare cleanly. */
  deviations?: string;
  remarks?: string;
  receivedOn?: string;
}

// ===========================================================================
// Procurement — Purchase Order
// ===========================================================================

/** How the order was arrived at. Drives what the purchase file must contain. */
export type PoBasis = 'COMPARATIVE' | 'RATE_CONTRACT' | 'SINGLE_SOURCE' | 'EMERGENCY' | 'REPEAT_ORDER';

export type PoDeliveryTerms = 'FOR_SITE' | 'EX_WORKS' | 'FOR_DESTINATION';

export interface PoLine {
  id: string;
  quotationLineId?: string;
  rfqLineId?: string;
  prId?: string;
  itemId: string;
  itemCode?: string;
  description: string;
  specification?: string;
  makeApproved?: string;
  uomCode: string;
  quantity: number;
  rate: number;
  discountPct?: number;
  gstRate: number;
  wbsId?: string;
  /** Quantity received so far against this line — written by the GRN later. */
  receivedQty?: number;
  scheduledDate?: string;
  remarks?: string;
}

/** Document-level charges, carried across from the accepted offer. */
export interface PoCharges {
  freightAmount?: number;
  loadingAmount?: number;
  packingAmount?: number;
  chargesGstRate?: number;
}

/**
 * Q-83: retention/security on a supply order is not universal — confirm whether
 * the client withholds a percentage on material orders or only on works.
 */
export interface PurchaseOrder extends DocumentAudit {
  id: string;
  documentNo: string;
  date: string;
  vendorId: string;
  vendorName: string;
  basis: PoBasis;
  /** The offer accepted. Absent for a rate-contract or emergency order. */
  quotationId?: string;
  rfqId?: string;
  prIds: string[];
  lines: PoLine[];
  charges: PoCharges;
  deliveryTerms: PoDeliveryTerms;
  deliverySiteId: string;
  deliveryAddress?: string;
  /** Overall completion date for the order. Lines may schedule within it. */
  deliveryByDate?: string;
  paymentTerms?: string;
  warrantyTerms?: string;
  /** Advance payable on order, in rupees. */
  advanceAmount?: number;
  retentionPct?: number;
  /** Liquidated damages clause as agreed, free text — varies by order. */
  ldClause?: string;
  /** Why this vendor, for the file. Mandatory when the basis is not comparative. */
  awardJustification?: string;
  inspectionRequired?: boolean;
  amendmentNo?: number;
  amendmentReason?: string;
  remarks?: string;
  approvedBy?: string;
  approvedOn?: string;
}

// ===========================================================================
// Stores — Goods Receipt
// ===========================================================================

/** How the material arrived. Drives which fields the screen demands. */
export type GrnType = 'AGAINST_PO' | 'WITHOUT_PO' | 'FREE_ISSUE' | 'SITE_TRANSFER_IN';

/** Condition recorded at the gate, per line. */
export type GrnLineCondition = 'ACCEPTED' | 'PARTIALLY_REJECTED' | 'REJECTED' | 'PENDING_TEST';

export interface GoodsReceiptLine {
  id: string;
  /** Set when received against an order. Absent on a without-PO receipt. */
  poLineId?: string;
  itemId: string;
  itemCode?: string;
  /** Snapshot of the item name at receipt — a later master rename must not rewrite history. */
  description: string;
  specification?: string;
  makeReceived?: string;
  uomCode: string;
  /** Quantity written on the vendor's delivery challan. */
  challanQty: number;
  /** Quantity physically found. Short of challan = transit shortage (D-116). */
  receivedQty: number;
  /** Quantity taken into stock. Only this posts to PoLine.receivedQty (D-115). */
  acceptedQty: number;
  rejectedQty: number;
  condition: GrnLineCondition;
  rejectionReason?: string;
  /** Rate carried from the order, for receipt valuation. Absent on free issue. */
  rate?: number;
  wbsId?: string;
  /** Where in the store it was put. */
  binLocation?: string;
  /** Mill test certificate / batch reference, as printed on the material. */
  batchNo?: string;
  manufacturedOn?: string;
  expiresOn?: string;
  remarks?: string;
}

export interface GoodsReceipt extends DocumentAudit {
  id: string;
  documentNo: string;
  /** Date the material was received at site, not the date of entry. */
  date: string;
  grnType: GrnType;
  /** One GRN, one order (D-119). Absent when grnType is not AGAINST_PO (D-120). */
  poId?: string;
  poDocumentNo?: string;
  vendorId?: string;
  vendorName?: string;

  /** Mandatory — material arrives against a challan, not an invoice (D-118). */
  challanNo: string;
  challanDate: string;
  invoiceNo?: string;
  invoiceDate?: string;
  /** Lorry receipt / consignment note from the transporter. */
  lrNo?: string;
  lrDate?: string;
  vehicleNo?: string;
  transporterName?: string;
  gateEntryNo?: string;
  gateEntryOn?: string;

  /** Weighbridge, for bulk receipts (D-117). Net is stored — the slip is the record. */
  weighbridgeSlipNo?: string;
  grossWeight?: number;
  tareWeight?: number;
  netWeight?: number;

  /** Store the material was taken into. */
  storeSiteId: string;
  receivedBy: string;
  inspectedBy?: string;
  testCertificateNo?: string;

  lines: GoodsReceiptLine[];
  remarks?: string;
  approvedBy?: string;
  approvedOn?: string;
}

// ===========================================================================
// Stores — Material Issue
// ===========================================================================

/** Why the material left the store. Drives which party field the screen demands. */
export type IssueType = 'CONSUMPTION' | 'SUBCONTRACTOR' | 'EQUIPMENT' | 'RETURNABLE';

export interface MaterialIssueLine {
  id: string;
  itemId: string;
  itemCode?: string;
  /** Snapshot of the item name at issue — a later master rename must not rewrite history. */
  description: string;
  uomCode: string;
  /** What the site asked for on the requisition slip. */
  requestedQty: number;
  /** What actually went out. Short of requested = the store could not meet it (D-124). */
  issuedQty: number;
  /** Stock rate at the issuing store on the date of issue (D-123). */
  rate?: number;
  /** Cost code the material is charged to. */
  wbsId?: string;
  binLocation?: string;
  batchNo?: string;
  /** Shuttering, staging, scaffolding — issued and expected back (D-126). */
  isReturnable?: boolean;
  expectedReturnDate?: string;
  /** Returned so far. Written by the Material Return screen only (D-127). */
  returnedQty?: number;
  remarks?: string;
}

export interface MaterialIssue extends DocumentAudit {
  id: string;
  documentNo: string;
  /** Date the material left the store, not the date of entry. */
  date: string;
  issueType: IssueType;
  /** Store the material went out of. */
  storeSiteId: string;

  /** Site requisition slip the store issued against — see Q-90. */
  requisitionNo?: string;
  requisitionDate?: string;

  /** Set when issueType is SUBCONTRACTOR. Recoverable issue — see Q-89. */
  subcontractorId?: string;
  subcontractorName?: string;
  /** Set when issueType is EQUIPMENT, for fuel and lubricants. */
  equipmentId?: string;
  /** Hour-meter or odometer reading at the time of issue. */
  equipmentHmr?: number;

  /** Activity the material is charged to, when the whole issue is for one item. */
  wbsId?: string;
  purpose?: string;
  /** Material leaving the premises needs a gate pass. */
  gatePassNo?: string;
  vehicleNo?: string;

  lines: MaterialIssueLine[];
  /** Storekeeper making the issue. */
  issuedBy: string;
  /** Person taking delivery at site. */
  receivedBy: string;
  remarks?: string;
  approvedBy?: string;
  approvedOn?: string;
}

// ===========================================================================
// Stores — Material Return
// ===========================================================================

/** Why the material came back. Drives which reference the screen demands. */
export type ReturnType = 'SURPLUS' | 'RETURNABLE' | 'FROM_SUBCONTRACTOR' | 'SCRAP';

/** Condition it came back in. Only GOOD re-enters usable stock (D-129). */
export type ReturnCondition = 'GOOD' | 'DAMAGED' | 'SCRAP';

export interface MaterialReturnLine {
  id: string;
  /** Issue line this came back against. Absent on a return with no reference. */
  issueLineId?: string;
  itemId: string;
  itemCode?: string;
  /** Snapshot of the item name at return — a later master rename must not rewrite history. */
  description: string;
  uomCode: string;
  /** Total handed back at the store counter. */
  returnedQty: number;
  /** Of that, taken back into usable stock (D-129). */
  restockedQty: number;
  /** Of that, unusable — damaged or scrap. */
  damagedQty: number;
  condition: ReturnCondition;
  /** The rate the material went out at (D-128). Not re-rated on return. */
  rate?: number;
  /** Cost code the credit goes back to. */
  wbsId?: string;
  binLocation?: string;
  remarks?: string;
}

export interface MaterialReturn extends DocumentAudit {
  id: string;
  documentNo: string;
  /** Date the material came back to the store, not the date of entry. */
  date: string;
  returnType: ReturnType;
  /** Store taking the material back. */
  storeSiteId: string;

  /** One return, one issue (D-131). Absent where there is no reference — see Q-95. */
  issueId?: string;
  issueDocumentNo?: string;

  /** Set when returnType is FROM_SUBCONTRACTOR. Recovery question is Q-93. */
  subcontractorId?: string;
  subcontractorName?: string;

  /** Activity the credit goes back to, when the whole return is for one activity. */
  wbsId?: string;
  reason?: string;
  /** Material coming back through the gate needs the pass referenced. */
  gatePassNo?: string;
  vehicleNo?: string;

  lines: MaterialReturnLine[];
  /** Site person handing the material back. */
  returnedBy: string;
  /** Storekeeper taking it in. */
  receivedBy: string;
  inspectedBy?: string;
  remarks?: string;
  approvedBy?: string;
  approvedOn?: string;
}

// ===========================================================================
// Stores — Stock Transfer
// ===========================================================================

/**
 * Where the transfer has reached. A transfer is two events, not one (D-133),
 * so the document carries its own lifecycle independent of DocumentStatus.
 */
export type TransferStage = 'DRAFT' | 'DISPATCHED' | 'PARTLY_RECEIVED' | 'RECEIVED';

export interface StockTransferLine {
  id: string;
  itemId: string;
  itemCode?: string;
  /** Snapshot of the item name at dispatch — a later master rename must not rewrite history. */
  description: string;
  uomCode: string;
  /** Sent out of the issuing store. */
  dispatchedQty: number;
  /** Taken in at the receiving store. Short of dispatched = transit loss (D-134). */
  receivedQty: number;
  /** Rate at the sending store. The move does not revalue material (D-135). */
  rate?: number;
  fromBinLocation?: string;
  toBinLocation?: string;
  batchNo?: string;
  remarks?: string;
}

export interface StockTransfer extends DocumentAudit {
  id: string;
  documentNo: string;
  /** Date the material left the sending store. */
  date: string;
  stage: TransferStage;

  /** Sending store. `siteId` on the audit block mirrors this. */
  fromSiteId: string;
  /** Receiving store. May belong to another project (D-136). */
  toSiteId: string;
  /** Set only when the receiving store belongs to a different project. */
  toProjectId?: string;

  /** Internal delivery challan — see Q-98. */
  challanNo?: string;
  vehicleNo?: string;
  transporterName?: string;
  lrNo?: string;
  /** Date the material reached the receiving store. Absent until received. */
  receivedDate?: string;

  reason?: string;
  lines: StockTransferLine[];
  /** Storekeeper at the sending store. */
  dispatchedBy: string;
  /** Storekeeper at the receiving store. Absent until received. */
  receivedBy?: string;
  remarks?: string;
  approvedBy?: string;
  approvedOn?: string;
}


// ===========================================================================
// Stores — Stock Adjustment
// ===========================================================================

/**
 * Why the stock was counted or written down. The direction — shortage or
 * excess — is never chosen here; it falls out of the arithmetic (D-139).
 */
export type AdjustmentType =
  | 'PHYSICAL_VERIFICATION'
  | 'DAMAGE'
  | 'THEFT'
  | 'EXPIRY'
  | 'MEASUREMENT_CORRECTION'
  | 'WRITE_OFF';

export interface StockAdjustmentLine {
  id: string;
  itemId: string;
  itemCode?: string;
  /** Snapshot of the item name at counting — a later master rename must not rewrite history. */
  description: string;
  uomCode: string;
  /** What the books said when the count was taken. Stored, not re-read (D-140). */
  systemQty: number;
  /** What was actually found in the store. */
  physicalQty: number;
  /** Stock rate the material was carried at. Values the variance (D-141). */
  rate?: number;
  /** Tolerance for this line, in percent. Bulk material has handling noise (D-142). */
  tolerancePct?: number;
  reason?: string;
  batchNo?: string;
  binLocation?: string;
  remarks?: string;
}

export interface StockAdjustment extends DocumentAudit {
  id: string;
  documentNo: string;
  /** Date the stock was physically counted, not the date of entry. */
  date: string;
  adjustmentType: AdjustmentType;

  /** Store that was counted. `siteId` on the audit block mirrors this. */
  storeSiteId: string;
  /** Physical count sheet reference — the paper the entry came from. */
  countSheetNo?: string;

  /** Mandatory for a write-down; the reason is the whole document (Q-99). */
  reason?: string;
  lines: StockAdjustmentLine[];

  /** Storekeeper who counted. */
  countedBy: string;
  /** Second person who witnessed the count, where one was present. */
  verifiedBy?: string;
  remarks?: string;
  /** Nothing moves until this is set (D-143). */
  approvedBy?: string;
  approvedOn?: string;
}
