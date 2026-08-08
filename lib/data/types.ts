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

export interface Vendor {
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

export interface Subcontractor {
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

export interface Uom {
  id: string;
  code: string;
  name: string;
  decimals: number;
}

export interface HsnSac {
  id: string;
  code: string;
  description: string;
  gstRate: number;
  kind: 'HSN' | 'SAC';
}

export interface Item {
  id: string;
  code: string;
  name: string;
  group: ItemGroup;
  specification: string;
  stockUomCode: string;
  hsnCode: string;
  gstRate: number;
  reorderLevel: number;
  isAsset: boolean;
  isActive: boolean;
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
  | 'GRN'
  | 'ISSUE'
  | 'RETURN'
  | 'TRANSFER'
  | 'WO'
  | 'MEASUREMENT'
  | 'BILL'
  | 'DPR'
  | 'FUEL'
  | 'EXPENSE';

export interface DocumentSummary {
  id: string;
  kind: DocumentKind;
  documentNo: string;
  date: string;
  companyId: string;
  projectId: string;
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
  group?: string;
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
