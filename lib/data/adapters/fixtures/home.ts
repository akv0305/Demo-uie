import type {
  AlertItem,
  CurrentUser,
  KpiValue,
  PendingApprovalGroup,
  PendingTask,
  UserRole,
} from '@/lib/data/types';
import { terminology as t } from '@/config/terminology.config';

/** Demo users, one per selectable role on the login screen. */
export const demoUsers: Record<UserRole, CurrentUser> = {
  ADMINISTRATOR: {
    id: 'USR-ADM', employeeCode: 'UIE/E/9001', name: 'Kiran Kumar Adluri', email: 'kiran.admin@udayinfra.co.in',
    role: 'ADMINISTRATOR', roleLabel: t.roles.ADMINISTRATOR, designation: 'System Administrator',
    companyId: 'CMP-UIE', projectId: 'PRJ-SH19', siteId: 'SITE-SH19-KM32', avatarInitials: 'KA', isExternal: false,
  },
  PROJECT_MANAGER: {
    id: 'USR-PM', employeeCode: 'UIE/E/1001', name: 'Ravindra Reddy Palle', email: 'ravindra.reddy@udayinfra.co.in',
    role: 'PROJECT_MANAGER', roleLabel: t.roles.PROJECT_MANAGER, designation: 'Project Manager',
    companyId: 'CMP-UIE', projectId: 'PRJ-SH19', siteId: 'SITE-SH19-KM32', avatarInitials: 'RP', isExternal: false,
  },
  SITE_ENGINEER: {
    id: 'USR-SE', employeeCode: 'UIE/E/1006', name: 'Praveen Kumar Dandu', email: 'praveen.kumar@udayinfra.co.in',
    role: 'SITE_ENGINEER', roleLabel: t.roles.SITE_ENGINEER, designation: 'Site Engineer',
    companyId: 'CMP-UIE', projectId: 'PRJ-SH19', siteId: 'SITE-SH19-KM32', avatarInitials: 'PD', isExternal: false,
  },
  STORE_KEEPER: {
    id: 'USR-SK', employeeCode: 'UIE/E/1011', name: 'Srinivas Goud Perika', email: 'srinivas.goud@udayinfra.co.in',
    role: 'STORE_KEEPER', roleLabel: t.roles.STORE_KEEPER, designation: 'Store Keeper',
    companyId: 'CMP-UIE', projectId: 'PRJ-SH19', siteId: 'SITE-SH19-KM32', avatarInitials: 'SP', isExternal: false,
  },
  PROCUREMENT_OFFICER: {
    id: 'USR-PO', employeeCode: 'UIE/E/1020', name: 'Girish Chandra Marri', email: 'girish.chandra@udayinfra.co.in',
    role: 'PROCUREMENT_OFFICER', roleLabel: t.roles.PROCUREMENT_OFFICER, designation: 'Purchase Officer',
    companyId: 'CMP-UIE', projectId: 'PRJ-SH19', siteId: 'SITE-MAIN', avatarInitials: 'GM', isExternal: false,
  },
  ACCOUNTS: {
    id: 'USR-AC', employeeCode: 'UIE/E/1040', name: 'Sudhakar Rao Chintalapudi', email: 'sudhakar.rao@udayinfra.co.in',
    role: 'ACCOUNTS', roleLabel: t.roles.ACCOUNTS, designation: 'Chief Accountant',
    companyId: 'CMP-UIE', projectId: 'PRJ-SH19', siteId: null, avatarInitials: 'SC', isExternal: false,
  },
  MANAGEMENT: {
    id: 'USR-MG', employeeCode: 'UIE/E/1000', name: 'K. Uday Kiran', email: 'uday.kiran@udayinfra.co.in',
    role: 'MANAGEMENT', roleLabel: t.roles.MANAGEMENT, designation: 'Managing Director',
    companyId: 'CMP-UIE', projectId: null, siteId: null, avatarInitials: 'UK', isExternal: false,
  },
  VENDOR: {
    id: 'USR-VN', employeeCode: 'UIE/V/0002', name: 'B. Ramachandra Prasad', email: 'orders@bharathisteel.co.in',
    role: 'VENDOR', roleLabel: t.roles.VENDOR, designation: 'Bharathi Steel Traders',
    companyId: 'CMP-UIE', projectId: null, siteId: null, avatarInitials: 'BP', isExternal: true,
  },
  SUBCONTRACTOR: {
    id: 'USR-SB', employeeCode: 'UIE/S/0001', name: 'M. Yadagiri', email: 'mahalakshmi.earth@gmail.com',
    role: 'SUBCONTRACTOR', roleLabel: t.roles.SUBCONTRACTOR, designation: 'Mahalakshmi Earthmovers & Contractors',
    companyId: 'CMP-UIE', projectId: 'PRJ-SH19', siteId: null, avatarInitials: 'MY', isExternal: true,
  },
};

