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

// ===========================================================================
// Organisation
// ===========================================================================
export type CompanyType = 'PARENT' | 'SPV' | 'JV';

export interface Company {
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
}

export type ProjectType =
  | 'ROAD'
  | 'BRIDGE'
  | 'INDUSTRIAL_PARK'
  | 'WAREHOUSE'
  | 'BUILDING';

export interface Project {
  id: string;
  companyId: string;
  code: string;
  name: string;
  shortName: string;
  type: ProjectType;
  client: string;
  location: string;
  contractValueCr: number; // in crore INR
  startDate: string;
  endDate: string;
  physicalProgressPct: number;
  financialProgressPct: number;
  projectManagerId: string;
  chainageFrom?: string;
  chainageTo?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ON_HOLD';
}

export type SiteType = 'MAIN_STORE' | 'SITE_STORE' | 'SITE_OFFICE' | 'PLANT';

export interface Site {
  id: string;
  companyId: string;
  projectId: string | null;
  code: string;
  name: string;
  type: SiteType;
  location: string;
  storeKeeperId?: string;
  isStore: boolean;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  headEmployeeId?: string;
}

// ===========================================================================
// People
// ===========================================================================
export interface Employee {
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

export interface Equipment {
  id: string;
  code: string;
  name: string;
  type: string;
  registrationNo?: string;
  ownership: EquipmentOwnership;
  hireVendorId?: string;
  hireRate?: number;
  hireRateUnit?: string;
  projectId: string | null;
  siteId: string | null;
  operatorEmployeeId?: string;
  status: EquipmentStatus;
  currentHmr: number;
  nextServiceDueHmr?: number;
  nextServiceDueDate?: string;
  isActive: boolean;
}

// ===========================================================================
// WBS / Cost codes
// ===========================================================================
export interface WbsNode {
  id: string;
  projectId: string;
  code: string;
  name: string;
  parentId: string | null;
  level: number;
  uomCode?: string;
  budgetedQty?: number;
  budgetedCost?: number;
  executedQty?: number;
  actualCost?: number;
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
  entityKey: string;
  entityId: string;
  fileName: string;
  category: string;
  sizeKb: number;
  uploadedByName: string;
  uploadedOn: string;
  expiryDate?: string;
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
