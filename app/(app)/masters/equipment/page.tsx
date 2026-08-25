'use client';

import * as React from 'react';
import { listEmployees, listEquipment, listProjects, listSites, listVendors } from '@/lib/data';
import { terminology as t } from '@/config/terminology.config';
import { useMasterCollection } from '@/lib/masters/use-master-collection';
import type { Employee, Equipment, Project, Site, Vendor } from '@/lib/data/types';
import { EquipmentScreen } from '@/features/masters/equipment/equipment-screen';
import type { EquipmentFormValues } from '@/features/masters/equipment/equipment-schema';

const blankToUndefined = (v: string): string | undefined => (v === '' ? undefined : v);

const toEquipment = (v: EquipmentFormValues): Omit<Equipment, 'id'> => ({
  code: v.code.trim().toUpperCase(),
  name: v.name.trim(),
  type: v.type.trim(),
  // '' rather than undefined so a cleared value overwrites the stored one (D-067).
  registrationNo: v.registrationNo,
  ownership: v.ownership,
  hireVendorId: v.hireVendorId,
  hireRate: v.hireRate === '' ? undefined : v.hireRate,
  hireRateUnit: v.hireRateUnit,
  projectId: v.projectId === '' ? null : v.projectId,
  siteId: v.siteId === '' ? null : v.siteId,
  operatorEmployeeId: v.operatorEmployeeId,
  status: v.status,
  currentHmr: v.currentHmr,
  nextServiceDueHmr: v.nextServiceDueHmr === '' ? undefined : v.nextServiceDueHmr,
  nextServiceDueDate: blankToUndefined(v.nextServiceDueDate),
  isActive: v.isActive,
});

export default function Page() {
  const { rows, isLoading, create, update, toggleActive } = useMasterCollection<
    Equipment,
    EquipmentFormValues
  >({
    entityKey: 'equipment',
    fetchFixtures: () => listEquipment({ pageSize: 500 }).then((p) => p.rows),
    toDomain: toEquipment,
  });

  const [projects, setProjects] = React.useState<Project[]>([]);
  const [sites, setSites] = React.useState<Site[]>([]);
  const [vendors, setVendors] = React.useState<Vendor[]>([]);
  const [employees, setEmployees] = React.useState<Employee[]>([]);

  React.useEffect(() => {
    void (async () => {
      const [p, s, v, e] = await Promise.all([
        listProjects(),
        listSites(),
        listVendors({ pageSize: 500 }).then((r) => r.rows),
        listEmployees({ pageSize: 500 }).then((r) => r.rows),
      ]);
      setProjects(p);
      setSites(s);
      setVendors(v);
      setEmployees(e);
    })();
  }, []);

  const [search, setSearch] = React.useState('');
  const [ownershipFilter, setOwnershipFilter] = React.useState('ALL');
  const [statusFilter, setStatusFilter] = React.useState('ALL');
  const [activeFilter, setActiveFilter] = React.useState('ALL');

  const projectOptions = React.useMemo(
    () => projects.map((p) => ({ value: p.id, label: `${p.code} — ${p.shortName}` })),
    [projects],
  );

  const siteOptions = React.useMemo(
    () => sites.map((s) => ({ value: s.id, label: `${s.code} — ${s.name}`, projectId: s.projectId })),
    [sites],
  );

  // Hire vendors only — equipment is not hired from a cement supplier.
  const vendorOptions = React.useMemo(
    () =>
      vendors
        .filter((v) => v.category === 'EQUIPMENT_HIRE' && v.isActive)
        .map((v) => ({ value: v.id, label: `${v.code} — ${v.name}` })),
    [vendors],
  );

  const employeeOptions = React.useMemo(
    () => employees.filter((e) => e.isActive).map((e) => ({ value: e.id, label: `${e.code} — ${e.name}` })),
    [employees],
  );

  const projectName = React.useCallback(
    (id: string | null) => (id ? projects.find((p) => p.id === id)?.shortName ?? id : '—'),
    [projects],
  );

  const siteName = React.useCallback(
    (id: string | null) => (id ? sites.find((s) => s.id === id)?.name ?? id : '—'),
    [sites],
  );

  const vendorName = React.useCallback(
    (id?: string) => (id ? vendors.find((v) => v.id === id)?.name ?? id : '—'),
    [vendors],
  );

  const employeeName = React.useCallback(
    (id?: string) => (id ? employees.find((e) => e.id === id)?.name ?? id : t.masters.eqpOperatorNone),
    [employees],
  );

  const visible = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (ownershipFilter !== 'ALL' && r.ownership !== ownershipFilter) return false;
      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
      if (activeFilter === 'ACTIVE' && r.isActive === false) return false;
      if (activeFilter === 'INACTIVE' && r.isActive !== false) return false;
      if (!q) return true;
      return [r.code, r.name, r.type, r.registrationNo ?? ''].some((f) => f.toLowerCase().includes(q));
    });
  }, [rows, search, ownershipFilter, statusFilter, activeFilter]);

  return (
    <EquipmentScreen
      rows={visible}
      isLoading={isLoading}
      search={search}
      onSearchChange={setSearch}
      ownershipFilter={ownershipFilter}
      onOwnershipFilterChange={setOwnershipFilter}
      statusFilter={statusFilter}
      onStatusFilterChange={setStatusFilter}
      activeFilter={activeFilter}
      onActiveFilterChange={setActiveFilter}
      projectOptions={projectOptions}
      siteOptions={siteOptions}
      vendorOptions={vendorOptions}
      employeeOptions={employeeOptions}
      projectName={projectName}
      siteName={siteName}
      vendorName={vendorName}
      employeeName={employeeName}
      onCreate={create}
      onUpdate={update}
      onToggleActive={toggleActive}
    />
  );
}
