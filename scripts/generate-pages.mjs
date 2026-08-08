/**
 * Generates a placeholder page for every navigation route.
 * Each generated page renders PlaceholderPage with the label read from the
 * terminology config (never a hardcoded string).
 *
 * Run with: node scripts/generate-pages.mjs
 */
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';

const ROOT = process.cwd();
const APP_DIR = join(ROOT, 'app', '(app)');

/**
 * [route, terminologyPath, groupTerminologyPath, helpTopic?]
 * terminologyPath is dot-notation into config/terminology.config.ts.
 */
const ROUTES = [
  // Masters
  ['/masters/companies', 'masters.companies', 'nav.groupMasters'],
  ['/masters/projects', 'masters.projects', 'nav.groupMasters'],
  ['/masters/sites-stores', 'masters.sitesStores', 'nav.groupMasters'],
  ['/masters/departments', 'masters.departments', 'nav.groupMasters'],
  ['/masters/employees', 'masters.employees', 'nav.groupMasters'],
  ['/masters/vendors', 'masters.vendors', 'nav.groupMasters'],
  ['/masters/subcontractors', 'masters.subcontractors', 'nav.groupMasters'],
  ['/masters/labour-contractors', 'masters.labourContractors', 'nav.groupMasters'],
  ['/masters/items', 'masters.items', 'nav.groupMasters'],
  ['/masters/uom', 'masters.uomFull', 'nav.groupMasters'],
  ['/masters/hsn-sac', 'masters.hsnSac', 'nav.groupMasters'],
  ['/masters/equipment', 'masters.equipment', 'nav.groupMasters'],
  ['/masters/wbs', 'masters.wbs', 'nav.groupMasters', 'wbs'],
  ['/masters/tax-categories', 'masters.taxCategories', 'nav.groupMasters'],
  ['/masters/document-categories', 'masters.documentCategories', 'nav.groupMasters'],

  // Project Controls
  ['/project-controls/project-dashboard', 'project.dashboard', 'nav.groupProjectControls'],
  ['/project-controls/contract-summary', 'project.contractSummary', 'nav.groupProjectControls'],
  ['/project-controls/wbs-budget', 'project.wbsBudget', 'nav.groupProjectControls', 'wbs'],
  ['/project-controls/daily-progress-report', 'project.dpr', 'nav.groupProjectControls', 'dpr'],
  ['/project-controls/hindrance-register', 'project.hindranceRegister', 'nav.groupProjectControls'],
  ['/project-controls/variation-register', 'project.variationRegister', 'nav.groupProjectControls'],
  ['/project-controls/claim-register', 'project.claimRegister', 'nav.groupProjectControls'],
  ['/project-controls/bg-retention', 'project.bgRetention', 'nav.groupProjectControls', 'retention'],

  // Procurement
  ['/procurement/purchase-requisitions', 'procurement.purchaseRequisitions', 'nav.groupProcurement', 'purchaseRequisition'],
  ['/procurement/rfq', 'procurement.rfq', 'nav.groupProcurement'],
  ['/procurement/vendor-quotations', 'procurement.vendorQuotations', 'nav.groupProcurement'],
  ['/procurement/quotation-comparison', 'procurement.quotationComparison', 'nav.groupProcurement'],
  ['/procurement/purchase-orders', 'procurement.purchaseOrders', 'nav.groupProcurement', 'purchaseOrder'],
  ['/procurement/purchase-invoice-capture', 'procurement.purchaseInvoiceCapture', 'nav.groupProcurement'],

  // Stores & Inventory
  ['/inventory/goods-receipt', 'inventory.grn', 'nav.groupInventory', 'grn'],
  ['/inventory/material-issue', 'inventory.materialIssue', 'nav.groupInventory', 'materialIssue'],
  ['/inventory/material-return', 'inventory.materialReturn', 'nav.groupInventory'],
  ['/inventory/stock-transfer', 'inventory.stockTransfer', 'nav.groupInventory'],
  ['/inventory/stock-adjustment', 'inventory.stockAdjustment', 'nav.groupInventory'],
  ['/inventory/stock-summary', 'inventory.stockSummary', 'nav.groupInventory'],
  ['/inventory/stock-ledger', 'inventory.stockLedger', 'nav.groupInventory'],
  ['/inventory/opening-stock', 'inventory.openingStock', 'nav.groupInventory'],

  // Subcontractors
  ['/subcontract/work-orders', 'subcontract.workOrders', 'nav.groupSubcontract', 'workOrder'],
  ['/subcontract/measurements', 'subcontract.measurements', 'nav.groupSubcontract', 'measurementSheet'],
  ['/subcontract/bills', 'subcontract.bills', 'nav.groupSubcontract'],
  ['/subcontract/deductions', 'subcontract.deductions', 'nav.groupSubcontract', 'tds'],

  // Plant & Fleet
  ['/plant/equipment-register', 'plant.equipmentRegister', 'nav.groupPlant'],
  ['/plant/deployment', 'plant.deployment', 'nav.groupPlant'],
  ['/plant/log-book', 'plant.logBook', 'nav.groupPlant'],
  ['/plant/fuel-issue', 'plant.fuelIssue', 'nav.groupPlant'],
  ['/plant/maintenance', 'plant.maintenance', 'nav.groupPlant'],
  ['/plant/breakdowns', 'plant.breakdowns', 'nav.groupPlant'],

  // HR & Labour
  ['/hr/employees', 'hr.employees', 'nav.groupHr'],
  ['/hr/attendance', 'hr.attendance', 'nav.groupHr'],
  ['/hr/leave', 'hr.leave', 'nav.groupHr'],
  ['/hr/payroll', 'hr.payroll', 'nav.groupHr'],
  ['/hr/salary-advances', 'hr.salaryAdvances', 'nav.groupHr'],
  ['/hr/expense-claims', 'hr.expenseClaims', 'nav.groupHr'],
  ['/hr/labour-attendance', 'hr.labourAttendance', 'nav.groupHr'],
  ['/hr/labour-compliance', 'hr.labourCompliance', 'nav.groupHr'],

  // Documents
  ['/documents/library', 'documents.library', 'nav.groupDocuments'],
  ['/documents/upload', 'documents.upload', 'nav.groupDocuments'],
  ['/documents/expiry-tracker', 'documents.expiryTracker', 'nav.groupDocuments'],

  // Order Book MIS
  ['/order-book/order-book', 'project.orderBook', 'nav.groupOrderBook'],
  ['/order-book/project-sales-mis', 'project.projectSalesMis', 'nav.groupOrderBook'],

  // Reports
  ['/reports/catalogue', 'reports.catalogue', 'nav.groupReports'],

  // Accounts Handover
  ['/accounts-handover/export-batches', 'reports.exportBatches', 'nav.groupHandover'],
  ['/accounts-handover/export-log', 'reports.exportLog', 'nav.groupHandover'],

  // Administration
  ['/administration/users', 'admin.users', 'nav.groupAdministration'],
  ['/administration/roles-permissions', 'admin.rolesPermissions', 'nav.groupAdministration'],
  ['/administration/approval-matrix', 'admin.approvalMatrix', 'nav.groupAdministration'],
  ['/administration/number-series', 'admin.numberSeries', 'nav.groupAdministration'],
  ['/administration/audit-log', 'admin.auditLog', 'nav.groupAdministration'],

  // External Portals
  ['/portals/vendor', 'admin.vendorPortal', 'nav.groupPortals'],
  ['/portals/subcontractor', 'admin.subcontractorPortal', 'nav.groupPortals'],
];

let written = 0;

for (const [route, labelPath, groupPath, helpTopic] of ROUTES) {
  const filePath = join(APP_DIR, route, 'page.tsx');
  mkdirSync(dirname(filePath), { recursive: true });

  const help = helpTopic ? `\n      helpTopic="${helpTopic}"` : '';
  const source = `import { PlaceholderPage } from '@/components/erp/placeholder-page';
import { terminology as t } from '@/config/terminology.config';

export const metadata = { title: t.${labelPath}, robots: { index: false, follow: false } };

export default function Page() {
  return (
    <PlaceholderPage
      title={t.${labelPath}}
      group={t.${groupPath}}${help}
    />
  );
}
`;
  writeFileSync(filePath, source, 'utf8');
  written += 1;
}

console.log(`Generated ${written} placeholder pages.`);
