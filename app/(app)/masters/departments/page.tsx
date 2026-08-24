'use client';

import * as React from 'react';
import { listDepartments, listEmployees } from '@/lib/data';
import type { Department, Employee } from '@/lib/data/types';
import { str } from '@/lib/forms';
import { useMasterCollection } from '@/lib/masters/use-master-collection';
import { terminology as t } from '@/config/terminology.config';
import type { Option } from '@/components/erp';
import DepartmentScreen from '@/features/masters/departments/department-screen';
import type { DepartmentFormValues } from '@/features/masters/departments/department-schema';

const toDepartment = (v: DepartmentFormValues): Omit<Department, 'id'> => ({
  code: v.code,
  name: v.name,
  // Blank means not assigned, so it drops out rather than storing ''.
  headEmployeeId: str(v.headEmployeeId),
  isActive: v.isActive,
});

export default function DepartmentsPage() {
  const [search, setSearch] = React.useState('');
  const [activeFilter, setActiveFilter] = React.useState('ALL');
  const [employees, setEmployees] = React.useState<Employee[]>([]);

  const { rows: allRows, isLoading, create, update, toggleActive } =
    useMasterCollection<Department, DepartmentFormValues>({
      entityKey: 'department',
      // listDepartments returns a plain array, not a Paged result.
      fetchFixtures: listDepartments,
      toDomain: toDepartment,
    });

  React.useEffect(() => {
    let cancelled = false;
    // listEmployees is paged, so unwrap .rows.
    void listEmployees({ pageSize: 500 }).then((p) => {
      if (!cancelled) setEmployees(p.rows);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const employeeOptions: Option[] = React.useMemo(
    () =>
      employees
        .filter((e) => e.isActive)
        .map((e) => ({ value: e.id, label: `${e.name} — ${e.designation}` })),
    [employees],
  );

  /** Unresolved ids render as not-assigned rather than an empty cell. */
  const employeeName = React.useCallback(
    (id?: string) => employees.find((e) => e.id === id)?.name ?? t.masters.depHeadNone,
    [employees],
  );

  const employeeDeptName = React.useCallback(
    (employeeId: string) => {
      const deptId = employees.find((e) => e.id === employeeId)?.departmentId;
      return allRows.find((d) => d.id === deptId)?.name;
    },
    [employees, allRows],
  );

  const rows = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return allRows.filter((r) => {
      // Fixture rows carry no flag, so missing means active.
      if (activeFilter === 'ACTIVE' && r.isActive === false) return false;
      if (activeFilter === 'INACTIVE' && r.isActive !== false) return false;
      if (q && !`${r.code} ${r.name} ${employeeName(r.headEmployeeId)}`.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [allRows, search, activeFilter, employeeName]);

  return (
    <DepartmentScreen
      rows={rows}
      isLoading={isLoading}
      search={search}
      onSearchChange={setSearch}
      activeFilter={activeFilter}
      onActiveFilterChange={setActiveFilter}
      employeeOptions={employeeOptions}
      employeeName={employeeName}
      employeeDeptName={employeeDeptName}
      onCreate={create}
      onUpdate={update}
      onToggleActive={toggleActive}
    />
  );
}
