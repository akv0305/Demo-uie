'use client';

import * as React from 'react';
import { terminology as t } from '@/config/terminology.config';
import { StatusChip, type ColumnDef } from '@/components/erp';
import { Badge } from '@/components/ui/badge';
import { formatAmount, formatDate } from '@/lib/format';
import type { PurchaseRequisition } from '@/lib/data/types';
import {
  daysToRequired,
  estimatedValue,
  isFullyOrdered,
  isNotOrdered,
  isOverdue,
  priorityLabel,
} from '@/lib/procurement/requisition';

export function prColumns(siteName: (id: string) => string): ColumnDef<PurchaseRequisition>[] {
  return [
    {
      key: 'documentNo',
      header: t.procurement.prNo,
      sortable: true,
      width: '11rem',
      cell: (r) => <span className="font-medium text-foreground">{r.documentNo}</span>,
    },
    {
      key: 'date',
      header: t.procurement.prDate,
      sortable: true,
      width: '7.5rem',
      cell: (r) => formatDate(r.date),
    },
    {
      key: 'lines',
      header: t.procurement.prLines,
      cell: (r) => (
        <span className="flex flex-col">
          <span className="line-clamp-1 text-foreground">
            {r.lines[0]?.description ?? '—'}
          </span>
          {r.lines.length > 1 && (
            <span className="text-xs text-muted-foreground">
              +{r.lines.length - 1} {t.procurement.prItems}
            </span>
          )}
        </span>
      ),
    },
    {
      key: 'priority',
      header: t.procurement.priority,
      width: '8rem',
      cell: (r) =>
        r.priority === 'EMERGENCY' ? (
          <Badge variant="danger">{priorityLabel(r.priority)}</Badge>
        ) : r.priority === 'URGENT' ? (
          <Badge variant="warning">{priorityLabel(r.priority)}</Badge>
        ) : (
          <span className="text-muted-foreground">{priorityLabel(r.priority)}</span>
        ),
    },
    {
      key: 'deliverySiteId',
      header: t.procurement.deliveryLocation,
      hiddenByDefault: true,
      cell: (r) => <span className="text-foreground">{siteName(r.deliverySiteId)}</span>,
    },
    {
      key: 'requiredBy',
      header: t.procurement.requiredBy,
      sortable: true,
      width: '9.5rem',
      cell: (r) => {
        if (isOverdue(r)) return <Badge variant="danger">{t.procurement.prOverdue}</Badge>;
        const days = daysToRequired(r);
        return (
          <span className="flex flex-col">
            <span className="text-foreground">{formatDate(r.requiredBy)}</span>
            {!isFullyOrdered(r) && days >= 0 && (
              <span className="num text-xs text-muted-foreground">
                {days} {t.procurement.prDays}
              </span>
            )}
          </span>
        );
      },
    },
    {
      key: 'estimatedValue',
      header: t.procurement.prEstimatedValue,
      align: 'right',
      width: '11rem',
      cell: (r) => <span className="num text-foreground">{formatAmount(estimatedValue(r))}</span>,
    },
    {
      key: 'orderStatus',
      header: t.procurement.prOrderStatus,
      width: '10rem',
      cell: (r) =>
        isFullyOrdered(r) ? (
          <Badge variant="success">{t.procurement.prFullyOrdered}</Badge>
        ) : isNotOrdered(r) ? (
          <span className="text-muted-foreground">{t.procurement.prNotOrdered}</span>
        ) : (
          <Badge variant="warning">{t.procurement.prPartlyOrdered}</Badge>
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
