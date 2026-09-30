/**
 * Bank guarantee and retention helpers. Pure functions — no data access, so
 * presenters may import this directly.
 */
import { differenceInCalendarDays } from 'date-fns';
import { terminology as t } from '@/config/terminology.config';
import type { BankGuarantee, BgStatus, BgType, RetentionEntry, RetentionEvent } from '@/lib/data/types';

/**
 * Banks and clients both want the extension in hand well before expiry, and
 * the paperwork takes weeks. Sixty days is the usual working margin, but it is
 * a company policy rather than a contract term — Q-70.
 */
export const DEFAULT_EXPIRY_WARNING_DAYS = 60;

/** Still carrying risk. A released or invoked guarantee no longer does. */
export function isLive(bg: BankGuarantee): boolean {
  return bg.bgStatus === 'LIVE' || bg.bgStatus === 'UNDER_EXTENSION';
}

/** Negative once the validity date has passed. */
export function daysToExpiry(bg: BankGuarantee): number {
  return differenceInCalendarDays(new Date(bg.validUpto), new Date());
}

/** Live, and either already lapsed or close enough to need action now. */
export function isExpiringSoon(bg: BankGuarantee, withinDays = DEFAULT_EXPIRY_WARNING_DAYS): boolean {
  return isLive(bg) && daysToExpiry(bg) <= withinDays;
}

/** Already past its validity date while still on the books. */
export function isLapsed(bg: BankGuarantee): boolean {
  return isLive(bg) && daysToExpiry(bg) < 0;
}

export function bgTypeLabel(v: BgType): string {
  return (
    {
      PERFORMANCE: t.project.bgtPERFORMANCE,
      MOBILISATION_ADVANCE: t.project.bgtMOBILISATION_ADVANCE,
      RETENTION_MONEY: t.project.bgtRETENTION_MONEY,
      ADVANCE_PAYMENT: t.project.bgtADVANCE_PAYMENT,
      SECURITY_DEPOSIT: t.project.bgtSECURITY_DEPOSIT,
      EMD: t.project.bgtEMD,
    } as Record<BgType, string>
  )[v];
}

export function bgStatusLabel(v: BgStatus): string {
  return (
    {
      LIVE: t.project.bgsLIVE,
      UNDER_EXTENSION: t.project.bgsUNDER_EXTENSION,
      EXPIRED: t.project.bgsEXPIRED,
      RELEASED: t.project.bgsRELEASED,
      INVOKED: t.project.bgsINVOKED,
    } as Record<BgStatus, string>
  )[v];
}

export function bgTotals(rows: BankGuarantee[], withinDays = DEFAULT_EXPIRY_WARNING_DAYS) {
  const live = rows.filter(isLive);
  return {
    total: rows.length,
    liveCount: live.length,
    liveValue: live.reduce((a, b) => a + b.amount, 0),
    /** Margin money and FDRs locked up behind the live guarantees. */
    marginLocked: live.reduce((a, b) => a + (b.marginAmount ?? 0), 0),
    expiringCount: rows.filter((b) => isExpiringSoon(b, withinDays)).length,
    lapsedCount: rows.filter(isLapsed).length,
  };
}

export function retentionTotals(rows: RetentionEntry[]) {
  const sum = (e: RetentionEvent) =>
    rows.filter((r) => r.event === e).reduce((a, r) => a + r.amount, 0);
  const deducted = sum('DEDUCTED');
  const released = sum('RELEASED');
  const substituted = sum('SUBSTITUTED_BY_BG');
  return {
    deducted,
    released,
    substituted,
    /** Cash the client is still holding. */
    balance: deducted - released - substituted,
  };
}

/** Running balance after each movement, oldest first — the ledger view. */
export function withRunningBalance(rows: RetentionEntry[]): (RetentionEntry & { balance: number })[] {
  const ordered = [...rows].sort((a, b) => (a.date < b.date ? -1 : 1));
  let balance = 0;
  return ordered.map((r) => {
    balance += r.event === 'DEDUCTED' ? r.amount : -r.amount;
    return { ...r, balance };
  });
}
