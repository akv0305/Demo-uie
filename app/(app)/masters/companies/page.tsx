'use client';

import * as React from 'react';
import { listCompanies } from '@/lib/data';
import type { Company } from '@/lib/data/types';
import { str } from '@/lib/forms';
import { useMasterCollection } from '@/lib/masters/use-master-collection';
import CompanyScreen from '@/features/masters/companies/company-screen';
import type { CompanyFormValues } from '@/features/masters/companies/company-schema';

const toCompany = (v: CompanyFormValues): Omit<Company, 'id'> => ({
  ...v,
  // A JV has no CIN, so a blank drops out rather than storing an empty string.
  cin: str(v.cin) ?? '',
});

export default function CompaniesPage() {
  const [search, setSearch] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState('ALL');
  const [activeFilter, setActiveFilter] = React.useState('ALL');

  const { rows: allRows, isLoading, create, update, toggleActive } =
    useMasterCollection<Company, CompanyFormValues>({
      entityKey: 'company',
      // listCompanies returns a plain array, not a Paged result.
      fetchFixtures: listCompanies,
      toDomain: toCompany,
    });

  const rows = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return allRows.filter((r) => {
      if (typeFilter !== 'ALL' && r.type !== typeFilter) return false;
      // Fixture rows carry no flag, so missing means active.
      if (activeFilter === 'ACTIVE' && r.isActive === false) return false;
      if (activeFilter === 'INACTIVE' && r.isActive !== false) return false;
      if (q && !`${r.code} ${r.name} ${r.legalName} ${r.city} ${r.gstin} ${r.pan}`.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [allRows, search, typeFilter, activeFilter]);

  return (
    <CompanyScreen
      rows={rows}
      isLoading={isLoading}
      search={search}
      onSearchChange={setSearch}
      typeFilter={typeFilter}
      onTypeFilterChange={setTypeFilter}
      activeFilter={activeFilter}
      onActiveFilterChange={setActiveFilter}
      onCreate={create}
      onUpdate={update}
      onToggleActive={toggleActive}
    />
  );
}
