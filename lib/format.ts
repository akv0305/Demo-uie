/**
 * Indian formatting conventions used across every screen.
 *  - Currency: INR with en-IN digit grouping (12,45,600)
 *  - Dates: dd-MMM-yyyy
 *  - Quantities: 3 decimal places
 *  - Amounts: 2 decimal places
 */
import { format, isValid, parseISO } from 'date-fns';
import { terminology as t } from '@/config/terminology.config';

const AMOUNT_DECIMALS = 2;
const QUANTITY_DECIMALS = 3;

function toDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const d = typeof value === 'string' ? parseISO(value) : value;
  return isValid(d) ? d : null;
}

/** dd-MMM-yyyy, e.g. 08-Aug-2026 */
export function formatDate(value: string | Date | null | undefined): string {
  const d = toDate(value);
  return d ? format(d, 'dd-MMM-yyyy') : '—';
}

/** dd-MMM-yyyy HH:mm */
export function formatDateTime(value: string | Date | null | undefined): string {
  const d = toDate(value);
  return d ? format(d, 'dd-MMM-yyyy HH:mm') : '—';
}

/** Amount with en-IN grouping and 2 decimals — no currency symbol. */
export function formatAmount(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: AMOUNT_DECIMALS,
    maximumFractionDigits: AMOUNT_DECIMALS,
  }).format(value);
}

/** Amount prefixed with the rupee symbol. */
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return `${t.common.currencySymbol}${formatAmount(value)}`;
}

/** Quantity with en-IN grouping and 3 decimals. */
export function formatQuantity(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: QUANTITY_DECIMALS,
    maximumFractionDigits: QUANTITY_DECIMALS,
  }).format(value);
}

/** Whole number with en-IN grouping. */
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value);
}

/** Converts rupees into a crore figure for management reporting. */
export function formatCrore(rupees: number): string {
  return `${new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rupees / 10000000)} ${t.common.inCrore}`;
}

/** Converts rupees into a lakh figure. */
export function formatLakh(rupees: number): string {
  return `${new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rupees / 100000)} ${t.common.inLakh}`;
}

export function formatPercent(value: number | null | undefined, decimals = 1): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return `${value.toFixed(decimals)}%`;
}

/** ISO yyyy-MM-dd for input[type=date] values. */
export function toInputDate(value: string | Date | null | undefined): string {
  const d = toDate(value);
  return d ? format(d, 'yyyy-MM-dd') : '';
}

export function todayInputDate(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/** Crore → rupees. Forms accept crore; storage is whole rupees (D-059). */
export function croreToRupees(crore: number): number {
  return Math.round(crore * 10000000);
}

/** Rupees → crore, for prefilling a crore-denominated form field. */
export function rupeesToCrore(rupees: number): number {
  return rupees / 10000000;
}
