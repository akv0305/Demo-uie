'use client';

import * as React from 'react';
import { listHsnSac } from '@/lib/data';
import type { HsnSac } from '@/lib/data/types';
import { useMasterCollection } from '@/lib/masters/use-master-collection';
import HsnScreen from '@/features/masters/hsn-sac/hsn-screen';
import { taxSplit, type HsnFormValues } from '@/features/masters/hsn-sac/hsn-schema';

/** Derived tax split is stored, never entered (single rule, see hsn-schema). */
const withSplit = (v: HsnFormValues): Omit<HsnSac, 'id'> =>
  ({ ...v, ...taxSplit(v.isNonGst ? 0 : v.gstRate) }) as Omit<HsnSac, 'id'>;

export default function HsnSacPage() {
  const [search, setSearch] = React.useState('');
  const [kindFilter, setKindFilter] = React.useState('ALL');
  const [rateFilter, setRateFilter] = React.useState('ALL');
  const [activeFilter, setActiveFilter] = React.useState('ALL');

  const { rows: allRows, isLoading, create, update, toggleActive } =
    useMasterCollection<HsnSac, HsnFormValues>({
      entityKey: 'hsnsac',
      fetchFixtures: listHsnSac,
      toDomain: withSplit,
    });

  const rows = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return allRows.filter((r) => {
      if (kindFilter !== 'ALL' && r.kind !== kindFilter) return false;
      if (rateFilter !== 'ALL' && String(r.gstRate) !== rateFilter) return false;
      if (activeFilter === 'ACTIVE' && (r.isActive ?? true) === false) return false;
      if (activeFilter === 'INACTIVE' && (r.isActive ?? true) === true) return false;
      if (q && !`${r.code} ${r.description}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [allRows, search, kindFilter, rateFilter, activeFilter]);

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
      onCreate={create}
      onUpdate={update}
      onToggleActive={toggleActive}
    />
  );
}
