'use client';

import * as React from 'react';
import { listVendors } from '@/lib/data';
import type { Vendor } from '@/lib/data/types';
import { str } from '@/lib/forms';
import { useMasterCollection } from '@/lib/masters/use-master-collection';
import VendorScreen from '@/features/masters/vendors/vendor-screen';
import type { VendorFormValues } from '@/features/masters/vendors/vendor-schema';

const toVendor = (v: VendorFormValues): Omit<Vendor, 'id'> => ({
  ...v,
  msmeNo: str(v.msmeNo),
});

export default function VendorsPage() {
  const [search, setSearch] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('ALL');
  const [activeFilter, setActiveFilter] = React.useState('ALL');

  const { rows: allRows, isLoading, create, update, toggleActive } =
    useMasterCollection<Vendor, VendorFormValues>({
      entityKey: 'vendor',
      fetchFixtures: () => listVendors({ pageSize: 500 }).then((p) => p.rows),
      toDomain: toVendor,
    });

  const rows = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return allRows.filter((r) => {
      if (categoryFilter !== 'ALL' && r.category !== categoryFilter) return false;
      if (activeFilter === 'ACTIVE' && !r.isActive) return false;
      if (activeFilter === 'INACTIVE' && r.isActive) return false;
      if (q && !`${r.code} ${r.name} ${r.city} ${r.gstin} ${r.contactPerson}`.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [allRows, search, categoryFilter, activeFilter]);

  return (
    <VendorScreen
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
