'use client';

import * as React from 'react';
import { listCompanies, listEmployees, listProjects } from '@/lib/data';
import type { Company, Employee, Project } from '@/lib/data/types';
import { str } from '@/lib/forms';
import { croreToRupees } from '@/lib/format';
import { useMasterCollection } from '@/lib/masters/use-master-collection';
import type { Option } from '@/components/erp';
import ProjectScreen from '@/features/masters/projects/project-screen';
import type { ProjectFormValues } from '@/features/masters/projects/project-schema';

/**
 * Form values to domain shape. The form takes crore for readability; the model
 * stores rupees (R2, D-059). Progress percentages are execution data and are
 * not part of the form, so a new project starts at zero.
 */
const toProject = (v: ProjectFormValues): Omit<Project, 'id'> => ({
  companyId: v.companyId,
  code: v.code,
  name: v.name,
  shortName: v.shortName,
  type: v.type,
  client: v.client,
  location: v.location,
  contractValue: croreToRupees(v.contractValueCrore),
  startDate: v.startDate,
  endDate: v.endDate,
  physicalProgressPct: 0,
  financialProgressPct: 0,
  projectManagerId: v.projectManagerId,
  chainageFrom: str(v.chainageFrom),
  chainageTo: str(v.chainageTo),
  status: v.status,
});

export default function ProjectsPage() {
  const [search, setSearch] = React.useState('');
  const [companyFilter, setCompanyFilter] = React.useState('ALL');
  const [statusFilter, setStatusFilter] = React.useState('ALL');

  const [companies, setCompanies] = React.useState<Company[]>([]);
  const [employees, setEmployees] = React.useState<Employee[]>([]);

  const { rows: allRows, isLoading, create, update } =
    useMasterCollection<Project, ProjectFormValues>({
      entityKey: 'project',
      // listProjects returns a plain array, not a Paged result.
      fetchFixtures: listProjects,
      toDomain: toProject,
    });

  React.useEffect(() => {
    let cancelled = false;
    void Promise.all([listCompanies(), listEmployees({ pageSize: 500 })]).then(([c, e]) => {
      if (cancelled) return;
      setCompanies(c);
      setEmployees(e.rows);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const companyOptions: Option[] = React.useMemo(
    () =>
      companies
        .filter((c) => c.isActive !== false)
        .map((c) => ({ value: c.id, label: c.name, hint: c.code })),
    [companies],
  );

  const managerOptions = React.useMemo(
    () =>
      employees
        .filter((e) => e.isActive)
        .map((e) => ({
          value: e.id,
          label: `${e.name} — ${e.designation}`,
          hint: e.code,
          companyId: e.companyId,
        })),
    [employees],
  );

  const lookups = React.useMemo(
    () => ({
      companyCode: (id: string) => companies.find((c) => c.id === id)?.code ?? id,
      employeeName: (id: string) => employees.find((e) => e.id === id)?.name ?? id,
    }),
    [companies, employees],
  );

  const rows = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return allRows.filter((r) => {
      if (companyFilter !== 'ALL' && r.companyId !== companyFilter) return false;
      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
      if (q && !`${r.code} ${r.name} ${r.shortName} ${r.client} ${r.location}`.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [allRows, search, companyFilter, statusFilter]);

  return (
    <ProjectScreen
      rows={rows}
      allRows={allRows}
      isLoading={isLoading}
      search={search}
      onSearchChange={setSearch}
      companyFilter={companyFilter}
      onCompanyFilterChange={setCompanyFilter}
      statusFilter={statusFilter}
      onStatusFilterChange={setStatusFilter}
      companyOptions={companyOptions}
      managerOptions={managerOptions}
      lookups={lookups}
      onCreate={create}
      onUpdate={update}
    />
  );
}
