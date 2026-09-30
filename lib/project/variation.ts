/**
 * Variation helpers. Pure functions — no data access, so presenters may import
 * this directly.
 */
import { terminology as t } from '@/config/terminology.config';
import type { Variation, VariationCategory, VariationOrigin } from '@/lib/data/types';

/** Decided one way or the other — no longer sitting with the client. */
export function isDecided(v: Variation): boolean {
  return v.status === 'APPROVED' || v.status === 'REJECTED' || v.status === 'CLOSED';
}

/** Awaiting a client decision. A draft has not been put up yet, so it is not pending. */
export function isPending(v: Variation): boolean {
  return v.status === 'SUBMITTED' || v.status === 'PENDING_APPROVAL';
}

/** What the claim is worth today: the admitted figure once decided, else the claim. */
export function effectiveAmount(v: Variation): number {
  return v.approvedAmount ?? v.proposedAmount;
}

/** Rupees knocked off the claim by the client. Undefined while undecided. */
export function shortfall(v: Variation): number | undefined {
  if (v.approvedAmount === undefined) return undefined;
  return v.proposedAmount - v.approvedAmount;
}

export function categoryLabel(c: VariationCategory): string {
  return (
    {
      EXTRA_ITEM: t.project.vcEXTRA_ITEM,
      DEVIATION_QTY: t.project.vcDEVIATION_QTY,
      SUBSTITUTED_ITEM: t.project.vcSUBSTITUTED_ITEM,
      DESIGN_CHANGE: t.project.vcDESIGN_CHANGE,
      SCOPE_ADDITION: t.project.vcSCOPE_ADDITION,
      OMISSION: t.project.vcOMISSION,
    } as Record<VariationCategory, string>
  )[c];
}

export function originLabel(o: VariationOrigin): string {
  return (
    {
      CLIENT_INSTRUCTION: t.project.voCLIENT_INSTRUCTION,
      SITE_CONDITION: t.project.voSITE_CONDITION,
      DESIGN_REVISION: t.project.voDESIGN_REVISION,
      STATUTORY: t.project.voSTATUTORY,
      CONTRACTOR_PROPOSAL: t.project.voCONTRACTOR_PROPOSAL,
    } as Record<VariationOrigin, string>
  )[o];
}

/**
 * Register totals. `deviationPct` is the admitted value as a share of the
 * agreement value — the figure that decides whether the deviation limit in the
 * contract has been breached, so omissions are netted off rather than added.
 */
export function variationTotals(rows: Variation[], contractValue: number) {
  const approved = rows.filter((v) => v.status === 'APPROVED' || v.status === 'CLOSED');
  const approvedValue = approved.reduce((a, v) => a + (v.approvedAmount ?? 0), 0);
  const pendingValue = rows.filter(isPending).reduce((a, v) => a + v.proposedAmount, 0);
  return {
    total: rows.length,
    approvedValue,
    pendingValue,
    pendingCount: rows.filter(isPending).length,
    deviationPct: contractValue > 0 ? (approvedValue / contractValue) * 100 : 0,
  };
}
