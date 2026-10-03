'use client';

import * as React from 'react';
import { terminology as t } from '@/config/terminology.config';
import type { ColumnDef } from '@/components/erp';
import { Badge } from '@/components/ui/badge';
import { formatAmount, formatDate, formatQuantity } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  idleDays,
  isBelowReorder,
  isNegative,
  isNonMoving,
  type StockSummaryRow,
} from '@/lib/inventory/summary';

const nil = <span className="text-muted-foreground">—</span>;

/** A zero movement is noise in a register this wide; show a dash instead. */
function qtyCell(value: number, className?: string) {
  if (!value) return nil;
  return <span className={cn('num', className ?? 'text-foreground')}>{formatQuantity(value)}</span>;
}

export function summaryColumns(opts: {
  /** Store column is pointless when one store is selected. */
  showStore: boolean;
  storeName: (siteId: string) => string;
  asOn: string;
}): ColumnDef<StockSummaryRow>[] {
  const { showStore, storeName, asOn } = opts;

  const columns: ColumnDef<StockSummaryRow>[] = [
    {
      key: 'item',
      header: t.masters.items,
      sortable: true,
      width: '18rem',
      cell: (r) => (
        <span className="flex flex-col">
          <span className="truncate font-medium text-foreground">{r.description}</span>
          <span className="text-xs text-muted-foreground">
            {r.itemCode}
            {r.uomCode ? ` · ${r.uomCode}` : ''}
          </span>
        </span>
      ),
    },
  ];

  if (showStore) {
    columns.push({
      key: 'store',
      header: t.inventory.ssStore,
      width: '12rem',
      cell: (r) => <span className="truncate text-foreground">{storeName(r.siteId)}</span>,
    });
  }

  return columns.concat([
    {
      key: 'openingQty',
      header: t.inventory.ssOpening,
      align: 'right',
      width: '8rem',
      hiddenByDefault: true,
      cell: (r) => qtyCell(r.openingQty, 'text-muted-foreground'),
    },
    {
      key: 'receiptQty',
      header: t.inventory.ssReceipts,
      align: 'right',
      width: '8rem',
      cell: (r) => qtyCell(r.receiptQty, 'text-success'),
    },
    {
      key: 'issueQty',
      header: t.inventory.ssIssues,
      align: 'right',
      width: '8rem',
      cell: (r) => qtyCell(r.issueQty, 'text-foreground'),
    },
    {
      key: 'returnQty',
      header: t.inventory.ssReturns,
      align: 'right',
      width: '8rem',
      hiddenByDefault: true,
      cell: (r) => qtyCell(r.returnQty),
    },
    {
      key: 'transferInQty',
      header: t.inventory.ssTransferIn,
      align: 'right',
      width: '8rem',
      hiddenByDefault: true,
      cell: (r) => qtyCell(r.transferInQty),
    },
    {
      key: 'transferOutQty',
      header: t.inventory.ssTransferOut,
      align: 'right',
      width: '8rem',
      hiddenByDefault: true,
      cell: (r) => qtyCell(r.transferOutQty),
    },
    {
      key: 'adjustment',
      header: t.inventory.ssAdjustOut,
      align: 'right',
      width: '9rem',
      hiddenByDefault: true,
      cell: (r) => {
        if (!r.adjustInQty && !r.adjustOutQty) return nil;
        return (
          <span className="flex flex-col items-end">
            {r.adjustInQty ? (
              <span className="num text-success">+{formatQuantity(r.adjustInQty)}</span>
            ) : null}
            {r.adjustOutQty ? (
              <span className="num text-danger">-{formatQuantity(r.adjustOutQty)}</span>
            ) : null}
          </span>
        );
      },
    },
    {
      key: 'closingQty',
      header: t.inventory.ssClosing,
      sortable: true,
      align: 'right',
      width: '10rem',
      cell: (r) => (
        <span className="flex flex-col items-end">
          <span
            className={cn(
              'num font-medium',
              isNegative(r)
                ? 'text-danger'
                : isBelowReorder(r)
                  ? 'text-warning'
                  : 'text-foreground',
            )}
          >
            {formatQuantity(r.closingQty)}
          </span>
          {r.reorderLevel > 0 ? (
            <span className="text-xs text-muted-foreground">
              {t.inventory.ssReorderLevel}: {formatQuantity(r.reorderLevel)}
            </span>
          ) : null}
        </span>
      ),
    },
    {
      key: 'rate',
      header: t.inventory.ssRate,
      align: 'right',
      width: '9rem',
      hiddenByDefault: true,
      cell: (r) => (r.rate > 0 ? <span className="num">{formatAmount(r.rate)}</span> : nil),
    },
    {
      key: 'closingValue',
      header: t.inventory.ssValue,
      sortable: true,
      align: 'right',
      width: '11rem',
      cell: (r) =>
        r.rate > 0 ? (
          <span className="num text-foreground">{formatAmount(r.closingValue)}</span>
        ) : (
          // Stock with no rate is real stock, so it must not read as nil value.
          <span className="text-xs text-muted-foreground">{t.inventory.ssUnvalued}</span>
        ),
    },
    {
      key: 'lastMovement',
      header: t.inventory.ssLastMovement,
      align: 'center',
      width: '10rem',
      hiddenByDefault: true,
      cell: (r) => {
        if (!r.lastMovementDate) {
          return <span className="text-xs text-muted-foreground">{t.inventory.ssNoMovement}</span>;
        }
        const idle = idleDays(r, asOn);
        return (
          <span className="flex flex-col items-center">
            <span className="text-foreground">{formatDate(r.lastMovementDate)}</span>
            {idle && idle > 0 ? (
              <span className="text-xs text-muted-foreground">
                {idle} {t.inventory.ssIdleDays}
              </span>
            ) : null}
          </span>
        );
      },
    },
    {
      key: 'flags',
      header: t.common.status,
      align: 'center',
      width: '13rem',
      cell: (r) => {
        const flags: React.ReactNode[] = [];
        // A negative balance is a bookkeeping failure, not a stock position.
        if (isNegative(r)) {
          flags.push(
            <Badge key="neg" variant="danger">
              {t.inventory.ssNegative}
            </Badge>,
          );
        }
        if (isBelowReorder(r)) {
          flags.push(
            <Badge key="reorder" variant="warning">
              {t.inventory.ssBelowReorder}
            </Badge>,
          );
        }
        if (isNonMoving(r, asOn)) {
          flags.push(
            <Badge key="idle" variant="secondary">
              {t.inventory.ssNonMoving}
            </Badge>,
          );
        }
        return flags.length ? (
          <span className="flex flex-wrap justify-center gap-1">{flags}</span>
        ) : (
          nil
        );
      },
    },
  ]);
}
