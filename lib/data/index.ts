/**
 * =============================================================================
 * DATA ACCESS LAYER — the ONLY module screens may import data from.
 * =============================================================================
 *
 * Every export is async and returns a typed result, so this fixture-backed
 * implementation can be replaced by a database/API adapter later without
 * touching a single screen.
 *
 * Screens must NEVER import from ./adapters/* directly.
 */
import {
  companies as fxCompanies,
  departments as fxDepartments,
  employees as fxEmployees,
  projects as fxProjects,
  sites as fxSites,
} from './adapters/fixtures/org';
import {
  equipment as fxEquipment,
  hsnSacCodes as fxHsnSac,
  items as fxItems,
  stockBalances as fxStock,
  subcontractors as fxSubcontractors,
  uoms as fxUoms,
  vendors as fxVendors,
  wbsNodes as fxWbs,
} from './adapters/fixtures/masters';
import {
  attachments as fxAttachments,
  auditEntries as fxAudit,
  documents as fxDocuments,
  notifications as fxNotifications,
  sampleLines as fxLines,
} from './adapters/fixtures/documents';
import {
  alertsFor,
  approvalsFor,
  demoUsers,
  kpisFor,
  tasksFor,
} from './adapters/fixtures/home';
import { store } from './store';
import type {
  AlertItem,
  Attachment,
  AuditEntry,
  Company,
  CurrentUser,
  Department,
  DocumentLine,
  DocumentSummary,
  Employee,
  Equipment,
  HsnSac,
  Item,
  KpiValue,
  ListParams,
  NotificationItem,
  Paged,
  PendingApprovalGroup,
  PendingTask,
  Project,
  Site,
  StockBalance,
  Subcontractor,
  Uom,
  UserRole,
  Vendor,
  WbsNode,
} from './types';

export type * from './types';
export { store } from './store';

const SESSION_KEY = 'session';

/** Simulated latency so screens exercise their loading states. */
function resolve<T>(value: T, ms = 90): Promise<T> {
  return new Promise((r) => setTimeout(() => r(value), ms));
}

function paginate<T>(rows: T[], params?: ListParams): Paged<T> {
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 25;
  const start = (page - 1) * pageSize;
  return { rows: rows.slice(start, start + pageSize), total: rows.length, page, pageSize };
}

function matchesText(haystack: string[], needle?: string): boolean {
  if (!needle) return true;
  const q = needle.trim().toLowerCase();
  if (!q) return true;
  return haystack.some((h) => h.toLowerCase().includes(q));
}

// ===========================================================================
// Session / current user
// ===========================================================================
interface SessionState {
  role: UserRole;
  companyId: string;
  projectId: string | null;
}

export async function getCurrentUser(): Promise<CurrentUser> {
  const session = store.getPreference<SessionState | null>(SESSION_KEY, null);
  const role: UserRole = session?.role ?? 'PROJECT_MANAGER';
  const base = demoUsers[role];
  return resolve<CurrentUser>({
    ...base,
    companyId: session?.companyId ?? base.companyId,
    projectId: session?.projectId ?? base.projectId,
  });
}

export async function setSession(next: Partial<SessionState>): Promise<void> {
  const current = store.getPreference<SessionState>(SESSION_KEY, {
    role: 'PROJECT_MANAGER',
    companyId: 'CMP-UIE',
    projectId: 'PRJ-SH19',
  });
  store.setPreference<SessionState>(SESSION_KEY, { ...current, ...next });
  return resolve(undefined, 0);
}

export async function listRoles(): Promise<{ role: UserRole; label: string; name: string }[]> {
  return resolve(
    (Object.keys(demoUsers) as UserRole[]).map((role) => ({
      role,
      label: demoUsers[role].roleLabel,
      name: demoUsers[role].name,
    })),
  );
}

// ===========================================================================
// Organisation
// ===========================================================================
export async function listCompanies(): Promise<Company[]> {
  return resolve(fxCompanies);
}

export async function getCompany(id: string): Promise<Company | null> {
  return resolve(fxCompanies.find((c) => c.id === id) ?? null);
}

export async function listProjects(params?: ListParams): Promise<Project[]> {
  let rows = fxProjects;
  if (params?.companyId) rows = rows.filter((p) => p.companyId === params.companyId);
  if (params?.search) rows = rows.filter((p) => matchesText([p.name, p.code, p.client], params.search));
  return resolve(rows);
}

export async function getProject(id: string): Promise<Project | null> {
  return resolve(fxProjects.find((p) => p.id === id) ?? null);
}

