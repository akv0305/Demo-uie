'use client';

import * as React from 'react';
import { terminology as t } from '@/config/terminology.config';
import { formatCrore, formatNumber, formatPercent } from '@/lib/format';
import type { ColumnDef } from '@/components/erp';
import type { WbsNode } from '@/lib/data/types';

export const wbsColumns = (): ColumnDef<WbsNode>[] => [
  {
    key: 'code',
    header: t.masters.wbsCode,
    width: '10rem',
    // Indent carries the hierarchy; rows arrive in depth-first order.
    cell: (r) => (
      <span
        className={r.level === 1 ? 'font-medium text-foreground' : 'text-foreground'}
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
      <span className={r.level === 1 ? 'truncate font-medium text-foreground' : 'truncate text-foreground'}>
        {r.name}
      </span>
    ),
  },
  {
    key: 'uomCode',
    header: t.masters.uom,
    width: '5rem',
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
    header: t.masters.wbsExecutedQty,
    align: 'right',
    cell: (r) => (
      <span className="num text-muted-foreground">
        {r.executedQty === undefined ? '—' : formatNumber(r.executedQty)}
      </span>
    ),
  },
  {
    key: 'budgetedCost',
    header: t.masters.wbsBudgetedCost,
    align: 'right',
    cell: (r) => (
      <span className="num text-foreground">
        {r.budgetedCost === undefined ? '—' : formatCrore(r.budgetedCost)}
      </span>
    ),
  },
  {
    key: 'actualCost',
    header: t.masters.wbsActualCost,
    align: 'right',
    cell: (r) => (
      <span className="num text-muted-foreground">
        {r.actualCost === undefined ? '—' : formatCrore(r.actualCost)}
      </span>
    ),
  },
  {
    key: 'variance',
    header: t.masters.wbsVariance,
    align: 'right',
    cell: (r) => {
      if (!r.budgetedCost || r.actualCost === undefined) return <span className="text-muted-foreground">—</span>;
      const consumed = (r.actualCost / r.budgetedCost) * 100;
      const executed =
        r.budgetedQty && r.executedQty !== undefined ? (r.executedQty / r.budgetedQty) * 100 : undefined;
      // Cost outrunning physical progress is the signal worth colouring.
      const overrun = executed !== undefined && consumed > executed + 5;
      return (
        <span className={overrun ? 'num text-danger' : 'num text-muted-foreground'}>
          {formatPercent(consumed)}
        </span>
      );
    },
  },
  {
    key: 'isActive',
    header: t.common.status,
    align: 'center',
    cell: (r) => (
      <span className={r.isActive !== false ? 'text-success' : 'text-muted-foreground'}>
        {r.isActive !== false ? t.admin.active : t.admin.inactive}
      </span>
    ),
  },
];
