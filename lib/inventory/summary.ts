/**
 * Pure helpers for the stock summary. No React, no data access (D-122).
 *
 * The summary answers one question a storekeeper is asked every month: what is
 * lying in this store, and what is it worth. It is derived from the same
 * movement stream as the ledger rather than kept as a balance table, so the
 * two can never disagree (D-156). A stored balance that drifts from its own
 * movements is the single most common reason a stores register stops being
 * believed.
 */
import type { Item, LedgerSource, StockLedgerRow } from '@/lib/data/types';
import { allMovements, type LedgerInput } from './ledger';

/** Beyond this, material is dead stock worth asking about (Q-108). */
export const NON_MOVING_DAYS = 90;

const MS_PER_DAY = 86_400_000;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * One store, one item. Never one item across stores — two stores holding the
 * same material are two physical positions, not one (D-158).
 */
export interface StockSummaryRow {
  itemId: string;
  itemCode: string;
  description: string;
  uomCode: string;
  siteId: string;

  /** Net of everything before the period opened. */
  openingQty: number;
  openingValue: number;

  /** Movements inside the period, kept apart so the register explains itself. */
  openingEntryQty: number;
  receiptQty: number;
  returnQty: number;
  transferInQty: number;
  adjustInQty: number;
  issueQty: number;
  transferOutQty: number;
  adjustOutQty: number;

  closingQty: number;
  /** Weighted average of inward movements up to the as-on date (D-157). */
  rate: number;
  closingValue: number;

  reorderLevel: number;
  /** Last date anything moved, for the dead-stock question. */
  lastMovementDate?: string;
}

export interface SummaryOptions {
  /** Absent = every store in the registers supplied. */
  siteId?: string;
  /** Absent = every item. Used by the item-group filter. */
  itemIds?: string[];
  /** Absent = from the beginning, so opening is nil. */
  fromDate?: string;
  /** Absent = up to today. */
  toDate?: string;
  /** For reorder level. A missing item master simply means no reorder level. */
  items?: Item[];
}

/** Which bucket a movement falls in. The only coupling to ledger.ts (D-156). */
const SOURCE_BUCKET: Record<LedgerSource, keyof StockSummaryRow> = {
  OPENING: 'openingEntryQty',
  GRN: 'receiptQty',
  RETURN: 'returnQty',
  TRANSFER_IN: 'transferInQty',
  ADJUSTMENT: 'adjustInQty', // direction decided per row below
  ISSUE: 'issueQty',
  TRANSFER_OUT: 'transferOutQty',
};

function blank(m: StockLedgerRow): StockSummaryRow {
  return {
    itemId: m.itemId,
    itemCode: m.itemCode ?? '',
    description: m.description,
    uomCode: m.uomCode,
    siteId: m.siteId,
    openingQty: 0,
    openingValue: 0,
    openingEntryQty: 0,
    receiptQty: 0,
    returnQty: 0,
    transferInQty: 0,
    adjustInQty: 0,
    issueQty: 0,
    transferOutQty: 0,
    adjustOutQty: 0,
    closingQty: 0,
    rate: 0,
    closingValue: 0,
    reorderLevel: 0,
  };
}

/** Running weighted average of what came in. Material out does not re-rate it. */
interface Wavg {
  qty: number;
  value: number;
}

function wavgRate(w: Wavg): number {
  return w.qty > 0 ? w.value / w.qty : 0;
}

/**
 * The register. One pass over every movement, bucketed by period and source.
 */