// ===========================================================================
// Waiting for my action — pending approvals grouped by document type
// ===========================================================================
const approvalsByRole: Partial<Record<UserRole, PendingApprovalGroup[]>> = {
  PROJECT_MANAGER: [
    { kind: 'PR', label: t.procurement.purchaseRequisition, count: 3, route: '/procurement/purchase-requisitions', oldestDate: '2026-07-21', totalAmount: 3021500 },
    { kind: 'BILL', label: t.subcontract.raBill, count: 2, route: '/subcontract/bills', oldestDate: '2026-08-02', totalAmount: 4128600 },
    { kind: 'MEASUREMENT', label: t.subcontract.measurementSheet, count: 1, route: '/subcontract/measurements', oldestDate: '2026-08-04', totalAmount: 1284000 },
    { kind: 'EXPENSE', label: t.hr.expenseClaims, count: 4, route: '/hr/expense-claims', oldestDate: '2026-07-30', totalAmount: 62840 },
  ],
  ACCOUNTS: [
    { kind: 'PO', label: t.procurement.purchaseOrder, count: 3, route: '/procurement/purchase-orders', oldestDate: '2026-07-24', totalAmount: 7285200 },
    { kind: 'BILL', label: t.subcontract.raBill, count: 5, route: '/subcontract/bills', oldestDate: '2026-07-18', totalAmount: 11842300 },
    { kind: 'WO', label: t.subcontract.workOrder, count: 1, route: '/subcontract/work-orders', oldestDate: '2026-08-01', totalAmount: 4280000 },
  ],
  SITE_ENGINEER: [
    { kind: 'ISSUE', label: t.inventory.materialIssue, count: 2, route: '/inventory/material-issue', oldestDate: '2026-08-07', totalAmount: 248900 },
  ],
  STORE_KEEPER: [
    { kind: 'GRN', label: t.inventory.grn, count: 2, route: '/inventory/goods-receipt', oldestDate: '2026-08-07', totalAmount: 610700 },
  ],
  PROCUREMENT_OFFICER: [
    { kind: 'PR', label: t.procurement.purchaseRequisition, count: 5, route: '/procurement/purchase-requisitions', oldestDate: '2026-07-21', totalAmount: 8942300 },
    { kind: 'QUOTE', label: t.procurement.vendorQuotations, count: 3, route: '/procurement/vendor-quotations', oldestDate: '2026-08-01' },
  ],
  ADMINISTRATOR: [
    { kind: 'PR', label: t.procurement.purchaseRequisition, count: 3, route: '/procurement/purchase-requisitions', oldestDate: '2026-07-21', totalAmount: 3021500 },
    { kind: 'PO', label: t.procurement.purchaseOrder, count: 3, route: '/procurement/purchase-orders', oldestDate: '2026-07-24', totalAmount: 7285200 },
    { kind: 'BILL', label: t.subcontract.raBill, count: 5, route: '/subcontract/bills', oldestDate: '2026-07-18', totalAmount: 11842300 },
  ],
  MANAGEMENT: [
    { kind: 'PO', label: t.procurement.purchaseOrder, count: 2, route: '/procurement/purchase-orders', oldestDate: '2026-07-24', totalAmount: 6598200 },
    { kind: 'WO', label: t.subcontract.workOrder, count: 1, route: '/subcontract/work-orders', oldestDate: '2026-08-01', totalAmount: 4280000 },
  ],
  VENDOR: [],
  SUBCONTRACTOR: [],
};

