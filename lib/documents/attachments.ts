/**
 * Attachment helpers shared by the document screens. Pure functions only —
 * no data access, so presenters may import this safely.
 */
import { differenceInCalendarDays } from 'date-fns';
import { terminology as t } from '@/config/terminology.config';
import type { Attachment } from '@/lib/data/types';

export type ExpiryState = 'EXPIRED' | 'DUE_SOON' | 'VALID' | 'NONE';

/** A document inside this window is treated as due for renewal (Q-66). */
export const DUE_SOON_DAYS = 30;

function today(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Negative = already expired. null = no expiry tracked. */
export function daysToExpiry(expiryDate?: string): number | null {
  if (!expiryDate) return null;
  return differenceInCalendarDays(new Date(expiryDate), today());
}

export function expiryState(expiryDate?: string, dueSoonDays = DUE_SOON_DAYS): ExpiryState {
  const days = daysToExpiry(expiryDate);
  if (days === null) return 'NONE';
  if (days < 0) return 'EXPIRED';
  if (days <= dueSoonDays) return 'DUE_SOON';
  return 'VALID';
}

export function expiryLabel(expiryDate?: string): string {
  const days = daysToExpiry(expiryDate);
  if (days === null) return t.documents.noExpiry;
  if (days < 0) return t.documents.expiredDaysAgo.replace('{days}', String(Math.abs(days)));
  return t.documents.expiresInDays.replace('{days}', String(days));
}

/** Entity collection key → human label. Never show the raw id (R1). */
export function entityTypeLabel(entityKey: string): string {
  const map: Record<string, string> = {
    documents: t.documents.entDocuments,
    vendors: t.documents.entVendors,
    subcontractors: t.documents.entSubcontractors,
    equipment: t.documents.entEquipment,
    employees: t.documents.entEmployees,
    projects: t.documents.entProjects,
    companies: t.documents.entCompanies,
  };
  return map[entityKey] ?? entityKey;
}

export function formatFileSize(sizeKb: number): string {
  return sizeKb >= 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;
}

export function sortByExpiry(rows: Attachment[]): Attachment[] {
  return [...rows].sort((a, b) => (a.expiryDate ?? '9999').localeCompare(b.expiryDate ?? '9999'));
}
