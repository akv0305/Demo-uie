'use client';

import * as React from 'react';
import { terminology as t } from '@/config/terminology.config';
import { formatCrore } from '@/lib/format';
import type { ColumnDef } from '@/components/erp';
import type { StatementRow } from '@/lib/project/contract-summary';

/** Subtotal and total rows are set apart, as they would be on a printed statement. */
function rowClass(kind: StatementRow['kind']): string {
  if (kind === 'total') return 'font-semibold text-foreground';
  if (kind === 'subtotal') return 'font-medium text-foreground';
  if (kind === 'opening') return 'font-medium text-foreground';
  return 'text-foreground';
}

export const contractSummaryColumns = (): ColumnDef<StatementRow>[] => [
  {
    key: 'particulars',
    header: t.project.cpParticulars,
    cell: (r) => (
      <span
        className={rowClass(r.kind)}
        style={{ paddingLeft: r.kind === 'add' || r.kind === 'less' ? '1.25rem' : undefined }}
      >
        {r.particulars}
      </span>
    ),
  },
  {
    key: 'amount',
    header: t.project.cpAmount,
    align: 'right',
    width: '12rem',
    cell: (r) => (
      <span className={`num ${r.amount < 0 ? 'text-danger' : ''} ${rowClass(r.kind)}`}>
        {formatCrore(r.amount)}
      </span>
    ),
  },
  {
    key: 'note',
    header: t.project.cpBasis,
    width: '18rem',
    hideOnCard: true,
    cell: (r) => <span className="text-sm text-muted-foreground">{r.note ?? '—'}</span>,
  },
];