// ===========================================================================
// My pending tasks
// ===========================================================================
const tasksByRole: Partial<Record<UserRole, PendingTask[]>> = {
  SITE_ENGINEER: [
    { id: 'TSK-1', label: t.home.dprNotSubmitted, detail: 'UIE/DPR/2526/0143 for 08-Aug-2026 is still in draft', count: 1, route: '/project-controls/daily-progress-report', severity: 'DANGER' },
    { id: 'TSK-2', label: t.home.draftsNotSubmitted, detail: 'Bitumen VG-30 requisition for Km 41+000 to Km 44+500', count: 2, route: '/procurement/purchase-requisitions', severity: 'WARNING' },
    { id: 'TSK-3', label: t.home.returnedForCorrection, detail: 'Travel and lab charges claim returned — attach lab receipt', count: 1, route: '/hr/expense-claims', severity: 'WARNING' },
  ],
  STORE_KEEPER: [
    { id: 'TSK-4', label: t.home.draftsNotSubmitted, detail: 'Diesel tanker receipt of 3,000 litre not yet submitted', count: 1, route: '/inventory/goods-receipt', severity: 'WARNING' },
    { id: 'TSK-5', label: t.home.returnedForCorrection, detail: 'M-Sand requisition returned — split admixture delivery', count: 1, route: '/procurement/purchase-requisitions', severity: 'WARNING' },
  ],
  PROJECT_MANAGER: [
    { id: 'TSK-6', label: t.home.dprNotSubmitted, detail: 'SH-19 Package II report for 08-Aug-2026 not received', count: 1, route: '/project-controls/daily-progress-report', severity: 'DANGER' },
    { id: 'TSK-7', label: t.home.draftsNotSubmitted, detail: 'Variation proposal for additional cross drainage works', count: 3, route: '/project-controls/variation-register', severity: 'INFO' },
  ],
  PROCUREMENT_OFFICER: [
    { id: 'TSK-8', label: t.home.draftsNotSubmitted, detail: 'Enquiry for bitumen emulsion pending release to vendors', count: 2, route: '/procurement/rfq', severity: 'WARNING' },
    { id: 'TSK-9', label: t.home.returnedForCorrection, detail: 'Steel order returned by accounts for revised rates', count: 1, route: '/procurement/purchase-orders', severity: 'WARNING' },
  ],
  ACCOUNTS: [
    { id: 'TSK-10', label: t.home.draftsNotSubmitted, detail: 'Purchase invoices captured but not yet posted', count: 6, route: '/procurement/purchase-invoice-capture', severity: 'WARNING' },
  ],
  ADMINISTRATOR: [
    { id: 'TSK-11', label: t.home.draftsNotSubmitted, detail: 'Number series for FY 2026-27 not yet configured', count: 1, route: '/administration/number-series', severity: 'INFO' },
  ],
  MANAGEMENT: [],
  VENDOR: [
    { id: 'TSK-12', label: t.home.draftsNotSubmitted, detail: 'Quotation against enquiry UIE/RFQ/2526/0031 not submitted', count: 1, route: '/portals/vendor', severity: 'WARNING' },
  ],
  SUBCONTRACTOR: [
    { id: 'TSK-13', label: t.home.draftsNotSubmitted, detail: 'Measurement claim for August first fortnight not raised', count: 1, route: '/portals/subcontractor', severity: 'WARNING' },
  ],
};

// ===========================================================================
// Alerts
// ===========================================================================
const commonAlerts: AlertItem[] = [
  { id: 'ALR-1', label: t.home.docsExpiring, detail: 'Labour licence, GST certificate and 2 vehicle insurances', count: 4, route: '/documents/expiry-tracker', severity: 'WARNING' },
  { id: 'ALR-2', label: t.home.lowStock, detail: 'HSD diesel, WMM material, AAC blocks and 5 more items', count: 8, route: '/inventory/stock-summary', severity: 'WARNING' },
  { id: 'ALR-3', label: t.home.equipmentBreakdown, detail: 'WMM Plant UIE/EQ/WMM01 and JCB UIE/EQ/JCB02', count: 2, route: '/plant/breakdowns', severity: 'DANGER' },
  { id: 'ALR-4', label: t.home.overdueMaintenance, detail: 'Soil compactor roller service overdue since 30-Jul-2026', count: 1, route: '/plant/maintenance', severity: 'DANGER' },
];

