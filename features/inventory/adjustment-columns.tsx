'use client';

import * as React from 'react';
import { terminology as t } from '@/config/terminology.config';
import { StatusChip, type ColumnDef } from '@/components/erp';
import { Badge } from '@/components/ui/badge';
import { formatAmount, formatDate, formatQuantity } from '@/lib/format';
import type { StockAdjustment } from '@/lib/data/types';
import {
  excessValue,
  hasVariance,
  isPosted,
  needsReason,
  netValue,
  reconciledCount,
  shortageQtyTotal,
  shortageValue,
} from '@/lib/inventory/adjustment';

/** A count is routine; a write-down is not. The register should not treat them alike. */
const TYPE_VARIANT: Record<StockAdjustment['adjustmentType'], 'secondary' | 'info' | 'danger'> = {
  PHYSICAL_VERIFICATION: 'secondary',
  DAMAGE: 'danger',
  THEFT: 'danger',
  EXPIRY: 'danger',
  MEASUREMENT_CORRECTION: 'info',
  WRITE_OFF: 'danger',
};

export function adjustmentColumns(
  storeName: (siteId: string) => string,
): ColumnDef<StockAdjustment>[] {
  return [
    {
      key: 'documentNo',
      header: t.inventory.saFull,
      sortable: true,
      width: '15rem',
      cell: (x) => (
        <span className="flex flex-col">
          <span className="font-medium text-foreground">{x.documentNo}</span>
          <span className="text-xs text-muted-foreground">{formatDate(x.date)}</span>
          <Badge variant={TYPE_VARIANT[x.adjustmentType]} className="mt-0.5 self-start">
            {t.inventory[`at${x.adjustmentType}` as keyof typeof t.inventory] as string}
          </Badge>
        </span>
      ),
    },
    {
      key: 'store',
      header: t.inventory.saStore,
      width: '14rem',
      cell: (x) => (
        <span className="flex flex-col">
          <span className="truncate text-foreground">{storeName(x.storeSiteId)}</span>
          {x.countSheetNo ? (
            <span className="text-xs text-muted-foreground">{x.countSheetNo}</span>
          ) : null}
        </span>
      ),
    },
    {
      key: 'lines',
      header: t.inventory.secSaLines,
      align: 'center',
      width: '10rem',
      cell: (x) => {
        const ok = reconciledCount(x);
        return (
          <span className="flex flex-col items-center">
            <span className="num text-foreground">{x.lines.length}</span>
            {ok > 0 ? (
              <span className="text-xs text-muted-foreground">
                {ok} {t.inventory.saReconciled.toLowerCase()}
              </span>
            ) : null}
          </span>
        );
      },
    },
    {
      key: 'shortageQty',
      header: t.inventory.saShortage,
      align: 'right',
      width: '9rem',
      hiddenByDefault: true,
      cell: (x) => {
        const qty = shortageQtyTotal(x);
        return qty > 0 ? (
          <span className="num text-danger">{formatQuantity(qty)}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    },
    {
      key: 'shortageValue',
      header: `${t.inventory.saShortage} ${t.common.currencySymbol}`,
      sortable: true,
      align: 'right',
      width: '10rem',
      cell: (x) => {
        const v = shortageValue(x);
        return v > 0 ? (
          <span className="num text-danger">{formatAmount(v)}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    },
    {
      key: 'excessValue',
      header: `${t.inventory.saExcess} ${t.common.currencySymbol}`,
      align: 'right',
      width: '10rem',
      hiddenByDefault: true,
      cell: (x) => {
        const v = excessValue(x);
        return v > 0 ? (
          <span className="num text-success">{formatAmount(v)}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    },
    {
      key: 'netValue',
      header: t.inventory.saNetEffect,
      align: 'right',
      width: '11rem',
      cell: (x) => {
        const net = netValue(x);
        if (!net) return <span className="text-muted-foreground">—</span>;
        return (
          <span className={net < 0 ? 'num text-danger' : 'num text-success'}>
            {formatAmount(net)}
          </span>
        );
      },
    },
    {
      key: 'flags',
      header: t.common.status,
      align: 'center',
      width: '13rem',
      hideOnCard: true,
      cell: (x) => {
        const flags: React.ReactNode[] = [];
        // Until this is approved the godown and the book still disagree (D-143).
        if (!isPosted(x)) {
          flags.push(
            <Badge key="unposted" variant="warning">
              {t.inventory.saNotPosted}
            </Badge>,
          );
        }
        if (!hasVariance(x)) {
          flags.push(
            <Badge key="ok" variant="secondary">
              {t.inventory.saReconciled}
            </Badge>,
          );
        }
        if (needsReason(x.adjustmentType) && x.reason) {
          flags.push(
            <Badge key="reason" variant="info">
              {t.inventory.saReason}
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
      cell: (x) => <StatusChip status={x.status} size="sm" />,
    },
  ];
}
