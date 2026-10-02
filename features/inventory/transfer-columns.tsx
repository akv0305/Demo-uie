'use client';

import * as React from 'react';
import { terminology as t } from '@/config/terminology.config';
import { StatusChip, type ColumnDef } from '@/components/erp';
import { Badge } from '@/components/ui/badge';
import { formatAmount, formatDate, formatQuantity } from '@/lib/format';
import type { StockTransfer } from '@/lib/data/types';
import {
  daysInTransit,
  dispatchedQtyTotal,
  hasTransitLoss,
  inTransitQtyTotal,
  isInterProject,
  receivedQtyTotal,
  transferValue,
  transitLossValue,
} from '@/lib/inventory/stock-transfer';

/** DRAFT and RECEIVED are settled states; the two middle ones need chasing. */
const STAGE_VARIANT: Record<StockTransfer['stage'], 'secondary' | 'info' | 'warning'> = {
  DRAFT: 'secondary',
  DISPATCHED: 'info',
  PARTLY_RECEIVED: 'warning',
  RECEIVED: 'secondary',
};

/**
 * A transfer has no party name of its own — the two stores are the story, so
 * the register is given a name lookup rather than denormalising onto the row.
 */
export function transferColumns(storeName: (siteId: string) => string): ColumnDef<StockTransfer>[] {
  return [
    {
      key: 'documentNo',
      header: t.inventory.stFull,
      sortable: true,
      width: '14rem',
      cell: (x) => (
        <span className="flex flex-col">
          <span className="font-medium text-foreground">{x.documentNo}</span>
          <span className="text-xs text-muted-foreground">{formatDate(x.date)}</span>
          {isInterProject(x) ? (
            <Badge variant="info" className="mt-0.5 self-start">
              {t.inventory.stInterProject}
            </Badge>
          ) : null}
        </span>
      ),
    },
    {
      key: 'route',
      header: t.inventory.secStRoute,
      width: '16rem',
      cell: (x) => (
        <span className="flex flex-col">
          <span className="truncate text-foreground">{storeName(x.fromSiteId)}</span>
          <span className="truncate text-xs text-muted-foreground">
            {t.common.to} {storeName(x.toSiteId)}
          </span>
        </span>
      ),
    },
    {
      key: 'stage',
      header: t.inventory.stStage,
      align: 'center',
      width: '10rem',
      cell: (x) => {
        const days = daysInTransit(x);
        return (
          <span className="flex flex-col items-center gap-0.5">
            <Badge variant={STAGE_VARIANT[x.stage]}>
              {t.inventory[`ts${x.stage}` as keyof typeof t.inventory] as string}
            </Badge>
            {days !== null ? (
              <span className="text-xs text-muted-foreground">
                {days} — {t.inventory.stDaysInTransit}
              </span>
            ) : null}
          </span>
        );
      },
    },
    {
      key: 'dispatchedQty',
      header: t.inventory.stDispatchedQty,
      align: 'right',
      width: '9rem',
      cell: (x) => <span className="num">{formatQuantity(dispatchedQtyTotal(x))}</span>,
    },
    {
      key: 'receivedQty',
      header: t.inventory.stReceivedQty,
      align: 'right',
      width: '9rem',
      hiddenByDefault: true,
      cell: (x) => <span className="num">{formatQuantity(receivedQtyTotal(x))}</span>,
    },
    {
      key: 'inTransitQty',
      header: t.inventory.stInTransitQty,
      align: 'right',
      width: '9rem',
      cell: (x) => {
        const qty = inTransitQtyTotal(x);
        return qty > 0 ? (
          <span className="num text-warning">{formatQuantity(qty)}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    },
    {
      key: 'transferValue',
      header: t.common.amount,
      sortable: true,
      align: 'right',
      width: '10rem',
      cell: (x) => <span className="num">{formatAmount(transferValue(x))}</span>,
    },
    {
      key: 'flags',
      header: t.common.status,
      align: 'center',
      width: '12rem',
      hideOnCard: true,
      cell: (x) => {
        const flags: React.ReactNode[] = [];
        if (hasTransitLoss(x)) {
          flags.push(
            <Badge key="loss" variant="danger">
              {`${t.inventory.stTransitLoss} ${formatAmount(transitLossValue(x))}`}
            </Badge>,
          );
        }
        if (x.challanNo) {
          flags.push(
            <Badge key="challan" variant="secondary">
              {x.challanNo}
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
