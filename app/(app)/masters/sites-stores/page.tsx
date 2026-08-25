'use client';

import * as React from 'react';
import {
  listCompanies,
  listEmployees,
  listProjects,
  listSites,
} from '@/lib/data';
import { terminology as t } from '@/config/terminology.config';
import { useMasterCollection } from '@/lib/masters/use-master-collection';
import type { Company, Employee, Project, Site } from '@/lib/data/types';
import { SiteScreen } from '@/features/masters/sites/site-screen';
import type { SiteFormValues } from '@/features/masters/sites/site-schema';

const toSite = (v: SiteFormValues): Omit<Site, 'id'> => ({
  companyId: v.companyId,
  projectId: v.projectId === '' ? null : v.projectId,
  code: v.code.trim().toUpperCase(),
  name: v.name.trim(),
  type: v.type,
  location: v.location.trim(),
  // '' rather than undefined: JSON.stringify drops undefined keys, so a
  // cleared keeper would otherwise never overwrite the stored value.
  storeKeeperId: v.storeKeeperId,
  isStore: v.isStore,
  isActive: v.isActive,
});

export default function Page() {
  const { rows, isLoading, create, update, toggleActive } = useMasterCollection<Site, SiteFormValues>({
    entityKey: 'site',
    fetchFixtures: listSites, // plain array, not Paged
    toDomain: toSite,
  });

  const [companies, setCompanies] = React.useState<Company[]>([]);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [employees, setEmployees] = React.useState<Employee[]>([]);

  React.useEffect(() => {
    void (async () => {
      const [c, p, e] = await Promise.all([
        listCompanies(),
        listProjects(),
        listEmployees({ pageSize: 500 }).then((r) => r.rows),
      ]);
      setCompanies(c);
      setProjects(p);
      setEmployees(e);
    })();
  }, []);

  const [search, setSearch] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState('ALL');
  const [activeFilter, setActiveFilter] = React.useState('ALL');

  const companyOptions = React.useMemo(
    () => companies.map((c) => ({ value: c.id, label: `${c.code} — ${c.name}` })),
    [companies],
  );

  const projectOptions = React.useMemo(
    () => projects.map((p) => ({ value: p.id, label: `${p.code} — ${p.shortName}`, companyId: p.companyId })),
    [projects],
  );

  const employeeOptions = React.useMemo(
    () => employees.filter((e) => e.isActive).map((e) => ({ value: e.id, label: `${e.code} — ${e.name}` })),
    [employees],
  );

  const companyName = React.useCallback(
    (id: string) => companies.find((c) => c.id === id)?.name ?? id,
    [companies],
  );

  const projectName = React.useCallback(
    (id: string | null) => (id ? projects.find((p) => p.id === id)?.shortName ?? id : t.masters.sitProjectNone),
    [projects],
  );

  const employeeName = React.useCallback(
    (id?: string) => (id ? employees.find((e) => e.id === id)?.name ?? id : t.masters.sitStoreKeeperNone),
    [employees],
  );

  const visible = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (typeFilter !== 'ALL' && r.type !== typeFilter) return false;
      if (activeFilter === 'ACTIVE' && r.isActive === false) return false;
      if (activeFilter === 'INACTIVE' && r.isActive !== false) return false;
      if (!q) return true;
      return [r.code, r.name, r.location].some((f) => f.toLowerCase().includes(q));
    });
  }, [rows, search, typeFilter, activeFilter]);

  return (
    <SiteScreen
      rows={visible}
      isLoading={isLoading}
      search={search}
      onSearchChange={setSearch}
      typeFilter={typeFilter}
      onTypeFilterChange={setTypeFilter}
      activeFilter={activeFilter}
      onActiveFilterChange={setActiveFilter}
      companyOptions={companyOptions}
      projectOptions={projectOptions}
      employeeOptions={employeeOptions}
      companyName={companyName}
      projectName={projectName}
      employeeName={employeeName}
      onCreate={create}
      onUpdate={update}
      onToggleActive={toggleActive}
    />
  );
}
