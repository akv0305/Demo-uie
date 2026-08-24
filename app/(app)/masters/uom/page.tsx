'use client';

import * as React from 'react';
import { listUoms } from '@/lib/data';
import type { Uom } from '@/lib/data/types';
import { useMasterCollection } from '@/lib/masters/use-master-collection';
import UomScreen from '@/features/masters/uom/uom-screen';
import type { UomFormValues } from '@/features/masters/uom/uom-schema';

export default function UomPage() {
  const [search, setSearch] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('ALL');
  const [activeFilter, setActiveFilter] = React.useState('ALL');

  const { rows: allRows, isLoading, create, update, toggleActive } =
    useMasterCollection<Uom, UomFormValues>({
      entityKey: 'uom',
      fetchFixtures: listUoms,
      toDomain: (v) => v as Omit<Uom, 'id'>,
    });

  const rows = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return allRows.filter((r) => {
      if (categoryFilter !== 'ALL' && r.category !== categoryFilter) return false;
      if (activeFilter === 'ACTIVE' && (r.isActive ?? true) === false) return false;
      if (activeFilter === 'INACTIVE' && (r.isActive ?? true) === true) return false;
      if (q && !`${r.code} ${r.name}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [allRows, search, categoryFilter, activeFilter]);

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
      onCreate={create}
      onUpdate={update}
      onToggleActive={toggleActive}
    />
  );
}
