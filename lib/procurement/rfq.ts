/**
 * Pure helpers for the Request for Quotation register. No React, no data access.
 */
import type { Rfq } from '@/lib/data/types';

/**
 * D-103: three comparable offers is the working norm for a purchase file.
 * Below this the enquiry is flagged, not blocked — single-source purchases
 * are legitimate with a recorded justification.
 */
export const MIN_QUOTES_EXPECTED = 3;

const MS_PER_DAY = 86_400_000;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function invitedCount(r: Rfq): number {
  return r.vendors.length;
}

export function receivedCount(r: Rfq): number {
  return r.vendors.filter((v) => v.response === 'RECEIVED').length;
}

export function regretCount(r: Rfq): number {
  return r.vendors.filter((v) => v.response === 'REGRETTED').length;
}

export function awaitedCount(r: Rfq): number {
  return r.vendors.filter((v) => v.response === 'AWAITED').length;
}

export function lineCount(r: Rfq): number {
  return r.lines.length;
}

/** Internal estimate of the enquiry — the figure an approver sanctions against. */
export function estimatedValue(r: Rfq): number {
  return r.lines.reduce((sum, l) => sum + l.quantity * (l.estimatedRate ?? 0), 0);
}

/** Negative once the due date has passed. */
export function daysToDue(r: Rfq, asOn: string = today()): number {
  return Math.round((new Date(r.dueDate).getTime() - new Date(asOn).getTime()) / MS_PER_DAY);
}

export function isOverdue(r: Rfq, asOn: string = today()): boolean {
  return r.status !== 'CLOSED' && r.status !== 'CANCELLED' && r.dueDate < asOn;
}

export function isOpenForQuoting(r: Rfq, asOn: string = today()): boolean {
  return r.status === 'SUBMITTED' && r.dueDate >= asOn;
}

/** Fewer comparable offers than the norm — the purchase file will need a note. */
export function isUndersubscribed(r: Rfq): boolean {
  return receivedCount(r) < MIN_QUOTES_EXPECTED;
}

export function rfqTotals(rows: Rfq[], asOn: string = today()) {
  const floated = rows.filter((r) => r.status === 'SUBMITTED' || r.status === 'CLOSED');
  return {
    total: rows.length,
    floated: floated.length,
    open: rows.filter((r) => isOpenForQuoting(r, asOn)).length,
    awaiting: rows.reduce((n, r) => n + (r.status === 'SUBMITTED' ? awaitedCount(r) : 0), 0),
    received: rows.reduce((n, r) => n + receivedCount(r), 0),
    overdue: rows.filter((r) => isOverdue(r, asOn)).length,
    closingSoon: rows.filter((r) => {
      const d = daysToDue(r, asOn);
      return isOpenForQuoting(r, asOn) && d >= 0 && d <= 3;
    }).length,
    estimatedValue: rows.reduce((sum, r) => sum + estimatedValue(r), 0),
    undersubscribed: floated.filter(isUndersubscribed).length,
  };
}
