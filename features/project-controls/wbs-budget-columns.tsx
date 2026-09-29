'use client';

import * as React from 'react';
import { terminology as t } from '@/config/terminology.config';
import { formatCrore, formatNumber, formatPercent } from '@/lib/format';
import type { ColumnDef } from '@/components/erp';
import type { RolledWbsNode } from '@/lib/project/wbs-rollup';

export const wbsBudgetColumns = (): ColumnDef<RolledWbsNode>[] => [
  {
    key: 'code',
    header: t.masters.wbsCode,
    width: '9rem',
    cell: (r) => (
      <span
        className={r.isParent ? 'font-medium text-foreground' : 'text-foreground'}
        style={{ paddingLeft: `${(r.level - 1) * 1.25}rem` }}
      >
        {r.code}
      </span>
    ),
  },
  {
    key: 'name',
    header: t.masters.wbsName,
    cell: (r) => (
      <span className={r.isParent ? 'font-medium text-foreground' : 'text-foreground'}>
        {r.name}
      </span>
    ),
  },
  {
    key: 'uomCode',
    header: t.masters.uom,
    width: '4.5rem',
    align: 'center',
    cell: (r) => <span className="text-muted-foreground">{r.uomCode ?? '—'}</span>,
  },
  {
    key: 'budgetedQty',
    header: t.masters.wbsBudgetedQty,
    align: 'right',
    cell: (r) => (
      <span className="num text-foreground">
        {r.budgetedQty === undefined ? '—' : formatNumber(r.budgetedQty)}
      </span>
    ),
  },
  {
    key: 'executedQty',
    header: t.project.wbsPhysical,
    align: 'right',
    cell: (r) => (
      <span className="num text-muted-foreground">
        {r.executedQty === undefined ? '—' : formatNumber(r.executedQty)}
      </span>
    ),
  },
  {
    key: 'budget',
    header: t.project.wbsOwnBudget,
    align: 'right',
    cell: (r) => <span className="num text-foreground">{formatCrore(r.rolledBudgetedCost)}</span>,
  },
  {
    key: 'actual',
    header: t.project.wbsSpent,
    align: 'right',
    cell: (r) => <span className="num text-foreground">{formatCrore(r.rolledActualCost)}</span>,
  },
  {
    key: 'balance',
    header: t.project.wbsBalance,
    align: 'right',
    hideOnCard: true,
    cell: (r) => {
      const bal = r.rolledBudgetedCost - r.rolledActualCost;
      return (
        <span className={bal < 0 ? 'num text-danger' : 'num text-muted-foreground'}>
          {formatCrore(bal)}
        </span>
      );
    },
  },
  {
    key: 'consumed',
    header: t.project.wbsConsumed,
    align: 'right',
    cell: (r) =>
      r.consumedPct === undefined ? (
        <span className="text-muted-foreground">—</span>
      ) : (
        <span className={r.isOverrun ? 'num text-danger' : 'num text-muted-foreground'}>
          {formatPercent(r.consumedPct)}
        </span>
      ),
  },
];
