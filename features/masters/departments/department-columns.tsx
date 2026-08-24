'use client';

import * as React from 'react';
import { terminology as t } from '@/config/terminology.config';
import type { ColumnDef } from '@/components/erp';
import type { Department } from '@/lib/data/types';

/**
 * Columns need an employee name, not an id, so this is a factory rather than a
 * constant. First master with a foreign key in the table; Projects, Sites and
 * Employees follow the same shape.
 */
export const departmentColumns = (
  employeeName: (id?: string) => string,
): ColumnDef<Department>[] => [
  {
    key: 'code',
    header: t.masters.depCode,
    sortable: true,
    width: '8rem',
    cell: (r) => <span className="font-medium text-foreground">{r.code}</span>,
  },
  {
    key: 'name',
    header: t.masters.depName,
    sortable: true,
    cell: (r) => <span className="truncate text-foreground">{r.name}</span>,
  },
  {
    key: 'headEmployeeId',
    header: t.masters.depHead,
    sortable: true,
    cell: (r) => (
      <span className={r.headEmployeeId ? 'text-foreground' : 'text-muted-foreground'}>
        {employeeName(r.headEmployeeId)}
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
