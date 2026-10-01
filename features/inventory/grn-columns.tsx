'use client';

import * as React from 'react';
import { terminology as t } from '@/config/terminology.config';
import { StatusChip, type ColumnDef } from '@/components/erp';
import { Badge } from '@/components/ui/badge';
import { formatAmount, formatDate, formatQuantity } from '@/lib/format';
import type { GoodsReceipt } from '@/lib/data/types';
import {
  acceptedQtyTotal,
  hasRejection,
  hasShortage,
  isAwaitingTest,
  isInvoiceAwaited,
  receiptValue,
  rejectedValue,
} from '@/lib/inventory/grn';

export function grnColumns(): ColumnDef<GoodsReceipt>[] {
  return [
    {
      key: 'documentNo',
      header: t.inventory.grnFull,
      sortable: true,
      width: '14rem',
      cell: (g) => (
        <span className="flex flex-col">
          <span className="font-medium text-foreground">{g.documentNo}</span>
          <span className="text-xs text-muted-foreground">{formatDate(g.date)}</span>
          {g.grnType !== 'AGAINST_PO' ? (
            <Badge variant="info" className="mt-0.5 self-start">
              {t.inventory[`gt${g.grnType}` as keyof typeof t.inventory] as string}
            </Badge>
          ) : null}
        </span>
      ),
    },
    {
      key: 'challanNo',
      header: t.inventory.grnChallanNo,
      sortable: true,
      width: '12rem',
      cell: (g) => (
        <span className="flex flex-col">
          <span className="text-foreground">{g.challanNo}</span>
          <span className="text-xs text-muted-foreground">{formatDate(g.challanDate)}</span>
          {isInvoiceAwaited(g) ? (
            <span className="text-xs text-warning">{t.inventory.grnInvoiceAwaited}</span>
          ) : null}
        </span>
      ),
    },
    {
      key: 'vendorName',
      header: t.procurement.poVendor,
      cell: (g) => (
        <span className="flex flex-col">
          <span className="text-foreground">{g.vendorName ?? '—'}</span>
          {g.poDocumentNo ? (
            <span className="text-xs text-muted-foreground">{g.poDocumentNo}</span>
          ) : null}
        </span>
      ),
    },
    {
      key: 'items',
      header: t.inventory.secGrnLines,
      cell: (g) => (
        <span className="line-clamp-2 text-foreground">
          {g.lines.map((l) => l.description).join(', ')}
        </span>
      ),
    },
    {
      key: 'vehicleNo',
      header: t.inventory.grnVehicleNo,
      width: '9rem',
      hiddenByDefault: true,
      cell: (g) => <span className="text-muted-foreground">{g.vehicleNo ?? '—'}</span>,
    },
    {
      key: 'acceptedQty',
      header: t.inventory.grnAcceptedQty,
      align: 'right',
      width: '9rem',
      cell: (g) => (
        <span className="num text-foreground">{formatQuantity(acceptedQtyTotal(g))}</span>
      ),
    },
    {
      key: 'value',
      header: t.inventory.grnKpiValue,
      align: 'right',
      sortable: true,
      width: '11rem',
      cell: (g) => (
        <span className="num font-medium text-foreground">{formatAmount(receiptValue(g))}</span>
      ),
    },
    {
      key: 'flags',
      header: t.common.remarks,
      align: 'center',
      width: '12rem',
      cell: (g) => {
        const flags: React.ReactNode[] = [];
        if (hasRejection(g)) {
          flags.push(
            <Badge key="rej" variant="danger">
              {formatAmount(rejectedValue(g))}
            </Badge>,
          );
        }
        if (hasShortage(g)) {
          flags.push(
            <Badge key="short" variant="warning">
              {t.inventory.grnShortQty}
            </Badge>,
          );
        }
        if (isAwaitingTest(g)) {
          flags.push(
            <Badge key="test" variant="info">
              {t.inventory.gcPENDING_TEST}
            </Badge>,
          );
        }
        return flags.length ? (
          <span className="flex flex-wrap justify-center gap-1">{flags}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    },
    {
      key: 'status',
      header: t.common.status,
      align: 'center',
      cell: (g) => <StatusChip status={g.status} size="sm" />,
    },
  ];
}
