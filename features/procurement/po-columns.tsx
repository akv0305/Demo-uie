'use client';

import * as React from 'react';
import { terminology as t } from '@/config/terminology.config';
import { StatusChip, type ColumnDef } from '@/components/erp';
import { Badge } from '@/components/ui/badge';
import { formatAmount, formatDate } from '@/lib/format';
import type { PurchaseOrder } from '@/lib/data/types';
import {
  deliveryProgressPct,
  isDeliveryOverdue,
  isFullyReceived,
  isPartlyReceived,
  needsJustification,
  orderValue,
  pendingValue,
} from '@/lib/procurement/purchase-order';

export function poColumns(): ColumnDef<PurchaseOrder>[] {
  return [
    {
      key: 'documentNo',
      header: t.procurement.poNo,
      sortable: true,
      width: '13rem',
      cell: (p) => (
        <span className="flex flex-col">
          <span className="font-medium text-foreground">{p.documentNo}</span>
          <span className="text-xs text-muted-foreground">{formatDate(p.date)}</span>
          {p.amendmentNo ? (
            <Badge variant="info" className="mt-0.5 self-start">
              {t.procurement.poAmended} {p.amendmentNo}
            </Badge>
          ) : null}
        </span>
      ),
    },
    {
      key: 'vendorName',
      header: t.procurement.poVendor,
      sortable: true,
      cell: (p) => (
        <span className="flex flex-col">
          <span className="text-foreground">{p.vendorName}</span>
          <span className="text-xs text-muted-foreground">
            {t.procurement[`pb${p.basis}` as keyof typeof t.procurement] as string}
          </span>
        </span>
      ),
    },
    {
      key: 'items',
      header: t.procurement.secPoLines,
      cell: (p) => (
        <span className="flex flex-col">
          <span className="line-clamp-2 text-foreground">
            {p.lines.map((l) => l.description).join(', ')}
          </span>
        </span>
      ),
    },
    {
      key: 'orderValue',
      header: t.procurement.poOrderValue,
      align: 'right',
      sortable: true,
      width: '11rem',
      cell: (p) => <span className="num font-medium text-foreground">{formatAmount(orderValue(p))}</span>,
    },
    {
      key: 'pendingValue',
      header: t.procurement.poPendingValue,
      align: 'right',
      width: '10rem',
      hiddenByDefault: true,
      cell: (p) => <span className="num text-muted-foreground">{formatAmount(pendingValue(p))}</span>,
    },
    {
      key: 'progress',
      header: t.procurement.poProgress,
      align: 'center',
      width: '10rem',
      cell: (p) => {
        const pct = deliveryProgressPct(p);
        return (
          <span className="flex flex-col items-center gap-1">
            <span className="h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
              <span
                className={
                  pct >= 100 ? 'block h-full bg-success' : 'block h-full bg-primary'
                }
                style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
              />
            </span>
            <span className="num text-xs text-muted-foreground">{pct.toFixed(0)}%</span>
          </span>
        );
      },
    },
    {
      key: 'deliveryByDate',
      header: t.procurement.poDeliveryBy,
      sortable: true,
      width: '11rem',
      cell: (p) => {
        if (!p.deliveryByDate) return <span className="text-muted-foreground">—</span>;
        return (
          <span className="flex flex-col">
            <span className="text-foreground">{formatDate(p.deliveryByDate)}</span>
            {isDeliveryOverdue(p) ? (
              <span className="text-xs text-danger">{t.procurement.poDeliveryOverdue}</span>
            ) : isFullyReceived(p) ? (
              <span className="text-xs text-success">{t.procurement.poFullyReceived}</span>
            ) : isPartlyReceived(p) ? (
              <span className="text-xs text-warning">{t.procurement.poPartlyReceived}</span>
            ) : null}
          </span>
        );
      },
    },
    {
      key: 'flags',
      header: t.common.remarks,
      align: 'center',
      width: '9rem',
      hiddenByDefault: true,
      cell: (p) =>
        needsJustification(p) ? (
          <Badge variant="warning">{t.procurement.poNoJustification}</Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: 'status',
      header: t.common.status,
      align: 'center',
      cell: (p) => <StatusChip status={p.status} size="sm" />,
    },
  ];
}
