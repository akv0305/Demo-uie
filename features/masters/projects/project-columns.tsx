'use client';

import * as React from 'react';
import { terminology as t } from '@/config/terminology.config';
import type { ColumnDef } from '@/components/erp';
import type { Project, ProjectType } from '@/lib/data/types';
import { formatCrore } from '@/lib/format';

export const projectTypeLabel = (pt: ProjectType): string =>
  t.masters[`pt${pt}` as keyof typeof t.masters] as string;

export const projectStatusLabel = (s: Project['status']): string =>
  t.masters[`prj${s}` as keyof typeof t.masters] as string;

export interface ProjectLookups {
  companyCode: (id: string) => string;
  employeeName: (id: string) => string;
}

export const projectColumns = (lk: ProjectLookups): ColumnDef<Project>[] => [
  {
    key: 'code',
    header: t.masters.prjCode,
    sortable: true,
    width: '10rem',
    cell: (r) => <span className="font-medium text-foreground">{r.code}</span>,
  },
  {
    key: 'shortName',
    header: t.masters.prjName,
    sortable: true,
    cell: (r) => (
      <span className="flex flex-col">
        <span className="truncate text-foreground">{r.shortName}</span>
        <span className="truncate text-xs text-muted-foreground">{r.client}</span>
      </span>
    ),
  },
  { key: 'type', header: t.masters.prjType, sortable: true, cell: (r) => projectTypeLabel(r.type) },
  {
    key: 'companyId',
    header: t.masters.company,
    sortable: true,
    cell: (r) => <span className="text-muted-foreground">{lk.companyCode(r.companyId)}</span>,
  },
  {
    key: 'contractValue',
    header: t.masters.prjContractValue,
    align: 'right',
    sortable: true,
    cell: (r) => <span className="num">{formatCrore(r.contractValue)}</span>,
  },
  {
    key: 'physicalProgressPct',
    header: t.masters.prjPhysicalProgress,
    align: 'right',
    sortable: true,
    cell: (r) => <span className="num">{r.physicalProgressPct.toFixed(1)}%</span>,
  },
  {
    key: 'financialProgressPct',
    header: t.masters.prjFinancialProgress,
    align: 'right',
    sortable: true,
    hiddenByDefault: true,
    cell: (r) => <span className="num">{r.financialProgressPct.toFixed(1)}%</span>,
  },
  {
    key: 'endDate',
    header: t.masters.prjEndDate,
    sortable: true,
    cell: (r) => <span className="num text-xs">{r.endDate}</span>,
  },
  {
    key: 'projectManagerId',
    header: t.masters.prjManager,
    hiddenByDefault: true,
    cell: (r) => lk.employeeName(r.projectManagerId),
  },
  {
    key: 'location',
    header: t.masters.prjLocation,
    hiddenByDefault: true,
    cell: (r) => <span className="text-muted-foreground">{r.location}</span>,
  },
  {
    key: 'status',
    header: t.masters.prjStatus,
    align: 'center',
    sortable: true,
    cell: (r) => (
      <span
        className={
          r.status === 'ACTIVE'
            ? 'text-success'
            : r.status === 'ON_HOLD'
              ? 'text-warning'
              : 'text-muted-foreground'
        }
      >
        {projectStatusLabel(r.status)}
      </span>
    ),
  },
];
