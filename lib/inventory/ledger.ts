/**
 * Builds the stock ledger from the stores documents. Pure — no React, no data
 * access (D-122). The caller fetches the five registers and hands them in.
 *
 * Nothing here is persisted. A ledger that is stored can drift away from the
 * documents it claims to summarise, and then two screens disagree and neither
 * can be trusted (D-144).
 */
import type {
  GoodsReceipt,
  LedgerSource,
  MaterialIssue,
  MaterialReturn,
  OpeningStock,
  StockAdjustment,
  StockLedgerRow,
  StockTransfer,
} from '@/lib/data/types';
import { isWithinTolerance, varianceQty } from './adjustment';

/** A draft is paper, not a movement (D-145). */
function moved(status: string, approvedBy?: string): boolean {
  if (status === 'CANCELLED' || status === 'REJECTED' || status === 'DRAFT') return false;
  return status === 'APPROVED' || status === 'CLOSED' || !!approvedBy;
}

type Raw = Omit<StockLedgerRow, 'balanceQty' | 'balanceValue'>;

function grnRows(rows: GoodsReceipt[]): Raw[] {
  return rows.filter((g) => moved(g.status, g.approvedBy)).flatMap((g) =>
    g.lines
      // Rejected material never entered stock, so it is not a movement (Q-103).
      .filter((l) => l.acceptedQty > 0)
      .map((l) => ({
        id: `${g.id}:${l.id}`,
        date: g.date,
        source: 'GRN' as LedgerSource,
        documentId: g.id,
        documentNo: g.documentNo,
        storeSiteId: g.storeSiteId,
        itemId: l.itemId,
        itemCode: l.itemCode,
        description: l.description,
        uomCode: l.uomCode,
        inQty: l.acceptedQty,
        outQty: 0,
        rate: l.rate,
        particulars: g.vendorName ?? g.poDocumentNo,
        remarks: l.remarks,
      })),
  );
}

function issueRows(rows: MaterialIssue[]): Raw[] {
  return rows.filter((m) => moved(m.status, m.approvedBy)).flatMap((m) =>
    m.lines
      .filter((l) => l.issuedQty > 0)
      .map((l) => ({
        id: `${m.id}:${l.id}`,
        date: m.date,
        source: 'ISSUE' as LedgerSource,
        documentId: m.id,
        documentNo: m.documentNo,
        storeSiteId: m.storeSiteId,
        itemId: l.itemId,
        itemCode: l.itemCode,
        description: l.description,
        uomCode: l.uomCode,
        inQty: 0,
        outQty: l.issuedQty,
        rate: l.rate,
        particulars: m.subcontractorName ?? m.purpose,
        remarks: l.remarks,
      })),
  );
}

function returnRows(rows: MaterialReturn[]): Raw[] {
  return rows.filter((r) => moved(r.status, r.approvedBy)).flatMap((r) =>
    r.lines
      // Only the good part re-entered usable stock; the damaged part is a loss (D-129).
      .filter((l) => l.restockedQty > 0)
      .map((l) => ({
        id: `${r.id}:${l.id}`,
        date: r.date,
        source: 'RETURN' as LedgerSource,
        documentId: r.id,
        documentNo: r.documentNo,
        storeSiteId: r.storeSiteId,
        itemId: l.itemId,
        itemCode: l.itemCode,
        description: l.description,
        uomCode: l.uomCode,
        inQty: l.restockedQty,
        outQty: 0,
        rate: l.rate,
        particulars: r.subcontractorName ?? r.issueDocumentNo ?? r.reason,
        remarks: l.remarks,
      })),
  );
}

/**
 * Two rows per line, at two stores, on two dates (D-146). Material on the road
 * has left one store and not yet reached the other, and the ledger says so.
 */
function transferRows(rows: StockTransfer[]): Raw[] {
  const out: Raw[] = [];
  for (const x of rows) {
    if (!moved(x.status, x.approvedBy) || x.stage === 'DRAFT') continue;
    for (const l of x.lines) {
      if (l.dispatchedQty > 0) {
        out.push({
          id: `${x.id}:${l.id}:out`,
          date: x.date,
          source: 'TRANSFER_OUT',
          documentId: x.id,
          documentNo: x.documentNo,
          storeSiteId: x.fromSiteId,
          itemId: l.itemId,
          itemCode: l.itemCode,
          description: l.description,
          uomCode: l.uomCode,
          inQty: 0,
          outQty: l.dispatchedQty,
          rate: l.rate,
          particulars: x.challanNo ?? x.vehicleNo,
          remarks: l.remarks,
        });
      }
      if (l.receivedQty > 0) {
        out.push({
          id: `${x.id}:${l.id}:in`,
          date: x.receivedDate ?? x.date,
          source: 'TRANSFER_IN',
          documentId: x.id,
          documentNo: x.documentNo,
          storeSiteId: x.toSiteId,
          itemId: l.itemId,
          itemCode: l.itemCode,
          description: l.description,
          uomCode: l.uomCode,
          inQty: l.receivedQty,
          outQty: 0,
          rate: l.rate,
          particulars: x.challanNo ?? x.vehicleNo,
          remarks: l.remarks,
        });
      }
    }
  }
  return out;
}

