'use client';

import * as React from 'react';
import { terminology as t } from '@/config/terminology.config';
import { StatusChip, type ColumnDef } from '@/components/erp';
import { Badge } from '@/components/ui/badge';
import { formatAmount, formatDate, formatQuantity } from '@/lib/format';
import type { OpeningStock } from '@/lib/data/types';
import {
  hasUnvaluedLine,
  isPosted,
  itemCount,
  openingValue,
  unvaluedQtyTotal,
} from '@/lib/inventory/opening-stock';

/** A counted figure and a copied figure are not equally trustworthy (D-155). */
const BASIS_VARIANT: Record<OpeningStock['basis'], 'secondary' | 'info' | 'warning'> = {
  PHYSICAL_COUNT: 'secondary',
  LEGACY_SYSTEM: 'info',
  MANUAL_REGISTER: 'warning',
};

export function openingColumns(storeName: (siteId: string) => string): ColumnDef<OpeningStock>[] {
  return [
    {
      key: 'documentNo',
      header: t.inventory.osFull,
      sortable: true,
      width: '15rem',
      cell: (x) => (
        <span className="flex flex-col">
          <span className="font-medium text-foreground">{x.documentNo}</span>
          <span className="text-xs text-muted-foreground">
            {t.inventory.osCutOff}: {formatDate(x.date)}
          </span>
          <Badge variant={BASIS_VARIANT[x.basis]} className="mt-0.5 self-start">
            {t.inventory[`ob${x.basis}` as keyof typeof t.inventory] as string}
          </Badge>
        </span>
      ),
    },
    {
      key: 'store',
      header: t.inventory.osStore,
      width: '15rem',
      cell: (x) => (
        <span className="flex flex-col">
          <span className="truncate text-foreground">{storeName(x.storeSiteId)}</span>
          {x.referenceNo ? (
            <span className="truncate text-xs text-muted-foreground">{x.referenceNo}</span>
          ) : null}
        </span>
      ),
    },
    {
      key: 'items',
      header: t.inventory.osItems,
      align: 'center',
      width: '7rem',
      cell: (x) => <span className="num text-foreground">{itemCount(x)}</span>,
    },
    {
      key: 'value',
      header: t.inventory.osValue,
      sortable: true,
      align: 'right',
      width: '11rem',
      cell: (x) => <span className="num font-medium">{formatAmount(openingValue(x))}</span>,
    },
    {
      key: 'unvalued',
      header: t.inventory.osUnvalued,
      align: 'right',
      width: '9rem',
      hiddenByDefault: true,
      cell: (x) => {
        const qty = unvaluedQtyTotal(x);
        return qty > 0 ? (
          <span className="num text-warning">{formatQuantity(qty)}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    },
    {
      key: 'flags',
      header: t.common.status,
      align: 'center',
      width: '14rem',
      hideOnCard: true,
      cell: (x) => {
        const flags: React.ReactNode[] = [];
        if (!isPosted(x)) {
          flags.push(
            <Badge key="unposted" variant="warning">
              {t.inventory.osNotPosted}
            </Badge>,
          );
        }
        if (hasUnvaluedLine(x)) {
          flags.push(
            <Badge key="unvalued" variant="danger">
              {t.inventory.osUnvalued}
            </Badge>,
          );
        }
        if (!x.certifiedBy) {
          flags.push(
            <Badge key="uncertified" variant="secondary">
              {t.inventory.osCertifiedBy}
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
