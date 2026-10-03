/**
 * Pure helpers for opening stock. No React, no data access (D-122).
 *
 * This is the one document whose numbers nobody can trace back to a purchase.
 * Everything the stores module later reports rests on it, so the helpers are
 * mostly about making its weak points visible rather than hiding them.
 */
import type { OpeningStock, OpeningStockLine, StockBalance } from '@/lib/data/types';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function lineValue(l: OpeningStockLine): number {
  return l.quantity * (l.rate ?? 0);
}

export function openingValue(x: OpeningStock): number {
  return x.lines.reduce((sum, l) => sum + lineValue(l), 0);
}

export function quantityTotal(x: OpeningStock): number {
  return x.lines.reduce((sum, l) => sum + l.quantity, 0);
}

export function itemCount(x: OpeningStock): number {
  return x.lines.length;
}

/** A quantity with no rate is stock the books cannot value (D-152). */
export function hasUnvaluedLine(x: OpeningStock): boolean {
  return x.lines.some((l) => l.quantity > 0 && !l.rate);
}

export function unvaluedQtyTotal(x: OpeningStock): number {
  return x.lines.filter((l) => !l.rate).reduce((sum, l) => sum + l.quantity, 0);
}

/** Nothing enters stock until approved. Frozen thereafter (D-150, D-153). */
export function isPosted(x: OpeningStock): boolean {
  return !!x.approvedBy && x.status !== 'CANCELLED';
}

export function isFrozen(x: OpeningStock): boolean {
  return isPosted(x);
}

export function isPendingApproval(x: OpeningStock): boolean {
  return !isPosted(x) && x.status !== 'CANCELLED';
}

/**
 * A second approved document for the same store adds to the first instead of
 * replacing it, which is how a store ends up with twice the cement it has
 * (D-151). The screen warns on this; it is not silently prevented.
 */
export function existingForStore(
  rows: OpeningStock[],
  storeSiteId: string,
  excludeId?: string,
): OpeningStock | undefined {
  return rows.find(
    (x) => x.storeSiteId === storeSiteId && x.id !== excludeId && x.status !== 'CANCELLED',
  );
}

export function storesOpened(rows: OpeningStock[]): string[] {
  return Array.from(new Set(rows.filter(isPosted).map((x) => x.storeSiteId)));
}

/** Seeds the sheet from whatever the system already believes is in the store. */
export function seedLineFromBalance(b: StockBalance): Omit<OpeningStockLine, 'id'> {
  return {
    itemId: b.itemId,
    itemCode: b.itemCode,
    description: b.itemName,
    uomCode: b.uomCode,
    quantity: b.quantity,
    rate: b.rate,
  };
}

export function openingTotals(rows: OpeningStock[], asOn: string = today()) {
  const live = rows.filter((x) => x.status !== 'CANCELLED');
  const posted = live.filter(isPosted);
  return {
    total: live.length,
    storesOpened: storesOpened(live).length,
    openingValue: posted.reduce((sum, x) => sum + openingValue(x), 0),
    itemsCovered: posted.reduce((sum, x) => sum + itemCount(x), 0),
    unvalued: live.filter(hasUnvaluedLine).length,
    unvaluedQty: live.reduce((sum, x) => sum + unvaluedQtyTotal(x), 0),
    pendingApproval: live.filter(isPendingApproval).length,
    latestCutOff: live.reduce((latest, x) => (x.date > latest ? x.date : latest), ''),
    asOn,
  };
}
