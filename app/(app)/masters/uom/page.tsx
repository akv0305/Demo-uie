'use client';

import * as React from 'react';
import { listUoms, createRecord, updateRecord, listRecords } from '@/lib/data';
import type { Uom } from '@/lib/data/types';
import UomScreen from '@/features/masters/uom/uom-screen';
import type { UomFormValues } from '@/features/masters/uom/uom-schema';

const ENTITY = 'uom';

/** Edits to fixture rows are stored as patch records (D-023). */
interface UomPatch {
  id: string;
  targetId: string;
  patch: Partial<Uom>;
}

export default function UomPage() {
  const [fixtureRows, setFixtureRows] = React.useState<Uom[]>([]);
  const [localRows, setLocalRows] = React.useState<Uom[]>([]);
  const [overrides, setOverrides] = React.useState<Record<string, Partial<Uom>>>({});
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('ALL');
  const [activeFilter, setActiveFilter] = React.useState('ALL');

  const reload = React.useCallback(async () => {
    const [fx, created, patches] = await Promise.all([
      listUoms(),
      listRecords<Uom>(ENTITY),
      listRecords<UomPatch>(`${ENTITY}.patch`),
    ]);
    setFixtureRows(fx);
    setLocalRows(created);
    setOverrides(Object.fromEntries(patches.map((p) => [p.targetId, p.patch])));
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    void reload();
  }, [reload]);

  const merged = React.useMemo(() => {
    const all = [...localRows, ...fixtureRows.filter((f) => !localRows.some((l) => l.id === f.id))];
    return all.map((r) => ({ ...r, ...(overrides[r.id] ?? {}) }));
  }, [fixtureRows, localRows, overrides]);

  const rows = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return merged.filter((r) => {
      if (categoryFilter !== 'ALL' && r.category !== categoryFilter) return false;
      if (activeFilter === 'ACTIVE' && (r.isActive ?? true) === false) return false;
      if (activeFilter === 'INACTIVE' && (r.isActive ?? true) === true) return false;
      if (q && !`${r.code} ${r.name}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [merged, search, categoryFilter, activeFilter]);

  const patch = async (id: string, values: Partial<Uom>) => {
    const existing = await listRecords<UomPatch>(`${ENTITY}.patch`);
    const hit = existing.find((p) => p.targetId === id);
    if (hit) await updateRecord<UomPatch>(`${ENTITY}.patch`, hit.id, { patch: values });
    else await createRecord<UomPatch>(`${ENTITY}.patch`, { targetId: id, patch: values });
  };

  const handleCreate = async (values: UomFormValues) => {
    await createRecord<Uom>(ENTITY, { ...values, createdBy: 'Demo User' } as Omit<Uom, 'id'>);
    await reload();
  };

  const handleUpdate = async (id: string, values: UomFormValues) => {
    if (localRows.some((r) => r.id === id)) await updateRecord<Uom>(ENTITY, id, values);
    else await patch(id, values);
    await reload();
  };

  const handleToggleActive = async (row: Uom) => {
    const next = { isActive: !(row.isActive ?? true) };
    if (localRows.some((r) => r.id === row.id)) await updateRecord<Uom>(ENTITY, row.id, next);
    else await patch(row.id, next);
    await reload();
  };

  return (
    <UomScreen
      rows={rows}
      isLoading={isLoading}
      search={search}
      onSearchChange={setSearch}
      categoryFilter={categoryFilter}
      onCategoryFilterChange={setCategoryFilter}
      activeFilter={activeFilter}
      onActiveFilterChange={setActiveFilter}
      onCreate={handleCreate}
      onUpdate={handleUpdate}
      onToggleActive={handleToggleActive}
    />
  );
}
