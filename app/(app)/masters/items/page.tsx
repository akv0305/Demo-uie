'use client';

import * as React from 'react';
import {
  createRecord,
  listHsnSac,
  listItems,
  listRecords,
  listSites,
  listUoms,
  updateRecord,
} from '@/lib/data';
import type { Item } from '@/lib/data/types';
import type { Option } from '@/components/erp';
import ItemScreen from '@/features/masters/items/item-screen';
import type { ItemFormValues } from '@/features/masters/items/item-schema';

const ENTITY = 'item';

interface ItemPatch {
  id: string;
  targetId: string;
  patch: Partial<Item>;
}

const n = (v: number | '' | undefined): number | undefined =>
  v === '' || v === undefined ? undefined : v;

/** Form values to domain shape. Blank numerics drop out rather than become 0. */
function toItem(v: ItemFormValues): Omit<Item, 'id'> {
  return {
    code: v.code,
    name: v.name,
    group: v.group,
    specification: v.specification,
    stockUomCode: v.stockUomCode,
    hsnCode: v.hsnCode,
    gstRate: v.gstRate,
    reorderLevel: n(v.reorderLevel) ?? 0,
    isAsset: v.isCapitalItem,
    isActive: v.isActive,
    shortName: v.shortName || undefined,
    subGroup: v.subGroup || undefined,
    oldCode: v.oldCode || undefined,
    brandPreference: v.brandPreference || undefined,
    makeOrGrade: v.makeOrGrade || undefined,
    itemType: v.itemType,
    isReturnable: v.isReturnable,
    isProduced: v.isProduced,
    isBatchTracked: v.isBatchTracked,
    isSerialTracked: v.isSerialTracked,
    requiresQc: v.requiresQc,
    shelfLifeDays: n(v.shelfLifeDays),
    purchaseUomCode: v.purchaseUomCode || undefined,
    purchaseToStockFactor: n(v.purchaseToStockFactor),
    issueUomCode: v.issueUomCode || undefined,
    issueToStockFactor: n(v.issueToStockFactor),
    minStockLevel: n(v.minStockLevel),
    maxStockLevel: n(v.maxStockLevel),
    leadTimeDays: n(v.leadTimeDays),
    allowNegativeStock: v.allowNegativeStock,
    defaultStoreSiteId: v.defaultStoreSiteId || undefined,
    binLocation: v.binLocation || undefined,
    valuationMethod: v.valuationMethod,
    standardRate: n(v.standardRate),
    lastPurchaseRate: n(v.lastPurchaseRate),
    budgetRateRef: n(v.budgetRateRef),
    isCapitalItem: v.isCapitalItem,
    isHazardous: v.isHazardous,
    remarks: v.remarks || undefined,
  };
}

export default function ItemsPage() {
  const [fixtureRows, setFixtureRows] = React.useState<Item[]>([]);
  const [localRows, setLocalRows] = React.useState<Item[]>([]);
  const [overrides, setOverrides] = React.useState<Record<string, Partial<Item>>>({});
  const [uomOptions, setUomOptions] = React.useState<Option[]>([]);
  const [hsnOptions, setHsnOptions] = React.useState<Option[]>([]);
  const [hsnRates, setHsnRates] = React.useState<Record<string, number>>({});
  const [storeOptions, setStoreOptions] = React.useState<Option[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [groupFilter, setGroupFilter] = React.useState('ALL');
  const [typeFilter, setTypeFilter] = React.useState('ALL');
  const [activeFilter, setActiveFilter] = React.useState('ALL');

  const reload = React.useCallback(async () => {
    const [paged, created, patches, uoms, hsn, sites] = await Promise.all([
      listItems({ pageSize: 500 }),
      listRecords<Item>(ENTITY),
      listRecords<ItemPatch>(`${ENTITY}.patch`),
      listUoms({ isActive: true }),
      listHsnSac({ isActive: true }),
      listSites(),
    ]);
    setFixtureRows(paged.rows);
    setLocalRows(created);
    setOverrides(Object.fromEntries(patches.map((p) => [p.targetId, p.patch])));
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
      if (groupFilter !== 'ALL' && r.group !== groupFilter) return false;
      if (typeFilter !== 'ALL' && (r.itemType ?? 'MATERIAL') !== typeFilter) return false;
      if (activeFilter === 'ACTIVE' && !r.isActive) return false;
      if (activeFilter === 'INACTIVE' && r.isActive) return false;
      if (q && !`${r.code} ${r.name} ${r.specification} ${r.hsnCode}`.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [merged, search, groupFilter, typeFilter, activeFilter]);

  const patch = async (id: string, values: Partial<Item>) => {
    const existing = await listRecords<ItemPatch>(`${ENTITY}.patch`);
    const hit = existing.find((p) => p.targetId === id);
    if (hit) await updateRecord<ItemPatch>(`${ENTITY}.patch`, hit.id, { patch: values });
    else await createRecord<ItemPatch>(`${ENTITY}.patch`, { targetId: id, patch: values });
  };

  const handleCreate = async (values: ItemFormValues) => {
    await createRecord<Item>(ENTITY, { ...toItem(values), createdBy: 'Demo User' });
    await reload();
  };

  const handleUpdate = async (id: string, values: ItemFormValues) => {
    const next = toItem(values);
    if (localRows.some((r) => r.id === id)) await updateRecord<Item>(ENTITY, id, next);
    else await patch(id, next);
    await reload();
  };

  const handleToggleActive = async (row: Item) => {
    const next = { isActive: !row.isActive };
    if (localRows.some((r) => r.id === row.id)) await updateRecord<Item>(ENTITY, row.id, next);
    else await patch(row.id, next);
    await reload();
  };

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
      onCreate={handleCreate}
      onUpdate={handleUpdate}
      onToggleActive={handleToggleActive}
    />
  );
}
