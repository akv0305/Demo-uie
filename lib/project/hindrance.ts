/**
 * Hindrance helpers. Pure functions — no data access, so presenters may import
 * this directly.
 */
import { differenceInCalendarDays } from 'date-fns';
import { terminology as t } from '@/config/terminology.config';
import type { Hindrance, HindranceCategory, HindranceResponsibility } from '@/lib/data/types';

export function isOpen(h: Hindrance): boolean {
  return !h.toDate;
}

/**
 * Elapsed days, inclusive of both dates. An open hindrance counts to today,
 * so the figure grows until it is closed.
 */
export function daysLost(h: Hindrance): number {
  const end = h.toDate ? new Date(h.toDate) : new Date();
  return Math.max(0, differenceInCalendarDays(end, new Date(h.fromDate)) + 1);
}

export function categoryLabel(c: HindranceCategory): string {
  return (
    {
      LAND_ACQUISITION: t.project.hcLAND_ACQUISITION,
      DRAWINGS_APPROVAL: t.project.hcDRAWINGS_APPROVAL,
      UTILITY_SHIFTING: t.project.hcUTILITY_SHIFTING,
      STATUTORY_PERMISSION: t.project.hcSTATUTORY_PERMISSION,
      WEATHER: t.project.hcWEATHER,
      CLIENT_MATERIAL: t.project.hcCLIENT_MATERIAL,
      PAYMENT_DELAY: t.project.hcPAYMENT_DELAY,
      LABOUR_SHORTAGE: t.project.hcLABOUR_SHORTAGE,
      EQUIPMENT_BREAKDOWN: t.project.hcEQUIPMENT_BREAKDOWN,
      LAW_AND_ORDER: t.project.hcLAW_AND_ORDER,
      OTHER: t.project.hcOTHER,
    } as Record<HindranceCategory, string>
  )[c];
}

export function responsibilityLabel(r: HindranceResponsibility): string {
  return (
    {
      CLIENT: t.project.hrCLIENT,
      CONTRACTOR: t.project.hrCONTRACTOR,
      EXTERNAL: t.project.hrEXTERNAL,
    } as Record<HindranceResponsibility, string>
  )[r];
}

export function hindranceTotals(rows: Hindrance[]) {
  const open = rows.filter(isOpen);
  return {
    total: rows.length,
    open: open.length,
    daysOpen: open.reduce((a, h) => a + daysLost(h), 0),
    eotDays: rows.reduce((a, h) => a + (h.isEotClaimable ? (h.eotClaimDays ?? 0) : 0), 0),
  };
}
