'use client';

import * as React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { terminology as t } from '@/config/terminology.config';
import type { ColumnDef } from '@/components/erp';
import type { Item, ItemGroup, ItemType, ValuationMethod } from '@/lib/data/types';

export const groupLabel = (g: ItemGroup): string =>
  t.masters[`grp${g}` as keyof typeof t.masters] as string;

export const typeLabel = (ty?: ItemType): string =>
  ty ? (t.masters[`type${ty}` as keyof typeof t.masters] as string) : '—';

export const valuationLabel = (v?: ValuationMethod): string =>
  v ? (t.masters[`val${v}` as keyof typeof t.masters] as string) : '—';

export const itemColumns: ColumnDef<Item>[] = [
  {
    key: 'code',
    header: t.masters.itemCode,
    sortable: true,
    width: '9rem',
    cell: (r) => <span className="font-medium text-foreground">{r.code}</span>,
  },
  {
    key: 'name',
    header: t.masters.itemName,
    sortable: true,
    cell: (r) => (
      <span className="flex items-center gap-1.5">
        <span className="truncate text-foreground">{r.name}</span>
        {r.isReturnable && <RotateCcw className="h-3 w-3 shrink-0 text-muted-foreground" aria-label={t.masters.itemReturnable} />}
        {r.isHazardous && <AlertTriangle className="h-3 w-3 shrink-0 text-warning" aria-label={t.masters.itemHazardous} />}
      </span>
    ),
  },
  {
    key: 'specification',
    header: t.masters.specification,
    hideOnCard: true,
    cell: (r) => <span className="text-muted-foreground">{r.specification || '—'}</span>,
  },
  { key: 'group', header: t.masters.itemGroup, sortable: true, cell: (r) => groupLabel(r.group) },
  {
    key: 'subGroup',
    header: t.masters.itemSubGroup,
    hiddenByDefault: true,
    cell: (r) => r.subGroup || '—',
  },
  { key: 'itemType', header: t.masters.itemType, sortable: true, cell: (r) => typeLabel(r.itemType) },
  { key: 'stockUomCode', header: t.masters.stockUom, align: 'center', cell: (r) => r.stockUomCode },
  {
    key: 'purchaseUomCode',
    header: t.masters.purchaseUom,
    align: 'center',
    hiddenByDefault: true,
    cell: (r) =>
      r.purchaseUomCode
        ? `${r.purchaseUomCode}${r.purchaseToStockFactor ? ` (×${r.purchaseToStockFactor})` : ''}`
        : '—',
  },
  { key: 'hsnCode', header: t.masters.hsnCode, align: 'center', cell: (r) => r.hsnCode },
  {
    key: 'gstRate',
    header: t.masters.gstRate,
    align: 'right',
    sortable: true,
    cell: (r) => `${r.gstRate}%`,
  },
  {
    key: 'reorderLevel',
    header: t.masters.reorderLevel,
    align: 'right',
    sortable: true,
    cell: (r) => (r.reorderLevel ? r.reorderLevel.toLocaleString('en-IN') : '—'),
  },
  {
    key: 'isActive',
    header: t.common.status,
    align: 'center',
    cell: (r) => (
      <span className={r.isActive ? 'text-success' : 'text-muted-foreground'}>
        {r.isActive ? t.admin.active : t.admin.inactive}
      </span>
    ),
  },
];
