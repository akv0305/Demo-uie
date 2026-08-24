'use client';

import * as React from 'react';
import { listHsnSac, listItems, listSites, listUoms } from '@/lib/data';
import type { Item } from '@/lib/data/types';
import type { Option } from '@/components/erp';
import { num, numOr, str } from '@/lib/forms';
import { useMasterCollection } from '@/lib/masters/use-master-collection';
import ItemScreen from '@/features/masters/items/item-screen';
import type { ItemFormValues } from '@/features/masters/items/item-schema';

/** Form values to domain shape. Blank numerics and blank text drop out. */
function toItem(v: ItemFormValues): Omit<Item, 'id'> {
  return {
    code: v.code,
    name: v.name,
    group: v.group,
    specification: v.specification,
    stockUomCode: v.stockUomCode,
    hsnCode: v.hsnCode,
    gstRate: v.gstRate,
    reorderLevel: numOr(v.reorderLevel, 0),
    isActive: v.isActive,
    shortName: str(v.shortName),
    subGroup: str(v.subGroup),
    oldCode: str(v.oldCode),
    brandPreference: str(v.brandPreference),
    makeOrGrade: str(v.makeOrGrade),
    itemType: v.itemType,
    isReturnable: v.isReturnable,
    isProduced: v.isProduced,
    isBatchTracked: v.isBatchTracked,
    isSerialTracked: v.isSerialTracked,
    requiresQc: v.requiresQc,
    shelfLifeDays: num(v.shelfLifeDays),
    purchaseUomCode: str(v.purchaseUomCode),
    purchaseToStockFactor: num(v.purchaseToStockFactor),
    issueUomCode: str(v.issueUomCode),
    issueToStockFactor: num(v.issueToStockFactor),
    minStockLevel: num(v.minStockLevel),
    maxStockLevel: num(v.maxStockLevel),
    leadTimeDays: num(v.leadTimeDays),
    allowNegativeStock: v.allowNegativeStock,
    defaultStoreSiteId: str(v.defaultStoreSiteId),
    binLocation: str(v.binLocation),
    valuationMethod: v.valuationMethod,
    standardRate: num(v.standardRate),
    lastPurchaseRate: num(v.lastPurchaseRate),
    budgetRateRef: num(v.budgetRateRef),
    isCapitalItem: v.isCapitalItem,
    isHazardous: v.isHazardous,
    remarks: str(v.remarks),
  };
}

export default function ItemsPage() {
  const [uomOptions, setUomOptions] = React.useState<Option[]>([]);
  const [hsnOptions, setHsnOptions] = React.useState<Option[]>([]);
  const [hsnRates, setHsnRates] = React.useState<Record<string, number>>({});
  const [storeOptions, setStoreOptions] = React.useState<Option[]>([]);
  const [search, setSearch] = React.useState('');
  const [groupFilter, setGroupFilter] = React.useState('ALL');
  const [typeFilter, setTypeFilter] = React.useState('ALL');
  const [activeFilter, setActiveFilter] = React.useState('ALL');

  const { rows: allRows, isLoading, create, update, toggleActive } =
    useMasterCollection<Item, ItemFormValues>({
      entityKey: 'item',
      fetchFixtures: () => listItems({ pageSize: 500 }).then((p) => p.rows),
      toDomain: toItem,
    });

  // Reference lists for the form's dropdowns.
  React.useEffect(() => {
    void (async () => {
      const [uoms, hsn, sites] = await Promise.all([
        listUoms({ isActive: true }),
        listHsnSac({ isActive: true }),
        listSites(),
      ]);
      setUomOptions(uoms.map((u) => ({ value: u.code, label: `${u.code} — ${u.name}` })));
      setHsnOptions(
        hsn.map((h) => ({
          value: h.code,
          label: `${h.code} — ${h.description}`,
          hint: `${h.gstRate}%`,
        })),
      );
      setHsnRates(Object.fromEntries(hsn.map((h) => [h.code, h.gstRate])));
      setStoreOptions(sites.filter((s) => s.isStore).map((s) => ({ value: s.id, label: s.name })));
    })();
  }, []);

  const rows = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return allRows.filter((r) => {
      if (groupFilter !== 'ALL' && r.group !== groupFilter) return false;
      if (typeFilter !== 'ALL' && (r.itemType ?? 'MATERIAL') !== typeFilter) return false;
      if (activeFilter === 'ACTIVE' && !r.isActive) return false;
      if (activeFilter === 'INACTIVE' && r.isActive) return false;
      if (q && !`${r.code} ${r.name} ${r.specification} ${r.hsnCode}`.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [allRows, search, groupFilter, typeFilter, activeFilter]);

  return (
    <ItemScreen
      rows={rows}
      isLoading={isLoading}
      search={search}
      onSearchChange={setSearch}
      groupFilter={groupFilter}
      onGroupFilterChange={setGroupFilter}
      typeFilter={typeFilter}
      onTypeFilterChange={setTypeFilter}
      activeFilter={activeFilter}
      onActiveFilterChange={setActiveFilter}
      uomOptions={uomOptions}
      hsnOptions={hsnOptions}
      hsnRates={hsnRates}
      storeOptions={storeOptions}
      onCreate={create}
      onUpdate={update}
      onToggleActive={toggleActive}
    />
  );
}
