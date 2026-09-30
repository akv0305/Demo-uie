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

import { dailyProgressReports as fxDprs } from './adapters/fixtures/progress';
import { hindrances as fxHindrances } from './adapters/fixtures/hindrances';
import { variations as fxVariations } from './adapters/fixtures/variations';
import { claims as fxClaims } from './adapters/fixtures/claims';
import {
  bankGuarantees as fxBgs,
  retentionEntries as fxRetention,
} from './adapters/fixtures/bg-retention';

import { purchaseRequisitions as fxPrs } from './adapters/fixtures/procurement';
import { rfqs as fxRfqs } from './adapters/fixtures/rfqs';
import { quotations as fxQuotations } from './adapters/fixtures/quotations';
import { purchaseOrders as fxPos } from './adapters/fixtures/purchase-orders';

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
  DailyProgressReport,
  Hindrance,
  Variation,
  Claim,
  BankGuarantee,
  RetentionEntry,
  PurchaseRequisition,
  Rfq,
  Quotation,
  PurchaseOrder,
} from './types';

export type * from './types';
export { store } from './store';

// ===========================================================================
// Daily progress
// ===========================================================================
export async function listDprs(params?: ListParams): Promise<Paged<DailyProgressReport>> {
  let rows = fxDprs;
  if (params?.projectId) rows = rows.filter((d) => d.projectId === params.projectId);
  if (params?.status && params.status !== 'ALL') rows = rows.filter((d) => d.status === params.status);
  if (params?.fromDate) rows = rows.filter((d) => d.date >= params.fromDate!);
  if (params?.toDate) rows = rows.filter((d) => d.date <= params.toDate!);
  if (params?.search)
    rows = rows.filter((d) => matchesText([d.documentNo, d.preparedByName, d.generalRemarks ?? ''], params.search));
  const sorted = [...rows].sort((a, b) => (a.date < b.date ? 1 : -1));
  return resolve(paginate(sorted, params));
}

export async function getDpr(id: string): Promise<DailyProgressReport | null> {
  return resolve(fxDprs.find((d) => d.id === id) ?? null);
}


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

/** Fixture rows plus anything uploaded during the demo session. */
function allAttachments(): Attachment[] {
  const created = store.list<Attachment & { [k: string]: unknown }>(
    'attachments',
  ) as unknown as Attachment[];
  return created.length ? [...fxAttachments, ...created] : fxAttachments;
}

/** Every file in the library. entityKey/entityId filter is optional here. */
export async function listDocumentFiles(params?: ListParams): Promise<Paged<Attachment>> {
  let rows = allAttachments();
  if (params?.group && params.group !== 'ALL') rows = rows.filter((a) => a.category === params.group);
  if (params?.search)
    rows = rows.filter((a) => matchesText([a.fileName, a.category, a.uploadedByName], params.search));
  if (params?.fromDate) rows = rows.filter((a) => a.uploadedOn >= params.fromDate!);
  if (params?.toDate) rows = rows.filter((a) => a.uploadedOn <= params.toDate!);
  const sorted = [...rows].sort((a, b) => (a.uploadedOn < b.uploadedOn ? 1 : -1));
  return resolve(paginate(sorted, params));
}

export async function listAttachmentCategories(): Promise<string[]> {
  return resolve([...new Set(allAttachments().map((a) => a.category))].sort());
}

