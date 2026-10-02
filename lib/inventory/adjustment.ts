/**
 * Pure helpers for stock adjustment. No React, no data access (D-122).
 *
 * An adjustment is the only stores document that creates or destroys material
 * without anything physically moving. Its arithmetic therefore runs one way
 * only — from counted reality back to the book (D-139).
 */
import type { StockAdjustment, StockAdjustmentLine } from '@/lib/data/types';

/** Default tolerance where the line carries none. Zero: most items are counted, not weighed. */
const DEFAULT_TOLERANCE_PCT = 0;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Found less book. Negative is a shortage, positive an excess (D-139). */
export function varianceQty(l: StockAdjustmentLine): number {
  return l.physicalQty - l.systemQty;
}

export function variancePct(l: StockAdjustmentLine): number {
  if (!l.systemQty) return l.physicalQty ? 100 : 0;
  return (varianceQty(l) / l.systemQty) * 100;
}

/** Handling noise on bulk material, not a loss worth chasing (D-142). */
export function isWithinTolerance(l: StockAdjustmentLine): boolean {
  const limit = l.tolerancePct ?? DEFAULT_TOLERANCE_PCT;
  if (!limit) return varianceQty(l) === 0;
  return Math.abs(variancePct(l)) <= limit;
}

export function isShortage(l: StockAdjustmentLine): boolean {
  return varianceQty(l) < 0 && !isWithinTolerance(l);
}

export function isExcess(l: StockAdjustmentLine): boolean {
  return varianceQty(l) > 0 && !isWithinTolerance(l);
}

/** Money the variance is worth, at the rate the material was carried at (D-141). */
export function lineValue(l: StockAdjustmentLine): number {
  return varianceQty(l) * (l.rate ?? 0);
}

export function shortageQtyTotal(x: StockAdjustment): number {
  return x.lines.filter(isShortage).reduce((sum, l) => sum + Math.abs(varianceQty(l)), 0);
}

export function excessQtyTotal(x: StockAdjustment): number {
  return x.lines.filter(isExcess).reduce((sum, l) => sum + varianceQty(l), 0);
}

/** Loss, as a positive number. */
export function shortageValue(x: StockAdjustment): number {
  return x.lines.filter(isShortage).reduce((sum, l) => sum + Math.abs(lineValue(l)), 0);
}

export function excessValue(x: StockAdjustment): number {
  return x.lines.filter(isExcess).reduce((sum, l) => sum + lineValue(l), 0);
}

/** Net effect on the books. Negative means the store is poorer than it thought. */
export function netValue(x: StockAdjustment): number {
  return x.lines.reduce((sum, l) => sum + (isWithinTolerance(l) ? 0 : lineValue(l)), 0);
}

export function hasVariance(x: StockAdjustment): boolean {
  return x.lines.some((l) => !isWithinTolerance(l));
}

export function reconciledCount(x: StockAdjustment): number {
  return x.lines.filter(isWithinTolerance).length;
}

/** A write-down must say why; a count need not (Q-99). */
export function needsReason(type: StockAdjustment['adjustmentType']): boolean {
  return type !== 'PHYSICAL_VERIFICATION' && type !== 'MEASUREMENT_CORRECTION';
}

/** Posted to stock only once approved (D-143). */
export function isPosted(x: StockAdjustment): boolean {
  return !!x.approvedBy && x.status !== 'CANCELLED';
}

export function isPendingApproval(x: StockAdjustment): boolean {
  return !isPosted(x) && x.status !== 'CANCELLED';
}

export function adjustmentTotals(rows: StockAdjustment[], asOn: string = today()) {
  const live = rows.filter((x) => x.status !== 'CANCELLED');
  const posted = live.filter(isPosted);
  return {
    total: live.length,
    thisMonth: live.filter((x) => x.date.slice(0, 7) === asOn.slice(0, 7)).length,
    withVariance: live.filter(hasVariance).length,
    shortageValue: posted.reduce((sum, x) => sum + shortageValue(x), 0),
    excessValue: posted.reduce((sum, x) => sum + excessValue(x), 0),
    netValue: posted.reduce((sum, x) => sum + netValue(x), 0),
    writeOffs: live.filter((x) => needsReason(x.adjustmentType)).length,
    writeOffValue: posted
      .filter((x) => needsReason(x.adjustmentType))
      .reduce((sum, x) => sum + shortageValue(x), 0),
    pendingApproval: live.filter(isPendingApproval).length,
  };
}
