/**
 * Claim helpers. Pure functions — no data access, so presenters may import
 * this directly.
 */
import { differenceInCalendarDays } from 'date-fns';
import { terminology as t } from '@/config/terminology.config';
import type { Claim, ClaimStage, ClaimType } from '@/lib/data/types';

/** Concluded, one way or the other. */
export function isClosed(c: Claim): boolean {
  return c.stage === 'SETTLED' || c.stage === 'WITHDRAWN';
}

/** Escalated beyond the engineer — a commercial risk worth flagging. */
export function isInDispute(c: Claim): boolean {
  return c.stage === 'CONCILIATION' || c.stage === 'ARBITRATION';
}

/**
 * Days between putting the client on notice and submitting particulars.
 * Most contracts set a limit; a long gap weakens the claim.
 */
export function particularsLag(c: Claim): number | undefined {
  if (!c.noticeDate || !c.particularsDate) return undefined;
  return Math.max(0, differenceInCalendarDays(new Date(c.particularsDate), new Date(c.noticeDate)));
}

/** Rupees conceded against the amount sought. Undefined while undecided. */
export function claimShortfall(c: Claim): number | undefined {
  if (c.settledAmount === undefined) return undefined;
  return c.claimedAmount - c.settledAmount;
}

export function typeLabel(v: ClaimType): string {
  return (
    {
      EOT: t.project.ctEOT,
      PROLONGATION: t.project.ctPROLONGATION,
      IDLE_RESOURCES: t.project.ctIDLE_RESOURCES,
      PRICE_ESCALATION: t.project.ctPRICE_ESCALATION,
      DELAYED_PAYMENT_INTEREST: t.project.ctDELAYED_PAYMENT_INTEREST,
      CHANGE_IN_LAW: t.project.ctCHANGE_IN_LAW,
      OTHER: t.project.ctOTHER,
    } as Record<ClaimType, string>
  )[v];
}

export function stageLabel(v: ClaimStage): string {
  return (
    {
      NOTICE_GIVEN: t.project.csNOTICE_GIVEN,
      PARTICULARS_SUBMITTED: t.project.csPARTICULARS_SUBMITTED,
      UNDER_REVIEW: t.project.csUNDER_REVIEW,
      ENGINEER_DECISION: t.project.csENGINEER_DECISION,
      CONCILIATION: t.project.csCONCILIATION,
      ARBITRATION: t.project.csARBITRATION,
      SETTLED: t.project.csSETTLED,
      WITHDRAWN: t.project.csWITHDRAWN,
    } as Record<ClaimStage, string>
  )[v];
}

/**
 * Register totals. Live value is what is still being pursued, so settled and
 * withdrawn claims drop out of it.
 */
export function claimTotals(rows: Claim[]) {
  const live = rows.filter((c) => !isClosed(c));
  return {
    total: rows.length,
    liveValue: live.reduce((a, c) => a + c.claimedAmount, 0),
    liveCount: live.length,
    settledValue: rows.reduce((a, c) => a + (c.settledAmount ?? 0), 0),
    disputeCount: rows.filter(isInDispute).length,
    daysSought: live.reduce((a, c) => a + (c.claimedDays ?? 0), 0),
  };
}
