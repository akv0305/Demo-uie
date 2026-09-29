'use client';

import * as React from 'react';
import { Download, Trash2, Upload } from 'lucide-react';
import { terminology as t } from '@/config/terminology.config';
import {
  ConfirmDialog,
  DataTable,
  PageHeader,
  SelectField,
  type Option,
  type RowAction,
} from '@/components/erp';
import { Input } from '@/components/ui/input';
import type { Attachment } from '@/lib/data/types';
import { entityTypeLabel } from '@/lib/documents/attachments';
import { documentColumns } from './document-columns';

export interface DocumentLibraryScreenProps {
  rows: Attachment[];
  isLoading: boolean;
  search: string;
  onSearchChange: (v: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (v: string) => void;
  categoryOptions: Option[];
  entityFilter: string;
  onEntityFilterChange: (v: string) => void;
  entityOptions: Option[];
  linkedLabel: (row: Attachment) => string;
  onDelete: (row: Attachment) => Promise<void>;
}

export function DocumentLibraryScreen({
  rows,
  isLoading,
  search,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  categoryOptions,
  entityFilter,
  onEntityFilterChange,
  entityOptions,
  linkedLabel,
  onDelete,
}: DocumentLibraryScreenProps) {
  const [deleteTarget, setDeleteTarget] = React.useState<Attachment | null>(null);

  const columns = React.useMemo(() => documentColumns(linkedLabel), [linkedLabel]);

  const rowActions: RowAction<Attachment>[] = [
    // Download is non-functional in the demonstration build.
    { label: t.common.download, icon: <Download />, onSelect: () => undefined },
    {
      label: t.common.delete,
      icon: <Trash2 />,
      destructive: true,
      onSelect: (row) => setDeleteTarget(row),
    },
  ];

  return (
    <>
      <PageHeader
        title={t.documents.library}
        subtitle={t.documents.librarySubtitle}
        breadcrumb={[{ label: t.nav.home, href: '/home' }, { label: t.nav.groupDocuments }]}
        primaryAction={{
          label: t.common.upload,
          icon: <Upload />,
          href: '/documents/upload',
        }}
      />

      <section className="mb-section flex flex-col gap-2 rounded-lg border border-border bg-surface p-card sm:flex-row sm:items-end">
        <div className="flex-1">
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t.common.search}
            aria-label={t.common.search}
          />
        </div>
        <SelectField
          id="doc-category-filter"
          label={t.documents.documentType}
          value={categoryFilter}
          onChange={onCategoryFilterChange}
          options={categoryOptions}
          className="w-full sm:w-52"
        />
        <SelectField
          id="doc-entity-filter"
          label={t.documents.linkedType}
          value={entityFilter}
          onChange={onEntityFilterChange}
          options={entityOptions}
          className="w-full sm:w-52"
        />
      </section>

      <DataTable<Attachment>
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        isLoading={isLoading}
        rowActions={rowActions}
        emptyHeadline={t.documents.libraryEmpty}
        emptyDescription={t.documents.libraryEmptyHint}
        cardTitle={(r) => r.fileName}
        cardSubtitle={(r) => `${entityTypeLabel(r.entityKey)} — ${linkedLabel(r)}`}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        intent="CANCEL"
        documentLabel={deleteTarget?.fileName}
        description={t.documents.deleteWarning}
        onConfirm={() => {
          if (deleteTarget) void onDelete(deleteTarget);
          setDeleteTarget(null);
        }}
      />
    </>
  );
}

export default DocumentLibraryScreen;
