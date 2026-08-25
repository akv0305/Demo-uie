'use client';

import * as React from 'react';
import { terminology as t } from '@/config/terminology.config';
import { formatAmount, formatDate, formatNumber } from '@/lib/format';
import type { ColumnDef } from '@/components/erp';
import type { Equipment } from '@/lib/data/types';
import { isServiceOverdue } from './equipment-schema';

export interface EquipmentColumnLookups {
  projectName: (id: string | null) => string;
  siteName: (id: string | null) => string;
  vendorName: (id?: string) => string;
  employeeName: (id?: string) => string;
}

export const equipmentColumns = ({
  projectName,
  siteName,
  vendorName,
  employeeName,
}: EquipmentColumnLookups): ColumnDef<Equipment>[] => [
  {
    key: 'code',
    header: t.masters.eqpCode,
    sortable: true,
    width: '10rem',
    cell: (r) => <span className="font-medium text-foreground">{r.code}</span>,
  },
  {
    key: 'name',
    header: t.masters.eqpName,
    sortable: true,
    cell: (r) => <span className="truncate text-foreground">{r.name}</span>,
  },
  {
    key: 'type',
    header: t.masters.eqpType,
    sortable: true,
    width: '9rem',
    cell: (r) => <span className="text-foreground">{r.type}</span>,
  },
  {
    key: 'registrationNo',
    header: t.masters.eqpRegNo,
    sortable: true,
    width: '8rem',
    cell: (r) => (
      <span className={r.registrationNo ? 'text-foreground' : 'text-muted-foreground'}>
        {r.registrationNo || '—'}
      </span>
    ),
  },
  {
    key: 'ownership',
    header: t.masters.eqpOwnership,
    sortable: true,
    width: '7rem',
    cell: (r) => (
      <span className="text-foreground">
        {r.ownership === 'OWNED' ? t.masters.eoOWNED : t.masters.eoHIRED}
      </span>
    ),
  },
  {
    key: 'hireVendorId',
    header: t.masters.eqpHireVendor,
    cell: (r) =>
      r.ownership === 'HIRED' ? (
        <span className="truncate text-foreground">
          {vendorName(r.hireVendorId)}
          {r.hireRate !== undefined && (
            <span className="text-muted-foreground">
              {' · '}
              {formatAmount(r.hireRate)}/{r.hireRateUnit}
            </span>
          )}
        </span>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    key: 'projectId',
    header: t.masters.project,
    sortable: true,
    cell: (r) => <span className="text-foreground">{projectName(r.projectId)}</span>,
  },
  {
    key: 'siteId',
    header: t.masters.siteName,
    cell: (r) => <span className="truncate text-muted-foreground">{siteName(r.siteId)}</span>,
  },
  {
    key: 'operatorEmployeeId',
    header: t.masters.eqpOperator,
    cell: (r) => (
      <span className={r.operatorEmployeeId ? 'text-foreground' : 'text-muted-foreground'}>
        {employeeName(r.operatorEmployeeId)}
      </span>
    ),
  },
  {
    key: 'status',
    header: t.masters.eqpStatus,
    sortable: true,
    width: '9rem',
    cell: (r) => (
      <span
        className={
          r.status === 'WORKING'
            ? 'text-success'
            : r.status === 'BREAKDOWN'
              ? 'text-danger'
              : r.status === 'UNDER_MAINTENANCE'
                ? 'text-warning'
                : 'text-muted-foreground'
        }
      >
        {t.masters[`es${r.status}`]}
      </span>
    ),
  },
  {
    key: 'currentHmr',
    header: t.masters.eqpCurrentHmr,
    sortable: true,
    align: 'right',
    cell: (r) => <span className="num text-foreground">{formatNumber(r.currentHmr)}</span>,
  },
  {
    key: 'nextServiceDueDate',
    header: t.masters.eqpNextServiceDate,
    sortable: true,
    width: '10rem',
    cell: (r) => {
      const overdue = isServiceOverdue(r.currentHmr, r.nextServiceDueHmr, r.nextServiceDueDate);
      return (
        <span className={overdue ? 'text-danger' : 'text-muted-foreground'}>
          {r.nextServiceDueDate ? formatDate(r.nextServiceDueDate) : '—'}
          {overdue && ` · ${t.masters.eqpServiceOverdue}`}
        </span>
      );
    },
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