export async function listSites(params?: ListParams): Promise<Site[]> {
  let rows = fxSites;
  if (params?.companyId) rows = rows.filter((s) => s.companyId === params.companyId);
  if (params?.projectId) rows = rows.filter((s) => s.projectId === params.projectId || s.projectId === null);
  return resolve(rows);
}

export async function getSite(id: string): Promise<Site | null> {
  return resolve(fxSites.find((s) => s.id === id) ?? null);
}

export async function listDepartments(): Promise<Department[]> {
  return resolve(fxDepartments);
}

export async function listEmployees(params?: ListParams): Promise<Paged<Employee>> {
  let rows = fxEmployees;
  if (params?.companyId) rows = rows.filter((e) => e.companyId === params.companyId);
  if (params?.projectId) rows = rows.filter((e) => e.projectId === params.projectId);
  if (params?.search) rows = rows.filter((e) => matchesText([e.name, e.code, e.designation], params.search));
  return resolve(paginate(rows, params));
}

export async function getEmployee(id: string): Promise<Employee | null> {
  return resolve(fxEmployees.find((e) => e.id === id) ?? null);
}

// ===========================================================================
// Parties
// ===========================================================================
export async function listVendors(params?: ListParams): Promise<Paged<Vendor>> {
  let rows = fxVendors;
  if (params?.group) rows = rows.filter((v) => v.category === params.group);
  if (params?.search) rows = rows.filter((v) => matchesText([v.name, v.code, v.gstin, v.city], params.search));
  return resolve(paginate(rows, params));
}

export async function getVendor(id: string): Promise<Vendor | null> {
  return resolve(fxVendors.find((v) => v.id === id) ?? null);
}

export async function listSubcontractors(params?: ListParams): Promise<Paged<Subcontractor>> {
  let rows = fxSubcontractors;
  if (params?.group) rows = rows.filter((s) => s.trade === params.group);
  if (params?.search) rows = rows.filter((s) => matchesText([s.name, s.code, s.contactPerson], params.search));
  return resolve(paginate(rows, params));
}

// ===========================================================================
// Item & inventory masters
// ===========================================================================
export async function listItems(params?: ListParams): Promise<Paged<Item>> {
  let rows = fxItems;
  if (params?.group && params.group !== 'ALL') rows = rows.filter((i) => i.group === params.group);
  if (params?.subGroup) rows = rows.filter((i) => i.subGroup === params.subGroup);
  if (params?.itemType && params.itemType !== 'ALL')
    rows = rows.filter((i) => i.itemType === params.itemType);
  if (params?.isActive !== undefined) rows = rows.filter((i) => i.isActive === params.isActive);
  if (params?.search)
    rows = rows.filter((i) => matchesText([i.name, i.code, i.specification, i.hsnCode], params.search));
  const sortBy = params?.sortBy;
  if (sortBy) {
    const dir = params?.sortDir === 'desc' ? -1 : 1;
    rows = [...rows].sort((a, b) => {
      const av = String((a as unknown as Record<string, unknown>)[sortBy] ?? '');
      const bv = String((b as unknown as Record<string, unknown>)[sortBy] ?? '');
      return av.localeCompare(bv, 'en-IN', { numeric: true }) * dir;
    });
  }
  return resolve(paginate(rows, params));
}

export async function getItem(id: string): Promise<Item | null> {
  return resolve(fxItems.find((i) => i.id === id) ?? null);
}

export async function listUoms(params?: ListParams): Promise<Uom[]> {
  let rows = fxUoms;
  if (params?.category && params.category !== 'ALL')
    rows = rows.filter((u) => u.category === params.category);
  if (params?.isActive !== undefined)
    rows = rows.filter((u) => (u.isActive ?? true) === params.isActive);
  if (params?.search) rows = rows.filter((u) => matchesText([u.code, u.name], params.search));
  return resolve(rows);
}

export async function listHsnSac(params?: ListParams): Promise<HsnSac[]> {
  let rows = fxHsnSac;
  if (params?.group && params.group !== 'ALL') rows = rows.filter((h) => h.kind === params.group);
  if (params?.isActive !== undefined)
    rows = rows.filter((h) => (h.isActive ?? true) === params.isActive);
  if (params?.search) rows = rows.filter((h) => matchesText([h.code, h.description], params.search));
  return resolve(rows);
}

export async function listStockBalances(params?: ListParams): Promise<Paged<StockBalance>> {
  let rows = fxStock;
  if (params?.siteId) rows = rows.filter((s) => s.siteId === params.siteId);
  if (params?.search) rows = rows.filter((s) => matchesText([s.itemName, s.itemCode], params.search));
  return resolve(paginate(rows, params));
}

