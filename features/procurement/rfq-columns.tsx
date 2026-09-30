'use client';

import * as React from 'react';
import { terminology as t } from '@/config/terminology.config';
import { StatusChip, type ColumnDef } from '@/components/erp';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatAmount, formatNumber } from '@/lib/format';
import type { Rfq } from '@/lib/data/types';
import {
  awaitedCount,
  daysToDue,
  estimatedValue,
  invitedCount,
  isOpenForQuoting,
  isOverdue,
  isUndersubscribed,
  receivedCount,
} from '@/lib/procurement/rfq';

export function rfqColumns(): ColumnDef<Rfq>[] {
  return [
    {
      key: 'documentNo',
      header: t.procurement.rfqNo,
      sortable: true,
      width: '12rem',
      cell: (r) => <span className="font-medium text-foreground">{r.documentNo}</span>,
    },
    {
      key: 'date',
      header: t.procurement.rfqDate,
      sortable: true,
      width: '7.5rem',
      cell: (r) => formatDate(r.date),
    },
    {
      key: 'title',
      header: t.procurement.rfqSubject,
      cell: (r) => (
        <span className="flex flex-col">
          <span className="line-clamp-2 text-foreground">{r.title}</span>
          {r.prIds.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {t.procurement.rfqFromPr}: {r.prIds.join(', ')}
            </span>
          )}
        </span>
      ),
    },
    {
      key: 'lines',
      header: t.procurement.rfqItems,
      align: 'right',
      width: '6rem',
      cell: (r) => <span className="num text-foreground">{formatNumber(r.lines.length)}</span>,
    },
    {
      key: 'estimatedValue',
      header: t.procurement.rfqEstimatedValue,
      align: 'right',
      sortable: true,
      width: '10rem',
      cell: (r) => <span className="num text-foreground">{formatAmount(estimatedValue(r))}</span>,
    },
    {
      key: 'responses',
      header: t.procurement.rfqResponses,
      align: 'center',
      width: '9rem',
      cell: (r) => {
        const invited = invitedCount(r);
        if (invited === 0) return <span className="text-muted-foreground">—</span>;
        const received = receivedCount(r);
        return (
          <span className="flex flex-col items-center">
            <span className="num text-foreground">
              {received} / {invited}
            </span>
            {awaitedCount(r) > 0 && (
              <span className="text-xs text-muted-foreground">
                {awaitedCount(r)} {t.procurement.rrAWAITED.toLowerCase()}
              </span>
            )}
          </span>
        );
      },
    },
    {
      key: 'dueDate',
      header: t.procurement.rfqDueDate,
      sortable: true,
      width: '11rem',
      cell: (r) => {
        const left = daysToDue(r);
        return (
          <span className="flex flex-col">
            <span className="text-foreground">{formatDate(r.dueDate)}</span>
            {isOverdue(r) ? (
              <span className="text-xs text-danger">{t.procurement.rfqOverdue}</span>
            ) : isOpenForQuoting(r) && left <= 3 ? (
              <span className="text-xs text-warning">
                {t.procurement.rfqDueIn} {left} {t.procurement.rfqDaysLeft}
              </span>
            ) : null}
          </span>
        );
      },
    },
    {
      key: 'thin',
      header: t.procurement.rfqUnderSubscribed,
      align: 'center',
      hiddenByDefault: true,
      cell: (r) =>
        r.status === 'DRAFT' ? (
          <span className="text-muted-foreground">—</span>
        ) : isUndersubscribed(r) ? (
          <Badge variant="warning">{t.common.yes}</Badge>
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
