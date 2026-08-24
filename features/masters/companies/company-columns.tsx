'use client';

import * as React from 'react';
import { terminology as t } from '@/config/terminology.config';
import type { ColumnDef } from '@/components/erp';
import type { Company, CompanyType } from '@/lib/data/types';

export const entityTypeLabel = (ct: CompanyType): string =>
  t.masters[`ent${ct}` as keyof typeof t.masters] as string;

export const companyColumns: ColumnDef<Company>[] = [
  {
    key: 'code',
    header: t.masters.cmpCode,
    sortable: true,
    width: '8rem',
    cell: (r) => <span className="font-medium text-foreground">{r.code}</span>,
  },
  {
    key: 'name',
    header: t.masters.cmpName,
    sortable: true,
    cell: (r) => (
      <span className="flex flex-col">
        <span className="truncate text-foreground">{r.name}</span>
        <span className="truncate text-xs text-muted-foreground">{r.legalName}</span>
      </span>
    ),
  },
  { key: 'type', header: t.masters.cmpType, sortable: true, cell: (r) => entityTypeLabel(r.type) },
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
    key: 'pan',
    header: t.masters.pan,
    hiddenByDefault: true,
    cell: (r) => <span className="num text-xs">{r.pan}</span>,
  },
  {
    key: 'cin',
    header: t.masters.cmpCin,
    hiddenByDefault: true,
    // A JV has no CIN; the dash is presentation, not data.
    cell: (r) => <span className="num text-xs">{r.cin || '—'}</span>,
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
    key: 'isActive',
    header: t.common.status,
    align: 'center',
    // Fixture rows carry no flag, so missing means active.
    cell: (r) => (
      <span className={r.isActive !== false ? 'text-success' : 'text-muted-foreground'}>
        {r.isActive !== false ? t.admin.active : t.admin.inactive}
      </span>
    ),
  },
];
