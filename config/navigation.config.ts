/**
 * Navigation structure. Labels come from terminology.config.ts only.
 * `roles` limits visibility; omitting it means visible to all internal roles.
 */
import type { LucideIcon } from 'lucide-react';
import {
  Boxes,
  Building2,
  ClipboardList,
  Database,
  FileStack,
  Gauge,
  HardHat,
  Home,
  LineChart,
  Send,
  Settings,
  ShoppingCart,
  Truck,
  Users,
  Warehouse,
} from 'lucide-react';
import { terminology as t } from '@/config/terminology.config';
import type { UserRole } from '@/lib/data/types';

export interface NavItem {
  label: string;
  href: string;
  roles?: UserRole[];
}

export interface NavGroup {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  items?: NavItem[];
  roles?: UserRole[];
  /** Shown only to external users (vendor / subcontractor). */
  externalOnly?: boolean;
}

const INTERNAL: UserRole[] = [
  'ADMINISTRATOR',
  'PROJECT_MANAGER',
  'SITE_ENGINEER',
  'STORE_KEEPER',
  'PROCUREMENT_OFFICER',
  'ACCOUNTS',
  'MANAGEMENT',
];

export const navigation: NavGroup[] = [
  {
    id: 'home',
    label: t.nav.home,
    icon: Home,
    href: '/home',
  },
  {
    id: 'masters',
    label: t.nav.groupMasters,
    icon: Database,
    roles: ['ADMINISTRATOR', 'PROJECT_MANAGER', 'PROCUREMENT_OFFICER', 'ACCOUNTS', 'MANAGEMENT', 'STORE_KEEPER'],
    items: [
      { label: t.masters.companies, href: '/masters/companies', roles: ['ADMINISTRATOR', 'ACCOUNTS', 'MANAGEMENT'] },
      { label: t.masters.projects, href: '/masters/projects' },
      { label: t.masters.sitesStores, href: '/masters/sites-stores' },
      { label: t.masters.departments, href: '/masters/departments', roles: ['ADMINISTRATOR', 'ACCOUNTS'] },
      { label: t.masters.employees, href: '/masters/employees', roles: ['ADMINISTRATOR', 'PROJECT_MANAGER', 'ACCOUNTS'] },
      { label: t.masters.vendors, href: '/masters/vendors' },
      { label: t.masters.subcontractors, href: '/masters/subcontractors' },
      { label: t.masters.labourContractors, href: '/masters/labour-contractors' },
      { label: t.masters.items, href: '/masters/items' },
      { label: t.masters.uom, href: '/masters/uom' },
      { label: t.masters.hsnSac, href: '/masters/hsn-sac', roles: ['ADMINISTRATOR', 'ACCOUNTS', 'PROCUREMENT_OFFICER'] },
      { label: t.masters.equipment, href: '/masters/equipment' },
      { label: t.masters.wbs, href: '/masters/wbs' },
      { label: t.masters.taxCategories, href: '/masters/tax-categories', roles: ['ADMINISTRATOR', 'ACCOUNTS'] },
      { label: t.masters.documentCategories, href: '/masters/document-categories', roles: ['ADMINISTRATOR'] },
    ],
  },
  {
    id: 'project-controls',
    label: t.nav.groupProjectControls,
    icon: Gauge,
    roles: ['ADMINISTRATOR', 'PROJECT_MANAGER', 'SITE_ENGINEER', 'MANAGEMENT', 'ACCOUNTS'],
    items: [
      { label: t.project.dashboard, href: '/project-controls/project-dashboard' },
      { label: t.project.contractSummary, href: '/project-controls/contract-summary' },
      { label: t.project.wbsBudget, href: '/project-controls/wbs-budget' },
      { label: t.project.dpr, href: '/project-controls/daily-progress-report' },
      { label: t.project.hindranceRegister, href: '/project-controls/hindrance-register' },
      { label: t.project.variationRegister, href: '/project-controls/variation-register' },
      { label: t.project.claimRegister, href: '/project-controls/claim-register' },
      { label: t.project.bgRetention, href: '/project-controls/bg-retention' },
    ],
  },
  {
    id: 'procurement',
    label: t.nav.groupProcurement,
    icon: ShoppingCart,
    roles: ['ADMINISTRATOR', 'PROCUREMENT_OFFICER', 'PROJECT_MANAGER', 'SITE_ENGINEER', 'ACCOUNTS', 'MANAGEMENT'],
    items: [
      { label: t.procurement.purchaseRequisitions, href: '/procurement/purchase-requisitions' },
      { label: t.procurement.rfq, href: '/procurement/rfq', roles: ['ADMINISTRATOR', 'PROCUREMENT_OFFICER'] },
      { label: t.procurement.vendorQuotations, href: '/procurement/vendor-quotations', roles: ['ADMINISTRATOR', 'PROCUREMENT_OFFICER'] },
      { label: t.procurement.quotationComparison, href: '/procurement/quotation-comparison', roles: ['ADMINISTRATOR', 'PROCUREMENT_OFFICER', 'MANAGEMENT'] },
      { label: t.procurement.purchaseOrders, href: '/procurement/purchase-orders' },
      { label: t.procurement.purchaseInvoiceCapture, href: '/procurement/purchase-invoice-capture', roles: ['ADMINISTRATOR', 'ACCOUNTS'] },
    ],
  },
  {
    id: 'inventory',
    label: t.nav.groupInventory,
    icon: Warehouse,
    roles: ['ADMINISTRATOR', 'STORE_KEEPER', 'SITE_ENGINEER', 'PROJECT_MANAGER', 'ACCOUNTS', 'PROCUREMENT_OFFICER'],
    items: [
      { label: t.inventory.grn, href: '/inventory/goods-receipt' },
      { label: t.inventory.materialIssue, href: '/inventory/material-issue' },
      { label: t.inventory.materialReturn, href: '/inventory/material-return' },
      { label: t.inventory.stockTransfer, href: '/inventory/stock-transfer' },
      { label: t.inventory.stockAdjustment, href: '/inventory/stock-adjustment', roles: ['ADMINISTRATOR', 'STORE_KEEPER', 'ACCOUNTS'] },
      { label: t.inventory.stockSummary, href: '/inventory/stock-summary' },
      { label: t.inventory.stockLedger, href: '/inventory/stock-ledger' },
      { label: t.inventory.openingStock, href: '/inventory/opening-stock', roles: ['ADMINISTRATOR', 'STORE_KEEPER'] },
    ],
  },
  {
    id: 'subcontract',
    label: t.nav.groupSubcontract,
    icon: HardHat,
    roles: ['ADMINISTRATOR', 'PROJECT_MANAGER', 'SITE_ENGINEER', 'ACCOUNTS', 'MANAGEMENT'],
    items: [
      { label: t.subcontract.workOrders, href: '/subcontract/work-orders' },
      { label: t.subcontract.measurements, href: '/subcontract/measurements' },
      { label: t.subcontract.bills, href: '/subcontract/bills' },
      { label: t.subcontract.deductions, href: '/subcontract/deductions' },
    ],
  },
  {
    id: 'plant',
    label: t.nav.groupPlant,
    icon: Truck,
    roles: ['ADMINISTRATOR', 'PROJECT_MANAGER', 'SITE_ENGINEER', 'STORE_KEEPER', 'ACCOUNTS', 'MANAGEMENT'],
    items: [
      { label: t.plant.equipmentRegister, href: '/plant/equipment-register' },
      { label: t.plant.deployment, href: '/plant/deployment' },
      { label: t.plant.logBook, href: '/plant/log-book' },
      { label: t.plant.fuelIssue, href: '/plant/fuel-issue' },
      { label: t.plant.maintenance, href: '/plant/maintenance' },
      { label: t.plant.breakdowns, href: '/plant/breakdowns' },
    ],
  },
  {
    id: 'hr',
    label: t.nav.groupHr,
    icon: Users,
    roles: ['ADMINISTRATOR', 'PROJECT_MANAGER', 'ACCOUNTS', 'SITE_ENGINEER', 'MANAGEMENT'],
    items: [
      { label: t.hr.employees, href: '/hr/employees' },
      { label: t.hr.attendance, href: '/hr/attendance' },
      { label: t.hr.leave, href: '/hr/leave' },
      { label: t.hr.payroll, href: '/hr/payroll', roles: ['ADMINISTRATOR', 'ACCOUNTS'] },
      { label: t.hr.salaryAdvances, href: '/hr/salary-advances', roles: ['ADMINISTRATOR', 'ACCOUNTS'] },
      { label: t.hr.expenseClaims, href: '/hr/expense-claims' },
      { label: t.hr.labourAttendance, href: '/hr/labour-attendance' },
      { label: t.hr.labourCompliance, href: '/hr/labour-compliance', roles: ['ADMINISTRATOR', 'ACCOUNTS', 'PROJECT_MANAGER'] },
    ],
  },
  {
    id: 'documents',
    label: t.nav.groupDocuments,
    icon: FileStack,
    items: [
      { label: t.documents.library, href: '/documents/library' },
      { label: t.documents.upload, href: '/documents/upload' },
      { label: t.documents.expiryTracker, href: '/documents/expiry-tracker' },
    ],
  },
  {
    id: 'order-book',
    label: t.nav.groupOrderBook,
    icon: LineChart,
    roles: ['ADMINISTRATOR', 'MANAGEMENT', 'ACCOUNTS', 'PROJECT_MANAGER'],
    items: [
      { label: t.project.orderBook, href: '/order-book/order-book' },
      { label: t.project.projectSalesMis, href: '/order-book/project-sales-mis' },
    ],
  },
  {
    id: 'reports',
    label: t.nav.groupReports,
    icon: ClipboardList,
    roles: INTERNAL,
    items: [{ label: t.reports.catalogue, href: '/reports/catalogue' }],
  },
  {
    id: 'handover',
    label: t.nav.groupHandover,
    icon: Send,
    roles: ['ADMINISTRATOR', 'ACCOUNTS'],
    items: [
      { label: t.reports.exportBatches, href: '/accounts-handover/export-batches' },
      { label: t.reports.exportLog, href: '/accounts-handover/export-log' },
    ],
  },
  {
    id: 'administration',
    label: t.nav.groupAdministration,
    icon: Settings,
    roles: ['ADMINISTRATOR'],
    items: [
      { label: t.admin.users, href: '/administration/users' },
      { label: t.admin.rolesPermissions, href: '/administration/roles-permissions' },
      { label: t.admin.approvalMatrix, href: '/administration/approval-matrix' },
      { label: t.admin.numberSeries, href: '/administration/number-series' },
      { label: t.admin.auditLog, href: '/administration/audit-log' },
    ],
  },
  {
    id: 'portals',
    label: t.nav.groupPortals,
    icon: Building2,
    externalOnly: true,
    items: [
      { label: t.admin.vendorPortal, href: '/portals/vendor', roles: ['VENDOR', 'ADMINISTRATOR'] },
      { label: t.admin.subcontractorPortal, href: '/portals/subcontractor', roles: ['SUBCONTRACTOR', 'ADMINISTRATOR'] },
    ],
  },
  {
    id: 'showcase',
    label: t.nav.showcase,
    icon: Boxes,
    href: '/_showcase',
    roles: ['ADMINISTRATOR'],
  },
];

