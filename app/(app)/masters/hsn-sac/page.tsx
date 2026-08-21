'use client';

import * as React from 'react';
import { listHsnSac, createRecord, updateRecord, listRecords } from '@/lib/data';
import type { HsnSac } from '@/lib/data/types';
import HsnScreen from '@/features/masters/hsn-sac/hsn-screen';
import { taxSplit, type HsnFormValues } from '@/features/masters/hsn-sac/hsn-schema';

const ENTITY = 'hsnsac';

interface HsnPatch {
  id: string;
  targetId: string;
  patch: Partial<HsnSac>;
}

/** Derived tax split is stored, never entered (single rule, see hsn-schema). */
const withSplit = (v: HsnFormValues): Omit<HsnSac, 'id'> => ({
  ...v,
  ...taxSplit(v.isNonGst ? 0 : v.gstRate),
});

export default function HsnSacPage() {
  const [fixtureRows, setFixtureRows] = React.useState<HsnSac[]>([]);
  const [localRows, setLocalRows] = React.useState<HsnSac[]>([]);
  const [overrides, setOverrides] = React.useState<Record<string, Partial<HsnSac>>>({});
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [kindFilter, setKindFilter] = React.useState('ALL');
  const [rateFilter, setRateFilter] = React.useState('ALL');
  const [activeFilter, setActiveFilter] = React.useState('ALL');

  const reload = React.useCallback(async () => {
    const [fx, created, patches] = await Promise.all([
      listHsnSac(),
      listRecords<HsnSac>(ENTITY),
      listRecords<HsnPatch>(`${ENTITY}.patch`),
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
      if (kindFilter !== 'ALL' && r.kind !== kindFilter) return false;
      if (rateFilter !== 'ALL' && r.gstRate !== Number(rateFilter)) return false;
      if (activeFilter === 'ACTIVE' && (r.isActive ?? true) === false) return false;
      if (activeFilter === 'INACTIVE' && (r.isActive ?? true) === true) return false;
      if (q && !`${r.code} ${r.description}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [merged, search, kindFilter, rateFilter, activeFilter]);

  const patch = async (id: string, values: Partial<HsnSac>) => {
    const existing = await listRecords<HsnPatch>(`${ENTITY}.patch`);
    const hit = existing.find((p) => p.targetId === id);
    if (hit) await updateRecord<HsnPatch>(`${ENTITY}.patch`, hit.id, { patch: values });
    else await createRecord<HsnPatch>(`${ENTITY}.patch`, { targetId: id, patch: values });
  };

  const handleCreate = async (values: HsnFormValues) => {
    await createRecord<HsnSac>(ENTITY, withSplit(values));
    await reload();
  };

  const handleUpdate = async (id: string, values: HsnFormValues) => {
    const next = withSplit(values);
    if (localRows.some((r) => r.id === id)) await updateRecord<HsnSac>(ENTITY, id, next);
    else await patch(id, next);
    await reload();
  };

  const handleToggleActive = async (row: HsnSac) => {
    const next = { isActive: !(row.isActive ?? true) };
    if (localRows.some((r) => r.id === row.id)) await updateRecord<HsnSac>(ENTITY, row.id, next);
    else await patch(row.id, next);
    await reload();
  };

  return (
    <HsnScreen
      rows={rows}
      isLoading={isLoading}
      search={search}
      onSearchChange={setSearch}
      kindFilter={kindFilter}
      onKindFilterChange={setKindFilter}
      rateFilter={rateFilter}
      onRateFilterChange={setRateFilter}
      activeFilter={activeFilter}
      onActiveFilterChange={setActiveFilter}
      onCreate={handleCreate}
      onUpdate={handleUpdate}
      onToggleActive={handleToggleActive}
    />
  );
}
