'use client';

import * as React from 'react';
import { listSubcontractors } from '@/lib/data';
import type { Subcontractor } from '@/lib/data/types';
import { str } from '@/lib/forms';
import { useMasterCollection } from '@/lib/masters/use-master-collection';
import SubcontractorScreen from '@/features/masters/subcontractors/subcontractor-screen';
import type { SubcontractorFormValues } from '@/features/masters/subcontractors/subcontractor-schema';

const toSubcontractor = (v: SubcontractorFormValues): Omit<Subcontractor, 'id'> => ({
  ...v,
  licenceNo: str(v.licenceNo),
});

export default function SubcontractorsPage() {
  const [search, setSearch] = React.useState('');
  const [tradeFilter, setTradeFilter] = React.useState('ALL');
  const [activeFilter, setActiveFilter] = React.useState('ALL');

  const { rows: allRows, isLoading, create, update, toggleActive } =
    useMasterCollection<Subcontractor, SubcontractorFormValues>({
      entityKey: 'subcontractor',
      fetchFixtures: () => listSubcontractors({ pageSize: 500 }).then((p) => p.rows),
      toDomain: toSubcontractor,
    });

  const rows = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return allRows.filter((r) => {
      if (tradeFilter !== 'ALL' && r.trade !== tradeFilter) return false;
      if (activeFilter === 'ACTIVE' && !r.isActive) return false;
      if (activeFilter === 'INACTIVE' && r.isActive) return false;
      if (q && !`${r.code} ${r.name} ${r.city} ${r.gstin} ${r.contactPerson}`.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [allRows, search, tradeFilter, activeFilter]);

  return (
    <SubcontractorScreen
      rows={rows}
      isLoading={isLoading}
      search={search}
      onSearchChange={setSearch}
      tradeFilter={tradeFilter}
      onTradeFilterChange={setTradeFilter}
      activeFilter={activeFilter}
      onActiveFilterChange={setActiveFilter}
      onCreate={create}
      onUpdate={update}
      onToggleActive={toggleActive}
    />
  );
}
