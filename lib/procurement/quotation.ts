/**
 * Pure helpers for vendor offers. The whole point of this module is the
 * landed rate — the only figure on which two offers may honestly be compared.
 */
import type { Quotation, QuotationLine } from '@/lib/data/types';

const MS_PER_DAY = 86_400_000;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Rate after the vendor's own line discount, before charges and tax. */
export function netRate(l: QuotationLine): number {
  return l.basicRate * (1 - (l.discountPct ?? 0) / 100);
}

export function lineBasic(l: QuotationLine): number {
  return l.notQuoted ? 0 : netRate(l) * l.quantity;
}

export function lineTax(l: QuotationLine): number {
  return lineBasic(l) * (l.gstRate / 100);
}

export function lineTotal(l: QuotationLine): number {
  return lineBasic(l) + lineTax(l);
}

/** Sum of the quoted lines before document-level charges. */
export function basicValue(q: Quotation): number {
  return q.lines.reduce((sum, l) => sum + lineBasic(l), 0);
}

/** Freight, loading and packing quoted extra. Included charges add nothing. */
export function extraCharges(q: Quotation): number {
  const c = q.charges;
  const pick = (basis: string, amount?: number) => (basis === 'EXTRA' ? (amount ?? 0) : 0);
  return (
    pick(c.freightBasis, c.freightAmount) +
    pick(c.loadingBasis, c.loadingAmount) +
    pick(c.packingBasis, c.packingAmount)
  );
}

export function taxValue(q: Quotation): number {
  const lineTaxes = q.lines.reduce((sum, l) => sum + lineTax(l), 0);
  const chargeTax = extraCharges(q) * ((q.charges.chargesGstRate ?? 0) / 100);
  return lineTaxes + chargeTax;
}

/**
 * Landed value — everything the company will actually pay. This is the figure
 * the comparative statement ranks on, not the quoted rate.
 */
export function landedValue(q: Quotation): number {
  return basicValue(q) + extraCharges(q) + taxValue(q);
}

/**
 * Landed rate per unit for a single line, with the document-level charges
 * apportioned on the line's share of basic value (D-105).
 */
export function landedRate(q: Quotation, l: QuotationLine): number {
  if (l.notQuoted || l.quantity === 0) return 0;
  const basic = basicValue(q);
  const share = basic > 0 ? lineBasic(l) / basic : 0;
  const apportioned = (extraCharges(q) + extraCharges(q) * ((q.charges.chargesGstRate ?? 0) / 100)) * share;
  return (lineTotal(l) + apportioned) / l.quantity;
}

export function quotedLineCount(q: Quotation): number {
  return q.lines.filter((l) => !l.notQuoted).length;
}

/** A partial offer cannot be compared line for line without a note on the file. */
export function isPartialOffer(q: Quotation): boolean {
  return q.lines.some((l) => l.notQuoted);
}

export function isExpired(q: Quotation, asOn: string = today()): boolean {
  return !!q.validUntil && q.validUntil < asOn;
}

export function daysToExpiry(q: Quotation, asOn: string = today()): number | null {
  if (!q.validUntil) return null;
  return Math.round((new Date(q.validUntil).getTime() - new Date(asOn).getTime()) / MS_PER_DAY);
}

export function quotationTotals(rows: Quotation[], asOn: string = today()) {
  const live = rows.filter((q) => !isExpired(q, asOn));
  return {
    total: rows.length,
    live: live.length,
    expired: rows.length - live.length,
    partial: rows.filter(isPartialOffer).length,
    qualified: rows.filter((q) => q.isTechnicallyQualified).length,
    pendingScrutiny: rows.filter((q) => q.isTechnicallyQualified === undefined).length,
    landedValue: rows.reduce((sum, q) => sum + landedValue(q), 0),
    expiringSoon: live.filter((q) => {
      const d = daysToExpiry(q, asOn);
      return d !== null && d >= 0 && d <= 7;
    }).length,
  };
}

/** Lowest landed value among comparable offers — the L1 the file will cite. */
export function lowestLanded(rows: Quotation[]): Quotation | null {
  const comparable = rows.filter((q) => q.isTechnicallyQualified !== false && !isPartialOffer(q));
  if (!comparable.length) return null;
  return comparable.reduce((best, q) => (landedValue(q) < landedValue(best) ? q : best));
}
