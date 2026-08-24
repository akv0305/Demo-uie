'use client';

import * as React from 'react';
import { BadgeCheck } from 'lucide-react';
import { terminology as t } from '@/config/terminology.config';
import type { ColumnDef } from '@/components/erp';
import type { Vendor, VendorCategory } from '@/lib/data/types';

export const categoryLabel = (c: VendorCategory): string =>
  t.masters[`cat${c}` as keyof typeof t.masters] as string;

export const vendorColumns: ColumnDef<Vendor>[] = [
  {
    key: 'code',
    header: t.masters.vendorCode,
    sortable: true,
    width: '10rem',
    cell: (r) => <span className="font-medium text-foreground">{r.code}</span>,
  },
  {
    key: 'name',
    header: t.masters.vendorName,
    sortable: true,
    cell: (r) => (
      <span className="flex items-center gap-1.5">
        <span className="truncate text-foreground">{r.name}</span>
        {r.msmeNo && <BadgeCheck className="h-3 w-3 shrink-0 text-info" aria-label={t.masters.vendorMsme} />}
      </span>
    ),
  },
  { key: 'category', header: t.masters.vendorCategory, sortable: true, cell: (r) => categoryLabel(r.category) },
  {
    key: 'city',
    header: t.masters.vendorCity,
    sortable: true,
    cell: (r) => <span className="text-muted-foreground">{r.city}, {r.state}</span>,
  },
  {
    key: 'gstin',
    header: t.masters.vendorGstin,
    hideOnCard: true,
    cell: (r) => <span className="num text-xs">{r.gstin}</span>,
  },
  {
    key: 'contactPerson',
    header: t.masters.vendorContactPerson,
    hiddenByDefault: true,
    cell: (r) => (
      <span className="flex flex-col">
        <span>{r.contactPerson}</span>
        <span className="text-xs text-muted-foreground">{r.phone}</span>
      </span>
    ),
  },
  {
    key: 'paymentTerms',
    header: t.masters.vendorPaymentTerms,
    hiddenByDefault: true,
    cell: (r) => r.paymentTerms,
  },
  {
    key: 'creditDays',
    header: t.masters.vendorCreditDays,
    align: 'right',
    sortable: true,
    cell: (r) => `${r.creditDays}`,
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
