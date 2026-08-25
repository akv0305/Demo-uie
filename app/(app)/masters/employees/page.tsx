'use client';

import * as React from 'react';
import { listCompanies, listDepartments, listEmployees, listProjects } from '@/lib/data';
import type { Company, Department, Employee, Project } from '@/lib/data/types';
import { str } from '@/lib/forms';
import { useMasterCollection } from '@/lib/masters/use-master-collection';
import { terminology as t } from '@/config/terminology.config';
import type { Option } from '@/components/erp';
import EmployeeScreen from '@/features/masters/employees/employee-screen';
import type { EmployeeFormValues } from '@/features/masters/employees/employee-schema';

const toEmployee = (v: EmployeeFormValues): Omit<Employee, 'id'> => ({
  code: v.code,
  name: v.name,
  designation: v.designation,
  departmentId: v.departmentId,
  companyId: v.companyId,
  // Blank means head office, which the contract models as null.
  projectId: v.projectId || null,
  dateOfJoining: v.dateOfJoining,
  reportingToId: str(v.reportingToId),
  phone: v.phone,
  email: v.email,
  pfNumber: str(v.pfNumber),
  esiNumber: str(v.esiNumber),
  isActive: v.isActive,
});

export default function EmployeesPage() {
  const [search, setSearch] = React.useState('');
  const [deptFilter, setDeptFilter] = React.useState('ALL');
  const [companyFilter, setCompanyFilter] = React.useState('ALL');
  const [activeFilter, setActiveFilter] = React.useState('ALL');

  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [companies, setCompanies] = React.useState<Company[]>([]);
  const [projects, setProjects] = React.useState<Project[]>([]);

  const { rows: allRows, isLoading, create, update, toggleActive } =
    useMasterCollection<Employee, EmployeeFormValues>({
      entityKey: 'employee',
      // listEmployees is paged, so unwrap .rows.
      fetchFixtures: () => listEmployees({ pageSize: 500 }).then((p) => p.rows),
      toDomain: toEmployee,
    });

  React.useEffect(() => {
    let cancelled = false;
    void Promise.all([listDepartments(), listCompanies(), listProjects()]).then(([d, c, p]) => {
      if (cancelled) return;
      setDepartments(d);
      setCompanies(c);
      setProjects(p);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const departmentOptions: Option[] = React.useMemo(
    () =>
      departments
        .filter((d) => d.isActive !== false)
        .map((d) => ({ value: d.id, label: d.name, hint: d.code })),
    [departments],
  );

  const companyOptions: Option[] = React.useMemo(
    () =>
      companies
        .filter((c) => c.isActive !== false)
        .map((c) => ({ value: c.id, label: c.name, hint: c.code })),
    [companies],
  );

  const projectOptions = React.useMemo(
    () =>
      projects.map((p) => ({
        value: p.id,
        label: p.shortName,
        hint: p.code,
        companyId: p.companyId,
      })),
    [projects],
  );

  const lookups = React.useMemo(
    () => ({
      departmentName: (id: string) => departments.find((d) => d.id === id)?.name ?? id,
      companyCode: (id: string) => companies.find((c) => c.id === id)?.code ?? id,
      projectShortName: (id: string | null) =>
        id ? (projects.find((p) => p.id === id)?.shortName ?? id) : t.masters.empProjectNone,
      employeeName: (id?: string) =>
        id ? (allRows.find((e) => e.id === id)?.name ?? id) : t.masters.empReportingNone,
    }),
    [departments, companies, projects, allRows],
  );

  const rows = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return allRows.filter((r) => {
      if (deptFilter !== 'ALL' && r.departmentId !== deptFilter) return false;
      if (companyFilter !== 'ALL' && r.companyId !== companyFilter) return false;
      if (activeFilter === 'ACTIVE' && !r.isActive) return false;
      if (activeFilter === 'INACTIVE' && r.isActive) return false;
      if (q && !`${r.code} ${r.name} ${r.designation} ${r.email} ${r.phone}`.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [allRows, search, deptFilter, companyFilter, activeFilter]);

  return (
    <EmployeeScreen
      rows={rows}
      allRows={allRows}
      isLoading={isLoading}
      search={search}
      onSearchChange={setSearch}
      deptFilter={deptFilter}
      onDeptFilterChange={setDeptFilter}
      companyFilter={companyFilter}
      onCompanyFilterChange={setCompanyFilter}
      activeFilter={activeFilter}
      onActiveFilterChange={setActiveFilter}
      departmentOptions={departmentOptions}
      companyOptions={companyOptions}
      projectOptions={projectOptions}
      lookups={lookups}
      onCreate={create}
      onUpdate={update}
      onToggleActive={toggleActive}
    />
  );
}
