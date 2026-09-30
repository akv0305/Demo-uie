/**
 * Purchase requisition helpers. Pure functions — no data access, so presenters
 * may import this directly.
 */
import { differenceInCalendarDays } from 'date-fns';
import { terminology as t } from '@/config/terminology.config';
import type { PrPriority, PurchaseRequisition, PurchaseRequisitionLine } from '@/lib/data/types';

/** Quantity still to be ordered on a line. */
export function pendingQty(line: PurchaseRequisitionLine): number {
  return Math.max(0, line.quantity - (line.orderedQty ?? 0));
}

/** Indicative value of a line. Zero when no estimated rate was given. */
export function lineValue(line: PurchaseRequisitionLine): number {
  return line.quantity * (line.estimatedRate ?? 0);
}

/** Indicative value of the whole indent, in rupees. */
export function estimatedValue(pr: PurchaseRequisition): number {
  return pr.lines.reduce((a, l) => a + lineValue(l), 0);
}

/** Every line fully covered by purchase orders. */
export function isFullyOrdered(pr: PurchaseRequisition): boolean {
  return pr.lines.length > 0 && pr.lines.every((l) => pendingQty(l) === 0);
}

/** Nothing ordered yet against any line. */
export function isNotOrdered(pr: PurchaseRequisition): boolean {
  return pr.lines.every((l) => (l.orderedQty ?? 0) === 0);
}

/**
 * Approved, wanted soon, and still not ordered. This is the list a purchase
 * officer should work from each morning.
 */
export function isAwaitingOrder(pr: PurchaseRequisition): boolean {
  return pr.status === 'APPROVED' && !isFullyOrdered(pr);
}

/** Negative once the required-by date has passed. */
export function daysToRequired(pr: PurchaseRequisition): number {
  return differenceInCalendarDays(new Date(pr.requiredBy), new Date());
}

/** Wanted already, and not yet fully ordered. */
export function isOverdue(pr: PurchaseRequisition): boolean {
  return !isFullyOrdered(pr) && daysToRequired(pr) < 0;
}

export function priorityLabel(p: PrPriority): string {
  return (
    {
      NORMAL: t.procurement.prpNORMAL,
      URGENT: t.procurement.prpURGENT,
      EMERGENCY: t.procurement.prpEMERGENCY,
    } as Record<PrPriority, string>
  )[p];
}

export function prTotals(rows: PurchaseRequisition[]) {
  const pending = rows.filter((r) => r.status === 'PENDING_APPROVAL' || r.status === 'SUBMITTED');
  const awaiting = rows.filter(isAwaitingOrder);
  return {
    total: rows.length,
    pendingApproval: pending.length,
    awaitingOrderCount: awaiting.length,
    awaitingOrderValue: awaiting.reduce((a, r) => a + estimatedValue(r), 0),
    overdueCount: rows.filter(isOverdue).length,
    urgentCount: rows.filter(
      (r) => r.priority !== 'NORMAL' && !isFullyOrdered(r) && r.status !== 'CANCELLED',
    ).length,
  };
}
