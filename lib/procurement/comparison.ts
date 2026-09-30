/**
 * Comparative statement (CST) — the sheet the purchase file is decided on.
 * Pure logic: takes the offers against one enquiry and lays them side by side
 * at landed cost, item by item.
 */
import type { Quotation, Rfq } from '@/lib/data/types';
import { basicValue, extraCharges, isExpired, isPartialOffer, landedRate, landedValue, taxValue } from './quotation';

export interface ComparisonCell {
  quotationId: string;
  vendorId: string;
  /** Absent when the vendor did not quote this item at all. */
  quoted: boolean;
  basicRate: number;
  landedRate: number;
  landedAmount: number;
  makeOffered?: string;
  /** Cheapest landed rate for this item among comparable offers. */
  isLowest: boolean;
}

export interface ComparisonRow {
  rfqLineId: string;
  itemId: string;
  description: string;
  uomCode: string;
  quantity: number;
  estimatedRate?: number;
  cells: ComparisonCell[];
  /** Lowest landed rate on the row, across comparable offers only. */
  lowestRate: number | null;
  lowestVendorId?: string;
}

export interface VendorColumn {
  quotationId: string;
  vendorId: string;
  vendorName: string;
  documentNo: string;
  basicValue: number;
  charges: number;
  tax: number;
  landedValue: number;
  /** 1 = L1 overall. Non-comparable offers are unranked. */
  rank: number | null;
  isComparable: boolean;
  isTechnicallyQualified?: boolean;
  isPartial: boolean;
  isExpired: boolean;
  deliveryPeriodDays?: number;
  paymentTerms?: string;
  validUntil?: string;
  deviations?: string;
}

export interface ComparisonResult {
  rfq: Rfq | null;
  vendors: VendorColumn[];
  rows: ComparisonRow[];
  /** Total if the whole enquiry goes to the single cheapest vendor. */
  singleVendorValue: number | null;
  singleVendorId?: string;
  /** Total if every item goes to whoever is cheapest on that item. */
  splitAwardValue: number | null;
  /** What splitting the award would save over the single lowest vendor. */
  splitSaving: number;
  /** Estimate carried on the enquiry, for the variance line. */
  estimatedValue: number;
}

/**
 * An offer enters the ranking only if it is technically acceptable, complete
 * and still valid. Others stay on the sheet for record but are not ranked
 * (D-107) — a purchase file must show every offer received, including rejects.
 */
export function isComparable(q: Quotation, asOn?: string): boolean {
  return q.isTechnicallyQualified !== false && !isPartialOffer(q) && !isExpired(q, asOn);
}

export function buildComparison(
  rfq: Rfq | null,
  quotations: Quotation[],
  asOn?: string,
): ComparisonResult {
  const vendors: VendorColumn[] = quotations.map((q) => ({
    quotationId: q.id,
    vendorId: q.vendorId,
    vendorName: q.vendorName,
    documentNo: q.documentNo,
    basicValue: basicValue(q),
    charges: extraCharges(q),
    tax: taxValue(q),
    landedValue: landedValue(q),
    rank: null,
    isComparable: isComparable(q, asOn),
    isTechnicallyQualified: q.isTechnicallyQualified,
    isPartial: isPartialOffer(q),
    isExpired: isExpired(q, asOn),
    deliveryPeriodDays: q.deliveryPeriodDays,
    paymentTerms: q.paymentTerms,
    validUntil: q.validUntil,
    deviations: q.deviations,
  }));

  // Rank only the comparable offers, cheapest landed value first.
  vendors
    .filter((v) => v.isComparable)
    .sort((a, b) => a.landedValue - b.landedValue)
    .forEach((v, i) => {
      v.rank = i + 1;
    });

  const lineSpecs = rfq
    ? rfq.lines.map((l) => ({
        rfqLineId: l.id,
        itemId: l.itemId,
        description: l.description,
        uomCode: l.uomCode,
        quantity: l.quantity,
        estimatedRate: l.estimatedRate,
      }))
    : [];

  const rows: ComparisonRow[] = lineSpecs.map((spec) => {
    const cells: ComparisonCell[] = quotations.map((q) => {
      const line = q.lines.find((l) => l.rfqLineId === spec.rfqLineId || l.itemId === spec.itemId);
      const quoted = !!line && !line.notQuoted;
      const rate = quoted ? landedRate(q, line) : 0;
      return {
        quotationId: q.id,
        vendorId: q.vendorId,
        quoted,
        basicRate: quoted ? line.basicRate : 0,
        landedRate: rate,
        landedAmount: rate * spec.quantity,
        makeOffered: line?.makeOffered,
        isLowest: false,
      };
    });

    // Lowest on the row, considering comparable offers only.
    const eligible = cells.filter(
      (c) => c.quoted && vendors.find((v) => v.quotationId === c.quotationId)?.isComparable,
    );
    const best = eligible.length
      ? eligible.reduce((lo, c) => (c.landedRate < lo.landedRate ? c : lo))
      : null;
    if (best) best.isLowest = true;

    return {
      ...spec,
      cells,
      lowestRate: best ? best.landedRate : null,
      lowestVendorId: best?.vendorId,
    };
  });

  const l1 = vendors.find((v) => v.rank === 1) ?? null;
  const splitAwardValue = rows.length
    ? rows.reduce((sum, r) => sum + (r.lowestRate === null ? 0 : r.lowestRate * r.quantity), 0)
    : null;

  const estimatedValue = rfq
    ? rfq.lines.reduce((sum, l) => sum + l.quantity * (l.estimatedRate ?? 0), 0)
    : 0;

  return {
    rfq,
    vendors,
    rows,
    singleVendorValue: l1 ? l1.landedValue : null,
    singleVendorId: l1?.vendorId,
    splitAwardValue,
    splitSaving:
      l1 && splitAwardValue !== null ? Math.max(0, l1.landedValue - splitAwardValue) : 0,
    estimatedValue,
  };
}

/** Variance of the L1 landed value against the internal estimate, in percent. */
export function estimateVariancePct(c: ComparisonResult): number | null {
  if (!c.estimatedValue || c.singleVendorValue === null) return null;
  return ((c.singleVendorValue - c.estimatedValue) / c.estimatedValue) * 100;
}
