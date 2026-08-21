'use client';

import * as React from 'react';
import { Plus, Pencil, Power, Upload } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { terminology as t } from '@/config/terminology.config';
import {
  PageHeader,
  DataTable,
  FormLayout,
  FormSection,
  TextField,
  NumberField,
  SelectField,
  TextareaField,
  CheckboxField,
  ConfirmDialog,
  type Option,
  type RowAction,
} from '@/components/erp';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Uom } from '@/lib/data/types';
import { uomColumns, categoryLabel } from './uom-columns';
import { uomSchema, emptyUom, UOM_CATEGORIES, type UomFormValues } from './uom-schema';

export interface UomScreenProps {
  rows: Uom[];
  isLoading: boolean;
  search: string;
  onSearchChange: (v: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (v: string) => void;
  activeFilter: string;
  onActiveFilterChange: (v: string) => void;
  onCreate: (values: UomFormValues) => Promise<void>;
  onUpdate: (id: string, values: UomFormValues) => Promise<void>;
  onToggleActive: (row: Uom) => Promise<void>;
}

export function UomScreen({
  rows,
  isLoading,
  search,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  activeFilter,
  onActiveFilterChange,
  onCreate,
  onUpdate,
  onToggleActive,
}: UomScreenProps) {
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Uom | null>(null);
  const [toggleTarget, setToggleTarget] = React.useState<Uom | null>(null);
  const [saving, setSaving] = React.useState(false);

  const form = useForm<UomFormValues>({
    resolver: zodResolver(uomSchema),
    defaultValues: emptyUom,
    mode: 'onBlur',
  });
  const { errors, isDirty } = form.formState;

  const categoryOptions: Option[] = [
    { value: 'ALL', label: t.common.all },
    ...UOM_CATEGORIES.map((c) => ({ value: c, label: categoryLabel(c) })),
  ];
  const statusOptions: Option[] = [
    { value: 'ALL', label: t.common.all },
    { value: 'ACTIVE', label: t.admin.active },
    { value: 'INACTIVE', label: t.admin.inactive },
  ];

  const openNew = () => {
    setEditing(null);
    form.reset(emptyUom);
    setFormOpen(true);
  };

  const openEdit = (row: Uom) => {
    setEditing(row);
    form.reset({
      code: row.code,
      name: row.name,
      category: row.category ?? 'OTHER',
      decimals: row.decimals,
      isBaseUnit: row.isBaseUnit ?? false,
      isActive: row.isActive ?? true,
      remarks: row.remarks ?? '',
    });
    setFormOpen(true);
  };

  const duplicateCode = (code: string) =>
    rows.some((r) => r.code.toUpperCase() === code.toUpperCase() && r.id !== editing?.id);

  const submit = form.handleSubmit(async (values) => {
    if (duplicateCode(values.code)) {
      form.setError('code', { message: t.masters.uomDuplicateCode });
      return;
    }
    setSaving(true);
    try {
      if (editing) await onUpdate(editing.id, values);
      else await onCreate(values);
      setFormOpen(false);
      form.reset(emptyUom);
    } finally {
      setSaving(false);
    }
  });

  const rowActions: RowAction<Uom>[] = [
    { label: t.common.edit, icon: <Pencil />, onSelect: openEdit },
    {
      label: t.masters.deactivate,
      icon: <Power />,
      onSelect: (row) => setToggleTarget(row),
    },
  ];

  return (
    <>
      <PageHeader
        title={t.masters.uomFull}
        subtitle={t.masters.uomSubtitle}
        breadcrumb={[{ label: t.nav.home, href: '/home' }, { label: t.nav.groupMasters }]}
        helpTopic="uom"
        primaryAction={{ label: t.masters.uomNew, icon: <Plus />, onClick: openNew }}
        secondaryActions={[{ label: t.common.upload, icon: <Upload />, disabled: true }]}
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
          id="uom-category-filter"
          label={t.masters.uomCategory}
          value={categoryFilter}
          onChange={onCategoryFilterChange}
          options={categoryOptions}
          className="w-full sm:w-48"
        />
        <SelectField
          id="uom-status-filter"
          label={t.common.status}
          value={activeFilter}
          onChange={onActiveFilterChange}
          options={statusOptions}
          className="w-full sm:w-40"
        />
      </section>

      <DataTable<Uom>
        columns={uomColumns}
        rows={rows}
        rowKey={(r) => r.id}
        isLoading={isLoading}
        rowActions={rowActions}
        onRowClick={openEdit}
        showExport
        showColumnToggle
        emptyHeadline={t.masters.uomEmpty}
        emptyDescription={t.masters.uomEmptyHint}
        cardTitle={(r) => `${r.code} — ${r.name}`}
        cardSubtitle={(r) => categoryLabel(r.category)}
      />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? t.masters.uomEdit : t.masters.uomNew}</DialogTitle>
          </DialogHeader>

          <FormLayout
            isDirty={isDirty}
            isSaving={saving}
            submitLabel={t.common.save}
            onSubmit={submit}
            onCancel={() => setFormOpen(false)}
          >
            <FormSection title={t.masters.uomFull} helpTopic="uom" columns={2}>
              <TextField
                id="code"
                label={t.masters.uomCode}
                required
                value={form.watch('code')}
                onChange={(v) => form.setValue('code', v.toUpperCase(), { shouldDirty: true })}
                error={errors.code?.message}
                maxLength={10}
                placeholder="MT"
              />
              <TextField
                id="name"
                label={t.masters.uomName}
                required
                value={form.watch('name')}
                onChange={(v) => form.setValue('name', v, { shouldDirty: true })}
                error={errors.name?.message}
                placeholder="Metric Tonne"
              />
              <Controller
                control={form.control}
                name="category"
                render={({ field }) => (
                  <SelectField
                    id="category"
                    label={t.masters.uomCategory}
                    required
                    value={field.value}
                    onChange={field.onChange}
                    options={UOM_CATEGORIES.map((c) => ({ value: c, label: categoryLabel(c) }))}
                    error={errors.category?.message}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="decimals"
                render={({ field }) => (
                  <NumberField
                    id="decimals"
                    label={t.masters.uomDecimals}
                    required
                    value={field.value}
                    onChange={(v) => field.onChange(v === '' ? 0 : v)}
                    error={errors.decimals?.message}
                    helperText={t.masters.uomDecimalsHint}
                    helpTopic="uomDecimals"
                  />
                )}
              />
              <Controller
                control={form.control}
                name="isBaseUnit"
                render={({ field }) => (
                  <CheckboxField
                    id="isBaseUnit"
                    label={t.masters.uomIsBase}
                    description={t.masters.uomBaseHint}
                    checked={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <CheckboxField
                    id="isActive"
                    label={t.admin.active}
                    checked={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </FormSection>

            <FormSection title={t.common.remarks} columns={1}>
              <TextareaField
                id="remarks"
                label={t.common.remarks}
                value={form.watch('remarks') ?? ''}
                onChange={(v) => form.setValue('remarks', v, { shouldDirty: true })}
                error={errors.remarks?.message}
                rows={2}
              />
            </FormSection>
          </FormLayout>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={toggleTarget !== null}
        onOpenChange={(o) => !o && setToggleTarget(null)}
        intent="CANCEL"
        documentLabel={toggleTarget ? `${toggleTarget.code} — ${toggleTarget.name}` : undefined}
        description={
          toggleTarget && toggleTarget.isActive === false
            ? t.masters.activateConfirm
            : t.masters.deactivateConfirm
        }
        onConfirm={() => {
          if (toggleTarget) void onToggleActive(toggleTarget);
          setToggleTarget(null);
        }}
      />
    </>
  );
}

export default UomScreen;