/** Documents with an expiry date, already expired or due within `withinDays`. */
export async function listExpiringAttachments(withinDays: number): Promise<Attachment[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const limit = new Date(today);
  limit.setDate(limit.getDate() + withinDays);
  return resolve(
    allAttachments()
      .filter((a) => a.expiryDate && new Date(a.expiryDate) <= limit)
      .sort((a, b) => (a.expiryDate! < b.expiryDate! ? -1 : 1)),
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

// ===========================================================================
// Hindrance register
// ===========================================================================
/**
 * Fixture rows plus anything raised during the demo session. A stored row with
 * the same id overrides its fixture, which is how an edit to a seeded record
 * survives a reload (DEF-044).
 */
function allHindrances(): Hindrance[] {
  const created = store.list<Hindrance & { [k: string]: unknown }>(
    'hindrances',
  ) as unknown as Hindrance[];
  if (!created.length) return fxHindrances;
  const overridden = new Set(created.map((h) => h.id));
  return [...created, ...fxHindrances.filter((h) => !overridden.has(h.id))];
}

/**
 * Edits a hindrance whether it came from a fixture or from this session.
 * store.update only knows rows the store created, so a fixture row is copied
 * into the store on first edit.
 */
export async function saveHindrance(id: string, patch: Partial<Hindrance>): Promise<Hindrance | null> {
  const updated = store.update<Hindrance & { [k: string]: unknown }>('hindrances', id, patch);
  if (updated) return resolve(updated as Hindrance, 0);
  const base = fxHindrances.find((h) => h.id === id);
  if (!base) return resolve(null, 0);
  return resolve(
    store.create<Hindrance & { [k: string]: unknown }>('hindrances', {
      ...base,
      ...patch,
      id,
    }) as Hindrance,
    0,
  );
}

export async function listHindrances(params?: ListParams): Promise<Paged<Hindrance>> {
  let rows = allHindrances();
  if (params?.projectId) rows = rows.filter((h) => h.projectId === params.projectId);
  if (params?.status && params.status !== 'ALL') rows = rows.filter((h) => h.status === params.status);
  if (params?.group && params.group !== 'ALL') rows = rows.filter((h) => h.category === params.group);
  if (params?.search)
    rows = rows.filter((h) => matchesText([h.documentNo, h.description, h.location ?? ''], params.search));
  const sorted = [...rows].sort((a, b) => (a.fromDate < b.fromDate ? 1 : -1));
  return resolve(paginate(sorted, params));
}

// ---------------------------------------------------------------------------
// Variations
// ---------------------------------------------------------------------------

/** Fixture rows plus anything raised in this session; a stored row wins on id. */
function allVariations(): Variation[] {
  const created = store.list<Variation & { [k: string]: unknown }>(
    'variations',
  ) as unknown as Variation[];
  if (!created.length) return fxVariations;
  const overridden = new Set(created.map((v) => v.id));
  return [...created, ...fxVariations.filter((v) => !overridden.has(v.id))];
}

export async function listVariations(params?: ListParams): Promise<Paged<Variation>> {
  let rows = allVariations();
  if (params?.projectId) rows = rows.filter((v) => v.projectId === params.projectId);
  if (params?.status && params.status !== 'ALL') rows = rows.filter((v) => v.status === params.status);
  if (params?.group && params.group !== 'ALL') rows = rows.filter((v) => v.category === params.group);
  if (params?.search)
    rows = rows.filter((v) =>
      matchesText([v.documentNo, v.description, v.location ?? '', v.clientRefNo ?? ''], params.search),
    );
  const sorted = [...rows].sort((a, b) => (a.date < b.date ? 1 : -1));
  return resolve(paginate(sorted, params));
}

/** Edits a variation whether it came from a fixture or from this session. */
export async function saveVariation(id: string, patch: Partial<Variation>): Promise<Variation | null> {
  const updated = store.update<Variation & { [k: string]: unknown }>('variations', id, patch);
  if (updated) return resolve(updated as Variation, 0);
  const base = fxVariations.find((v) => v.id === id);
  if (!base) return resolve(null, 0);
  return resolve(
    store.create<Variation & { [k: string]: unknown }>('variations', { ...base, ...patch, id }) as Variation,
    0,
  );
}

// ---------------------------------------------------------------------------
// Claims
// ---------------------------------------------------------------------------

/** Fixture rows plus anything raised in this session; a stored row wins on id. */
function allClaims(): Claim[] {
  const created = store.list<Claim & { [k: string]: unknown }>('claims') as unknown as Claim[];
  if (!created.length) return fxClaims;
  const overridden = new Set(created.map((c) => c.id));
  return [...created, ...fxClaims.filter((c) => !overridden.has(c.id))];
}

export async function listClaims(params?: ListParams): Promise<Paged<Claim>> {
  let rows = allClaims();
  if (params?.projectId) rows = rows.filter((c) => c.projectId === params.projectId);
  if (params?.status && params.status !== 'ALL') rows = rows.filter((c) => c.status === params.status);
  if (params?.group && params.group !== 'ALL') rows = rows.filter((c) => c.type === params.group);
  if (params?.category && params.category !== 'ALL')
    rows = rows.filter((c) => c.stage === params.category);
  if (params?.search)
    rows = rows.filter((c) =>
      matchesText([c.documentNo, c.title, c.description, c.noticeRefNo ?? ''], params.search),
    );
  const sorted = [...rows].sort((a, b) => (a.date < b.date ? 1 : -1));
  return resolve(paginate(sorted, params));
}

/** Edits a claim whether it came from a fixture or from this session. */
export async function saveClaim(id: string, patch: Partial<Claim>): Promise<Claim | null> {
  const updated = store.update<Claim & { [k: string]: unknown }>('claims', id, patch);
  if (updated) return resolve(updated as Claim, 0);
  const base = fxClaims.find((c) => c.id === id);
  if (!base) return resolve(null, 0);
  return resolve(
    store.create<Claim & { [k: string]: unknown }>('claims', { ...base, ...patch, id }) as Claim,
    0,
  );
}

// ---------------------------------------------------------------------------
// Bank guarantees & retention
// ---------------------------------------------------------------------------

/** Fixture rows plus anything raised in this session; a stored row wins on id. */
function allBankGuarantees(): BankGuarantee[] {
  const created = store.list<BankGuarantee & { [k: string]: unknown }>(
    'bankGuarantees',
  ) as unknown as BankGuarantee[];
  if (!created.length) return fxBgs;
  const overridden = new Set(created.map((b) => b.id));
  return [...created, ...fxBgs.filter((b) => !overridden.has(b.id))];
}

export async function listBankGuarantees(params?: ListParams): Promise<Paged<BankGuarantee>> {
  let rows = allBankGuarantees();
  if (params?.projectId) rows = rows.filter((b) => b.projectId === params.projectId);
  if (params?.status && params.status !== 'ALL') rows = rows.filter((b) => b.status === params.status);
  if (params?.group && params.group !== 'ALL') rows = rows.filter((b) => b.type === params.group);
  if (params?.category && params.category !== 'ALL')
    rows = rows.filter((b) => b.bgStatus === params.category);
  if (params?.search)
    rows = rows.filter((b) =>
      matchesText([b.documentNo, b.bgNumber, b.bankName, b.beneficiary], params.search),
    );
  // Soonest expiry first — the register exists to catch lapses.
  const sorted = [...rows].sort((a, b) => (a.validUpto < b.validUpto ? -1 : 1));
  return resolve(paginate(sorted, params));
}

/** Edits a guarantee whether it came from a fixture or from this session. */
export async function saveBankGuarantee(
  id: string,
  patch: Partial<BankGuarantee>,
): Promise<BankGuarantee | null> {
  const updated = store.update<BankGuarantee & { [k: string]: unknown }>('bankGuarantees', id, patch);
  if (updated) return resolve(updated as BankGuarantee, 0);
  const base = fxBgs.find((b) => b.id === id);
  if (!base) return resolve(null, 0);
  return resolve(
    store.create<BankGuarantee & { [k: string]: unknown }>('bankGuarantees', {
      ...base,
      ...patch,
      id,
    }) as BankGuarantee,
    0,
  );
}

/**
 * Retention movements. Read-only in Phase 1 — entries arise from running
 * account bills, which the billing module will raise.
 */
export async function listRetentionEntries(params?: ListParams): Promise<RetentionEntry[]> {
  let rows = fxRetention;
  if (params?.projectId) rows = rows.filter((r) => r.projectId === params.projectId);
  return resolve([...rows].sort((a, b) => (a.date < b.date ? -1 : 1)));
}

// ---------------------------------------------------------------------------
// Procurement — purchase requisitions
// ---------------------------------------------------------------------------

/** Fixture rows plus anything raised in this session; a stored row wins on id. */
function allPurchaseRequisitions(): PurchaseRequisition[] {
  const created = store.list<PurchaseRequisition & { [k: string]: unknown }>(
    'purchaseRequisitions',
  ) as unknown as PurchaseRequisition[];
  if (!created.length) return fxPrs;
  const overridden = new Set(created.map((p) => p.id));
  return [...created, ...fxPrs.filter((p) => !overridden.has(p.id))];
}

export async function listPurchaseRequisitions(
  params?: ListParams,
): Promise<Paged<PurchaseRequisition>> {
  let rows = allPurchaseRequisitions();
  if (params?.projectId) rows = rows.filter((p) => p.projectId === params.projectId);
  if (params?.status && params.status !== 'ALL') rows = rows.filter((p) => p.status === params.status);
  if (params?.category && params.category !== 'ALL')
    rows = rows.filter((p) => p.priority === params.category);
  if (params?.search)
    rows = rows.filter((p) =>
      matchesText(
        [p.documentNo, p.justification ?? '', ...p.lines.map((l) => l.description)],
        params.search,
      ),
    );
  // Newest first — the register is worked from the top.
  const sorted = [...rows].sort((a, b) => (a.date > b.date ? -1 : 1));
  return resolve(paginate(sorted, params));
}

/** Edits a requisition whether it came from a fixture or from this session. */
export async function savePurchaseRequisition(
  id: string,
  patch: Partial<PurchaseRequisition>,
): Promise<PurchaseRequisition | null> {
  const updated = store.update<PurchaseRequisition & { [k: string]: unknown }>(
    'purchaseRequisitions',
    id,
    patch,
  );
  if (updated) return resolve(updated as PurchaseRequisition, 0);
  const base = fxPrs.find((p) => p.id === id);
  if (!base) return resolve(null, 0);
  return resolve(
    store.create<PurchaseRequisition & { [k: string]: unknown }>('purchaseRequisitions', {
      ...base,
      ...patch,
      id,
    }) as PurchaseRequisition,
    0,
  );
}

// ===========================================================================
// Procurement — RFQ / enquiry
// ===========================================================================
function allRfqs(): Rfq[] {
  const created = store.list<Rfq & { [k: string]: unknown }>('rfqs') as unknown as Rfq[];
  if (!created.length) return fxRfqs;
  const overridden = new Set(created.map((r: Rfq) => r.id));
  return [...created, ...fxRfqs.filter((r: Rfq) => !overridden.has(r.id))];
}

export async function listRfqs(params?: ListParams): Promise<Paged<Rfq>> {
  let rows: Rfq[] = allRfqs();
  if (params?.projectId) rows = rows.filter((r) => r.projectId === params.projectId);
  if (params?.status && params.status !== 'ALL') rows = rows.filter((r) => r.status === params.status);
  if (params?.search)
    rows = rows.filter((r) =>
      matchesText(
        [r.documentNo, r.title, ...r.lines.map((l) => l.description), ...r.vendors.map((v) => v.vendorName)],
        params.search,
      ),
    );
  const sorted = [...rows].sort((a, b) => (a.date < b.date ? 1 : -1));
  return resolve(paginate(sorted, params));
}

export async function getRfq(id: string): Promise<Rfq | null> {
  return resolve(allRfqs().find((r) => r.id === id) ?? null);
}

/** Edits an enquiry whether it came from a fixture or from this session. */
export async function saveRfq(id: string, patch: Partial<Rfq>): Promise<Rfq | null> {
  const updated = store.update<Rfq & { [k: string]: unknown }>('rfqs', id, patch);
  if (updated) return resolve(updated as Rfq, 0);
  const base = fxRfqs.find((r: Rfq) => r.id === id);
  if (!base) return resolve(null, 0);
  return resolve(
    store.create<Rfq & { [k: string]: unknown }>('rfqs', { ...base, ...patch, id }) as Rfq,
    0,
  );
}

// ===========================================================================
// Procurement — vendor quotations
// ===========================================================================
function allQuotations(): Quotation[] {
  const created = store.list<Quotation & { [k: string]: unknown }>('quotations') as unknown as Quotation[];
  if (!created.length) return fxQuotations;
  const overridden = new Set(created.map((q: Quotation) => q.id));
  return [...created, ...fxQuotations.filter((q: Quotation) => !overridden.has(q.id))];
}

export async function listQuotations(
  params?: ListParams & { rfqId?: string; vendorId?: string },
): Promise<Paged<Quotation>> {
  let rows: Quotation[] = allQuotations();
  if (params?.projectId) rows = rows.filter((q) => q.projectId === params.projectId);
  if (params?.rfqId) rows = rows.filter((q) => q.rfqId === params.rfqId);
  if (params?.vendorId) rows = rows.filter((q) => q.vendorId === params.vendorId);
  if (params?.status && params.status !== 'ALL') rows = rows.filter((q) => q.status === params.status);
  if (params?.search)
    rows = rows.filter((q) =>
      matchesText([q.documentNo, q.vendorName, q.vendorRefNo ?? '', ...q.lines.map((l) => l.description)], params.search),
    );
  const sorted = [...rows].sort((a, b) => (a.date < b.date ? 1 : -1));
  return resolve(paginate(sorted, params));
}

export async function getQuotation(id: string): Promise<Quotation | null> {
  return resolve(allQuotations().find((q) => q.id === id) ?? null);
}

export async function saveQuotation(id: string, patch: Partial<Quotation>): Promise<Quotation | null> {
  const updated = store.update<Quotation & { [k: string]: unknown }>('quotations', id, patch);
  if (updated) return resolve(updated as Quotation, 0);
  const base = fxQuotations.find((q: Quotation) => q.id === id);
  if (!base) return resolve(null, 0);
  return resolve(
    store.create<Quotation & { [k: string]: unknown }>('quotations', { ...base, ...patch, id }) as Quotation,
    0,
  );
}

// ===========================================================================
// Procurement — purchase orders
// ===========================================================================
function allPurchaseOrders(): PurchaseOrder[] {
  const created = store.list<PurchaseOrder & { [k: string]: unknown }>('purchaseOrders') as unknown as PurchaseOrder[];
  if (!created.length) return fxPos;
  const overridden = new Set(created.map((p: PurchaseOrder) => p.id));
  return [...created, ...fxPos.filter((p: PurchaseOrder) => !overridden.has(p.id))];
}

export async function listPurchaseOrders(
  params?: ListParams & { vendorId?: string; rfqId?: string },
): Promise<Paged<PurchaseOrder>> {
  let rows: PurchaseOrder[] = allPurchaseOrders();
  if (params?.projectId) rows = rows.filter((p) => p.projectId === params.projectId);
  if (params?.vendorId) rows = rows.filter((p) => p.vendorId === params.vendorId);
  if (params?.rfqId) rows = rows.filter((p) => p.rfqId === params.rfqId);
  if (params?.status && params.status !== 'ALL') rows = rows.filter((p) => p.status === params.status);
  if (params?.search)
    rows = rows.filter((p) =>
      matchesText([p.documentNo, p.vendorName, ...p.lines.map((l) => l.description)], params.search),
    );
  const sorted = [...rows].sort((a, b) => (a.date < b.date ? 1 : -1));
  return resolve(paginate(sorted, params));
}

export async function getPurchaseOrder(id: string): Promise<PurchaseOrder | null> {
  return resolve(allPurchaseOrders().find((p) => p.id === id) ?? null);
}

export async function savePurchaseOrder(
  id: string,
  patch: Partial<PurchaseOrder>,
): Promise<PurchaseOrder | null> {
  const updated = store.update<PurchaseOrder & { [k: string]: unknown }>('purchaseOrders', id, patch);
  if (updated) return resolve(updated as PurchaseOrder, 0);
  const base = fxPos.find((p: PurchaseOrder) => p.id === id);
  if (!base) return resolve(null, 0);
  return resolve(
    store.create<PurchaseOrder & { [k: string]: unknown }>('purchaseOrders', { ...base, ...patch, id }) as PurchaseOrder,
    0,
  );
}
