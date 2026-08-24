'use client';

import * as React from 'react';
import { HardHat } from 'lucide-react';
import { terminology as t } from '@/config/terminology.config';
import type { ColumnDef } from '@/components/erp';
import type { Subcontractor, SubcontractorTrade } from '@/lib/data/types';

export const tradeLabel = (tr: SubcontractorTrade): string =>
  t.masters[`trd${tr}` as keyof typeof t.masters] as string;

export const subcontractorColumns: ColumnDef<Subcontractor>[] = [
  {
    key: 'code',
    header: t.masters.subCode,
    sortable: true,
    width: '10rem',
    cell: (r) => <span className="font-medium text-foreground">{r.code}</span>,
  },
  {
    key: 'name',
    header: t.masters.subName,
    sortable: true,
    cell: (r) => (
      <span className="flex items-center gap-1.5">
        <span className="truncate text-foreground">{r.name}</span>
        {r.isLabourContractor && (
          <HardHat className="h-3 w-3 shrink-0 text-info" aria-label={t.masters.subIsLabour} />
        )}
      </span>
    ),
  },
  { key: 'trade', header: t.masters.trade, sortable: true, cell: (r) => tradeLabel(r.trade) },
  {
    key: 'city',
    header: t.masters.city,
    sortable: true,
    cell: (r) => <span className="text-muted-foreground">{r.city}, {r.state}</span>,
  },
  {
    key: 'gstin',
    header: t.masters.gstin,
    hideOnCard: true,
    cell: (r) => <span className="num text-xs">{r.gstin}</span>,
  },
  {
    key: 'contactPerson',
    header: t.masters.contactPerson,
    hiddenByDefault: true,
    cell: (r) => (
      <span className="flex flex-col">
        <span>{r.contactPerson}</span>
        <span className="text-xs text-muted-foreground">{r.phone}</span>
      </span>
    ),
  },
  {
    key: 'licenceNo',
    header: t.masters.subLicenceNo,
    hiddenByDefault: true,
    cell: (r) => r.licenceNo ?? '—',
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
