'use client';

import * as React from 'react';
import { terminology as t } from '@/config/terminology.config';
import { StatusChip, type ColumnDef } from '@/components/erp';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/format';
import type { Hindrance } from '@/lib/data/types';
import { categoryLabel, daysLost, isOpen, responsibilityLabel } from '@/lib/project/hindrance';

export function hindranceColumns(activityName: (id?: string) => string): ColumnDef<Hindrance>[] {
  return [
    {
      key: 'fromDate',
      header: t.project.hinFrom,
      sortable: true,
      width: '7.5rem',
      cell: (r) => <span className="font-medium text-foreground">{formatDate(r.fromDate)}</span>,
    },
    {
      key: 'toDate',
      header: t.project.hinTo,
      width: '7.5rem',
      cell: (r) =>
        r.toDate ? (
          <span className="text-foreground">{formatDate(r.toDate)}</span>
        ) : (
          <Badge variant="warning">{t.project.hinOngoing}</Badge>
        ),
    },
    {
      key: 'daysLost',
      header: t.project.hinDaysLost,
      align: 'right',
      width: '5rem',
      cell: (r) => (
        <span className={isOpen(r) ? 'num text-danger' : 'num text-foreground'}>{daysLost(r)}</span>
      ),
    },
    { key: 'category', header: t.project.hinCategory, cell: (r) => categoryLabel(r.category) },
    {
      key: 'description',
      header: t.project.hinDescription,
      cell: (r) => (
        <span className="line-clamp-2 text-foreground">{r.description}</span>
      ),
    },
    {
      key: 'activity',
      header: t.project.hinActivity,
      hiddenByDefault: true,
      cell: (r) => activityName(r.wbsId),
    },
    {
      key: 'responsibility',
      header: t.project.hinResponsibility,
      align: 'center',
      cell: (r) => (
        <span className={r.responsibility === 'CLIENT' ? 'text-info' : 'text-muted-foreground'}>
          {responsibilityLabel(r.responsibility)}
        </span>
      ),
    },
    {
      key: 'eot',
      header: t.project.hinEotDays,
      align: 'right',
      cell: (r) =>
        r.isEotClaimable && r.eotClaimDays ? (
          <span className="num text-foreground">{r.eotClaimDays}</span>
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