export async function listLowStock(): Promise<StockBalance[]> {
  return resolve(fxStock.filter((s) => s.reorderLevel > 0 && s.quantity < s.reorderLevel));
}

// ===========================================================================
// Plant & WBS
// ===========================================================================
export async function listEquipment(params?: ListParams): Promise<Paged<Equipment>> {
  let rows = fxEquipment;
  if (params?.projectId) rows = rows.filter((e) => e.projectId === params.projectId);
  if (params?.search) rows = rows.filter((e) => matchesText([e.name, e.code, e.registrationNo ?? ''], params.search));
  return resolve(paginate(rows, params));
}

export async function listWbsNodes(projectId: string): Promise<WbsNode[]> {
  return resolve(fxWbs.filter((w) => w.projectId === projectId));
}

// ===========================================================================
// Documents
// ===========================================================================
export async function listDocuments(params?: ListParams): Promise<Paged<DocumentSummary>> {
  let rows = fxDocuments;
  if (params?.companyId) rows = rows.filter((d) => d.companyId === params.companyId);
  if (params?.projectId) rows = rows.filter((d) => d.projectId === params.projectId);
  if (params?.status && params.status !== 'ALL') rows = rows.filter((d) => d.status === params.status);
  if (params?.search)
    rows = rows.filter((d) => matchesText([d.documentNo, d.title, d.partyName ?? '', d.createdByName], params.search));
  if (params?.fromDate) rows = rows.filter((d) => d.date >= params.fromDate!);
  if (params?.toDate) rows = rows.filter((d) => d.date <= params.toDate!);
  const sorted = [...rows].sort((a, b) => (a.date < b.date ? 1 : -1));
  return resolve(paginate(sorted, params));
}

export async function getDocument(id: string): Promise<DocumentSummary | null> {
  return resolve(fxDocuments.find((d) => d.id === id) ?? null);
}

export async function listDocumentLines(_documentId: string): Promise<DocumentLine[]> {
  return resolve(fxLines);
}

export async function listAttachments(entityKey: string, entityId: string): Promise<Attachment[]> {
  return resolve(fxAttachments.filter((a) => a.entityKey === entityKey && a.entityId === entityId));
}

export async function listExpiringAttachments(withinDays: number): Promise<Attachment[]> {
  const limit = new Date();
  limit.setDate(limit.getDate() + withinDays);
  return resolve(
    fxAttachments.filter((a) => a.expiryDate && new Date(a.expiryDate) <= limit),
  );
}

export async function listAuditEntries(entityKey: string, entityId: string): Promise<AuditEntry[]> {
  return resolve(
    fxAudit
      .filter((a) => a.entityKey === entityKey && a.entityId === entityId)
      .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1)),
  );
}

export async function listNotifications(): Promise<NotificationItem[]> {
  return resolve(fxNotifications);
}

export async function countUnreadNotifications(): Promise<number> {
  return resolve(fxNotifications.filter((n) => !n.isRead).length);
}

// ===========================================================================
// Home page feeds
// ===========================================================================
export async function listPendingApprovals(role: UserRole): Promise<PendingApprovalGroup[]> {
  return resolve(approvalsFor(role));
}

export async function listMyPendingTasks(role: UserRole): Promise<PendingTask[]> {
  return resolve(tasksFor(role));
}

export async function listAlerts(role: UserRole): Promise<AlertItem[]> {
  return resolve(alertsFor(role));
}

export async function listKpis(role: UserRole): Promise<KpiValue[]> {
  return resolve(kpisFor(role));
}

// ===========================================================================
// Generic persistence for records created in the demo
// ===========================================================================
export async function createRecord<T extends { id: string }>(
  entityKey: string,
  record: Omit<T, 'id'> & { id?: string },
): Promise<T> {
  return resolve(store.create<T & { [k: string]: unknown }>(entityKey, record) as T, 0);
}

export async function updateRecord<T extends { id: string }>(
  entityKey: string,
  id: string,
  patch: Partial<T>,
): Promise<T | null> {
  return resolve((store.update<T & { [k: string]: unknown }>(entityKey, id, patch) as T) ?? null, 0);
}

export async function listRecords<T extends { id: string }>(entityKey: string): Promise<T[]> {
  return resolve(store.list<T & { [k: string]: unknown }>(entityKey) as unknown as T[], 0);
}

export async function removeRecord(entityKey: string, id: string): Promise<boolean> {
  return resolve(store.remove(entityKey, id), 0);
}
