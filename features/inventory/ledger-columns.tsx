'use client';

import * as React from 'react';
import { terminology as t } from '@/config/terminology.config';
import { type ColumnDef } from '@/components/erp';
import { Badge } from '@/components/ui/badge';
import { formatAmount, formatDate, formatQuantity } from '@/lib/format';
import type { LedgerSource, StockLedgerRow } from '@/lib/data/types';
import { cn } from '@/lib/utils';

/** Inward is routine, outward is routine, an adjustment is not. */
const SOURCE_VARIANT: Record<LedgerSource, 'secondary' | 'info' | 'warning' | 'danger'> = {
  OPENING: 'secondary',
  GRN: 'info',
  ISSUE: 'secondary',
  RETURN: 'info',
  TRANSFER_OUT: 'warning',
  TRANSFER_IN: 'warning',
  ADJUSTMENT: 'danger',
};

export function ledgerColumns(): ColumnDef<StockLedgerRow>[] {
  return [
    {
      key: 'date',
      header: t.common.date,
      width: '8rem',
      cell: (r) =>
        r.source === 'OPENING' ? (
          <span className="text-muted-foreground">—</span>
        ) : (
          <span className="text-foreground">{formatDate(r.date)}</span>
        ),
    },
    {
      key: 'document',
      header: t.inventory.slSource,
      width: '15rem',
      cell: (r) => (
        <span className="flex flex-col">
          <Badge variant={SOURCE_VARIANT[r.source]} className="self-start">
            {t.inventory[`ls${r.source}` as keyof typeof t.inventory] as string}
          </Badge>
          {r.source !== 'OPENING' ? (
            <span className="mt-0.5 text-xs text-muted-foreground">{r.documentNo}</span>
          ) : null}
        </span>
      ),
    },
    {
      key: 'description',
      header: t.inventory.slItem,
      width: '16rem',
      cell: (r) =>
        r.source === 'OPENING' ? (
          <span className="font-medium text-foreground">{t.inventory.slOpening}</span>
        ) : (
          <span className="flex flex-col">
            <span className="truncate text-foreground">{r.description}</span>
            {r.itemCode ? (
              <span className="text-xs text-muted-foreground">{r.itemCode}</span>
            ) : null}
          </span>
        ),
    },
    {
      key: 'particulars',
      header: t.inventory.slParticulars,
      width: '16rem',
      hideOnCard: true,
      cell: (r) =>
        r.particulars ? (
          <span className="truncate text-muted-foreground">{r.particulars}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: 'inQty',
      header: t.inventory.slInQty,
      align: 'right',
      width: '8rem',
      cell: (r) =>
        r.inQty > 0 ? (
          <span className="num text-foreground">{formatQuantity(r.inQty)}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: 'outQty',
      header: t.inventory.slOutQty,
      align: 'right',
      width: '8rem',
      cell: (r) =>
        r.outQty > 0 ? (
          <span className="num text-foreground">{formatQuantity(r.outQty)}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: 'rate',
      header: t.inventory.saRate,
      align: 'right',
      width: '8rem',
      hiddenByDefault: true,
      cell: (r) =>
        r.rate ? (
          <span className="num text-muted-foreground">{formatAmount(r.rate)}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: 'balanceQty',
      header: t.inventory.slBalanceQty,
      align: 'right',
      width: '9rem',
      cell: (r) => (
        <span
          className={cn('num font-medium', r.balanceQty < 0 ? 'text-danger' : 'text-foreground')}
        >
          {formatQuantity(r.balanceQty)}
          {r.uomCode ? (
            <span className="ml-1 text-xs font-normal text-muted-foreground">{r.uomCode}</span>
          ) : null}
        </span>
      ),
    },
    {
      key: 'balanceValue',
      header: t.inventory.slBalanceValue,
      align: 'right',
      width: '10rem',
      cell: (r) => <span className="num text-muted-foreground">{formatAmount(r.balanceValue)}</span>,
    },
  ];
}