/** Filters the navigation tree for a role, dropping empty groups. */
export function navigationForRole(role: UserRole): NavGroup[] {
  const isExternal = role === 'VENDOR' || role === 'SUBCONTRACTOR';

  return navigation
    .filter((group) => {
      if (group.externalOnly) return isExternal || role === 'ADMINISTRATOR';
      if (isExternal) return group.id === 'home' || group.id === 'documents';
      return !group.roles || group.roles.includes(role);
    })
    .map((group) => {
      if (!group.items) return group;
      const items = group.items.filter((item) => !item.roles || item.roles.includes(role));
      return { ...group, items };
    })
    .filter((group) => group.href || (group.items && group.items.length > 0));
}

/** Resolves a route to its breadcrumb trail. */
export function breadcrumbFor(pathname: string): { label: string; href?: string }[] {
  if (pathname === '/home' || pathname === '/') return [{ label: t.nav.home }];

  for (const group of navigation) {
    if (group.href && group.href === pathname) return [{ label: group.label }];
    const match = group.items?.find((i) => i.href === pathname);
    if (match) return [{ label: group.label }, { label: match.label }];
  }
  return [{ label: t.nav.home, href: '/home' }];
}

/** Flat list of every route, used to generate placeholder pages. */
export function allRoutes(): { href: string; label: string; group: string }[] {
  const out: { href: string; label: string; group: string }[] = [];
  navigation.forEach((g) => {
    if (g.href) out.push({ href: g.href, label: g.label, group: g.label });
    g.items?.forEach((i) => out.push({ href: i.href, label: i.label, group: g.label }));
  });
  return out;
}