function adjustmentRows(rows: StockAdjustment[]): Raw[] {
  return rows.filter((x) => moved(x.status, x.approvedBy)).flatMap((x) =>
    x.lines
      // Within tolerance the book was never wrong enough to correct (D-142).
      .filter((l) => !isWithinTolerance(l))
      .map((l) => {
        const diff = varianceQty(l);
        return {
          id: `${x.id}:${l.id}`,
          date: x.date,
          source: 'ADJUSTMENT' as LedgerSource,
          documentId: x.id,
          documentNo: x.documentNo,
          storeSiteId: x.storeSiteId,
          itemId: l.itemId,
          itemCode: l.itemCode,
          description: l.description,
          uomCode: l.uomCode,
          inQty: diff > 0 ? diff : 0,
          outQty: diff < 0 ? Math.abs(diff) : 0,
          rate: l.rate,
          particulars: l.reason ?? x.reason,
          remarks: l.remarks,
        };
      }),
  );
}

/** The document the whole stock card rests on (D-154). */
function openingRows(rows: OpeningStock[]): Raw[] {
  return rows.filter((x) => moved(x.status, x.approvedBy)).flatMap((x) =>
    x.lines
      .filter((l) => l.quantity > 0)
      .map((l) => ({
        id: `${x.id}:${l.id}`,
        date: x.date,
        source: 'OPENING' as LedgerSource,
        documentId: x.id,
        documentNo: x.documentNo,
        storeSiteId: x.storeSiteId,
        itemId: l.itemId,
        itemCode: l.itemCode,
        description: l.description,
        uomCode: l.uomCode,
        inQty: l.quantity,
        outQty: 0,
        rate: l.rate,
        particulars: x.referenceNo,
        remarks: l.remarks,
      })),
  );
}

export interface LedgerInput {
  goodsReceipts: GoodsReceipt[];
  issues: MaterialIssue[];
  returns: MaterialReturn[];
  transfers: StockTransfer[];
  adjustments: StockAdjustment[];
  openings: OpeningStock[];
}

export interface LedgerFilter {
  storeSiteId?: string;
  itemId?: string;
  fromDate?: string;
  toDate?: string;
  source?: LedgerSource | 'ALL';
}

/** Date order, document number as the tie-break for same-day movements (D-148). */
function byDateThenDoc(a: Raw, b: Raw): number {
  if (a.date !== b.date) return a.date < b.date ? -1 : 1;
  return a.documentNo < b.documentNo ? -1 : a.documentNo > b.documentNo ? 1 : 0;
}

/** Every movement, unfiltered and unbalanced. */
export function allMovements(input: LedgerInput): Raw[] {
  return [
    ...grnRows(input.goodsReceipts),
    ...issueRows(input.issues),
    ...returnRows(input.returns),
    ...transferRows(input.transfers),
    ...adjustmentRows(input.adjustments),
  ].sort(byDateThenDoc);
}

/** Quantity and value in the store before the from-date. Shown as a row (D-148). */
export function openingBalance(
  movements: Raw[],
  filter: LedgerFilter,
): { quantity: number; value: number } {
  const before = movements.filter(
    (m) =>
      (!filter.storeSiteId || m.storeSiteId === filter.storeSiteId) &&
      (!filter.itemId || m.itemId === filter.itemId) &&
      !!filter.fromDate &&
      m.date < filter.fromDate,
  );
  return {
    quantity: before.reduce((sum, m) => sum + m.inQty - m.outQty, 0),
    value: before.reduce((sum, m) => sum + (m.inQty - m.outQty) * (m.rate ?? 0), 0),
  };
}

/**
 * The ledger as shown. Running balance is computed after filtering, so the
 * closing figure always matches the rows on screen (D-148).
 */
export function buildLedger(input: LedgerInput, filter: LedgerFilter = {}): StockLedgerRow[] {
  const all = allMovements(input);
  const rows = all.filter(
    (m) =>
      (!filter.storeSiteId || m.storeSiteId === filter.storeSiteId) &&
      (!filter.itemId || m.itemId === filter.itemId) &&
      (!filter.fromDate || m.date >= filter.fromDate) &&
      (!filter.toDate || m.date <= filter.toDate) &&
      (!filter.source || filter.source === 'ALL' || m.source === filter.source),
  );

  const opening = openingBalance(all, filter);
  let qty = opening.quantity;
  let value = opening.value;

  return rows.map((m) => {
    qty += m.inQty - m.outQty;
    value += (m.inQty - m.outQty) * (m.rate ?? 0);
    return { ...m, balanceQty: qty, balanceValue: value };
  });
}

/** Closing position of the ledger as shown. */
export function closingBalance(rows: StockLedgerRow[]): { quantity: number; value: number } {
  const last = rows[rows.length - 1];
  return last
    ? { quantity: last.balanceQty, value: last.balanceValue }
    : { quantity: 0, value: 0 };
}

/** Negative at any point in the period — the book went below zero (D-125). */
export function wentNegative(rows: StockLedgerRow[]): boolean {
  return rows.some((r) => r.balanceQty < 0);
}

export function ledgerTotals(rows: StockLedgerRow[], opening = { quantity: 0, value: 0 }) {
  const closing = closingBalance(rows);
  return {
    movements: rows.length,
    openingQty: opening.quantity,
    openingValue: opening.value,
    inQty: rows.reduce((sum, r) => sum + r.inQty, 0),
    inValue: rows.reduce((sum, r) => sum + r.inQty * (r.rate ?? 0), 0),
    outQty: rows.reduce((sum, r) => sum + r.outQty, 0),
    outValue: rows.reduce((sum, r) => sum + r.outQty * (r.rate ?? 0), 0),
    closingQty: rows.length ? closing.quantity : opening.quantity,
    closingValue: rows.length ? closing.value : opening.value,
    wentNegative: wentNegative(rows),
  };
}
