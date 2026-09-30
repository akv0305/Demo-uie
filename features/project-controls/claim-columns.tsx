'use client';

import * as React from 'react';
import { terminology as t } from '@/config/terminology.config';
import { StatusChip, type ColumnDef } from '@/components/erp';
import { Badge } from '@/components/ui/badge';
import { formatAmount, formatDate } from '@/lib/format';
import type { Claim } from '@/lib/data/types';
import { claimShortfall, isInDispute, stageLabel, typeLabel } from '@/lib/project/claim';

export function claimColumns(): ColumnDef<Claim>[] {
  return [
    {
      key: 'documentNo',
      header: t.project.clmNo,
      sortable: true,
      width: '11rem',
      cell: (r) => <span className="font-medium text-foreground">{r.documentNo}</span>,
    },
    {
      key: 'date',
      header: t.project.clmDate,
      sortable: true,
      width: '7.5rem',
      cell: (r) => formatDate(r.date),
    },
    {
      key: 'title',
      header: t.project.clmTitle,
      cell: (r) => (
        <span className="flex flex-col">
          <span className="line-clamp-2 text-foreground">{r.title}</span>
          <span className="text-xs text-muted-foreground">{typeLabel(r.type)}</span>
        </span>
      ),
    },
    {
      key: 'stage',
      header: t.project.clmStage,
      cell: (r) =>
        isInDispute(r) ? (
          <Badge variant="danger">{stageLabel(r.stage)}</Badge>
        ) : (
          <span className="text-foreground">{stageLabel(r.stage)}</span>
        ),
    },
    {
      key: 'noticeDate',
      header: t.project.clmNoticeDate,
      width: '8rem',
      hiddenByDefault: true,
      cell: (r) => formatDate(r.noticeDate),
    },
    {
      key: 'claimedAmount',
      header: t.project.clmClaimed,
      align: 'right',
      sortable: true,
      width: '9rem',
      cell: (r) =>
        r.claimedAmount > 0 ? (
          <span className="num text-foreground">{formatAmount(r.claimedAmount)}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: 'claimedDays',
      header: t.project.clmClaimedDays,
      align: 'right',
      width: '7rem',
      cell: (r) =>
        r.claimedDays ? (
          <span className="num text-foreground">{r.claimedDays}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: 'settledAmount',
      header: t.project.clmSettled,
      align: 'right',
      width: '9rem',
      cell: (r) =>
        r.settledAmount === undefined ? (
          <Badge variant="warning">{t.project.clmPending}</Badge>
        ) : (
          <span className="num text-foreground">{formatAmount(r.settledAmount)}</span>
        ),
    },
    {
      key: 'shortfall',
      header: t.project.clmShortfall,
      align: 'right',
      width: '9rem',
      cell: (r) => {
        const gap = claimShortfall(r);
        if (gap === undefined || gap <= 0) return <span className="text-muted-foreground">—</span>;
        return <span className="num text-danger">{formatAmount(gap)}</span>;
      },
    },
    {
      key: 'status',
      header: t.common.status,
      align: 'center',
      cell: (r) => <StatusChip status={r.status} size="sm" />,
    },
  ];
}
