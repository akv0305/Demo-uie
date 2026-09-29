/**
 * WBS rollup. Indian BOQ convention: only leaf nodes carry priced quantities
 * and amounts; a parent row totals its descendants (D-089).
 *
 * Pure functions — no data access, so presenters may import this.
 */
import type { WbsNode } from '@/lib/data/types';

export interface RolledWbsNode extends WbsNode {
  /** True when this node has children, i.e. it is a heading. */
  isParent: boolean;
  /** Budget in rupees: own figure for a leaf, sum of descendants for a parent. */
  rolledBudgetedCost: number;
  rolledActualCost: number;
  /** Cost consumed as a percentage of budget. undefined when no budget. */
  consumedPct?: number;
  /** Physical progress. Leaf nodes only — quantities do not sum across units. */
  executedPct?: number;
  /** Cost is running ahead of physical progress by more than 5 points. */
  isOverrun: boolean;
}

export function rollupWbs(nodes: WbsNode[]): RolledWbsNode[] {
  const childrenOf = new Map<string, WbsNode[]>();
  nodes.forEach((n) => {
    const key = n.parentId ?? '';
    if (!childrenOf.has(key)) childrenOf.set(key, []);
    childrenOf.get(key)!.push(n);
  });

  const budgetCache = new Map<string, number>();
  const actualCache = new Map<string, number>();

  const sum = (node: WbsNode, depth: number): { budget: number; actual: number } => {
    if (budgetCache.has(node.id)) {
      return { budget: budgetCache.get(node.id)!, actual: actualCache.get(node.id)! };
    }
    const kids = childrenOf.get(node.id) ?? [];
    let budget: number;
    let actual: number;
    if (kids.length === 0 || depth > 10) {
      budget = node.budgetedCost ?? 0;
      actual = node.actualCost ?? 0;
    } else {
      budget = 0;
      actual = 0;
      kids.forEach((k) => {
        const s = sum(k, depth + 1);
        budget += s.budget;
        actual += s.actual;
      });
    }
    budgetCache.set(node.id, budget);
    actualCache.set(node.id, actual);
    return { budget, actual };
  };

  return nodes.map((n) => {
    const kids = childrenOf.get(n.id) ?? [];
    const { budget, actual } = sum(n, 0);
    const consumedPct = budget > 0 ? (actual / budget) * 100 : undefined;
    const executedPct =
      kids.length === 0 && n.budgetedQty && n.executedQty !== undefined
        ? (n.executedQty / n.budgetedQty) * 100
        : undefined;
    return {
      ...n,
      isParent: kids.length > 0,
      rolledBudgetedCost: budget,
      rolledActualCost: actual,
      consumedPct,
      executedPct,
      isOverrun:
        consumedPct !== undefined && executedPct !== undefined && consumedPct > executedPct + 5,
    };
  });
}

/** Project totals = sum of the top-level nodes only, never every row. */
export function wbsTotals(rolled: RolledWbsNode[]) {
  const roots = rolled.filter((n) => !n.parentId);
  const budget = roots.reduce((a, n) => a + n.rolledBudgetedCost, 0);
  const actual = roots.reduce((a, n) => a + n.rolledActualCost, 0);
  return {
    budget,
    actual,
    balance: budget - actual,
    consumedPct: budget > 0 ? (actual / budget) * 100 : 0,
    overrunCount: rolled.filter((n) => n.isOverrun).length,
  };
}
