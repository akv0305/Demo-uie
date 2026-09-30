/**
 * Pure helpers for purchase orders. Mirrors the quotation maths so an order
 * raised from an accepted offer carries the same value through.
 */
import type { PoLine, PurchaseOrder } from '@/lib/data/types';

const MS_PER_DAY = 86_400_000;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function lineNetRate(l: PoLine): number {
  return l.rate * (1 - (l.discountPct ?? 0) / 100);
}

export function lineBasic(l: PoLine): number {
  return lineNetRate(l) * l.quantity;
}

export function lineTax(l: PoLine): number {
  return lineBasic(l) * (l.gstRate / 100);
}

export function lineTotal(l: PoLine): number {
  return lineBasic(l) + lineTax(l);
}

export function basicValue(po: PurchaseOrder): number {
  return po.lines.reduce((sum, l) => sum + lineBasic(l), 0);
}

export function chargesValue(po: PurchaseOrder): number {
  const c = po.charges;
  return (c.freightAmount ?? 0) + (c.loadingAmount ?? 0) + (c.packingAmount ?? 0);
}

export function taxValue(po: PurchaseOrder): number {
  const lineTaxes = po.lines.reduce((sum, l) => sum + lineTax(l), 0);
  return lineTaxes + chargesValue(po) * ((po.charges.chargesGstRate ?? 0) / 100);
}

/** Order value inclusive of everything — what the vendor will bill in total. */
export function orderValue(po: PurchaseOrder): number {
  return basicValue(po) + chargesValue(po) + taxValue(po);
}

export function advanceValue(po: PurchaseOrder): number {
  return po.advanceAmount ?? 0;
}

export function retentionValue(po: PurchaseOrder): number {
  return po.retentionPct ? (basicValue(po) * po.retentionPct) / 100 : 0;
}

// --- Delivery progress -----------------------------------------------------

export function linePending(l: PoLine): number {
  return Math.max(0, l.quantity - (l.receivedQty ?? 0));
}

export function isLineClosed(l: PoLine): boolean {
  return linePending(l) <= 0;
}

/** Share of ordered quantity received, weighted by line value (D-109). */
export function deliveryProgressPct(po: PurchaseOrder): number {
  const total = basicValue(po);
  if (total <= 0) return 0;
  const received = po.lines.reduce(
    (sum, l) => sum + lineNetRate(l) * Math.min(l.quantity, l.receivedQty ?? 0),
    0,
  );
  return (received / total) * 100;
}

export function isFullyReceived(po: PurchaseOrder): boolean {
  return po.lines.length > 0 && po.lines.every(isLineClosed);
}

export function isPartlyReceived(po: PurchaseOrder): boolean {
  return po.lines.some((l) => (l.receivedQty ?? 0) > 0) && !isFullyReceived(po);
}

export function pendingValue(po: PurchaseOrder): number {
  return po.lines.reduce((sum, l) => sum + lineNetRate(l) * linePending(l), 0);
}

export function daysToDelivery(po: PurchaseOrder, asOn: string = today()): number | null {
  if (!po.deliveryByDate) return null;
  return Math.round((new Date(po.deliveryByDate).getTime() - new Date(asOn).getTime()) / MS_PER_DAY);
}

/** Past the delivery date with material still outstanding — an LD situation. */
export function isDeliveryOverdue(po: PurchaseOrder, asOn: string = today()): boolean {
  if (!po.deliveryByDate || isFullyReceived(po)) return false;
  if (po.status === 'CANCELLED' || po.status === 'CLOSED' || po.status === 'DRAFT') return false;
  return po.deliveryByDate < asOn;
}

/** An order on a non-comparative basis must carry a reason on the file. */
export function needsJustification(po: PurchaseOrder): boolean {
  return po.basis !== 'COMPARATIVE' && !po.awardJustification?.trim();
}

export function poTotals(rows: PurchaseOrder[], asOn: string = today()) {
  const live = rows.filter((p) => p.status !== 'CANCELLED' && p.status !== 'DRAFT');
  return {
    total: rows.length,
    live: live.length,
    draft: rows.filter((p) => p.status === 'DRAFT').length,
    orderValue: live.reduce((sum, p) => sum + orderValue(p), 0),
    pendingValue: live.reduce((sum, p) => sum + pendingValue(p), 0),
    fullyReceived: live.filter(isFullyReceived).length,
    partlyReceived: live.filter(isPartlyReceived).length,
    overdue: live.filter((p) => isDeliveryOverdue(p, asOn)).length,
    advanceCommitted: live.reduce((sum, p) => sum + advanceValue(p), 0),
    missingJustification: live.filter(needsJustification).length,
  };
}
