/**
 * Pure helpers for goods receipt. No React, no data access (D-122).
 *
 * The arithmetic a storekeeper does at the gate: what the challan says, what
 * actually came off the lorry, and what was good enough to take into stock.
 * Those are three different numbers and the difference between them is money
 * somebody owes somebody (D-116).
 */
import type { GoodsReceipt, GoodsReceiptLine, PoLine, PurchaseOrder } from '@/lib/data/types';

/** D-121: bulk loads overrun. Flagged above this, never blocked. */
export const OVER_RECEIPT_TOLERANCE_PCT = 2;

const MS_PER_DAY = 86_400_000;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Challan quantity not physically received — transit shortage or driage. */
export function shortQty(l: GoodsReceiptLine): number {
  return Math.max(0, l.challanQty - l.receivedQty);
}

/** Value of what was taken into stock. Zero when no rate applies (free issue). */
export function lineValue(l: GoodsReceiptLine): number {
  return l.acceptedQty * (l.rate ?? 0);
}

export function receiptValue(g: GoodsReceipt): number {
  return g.lines.reduce((sum, l) => sum + lineValue(l), 0);
}

export function acceptedQtyTotal(g: GoodsReceipt): number {
  return g.lines.reduce((sum, l) => sum + l.acceptedQty, 0);
}

export function rejectedQtyTotal(g: GoodsReceipt): number {
  return g.lines.reduce((sum, l) => sum + l.rejectedQty, 0);
}

export function shortQtyTotal(g: GoodsReceipt): number {
  return g.lines.reduce((sum, l) => sum + shortQty(l), 0);
}

/** Value of material refused. What a debit note on the vendor would carry (Q-88). */
export function rejectedValue(g: GoodsReceipt): number {
  return g.lines.reduce((sum, l) => sum + l.rejectedQty * (l.rate ?? 0), 0);
}

export function hasRejection(g: GoodsReceipt): boolean {
  return g.lines.some((l) => l.rejectedQty > 0);
}

export function hasShortage(g: GoodsReceipt): boolean {
  return g.lines.some((l) => shortQty(l) > 0);
}

export function isAwaitingTest(g: GoodsReceipt): boolean {
  return g.lines.some((l) => l.condition === 'PENDING_TEST');
}

/** Weighbridge net against the sum of the slip's own gross and tare. */
export function weighbridgeVariance(g: GoodsReceipt): number | null {
  if (g.grossWeight === undefined || g.tareWeight === undefined || g.netWeight === undefined) {
    return null;
  }
  return g.netWeight - (g.grossWeight - g.tareWeight);
}

/** Material on site with no vendor invoice yet — the accounts follow-up list (D-118). */
export function isInvoiceAwaited(g: GoodsReceipt): boolean {
  return !g.invoiceNo;
}

/** Days the invoice has been outstanding against a receipt. */
export function invoiceAwaitedDays(g: GoodsReceipt, asOn: string = today()): number | null {
  if (!isInvoiceAwaited(g)) return null;
  return Math.max(0, Math.round((new Date(asOn).getTime() - new Date(g.date).getTime()) / MS_PER_DAY));
}

/** Quantity still to come on an order line, after everything received so far. */
export function poLinePending(l: PoLine): number {
  return Math.max(0, l.quantity - (l.receivedQty ?? 0));
}

/**
 * Accepting `acceptedQty` would take the line past its ordered quantity by
 * more than the tolerance. Flag, not a block (D-121).
 */
export function isOverReceipt(poLine: PoLine, acceptedQty: number): boolean {
  const limit = poLine.quantity * (1 + OVER_RECEIPT_TOLERANCE_PCT / 100);
  return (poLine.receivedQty ?? 0) + acceptedQty > limit;
}

/**
 * Seed GRN lines from an order, at pending quantity. The storekeeper then
 * overwrites what actually arrived.
 */
export function seedLinesFromPo(po: PurchaseOrder): Omit<GoodsReceiptLine, 'id'>[] {
  return po.lines
    .filter((l) => poLinePending(l) > 0)
    .map((l) => {
      const pending = poLinePending(l);
      return {
        poLineId: l.id,
        itemId: l.itemId,
        itemCode: l.itemCode,
        description: l.description,
        specification: l.specification,
        makeReceived: l.makeApproved,
        uomCode: l.uomCode,
        challanQty: pending,
        receivedQty: pending,
        acceptedQty: pending,
        rejectedQty: 0,
        condition: 'ACCEPTED' as const,
        rate: l.rate,
        wbsId: l.wbsId,
      };
    });
}

/**
 * The write-back (D-115). Returns the order with `receivedQty` advanced by the
 * accepted quantities. Pure — the caller persists the result.
 */
export function postToPo(po: PurchaseOrder, g: GoodsReceipt): PurchaseOrder {
  return {
    ...po,
    lines: po.lines.map((pl) => {
      const received = g.lines
        .filter((gl) => gl.poLineId === pl.id)
        .reduce((sum, gl) => sum + gl.acceptedQty, 0);
      return received ? { ...pl, receivedQty: (pl.receivedQty ?? 0) + received } : pl;
    }),
  };
}

export function grnTotals(rows: GoodsReceipt[], asOn: string = today()) {
  const live = rows.filter((g) => g.status !== 'CANCELLED');
  return {
    total: live.length,
    thisMonth: live.filter((g) => g.date.slice(0, 7) === asOn.slice(0, 7)).length,
    receiptValue: live.reduce((sum, g) => sum + receiptValue(g), 0),
    withRejection: live.filter(hasRejection).length,
    rejectedValue: live.reduce((sum, g) => sum + rejectedValue(g), 0),
    withShortage: live.filter(hasShortage).length,
    awaitingTest: live.filter(isAwaitingTest).length,
    invoiceAwaited: live.filter(isInvoiceAwaited).length,
    withoutPo: live.filter((g) => g.grnType === 'WITHOUT_PO').length,
  };
}
