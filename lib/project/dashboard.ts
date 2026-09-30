/**
 * Project controls dashboard. Pure functions — no data access, so presenters
 * may import this directly.
 *
 * This assembles the monthly review position an Indian PM presents: physical
 * against financial progress, time elapsed against work done, and the
 * commercial exposure carried in the registers.
 */
import { differenceInCalendarDays } from 'date-fns';
import { terminology as t } from '@/config/terminology.config';
import type {
  BankGuarantee,
  Claim,
  DailyProgressReport,
  Hindrance,
  Project,
  Variation,
} from '@/lib/data/types';
import { bgTotals } from './bg-retention';
import { claimTotals } from './claim';
import { daysLost, isOpen } from './hindrance';
import { isPending } from './variation';
import { wbsTotals, type RolledWbsNode } from './wbs-rollup';

/**
 * Physical progress trailing time elapsed by more than this many points is
 * treated as slippage worth flagging. A working convention, not a contract
 * term — Q-73.
 */
export const SLIPPAGE_THRESHOLD_PCT = 5;

export interface ProgressGauge {
  label: string;
  pct: number;
  /** Amber/red styling is decided here, not in the view. */
  severity: 'ok' | 'warn' | 'bad';
}

export interface DashboardPosition {
  /** Time */
  timeElapsedPct: number;
  daysElapsed: number;
  daysTotal: number;
  daysRemaining: number;
  isOverrun: boolean;

  /** Progress */
  physicalPct: number;
  financialPct: number;
  /** Physical minus time elapsed. Negative means behind programme. */
  slippagePct: number;
  isSlipping: boolean;

  /** Cost */
  budget: number;
  actual: number;
  costBalance: number;
  consumedPct: number;
  overrunNodes: number;

  /** Commercial exposure */
  openHindrances: number;
  hindranceDaysOpen: number;
  eotDaysClaimable: number;
  pendingVariationValue: number;
  pendingVariationCount: number;
  liveClaimValue: number;
  liveClaimCount: number;
  disputeCount: number;
  /** Everything not yet admitted by the client. */
  totalExposure: number;

  /** Guarantees */
  bgLiveValue: number;
  bgExpiringCount: number;
  bgLapsedCount: number;

  /** Reporting discipline */
  dprCount: number;
  dprPendingApproval: number;
  lastDprDate?: string;
  daysSinceLastDpr?: number;
}

export function dashboardPosition(
  project: Project | null,
  wbs: RolledWbsNode[],
  hindrances: Hindrance[],
  variations: Variation[],
  claims: Claim[],
  guarantees: BankGuarantee[],
  dprs: DailyProgressReport[],
): DashboardPosition {
  const now = new Date();
  const start = project?.startDate ? new Date(project.startDate) : null;
  const end = project?.endDate ? new Date(project.endDate) : null;

  const daysTotal = start && end ? Math.max(1, differenceInCalendarDays(end, start)) : 0;
  const daysElapsed = start ? Math.max(0, differenceInCalendarDays(now, start)) : 0;
  const daysRemaining = end ? differenceInCalendarDays(end, now) : 0;
  const timeElapsedPct = daysTotal > 0 ? Math.min(100, (daysElapsed / daysTotal) * 100) : 0;

  const physicalPct = project?.physicalProgressPct ?? 0;
  const financialPct = project?.financialProgressPct ?? 0;
  const slippagePct = physicalPct - timeElapsedPct;

  const cost = wbsTotals(wbs);

  const open = hindrances.filter(isOpen);
  const eotDaysClaimable = hindrances.reduce(
    (a, h) => a + (h.isEotClaimable ? (h.eotClaimDays ?? 0) : 0),
    0,
  );

  const pending = variations.filter(isPending);
  const pendingVariationValue = pending.reduce((a, v) => a + v.proposedAmount, 0);
  const clm = claimTotals(claims);
  const bg = bgTotals(guarantees);

  // Sorted newest first so the latest report date is simply the head.
  const ordered = [...dprs].sort((a, b) => (a.date > b.date ? -1 : 1));
  const lastDprDate = ordered[0]?.date;

  return {
    timeElapsedPct,
    daysElapsed,
    daysTotal,
    daysRemaining,
    isOverrun: daysRemaining < 0,

    physicalPct,
    financialPct,
    slippagePct,
    isSlipping: slippagePct < -SLIPPAGE_THRESHOLD_PCT,

    budget: cost.budget,
    actual: cost.actual,
    costBalance: cost.budget - cost.actual,
    consumedPct: cost.consumedPct,
    overrunNodes: cost.overrunCount,

    openHindrances: open.length,
    hindranceDaysOpen: open.reduce((a, h) => a + daysLost(h), 0),
    eotDaysClaimable,
    pendingVariationValue,
    pendingVariationCount: pending.length,
    liveClaimValue: clm.liveValue,
    liveClaimCount: clm.liveCount,
    disputeCount: clm.disputeCount,
    totalExposure: pendingVariationValue + clm.liveValue,

    bgLiveValue: bg.liveValue,
    bgExpiringCount: bg.expiringCount,
    bgLapsedCount: bg.lapsedCount,

    dprCount: dprs.length,
    dprPendingApproval: dprs.filter(
      (d) => d.status === 'PENDING_APPROVAL' || d.status === 'SUBMITTED',
    ).length,
    lastDprDate,
    daysSinceLastDpr: lastDprDate
      ? Math.max(0, differenceInCalendarDays(now, new Date(lastDprDate)))
      : undefined,
  };
}

