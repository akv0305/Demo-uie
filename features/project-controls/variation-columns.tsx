'use client';

import * as React from 'react';
import { terminology as t } from '@/config/terminology.config';
import { StatusChip, type ColumnDef } from '@/components/erp';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatAmount } from '@/lib/format';
import type { Variation } from '@/lib/data/types';
import { categoryLabel, originLabel, shortfall } from '@/lib/project/variation';

export function variationColumns(activityName: (id?: string) => string): ColumnDef<Variation>[] {
  return [
    {
      key: 'documentNo',
      header: t.project.varNo,
      sortable: true,
      width: '11rem',
      cell: (r) => <span className="font-medium text-foreground">{r.documentNo}</span>,
    },
    {
      key: 'date',
      header: t.project.varDate,
      sortable: true,
      width: '7.5rem',
      cell: (r) => formatDate(r.date),
    },
    {
      key: 'category',
      header: t.project.varCategory,
      cell: (r) => (
        <span className="flex flex-col">
          <span className="text-foreground">{categoryLabel(r.category)}</span>
          <span className="text-xs text-muted-foreground">{originLabel(r.origin)}</span>
        </span>
      ),
    },
    {
      key: 'description',
      header: t.project.varDescription,
      cell: (r) => (
        <span className="flex flex-col">
          <span className="line-clamp-2 text-foreground">{r.description}</span>
          {r.location && <span className="text-xs text-muted-foreground">{r.location}</span>}
        </span>
      ),
    },
    {
      key: 'wbsId',
      header: t.project.varActivity,
      hiddenByDefault: true,
      cell: (r) => activityName(r.wbsId),
    },
    {
      key: 'proposedAmount',
      header: t.project.varProposed,
      align: 'right',
      sortable: true,
      width: '9rem',
      cell: (r) => <span className="num text-foreground">{formatAmount(r.proposedAmount)}</span>,
    },
    {
      key: 'approvedAmount',
      header: t.project.varApproved,
      align: 'right',
      width: '9rem',
      cell: (r) =>
        r.approvedAmount === undefined ? (
          <Badge variant="warning">{t.project.varUndecided}</Badge>
        ) : (
          <span className="num text-foreground">{formatAmount(r.approvedAmount)}</span>
        ),
    },
    {
      key: 'shortfall',
      header: t.project.varShortfall,
      align: 'right',
      width: '9rem',
      cell: (r) => {
        const gap = shortfall(r);
        if (gap === undefined) return <span className="text-muted-foreground">—</span>;
        if (gap <= 0) return <span className="text-muted-foreground">—</span>;
        return <span className="num text-danger">{formatAmount(gap)}</span>;
      },
    },
    {
      key: 'rateAnalysis',
      header: t.project.varRateAnalysis,
      align: 'center',
      hiddenByDefault: true,
      cell: (r) =>
        r.needsRateAnalysis ? (
          <Badge variant="info">{t.common.yes}</Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: 'status',
      header: t.common.status,
      align: 'center',
      cell: (r) => <StatusChip status={r.status} size="sm" />,
    },
  ];
}
