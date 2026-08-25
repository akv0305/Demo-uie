'use client';

import * as React from 'react';
import { terminology as t } from '@/config/terminology.config';
import type { ColumnDef } from '@/components/erp';
import type { Site } from '@/lib/data/types';

export interface SiteColumnLookups {
  companyName: (id: string) => string;
  projectName: (id: string | null) => string;
  employeeName: (id?: string) => string;
}

export const siteColumns = ({
  companyName,
  projectName,
  employeeName,
}: SiteColumnLookups): ColumnDef<Site>[] => [
  {
    key: 'code',
    header: t.masters.sitCode,
    sortable: true,
    width: '9rem',
    cell: (r) => <span className="font-medium text-foreground">{r.code}</span>,
  },
  {
    key: 'name',
    header: t.masters.siteName,
    sortable: true,
    cell: (r) => <span className="truncate text-foreground">{r.name}</span>,
  },
  {
    key: 'type',
    header: t.masters.siteType,
    sortable: true,
    width: '9rem',
    cell: (r) => <span className="text-foreground">{t.masters[`st${r.type}`]}</span>,
  },
  {
    key: 'companyId',
    header: t.masters.company,
    sortable: true,
    cell: (r) => <span className="text-foreground">{companyName(r.companyId)}</span>,
  },
  {
    key: 'projectId',
    header: t.masters.project,
    sortable: true,
    cell: (r) => (
      <span className={r.projectId ? 'text-foreground' : 'text-muted-foreground'}>
        {projectName(r.projectId)}
      </span>
    ),
  },
  {
    key: 'location',
    header: t.masters.location,
    sortable: true,
    cell: (r) => <span className="truncate text-muted-foreground">{r.location}</span>,
  },
  {
    key: 'storeKeeperId',
    header: t.masters.storeKeeper,
    sortable: true,
    cell: (r) => (
      <span className={r.storeKeeperId ? 'text-foreground' : 'text-muted-foreground'}>
        {employeeName(r.storeKeeperId)}
      </span>
    ),
  },
  {
    key: 'isStore',
    header: t.masters.sitIsStore,
    align: 'center',
    cell: (r) => (
      <span className={r.isStore ? 'text-foreground' : 'text-muted-foreground'}>
        {r.isStore ? t.common.yes : t.common.no}
      </span>
    ),
  },
  {
    key: 'isActive',
    header: t.common.status,
    align: 'center',
    cell: (r) => (
      <span className={r.isActive !== false ? 'text-success' : 'text-muted-foreground'}>
        {r.isActive !== false ? t.admin.active : t.admin.inactive}
      </span>
    ),
  },
];