/**
 * The three bars a PM is asked about first. Physical is judged against time
 * elapsed, and financial against physical — billing running ahead of work done
 * is its own kind of problem.
 */
export function progressGauges(p: DashboardPosition): ProgressGauge[] {
  const physicalSeverity: ProgressGauge['severity'] =
    p.slippagePct < -SLIPPAGE_THRESHOLD_PCT * 2
      ? 'bad'
      : p.slippagePct < -SLIPPAGE_THRESHOLD_PCT
        ? 'warn'
        : 'ok';

  return [
    { label: t.project.dbTimeElapsed, pct: p.timeElapsedPct, severity: 'ok' },
    { label: t.project.dbPhysical, pct: p.physicalPct, severity: physicalSeverity },
    {
      label: t.project.dbFinancial,
      pct: p.financialPct,
      severity: p.financialPct > p.physicalPct + SLIPPAGE_THRESHOLD_PCT ? 'warn' : 'ok',
    },
  ];
}

export interface HindranceSplit {
  label: string;
  count: number;
  days: number;
  pct: number;
}

/**
 * Delay days grouped by who is answerable. This is the single most useful cut
 * on an Indian dashboard, because client-attributable days are what an EOT
 * claim rests on.
 */
export function hindranceByResponsibility(rows: Hindrance[]): HindranceSplit[] {
  const buckets: { key: Hindrance['responsibility']; label: string }[] = [
    { key: 'CLIENT', label: t.project.hrCLIENT },
    { key: 'CONTRACTOR', label: t.project.hrCONTRACTOR },
    { key: 'EXTERNAL', label: t.project.hrEXTERNAL },
  ];
  const totalDays = rows.reduce((a, h) => a + daysLost(h), 0);

  return buckets.map(({ key, label }) => {
    const mine = rows.filter((h) => h.responsibility === key);
    const days = mine.reduce((a, h) => a + daysLost(h), 0);
    return {
      label,
      count: mine.length,
      days,
      pct: totalDays > 0 ? (days / totalDays) * 100 : 0,
    };
  });
}

export interface TrendPoint {
  label: string;
  /** Quantity executed on that day, across all WBS lines on the report. */
  value: number;
}

/**
 * Daily executed quantity from the DPRs, oldest first. Not a true S-curve —
 * that needs a baseline programme, which Phase 1 does not hold (Q-74) — but it
 * shows the working trend and where a wet day bites.
 */
export function dprTrend(dprs: DailyProgressReport[], lastN = 14): TrendPoint[] {
  return [...dprs]
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .slice(-lastN)
    .map((d) => ({
      label: d.date,
      value: (d.progressLines ?? []).reduce((a, l) => a + (l.todayQty ?? 0), 0),
    }));
}
