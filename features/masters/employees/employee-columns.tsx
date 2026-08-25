'use client';

import * as React from 'react';
import { terminology as t } from '@/config/terminology.config';
import type { ColumnDef } from '@/components/erp';
import type { Employee } from '@/lib/data/types';

export interface EmployeeLookups {
  departmentName: (id: string) => string;
  companyCode: (id: string) => string;
  projectShortName: (id: string | null) => string;
  employeeName: (id?: string) => string;
}

/** Factory, per D-052 — foreign keys render as names. */
export const employeeColumns = (lk: EmployeeLookups): ColumnDef<Employee>[] => [
  {
    key: 'code',
    header: t.masters.empCode,
    sortable: true,
    width: '10rem',
    cell: (r) => <span className="font-medium text-foreground">{r.code}</span>,
  },
  {
    key: 'name',
    header: t.masters.empName,
    sortable: true,
    cell: (r) => (
      <span className="flex flex-col">
        <span className="truncate text-foreground">{r.name}</span>
        <span className="truncate text-xs text-muted-foreground">{r.designation}</span>
      </span>
    ),
  },
  {
    key: 'departmentId',
    header: t.masters.department,
    sortable: true,
    cell: (r) => lk.departmentName(r.departmentId),
  },
  {
    key: 'companyId',
    header: t.masters.company,
    sortable: true,
    cell: (r) => <span className="text-muted-foreground">{lk.companyCode(r.companyId)}</span>,
  },
  {
    key: 'projectId',
    header: t.masters.project,
    sortable: true,
    cell: (r) => (
      <span className={r.projectId ? 'text-foreground' : 'text-muted-foreground'}>
        {lk.projectShortName(r.projectId)}
      </span>
    ),
  },
  {
    key: 'reportingToId',
    header: t.masters.empReportingTo,
    hiddenByDefault: true,
    cell: (r) => (
      <span className={r.reportingToId ? 'text-foreground' : 'text-muted-foreground'}>
        {lk.employeeName(r.reportingToId)}
      </span>
    ),
  },
  {
    key: 'dateOfJoining',
    header: t.masters.empDoj,
    sortable: true,
    hiddenByDefault: true,
    cell: (r) => <span className="num text-xs">{r.dateOfJoining}</span>,
  },
  {
    key: 'phone',
    header: t.masters.phone,
    hiddenByDefault: true,
    cell: (r) => (
      <span className="flex flex-col">
        <span className="num text-xs">{r.phone}</span>
        <span className="truncate text-xs text-muted-foreground">{r.email}</span>
      </span>
    ),
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
