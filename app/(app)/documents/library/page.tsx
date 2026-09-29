'use client';

import * as React from 'react';
import { terminology as t } from '@/config/terminology.config';
import type { Option } from '@/components/erp';
import { DocumentLibraryScreen } from '@/features/documents/document-library-screen';
import {
  listCompanies,
  listDocumentFiles,
  listEmployees,
  listEquipment,
  listProjects,
  listSubcontractors,
  listVendors,
  removeRecord,
} from '@/lib/data';
import type { Attachment } from '@/lib/data/types';
import { entityTypeLabel } from '@/lib/documents/attachments';

export default function Page() {
  const [rows, setRows] = React.useState<Attachment[]>([]);
  const [names, setNames] = React.useState<Record<string, string>>({});
  const [categories, setCategories] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('ALL');
  const [entityFilter, setEntityFilter] = React.useState('ALL');

  const load = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [files, vendors, subs, equipment, employees, projects, companies] = await Promise.all([
        listDocumentFiles({ pageSize: 500 }),
        listVendors({ pageSize: 500 }),
        listSubcontractors({ pageSize: 500 }),
        listEquipment({ pageSize: 500 }),
        listEmployees({ pageSize: 500 }),
        listProjects(),
        listCompanies(),
      ]);

      const map: Record<string, string> = {};
      vendors.rows.forEach((v) => (map[`vendors:${v.id}`] = v.name));
      subs.rows.forEach((s) => (map[`subcontractors:${s.id}`] = s.name));
      equipment.rows.forEach((e) => (map[`equipment:${e.id}`] = `${e.code} — ${e.name}`));
      employees.rows.forEach((e) => (map[`employees:${e.id}`] = e.name));
      projects.forEach((p) => (map[`projects:${p.id}`] = p.name));
      companies.forEach((c) => (map[`companies:${c.id}`] = c.name));

      setNames(map);
      setRows(files.rows);
      setCategories([...new Set(files.rows.map((f) => f.category))].sort());
    } catch (err) {
      // Temporary during bring-up — replace with ErrorState once the cause is known.
      console.error('[document-library] load failed', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const linkedLabel = React.useCallback(
    (row: Attachment) => names[`${row.entityKey}:${row.entityId}`] ?? row.entityId,
    [names],
  );

  const visible = rows.filter((r) => {
    if (categoryFilter !== 'ALL' && r.category !== categoryFilter) return false;
    if (entityFilter !== 'ALL' && r.entityKey !== entityFilter) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      r.fileName.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      linkedLabel(r).toLowerCase().includes(q)
    );
  });

  const categoryOptions: Option[] = [
    { value: 'ALL', label: t.common.all },
    ...categories.map((c) => ({ value: c, label: c })),
  ];

  const entityOptions: Option[] = [
    { value: 'ALL', label: t.common.all },
    ...[...new Set(rows.map((r) => r.entityKey))].map((k) => ({
      value: k,
      label: entityTypeLabel(k),
    })),
  ];

  return (
    <DocumentLibraryScreen
      rows={visible}
      isLoading={isLoading}
      search={search}
      onSearchChange={setSearch}
      categoryFilter={categoryFilter}
      onCategoryFilterChange={setCategoryFilter}
      categoryOptions={categoryOptions}
      entityFilter={entityFilter}
      onEntityFilterChange={setEntityFilter}
      entityOptions={entityOptions}
      linkedLabel={linkedLabel}
      onDelete={async (row) => {
        await removeRecord('attachments', row.id);
        await load();
      }}
    />
  );
}