export function buildSummary(input: LedgerInput, opts: SummaryOptions = {}): StockSummaryRow[] {
  const { siteId, itemIds, fromDate } = opts;
  const toDate = opts.toDate || today();
  const wanted = itemIds ? new Set(itemIds) : null;
  const reorder = new Map((opts.items ?? []).map((i) => [i.id, i.reorderLevel ?? 0]));

  const rows = new Map<string, StockSummaryRow>();
  const inAll = new Map<string, Wavg>();
  const inOpening = new Map<string, Wavg>();

  for (const m of allMovements(input)) {
    if (siteId && m.siteId !== siteId) continue;
    if (wanted && !wanted.has(m.itemId)) continue;
    if (m.date > toDate) continue;

    const key = `${m.siteId}|${m.itemId}`;
    let row = rows.get(key);
    if (!row) {
      row = blank(m);
      row.reorderLevel = reorder.get(m.itemId) ?? 0;
      rows.set(key, row);
    }

    const inQty = m.inQty || 0;
    const outQty = m.outQty || 0;
    const rate = m.rate ?? 0;

    // Inward movements set the valuation; outward movements never do (D-157).
    if (inQty > 0 && rate > 0) {
      const all = inAll.get(key) ?? { qty: 0, value: 0 };
      all.qty += inQty;
      all.value += inQty * rate;
      inAll.set(key, all);
      if (fromDate && m.date < fromDate) {
        const op = inOpening.get(key) ?? { qty: 0, value: 0 };
        op.qty += inQty;
        op.value += inQty * rate;
        inOpening.set(key, op);
      }
    }

    if (inQty || outQty) {
      if (!row.lastMovementDate || m.date > row.lastMovementDate) row.lastMovementDate = m.date;
    }

    // Before the period opened everything collapses into one figure. Inside it,
    // the movement keeps its own identity so the closing figure is explicable.
    if (fromDate && m.date < fromDate) {
      row.openingQty += inQty - outQty;
      continue;
    }

    if (m.source === 'ADJUSTMENT') {
      // A count moves stock either way, and the two are not the same news.
      row.adjustInQty += inQty;
      row.adjustOutQty += outQty;
      continue;
    }

    const bucket = SOURCE_BUCKET[m.source];
    if (bucket) {
      (row[bucket] as number) += inQty + outQty;
    }
  }

  for (const [key, row] of rows) {
    row.rate = wavgRate(inAll.get(key) ?? { qty: 0, value: 0 });
    const openingRate = wavgRate(inOpening.get(key) ?? { qty: 0, value: 0 }) || row.rate;
    row.openingValue = row.openingQty * openingRate;
    row.closingQty = row.openingQty + totalIn(row) - totalOut(row);
    row.closingValue = row.closingQty * row.rate;
  }

  return [...rows.values()];
}

export function totalIn(r: StockSummaryRow): number {
  return r.openingEntryQty + r.receiptQty + r.returnQty + r.transferInQty + r.adjustInQty;
}

export function totalOut(r: StockSummaryRow): number {
  return r.issueQty + r.transferOutQty + r.adjustOutQty;
}

export function hasMovement(r: StockSummaryRow): boolean {
  return totalIn(r) > 0 || totalOut(r) > 0;
}

/** Below the level at which an indent should already have been raised. */
export function isBelowReorder(r: StockSummaryRow): boolean {
  return r.reorderLevel > 0 && r.closingQty < r.reorderLevel;
}

/** The books say less than nothing is in the godown. Always an error to chase. */
export function isNegative(r: StockSummaryRow): boolean {
  return r.closingQty < 0;
}

/** Stock lying untouched. Judged against the as-on date, not today (D-160). */
export function isNonMoving(r: StockSummaryRow, asOn: string = today()): boolean {
  if (r.closingQty <= 0) return false;
  if (!r.lastMovementDate) return true;
  const days = Math.round(
    (new Date(asOn).getTime() - new Date(r.lastMovementDate).getTime()) / MS_PER_DAY,
  );
  return days > NON_MOVING_DAYS;
}

export function idleDays(r: StockSummaryRow, asOn: string = today()): number | null {
  if (!r.lastMovementDate) return null;
  const days = Math.round(
    (new Date(asOn).getTime() - new Date(r.lastMovementDate).getTime()) / MS_PER_DAY,
  );
  return days > 0 ? days : 0;
}

/**
 * Quantities are deliberately absent — summing across items of different UOM
 * produces a number that means nothing (D-159).
 */
export function summaryTotals(rows: StockSummaryRow[], asOn: string = today()) {
  const holding = rows.filter((r) => r.closingQty !== 0);
  return {
    items: rows.length,
    holding: holding.length,
    closingValue: rows.reduce((sum, r) => sum + r.closingValue, 0),
    unvalued: holding.filter((r) => r.rate <= 0).length,
    belowReorder: rows.filter(isBelowReorder).length,
    negative: rows.filter(isNegative).length,
    nonMoving: rows.filter((r) => isNonMoving(r, asOn)).length,
    nonMovingValue: rows
      .filter((r) => isNonMoving(r, asOn))
      .reduce((sum, r) => sum + r.closingValue, 0),
    moved: rows.filter(hasMovement).length,
  };
}