const alertsByRole: Partial<Record<UserRole, AlertItem[]>> = {
  ADMINISTRATOR: commonAlerts,
  PROJECT_MANAGER: commonAlerts,
  MANAGEMENT: [commonAlerts[0]!, commonAlerts[2]!],
  SITE_ENGINEER: [commonAlerts[1]!, commonAlerts[2]!],
  STORE_KEEPER: [commonAlerts[1]!],
  PROCUREMENT_OFFICER: [commonAlerts[1]!],
  ACCOUNTS: [commonAlerts[0]!],
  VENDOR: [],
  SUBCONTRACTOR: [],
};

// ===========================================================================
// KPI cards per role
// ===========================================================================
const kpisByRole: Partial<Record<UserRole, KpiValue[]>> = {
  PROJECT_MANAGER: [
    { id: 'KPI-1', label: t.masters.physicalProgress, value: '46.8', unit: '%', comparison: '3.2% gained in July 2026', trend: 'UP', trendIsGood: true, route: '/project-controls/project-dashboard' },
    { id: 'KPI-2', label: t.masters.financialProgress, value: '42.1', unit: '%', comparison: 'Certified value ₹90.41 Cr', trend: 'UP', trendIsGood: true, route: '/project-controls/contract-summary' },
    { id: 'KPI-3', label: t.project.actualCost, value: '78.24', unit: t.common.inCrore, comparison: '4.6% above budget to date', trend: 'UP', trendIsGood: false, route: '/project-controls/wbs-budget' },
    { id: 'KPI-4', label: t.project.hindranceRegister, value: '6', unit: 'open', comparison: '2 closed in July 2026', trend: 'DOWN', trendIsGood: true, route: '/project-controls/hindrance-register' },
  ],
  SITE_ENGINEER: [
    { id: 'KPI-5', label: t.project.manpowerDeployed, value: '184', unit: 'nos', comparison: '12 more than yesterday', trend: 'UP', trendIsGood: true, route: '/hr/labour-attendance' },
    { id: 'KPI-6', label: t.project.workDone, value: '2,840', unit: 'cum', comparison: 'Embankment earthwork, 07-Aug-2026', trend: 'FLAT', route: '/project-controls/daily-progress-report' },
    { id: 'KPI-7', label: t.inventory.materialIssue, value: '11', unit: 'today', comparison: 'Against 4 cost codes', trend: 'UP', trendIsGood: true, route: '/inventory/material-issue' },
  ],
  STORE_KEEPER: [
    { id: 'KPI-8', label: t.inventory.stockValue, value: '1,42,68,540', unit: t.common.currencySymbol, comparison: 'Across 4 stores', trend: 'FLAT', route: '/inventory/stock-summary' },
    { id: 'KPI-9', label: t.home.lowStock, value: '8', unit: 'items', comparison: '3 more than last week', trend: 'UP', trendIsGood: false, route: '/inventory/stock-summary' },
    { id: 'KPI-10', label: t.inventory.grn, value: '14', unit: 'this month', comparison: '2 pending approval', trend: 'UP', trendIsGood: true, route: '/inventory/goods-receipt' },
  ],
  PROCUREMENT_OFFICER: [
    { id: 'KPI-11', label: t.procurement.purchaseOrders, value: '18', unit: 'open', comparison: 'Order value ₹4.62 Cr', trend: 'UP', trendIsGood: true, route: '/procurement/purchase-orders' },
    { id: 'KPI-12', label: t.procurement.purchaseRequisitions, value: '5', unit: 'awaiting', comparison: 'Oldest pending 18 days', trend: 'UP', trendIsGood: false, route: '/procurement/purchase-requisitions' },
    { id: 'KPI-13', label: t.procurement.pendingQty, value: '32', unit: 'lines', comparison: 'Deliveries overdue on 6 orders', trend: 'DOWN', trendIsGood: true, route: '/procurement/purchase-orders' },
  ],
  ACCOUNTS: [
    { id: 'KPI-14', label: t.subcontract.netPayable, value: '2,86,42,180', unit: t.common.currencySymbol, comparison: '11 bills pending payment', trend: 'UP', trendIsGood: false, route: '/subcontract/bills' },
    { id: 'KPI-15', label: t.procurement.purchaseInvoiceCapture, value: '6', unit: 'unposted', comparison: 'Value ₹18.42 Lakh', trend: 'FLAT', route: '/procurement/purchase-invoice-capture' },
    { id: 'KPI-16', label: t.project.retentionHeld, value: '64.28', unit: t.common.inLakh, comparison: 'Across 8 subcontractors', trend: 'UP', trendIsGood: true, route: '/subcontract/deductions' },
  ],
  MANAGEMENT: [
    { id: 'KPI-17', label: t.project.orderBook, value: '460.60', unit: t.common.inCrore, comparison: '4 active projects', trend: 'UP', trendIsGood: true, route: '/order-book/order-book' },
    { id: 'KPI-18', label: t.masters.contractValue, value: '214.75', unit: t.common.inCrore, comparison: 'SH-19 Package II, largest order', trend: 'FLAT', route: '/masters/projects' },
    { id: 'KPI-19', label: t.masters.physicalProgress, value: '40.5', unit: '%', comparison: 'Weighted across all projects', trend: 'UP', trendIsGood: true, route: '/order-book/project-sales-mis' },
    { id: 'KPI-20', label: t.project.bgRetention, value: '38.42', unit: t.common.inCrore, comparison: '3 guarantees expiring in 90 days', trend: 'FLAT', route: '/project-controls/bg-retention' },
  ],
  ADMINISTRATOR: [
    { id: 'KPI-21', label: t.admin.users, value: '42', unit: 'active', comparison: '3 added this month', trend: 'UP', trendIsGood: true, route: '/administration/users' },
    { id: 'KPI-22', label: t.admin.approvalMatrix, value: '14', unit: 'rules', comparison: 'Across 9 document types', trend: 'FLAT', route: '/administration/approval-matrix' },
    { id: 'KPI-23', label: t.admin.auditLog, value: '1,284', unit: 'entries', comparison: 'Last 30 days', trend: 'UP', trendIsGood: true, route: '/administration/audit-log' },
  ],
  VENDOR: [
    { id: 'KPI-24', label: t.procurement.purchaseOrders, value: '3', unit: 'open', comparison: 'Value ₹48.62 Lakh', trend: 'FLAT', route: '/portals/vendor' },
    { id: 'KPI-25', label: t.procurement.pendingQty, value: '18.42', unit: 'MT', comparison: 'Steel pending dispatch', trend: 'DOWN', trendIsGood: true, route: '/portals/vendor' },
  ],
  SUBCONTRACTOR: [
    { id: 'KPI-26', label: t.subcontract.woValue, value: '1.84', unit: t.common.inCrore, comparison: 'Earthwork Km 36+000 to 42+000', trend: 'FLAT', route: '/portals/subcontractor' },
    { id: 'KPI-27', label: t.subcontract.netPayable, value: '34.59', unit: t.common.inLakh, comparison: 'RA Bill 04 under approval', trend: 'UP', trendIsGood: true, route: '/portals/subcontractor' },
  ],
};

export function approvalsFor(role: UserRole): PendingApprovalGroup[] {
  return approvalsByRole[role] ?? [];
}
export function tasksFor(role: UserRole): PendingTask[] {
  return tasksByRole[role] ?? [];
}
export function alertsFor(role: UserRole): AlertItem[] {
  return alertsByRole[role] ?? [];
}
export function kpisFor(role: UserRole): KpiValue[] {
  return kpisByRole[role] ?? [];
}
