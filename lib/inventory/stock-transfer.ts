/**
 * Pure helpers for stock transfer. No React, no data access (D-122).
 *
 * A transfer is the one stores document where material legitimately exists in
 * neither store for a while. Treating it as a single instantaneous movement is
 * what makes lorry-loads disappear from the books (D-133).
 */
import type { StockTransfer, StockTransferLine, TransferStage } from '@/lib/data/types';

const MS_PER_DAY = 86_400_000;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Sent but not yet taken in. On the road, or lost on it. */
export function inTransitQty(l: StockTransferLine): number {
  return Math.max(0, l.dispatchedQty - l.receivedQty);
}

/** Value at the sending store's rate. The move itself creates no gain (D-135). */
export function lineValue(l: StockTransferLine): number {
  return l.dispatchedQty * (l.rate ?? 0);
}

export function transferValue(x: StockTransfer): number {
  return x.lines.reduce((sum, l) => sum + lineValue(l), 0);
}

export function inTransitValue(x: StockTransfer): number {
  return x.lines.reduce((sum, l) => sum + inTransitQty(l) * (l.rate ?? 0), 0);
}

export function dispatchedQtyTotal(x: StockTransfer): number {
  return x.lines.reduce((sum, l) => sum + l.dispatchedQty, 0);
}

export function receivedQtyTotal(x: StockTransfer): number {
  return x.lines.reduce((sum, l) => sum + l.receivedQty, 0);
}

export function inTransitQtyTotal(x: StockTransfer): number {
  return x.lines.reduce((sum, l) => sum + inTransitQty(l), 0);
}

/** A shortage only becomes real once the transfer has been received (D-134). */
export function hasTransitLoss(x: StockTransfer): boolean {
  return x.stage === 'RECEIVED' && x.lines.some((l) => inTransitQty(l) > 0);
}

export function transitLossValue(x: StockTransfer): number {
  return hasTransitLoss(x) ? inTransitValue(x) : 0;
}

/** Receiving more than was sent. Flagged for the storekeeper, never blocked. */
export function exceedsDispatched(l: StockTransferLine, receivedQty: number): boolean {
  return receivedQty > l.dispatchedQty;
}

export function isInterProject(x: StockTransfer): boolean {
  return !!x.toProjectId && x.toProjectId !== x.projectId;
}

// ---------------------------------------------------------------------------
// Lifecycle (D-133, D-137)
// ---------------------------------------------------------------------------

/** Material is out of the sending store and not yet in the receiving one. */
export function isInTransit(x: StockTransfer): boolean {
  return (x.stage === 'DISPATCHED' || x.stage === 'PARTLY_RECEIVED') && inTransitQtyTotal(x) > 0;
}

export function isOpen(x: StockTransfer): boolean {
  return x.stage !== 'RECEIVED' && x.status !== 'CANCELLED';
}

/** Days the material has been on the road. The follow-up list for a storekeeper. */
export function daysInTransit(x: StockTransfer, asOn: string = today()): number | null {
  if (!isInTransit(x)) return null;
  const days = Math.round((new Date(asOn).getTime() - new Date(x.date).getTime()) / MS_PER_DAY);
  return days > 0 ? days : 0;
}

/**
 * The stage a transfer has actually reached, from its own quantities. Derived
 * rather than set by hand, so the register cannot claim a transfer is closed
 * while material is still on the road.
 */
export function deriveStage(x: StockTransfer, dispatched: boolean): TransferStage {
  if (!dispatched) return 'DRAFT';
  const received = receivedQtyTotal(x);
  if (received <= 0) return 'DISPATCHED';
  return inTransitQtyTotal(x) > 0 ? 'PARTLY_RECEIVED' : 'RECEIVED';
}

/** Lines seeded for the receiving storekeeper — assume all of it arrived. */
export function seedReceipt(x: StockTransfer): StockTransferLine[] {
  return x.lines.map((l) => ({ ...l, receivedQty: l.dispatchedQty }));
}

export function transferTotals(rows: StockTransfer[], asOn: string = today()) {
  const live = rows.filter((x) => x.status !== 'CANCELLED');
  return {
    total: live.length,
    thisMonth: live.filter((x) => x.date.slice(0, 7) === asOn.slice(0, 7)).length,
    transferValue: live.reduce((sum, x) => sum + transferValue(x), 0),
    inTransit: live.filter(isInTransit).length,
    inTransitValue: live.filter(isInTransit).reduce((sum, x) => sum + inTransitValue(x), 0),
    withTransitLoss: live.filter(hasTransitLoss).length,
    transitLossValue: live.reduce((sum, x) => sum + transitLossValue(x), 0),
    interProject: live.filter(isInterProject).length,
    open: live.filter(isOpen).length,
  };
}
