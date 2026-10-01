/**
 * Pure helpers for material issue. No React, no data access (D-122).
 *
 * A store issue is three separate questions: what the site asked for, what the
 * store could actually give, and what it cost the job. Keeping the first two
 * apart is what makes a shortage visible instead of invisible (D-124).
 */
import type { Item, MaterialIssue, MaterialIssueLine, StockBalance } from '@/lib/data/types';

const MS_PER_DAY = 86_400_000;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Asked for but not issued — the store could not meet it in full. */
export function shortQty(l: MaterialIssueLine): number {
  return Math.max(0, l.requestedQty - l.issuedQty);
}

/** Cost charged to the job. Zero where no rate applies. */
export function lineValue(l: MaterialIssueLine): number {
  return l.issuedQty * (l.rate ?? 0);
}

export function issueValue(m: MaterialIssue): number {
  return m.lines.reduce((sum, l) => sum + lineValue(l), 0);
}

export function issuedQtyTotal(m: MaterialIssue): number {
  return m.lines.reduce((sum, l) => sum + l.issuedQty, 0);
}

export function shortQtyTotal(m: MaterialIssue): number {
  return m.lines.reduce((sum, l) => sum + shortQty(l), 0);
}

export function hasShortIssue(m: MaterialIssue): boolean {
  return m.lines.some((l) => shortQty(l) > 0);
}

// ---------------------------------------------------------------------------
// Returnable material (D-126, D-127)
// ---------------------------------------------------------------------------

/** Still lying at site against a returnable issue. */
export function pendingReturnQty(l: MaterialIssueLine): number {
  if (!l.isReturnable) return 0;
  return Math.max(0, l.issuedQty - (l.returnedQty ?? 0));
}

export function pendingReturnTotal(m: MaterialIssue): number {
  return m.lines.reduce((sum, l) => sum + pendingReturnQty(l), 0);
}

export function hasPendingReturn(m: MaterialIssue): boolean {
  return pendingReturnTotal(m) > 0;
}

/** Return date passed with material still out. The shuttering-recovery list. */
export function isReturnOverdue(m: MaterialIssue, asOn: string = today()): boolean {
  return m.lines.some(
    (l) => pendingReturnQty(l) > 0 && !!l.expectedReturnDate && l.expectedReturnDate < asOn,
  );
}

export function daysOverdue(l: MaterialIssueLine, asOn: string = today()): number | null {
  if (pendingReturnQty(l) <= 0 || !l.expectedReturnDate) return null;
  const days = Math.round(
    (new Date(asOn).getTime() - new Date(l.expectedReturnDate).getTime()) / MS_PER_DAY,
  );
  return days > 0 ? days : null;
}

// ---------------------------------------------------------------------------
// Stock position at the issuing store
// ---------------------------------------------------------------------------

export function balanceFor(
  balances: StockBalance[],
  itemId: string,
  siteId: string,
): StockBalance | undefined {
  return balances.find((b) => b.itemId === itemId && b.siteId === siteId);
}

export function availableQty(balances: StockBalance[], itemId: string, siteId: string): number {
  return balanceFor(balances, itemId, siteId)?.quantity ?? 0;
}

/** Weighted-average rate carried on the balance. The issue rate (D-123). */
export function stockRate(balances: StockBalance[], itemId: string, siteId: string): number {
  return balanceFor(balances, itemId, siteId)?.rate ?? 0;
}

/** Issuing this much would take the store below zero. */
export function exceedsStock(
  balances: StockBalance[],
  itemId: string,
  siteId: string,
  issuedQty: number,
): boolean {
  return issuedQty > availableQty(balances, itemId, siteId);
}

/**
 * Whether the shortfall may be saved at all. Most items are flagged and
 * allowed; an item marked otherwise in the master is blocked (D-125).
 */
export function isNegativeStockBlocked(item: Item | undefined): boolean {
  return item?.allowNegativeStock === false;
}

/** A line seeded from what is actually lying in the store. */
export function seedLineFromStock(b: StockBalance): Omit<MaterialIssueLine, 'id'> {
  return {
    itemId: b.itemId,
    itemCode: b.itemCode,
    description: b.itemName,
    uomCode: b.uomCode,
    requestedQty: 0,
    issuedQty: 0,
    rate: b.rate,
  };
}

export function issueTotals(rows: MaterialIssue[], asOn: string = today()) {
  const live = rows.filter((m) => m.status !== 'CANCELLED');
  return {
    total: live.length,
    thisMonth: live.filter((m) => m.date.slice(0, 7) === asOn.slice(0, 7)).length,
    issueValue: live.reduce((sum, m) => sum + issueValue(m), 0),
    withShortIssue: live.filter(hasShortIssue).length,
    toSubcontractor: live.filter((m) => m.issueType === 'SUBCONTRACTOR').length,
    subcontractorValue: live
      .filter((m) => m.issueType === 'SUBCONTRACTOR')
      .reduce((sum, m) => sum + issueValue(m), 0),
    returnPending: live.filter(hasPendingReturn).length,
    returnPendingQty: live.reduce((sum, m) => sum + pendingReturnTotal(m), 0),
    returnOverdue: live.filter((m) => isReturnOverdue(m, asOn)).length,
  };
}
