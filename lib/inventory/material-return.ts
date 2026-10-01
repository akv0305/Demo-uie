/**
 * Pure helpers for material return. No React, no data access (D-122).
 *
 * Material coming back is two numbers, not one: what the site handed over and
 * what was still fit to put back on the rack. The difference is a loss the job
 * has to carry, and hiding it inside a single "returned" figure is how stores
 * registers stop matching the yard (D-129).
 */
import type {
  MaterialIssue,
  MaterialIssueLine,
  MaterialReturn,
  MaterialReturnLine,
} from '@/lib/data/types';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Credit going back to the job — only what re-entered usable stock (D-128). */
export function restockValue(l: MaterialReturnLine): number {
  return l.restockedQty * (l.rate ?? 0);
}

/** Value handed back but unusable. A loss, not a credit. */
export function damagedValue(l: MaterialReturnLine): number {
  return l.damagedQty * (l.rate ?? 0);
}

export function returnValue(r: MaterialReturn): number {
  return r.lines.reduce((sum, l) => sum + restockValue(l), 0);
}

export function damagedValueTotal(r: MaterialReturn): number {
  return r.lines.reduce((sum, l) => sum + damagedValue(l), 0);
}

export function returnedQtyTotal(r: MaterialReturn): number {
  return r.lines.reduce((sum, l) => sum + l.returnedQty, 0);
}

export function restockedQtyTotal(r: MaterialReturn): number {
  return r.lines.reduce((sum, l) => sum + l.restockedQty, 0);
}

export function damagedQtyTotal(r: MaterialReturn): number {
  return r.lines.reduce((sum, l) => sum + l.damagedQty, 0);
}

export function hasDamage(r: MaterialReturn): boolean {
  return r.lines.some((l) => l.damagedQty > 0);
}

/** Restocked plus damaged must account for everything handed back. */
export function isLineBalanced(l: MaterialReturnLine): boolean {
  return Math.abs(l.restockedQty + l.damagedQty - l.returnedQty) < 0.001;
}

export function hasUnbalancedLine(r: MaterialReturn): boolean {
  return r.lines.some((l) => !isLineBalanced(l));
}

// ---------------------------------------------------------------------------
// Against the issue (D-130, D-132)
// ---------------------------------------------------------------------------

/**
 * Still out against an issue line. Deliberately ignores isReturnable — surplus
 * consumable material comes back too, and the store must be able to take it.
 */
export function issueLinePending(l: MaterialIssueLine): number {
  return Math.max(0, l.issuedQty - (l.returnedQty ?? 0));
}

export function issuePendingTotal(m: MaterialIssue): number {
  return m.lines.reduce((sum, l) => sum + issueLinePending(l), 0);
}

/** Returning more than went out. Flagged for the storekeeper, never blocked. */
export function exceedsIssued(l: MaterialIssueLine, returnedQty: number): boolean {
  return returnedQty > issueLinePending(l);
}

/** Lines seeded from what is still out against an issue. */
export function seedLinesFromIssue(m: MaterialIssue): Omit<MaterialReturnLine, 'id'>[] {
  return m.lines
    .filter((l) => issueLinePending(l) > 0)
    .map((l) => ({
      issueLineId: l.id,
      itemId: l.itemId,
      itemCode: l.itemCode,
      description: l.description,
      uomCode: l.uomCode,
      returnedQty: 0,
      restockedQty: 0,
      damagedQty: 0,
      condition: 'GOOD' as const,
      rate: l.rate,
      wbsId: l.wbsId,
    }));
}

/**
 * The write-back. Mirrors postToPo: the return is the only writer of
 * MaterialIssueLine.returnedQty (D-130).
 */
export function postToIssue(m: MaterialIssue, r: MaterialReturn): MaterialIssue {
  return {
    ...m,
    lines: m.lines.map((il) => {
      const returned = r.lines
        .filter((rl) => rl.issueLineId === il.id)
        .reduce((sum, rl) => sum + rl.returnedQty, 0);
      return returned ? { ...il, returnedQty: (il.returnedQty ?? 0) + returned } : il;
    }),
  };
}

export function returnTotals(rows: MaterialReturn[], asOn: string = today()) {
  const live = rows.filter((r) => r.status !== 'CANCELLED');
  return {
    total: live.length,
    thisMonth: live.filter((r) => r.date.slice(0, 7) === asOn.slice(0, 7)).length,
    restockValue: live.reduce((sum, r) => sum + returnValue(r), 0),
    withDamage: live.filter(hasDamage).length,
    damagedValue: live.reduce((sum, r) => sum + damagedValueTotal(r), 0),
    fromSubcontractor: live.filter((r) => r.returnType === 'FROM_SUBCONTRACTOR').length,
    withoutIssue: live.filter((r) => !r.issueId).length,
  };
}
