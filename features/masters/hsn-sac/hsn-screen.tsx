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
  DateField,
  CheckboxField,
  ConfirmDialog,
  type Option,
  type RowAction,
} from '@/components/erp';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { HsnSac } from '@/lib/data/types';
import { hsnColumns, kindLabel } from './hsn-columns';
import {
  hsnSchema,
  emptyHsn,
  HSN_KINDS,
  GST_RATES,
  taxSplit,
  type HsnFormValues,
} from './hsn-schema';

export interface HsnScreenProps {
  rows: HsnSac[];
  isLoading: boolean;
  search: string;
  onSearchChange: (v: string) => void;
  kindFilter: string;
  onKindFilterChange: (v: string) => void;
  rateFilter: string;
  onRateFilterChange: (v: string) => void;
  activeFilter: string;
  onActiveFilterChange: (v: string) => void;
  onCreate: (values: HsnFormValues) => Promise<void>;
  onUpdate: (id: string, values: HsnFormValues) => Promise<void>;
  onToggleActive: (row: HsnSac) => Promise<void>;
}

export function HsnScreen({
  rows,
  isLoading,
  search,
  onSearchChange,
  kindFilter,
  onKindFilterChange,
  rateFilter,
  onRateFilterChange,
  activeFilter,
  onActiveFilterChange,
  onCreate,
  onUpdate,
  onToggleActive,
}: HsnScreenProps) {
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<HsnSac | null>(null);
  const [toggleTarget, setToggleTarget] = React.useState<HsnSac | null>(null);
  const [saving, setSaving] = React.useState(false);

  const form = useForm<HsnFormValues>({
    resolver: zodResolver(hsnSchema),
    defaultValues: emptyHsn,
    mode: 'onBlur',
  });
  const { errors, isDirty } = form.formState;

  const gstRate = form.watch('gstRate');
  const isNonGst = form.watch('isNonGst');
  const split = taxSplit(isNonGst ? 0 : (gstRate ?? 0));

  const kindOptions: Option[] = HSN_KINDS.map((k) => ({ value: k, label: kindLabel(k) }));
  const rateOptions: Option[] = GST_RATES.map((r) => ({ value: String(r), label: `${r}%` }));

  const openNew = () => {
    setEditing(null);
    form.reset(emptyHsn);
    setFormOpen(true);
  };

  const openEdit = (row: HsnSac) => {
    setEditing(row);
    form.reset({
      code: row.code,
      kind: row.kind,
      description: row.description,
      gstRate: row.gstRate,
      cessRate: row.cessRate ?? 0,
      effectiveFrom: row.effectiveFrom ?? '2017-07-01',
      isNonGst: row.isNonGst ?? false,
      isActive: row.isActive ?? true,
    });
    setFormOpen(true);
  };

  const submit = form.handleSubmit(async (values) => {
    if (rows.some((r) => r.code === values.code && r.id !== editing?.id)) {
      form.setError('code', { message: t.masters.hsnDuplicateCode });
      return;
    }
    setSaving(true);
    try {
      if (editing) await onUpdate(editing.id, values);
      else await onCreate(values);
      setFormOpen(false);
      form.reset(emptyHsn);
    } finally {
      setSaving(false);
    }
  });

  const rowActions: RowAction<HsnSac>[] = [
    { label: t.common.edit, icon: <Pencil />, onSelect: openEdit },
    { label: t.masters.deactivate, icon: <Power />, onSelect: (row) => setToggleTarget(row) },
  ];

  return (
    <>
      <PageHeader
        title={t.masters.hsnFull}
        subtitle={t.masters.hsnSubtitle}
        breadcrumb={[{ label: t.nav.home, href: '/home' }, { label: t.nav.groupMasters }]}
        helpTopic="hsn"
        primaryAction={{ label: t.masters.hsnNew, icon: <Plus />, onClick: openNew }}
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
          id="hsn-kind-filter"
          label={t.masters.hsnKind}
          value={kindFilter}
          onChange={onKindFilterChange}
          options={[{ value: 'ALL', label: t.common.all }, ...kindOptions]}
          className="w-full sm:w-44"
        />
        <SelectField
          id="hsn-rate-filter"
          label={t.masters.hsnGstRate}
          value={rateFilter}
          onChange={onRateFilterChange}
          options={[{ value: 'ALL', label: t.common.all }, ...rateOptions]}
          className="w-full sm:w-32"
        />
        <SelectField
          id="hsn-status-filter"
          label={t.common.status}
          value={activeFilter}
          onChange={onActiveFilterChange}
          options={[
            { value: 'ALL', label: t.common.all },
            { value: 'ACTIVE', label: t.admin.active },
            { value: 'INACTIVE', label: t.admin.inactive },
          ]}
          className="w-full sm:w-40"
        />
      </section>

      <DataTable<HsnSac>
        columns={hsnColumns}
        rows={rows}
        rowKey={(r) => r.id}
        isLoading={isLoading}
        rowActions={rowActions}
        onRowClick={openEdit}
        showExport
        showColumnToggle
        emptyHeadline={t.masters.hsnEmpty}
        emptyDescription={t.masters.hsnEmptyHint}
        cardTitle={(r) => `${r.code} — ${kindLabel(r.kind)}`}
        cardSubtitle={(r) => r.description}
      />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editing ? t.masters.hsnEdit : t.masters.hsnNew}</DialogTitle>
          </DialogHeader>

          <FormLayout
            isDirty={isDirty}
            isSaving={saving}
            submitLabel={t.common.save}
            onSubmit={submit}
            onCancel={() => setFormOpen(false)}
          >
            <FormSection title={t.masters.hsnFull} helpTopic="hsn" columns={2}>
              <Controller
                control={form.control}
                name="kind"
                render={({ field }) => (
                  <SelectField
                    id="kind"
                    label={t.masters.hsnKind}
                    required
                    value={field.value}
                    onChange={field.onChange}
                    options={kindOptions}
                    helperText={t.masters.hsnKindHint}
                    error={errors.kind?.message}
                  />
                )}
              />
              <TextField
                id="code"
                label={t.masters.hsnCode}
                required
                value={form.watch('code')}
                onChange={(v) =>
                  form.setValue('code', v.replace(/\D/g, ''), { shouldDirty: true })
                }
                error={errors.code?.message}
                maxLength={8}
                placeholder="2523"
              />
              <div className="sm:col-span-2">
                <TextareaField
                  id="description"
                  label={t.masters.hsnDescription}
                  required
                  value={form.watch('description')}
                  onChange={(v) => form.setValue('description', v, { shouldDirty: true })}
                  error={errors.description?.message}
                  rows={2}
                />
              </div>
            </FormSection>

            <FormSection
              title={t.masters.hsnGstRate}
              description={t.masters.hsnSplitNote}
              helpTopic="hsnSplit"
              columns={2}
            >
              <Controller
                control={form.control}
                name="isNonGst"
                render={({ field }) => (
                  <CheckboxField
                    id="isNonGst"
                    label={t.masters.hsnNonGst}
                    description={t.masters.hsnNonGstHint}
                    checked={field.value}
                    onChange={(c) => {
                      field.onChange(c);
                      if (c) form.setValue('gstRate', 0, { shouldDirty: true });
                    }}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="gstRate"
                render={({ field }) => (
                  <SelectField
                    id="gstRate"
                    label={t.masters.hsnGstRate}
                    required
                    value={String(field.value ?? '')}
                    onChange={(v) => field.onChange(Number(v))}
                    options={rateOptions}
                    disabled={isNonGst}
                    error={errors.gstRate?.message}
                  />
                )}
              />
              <NumberField id="cgstDisplay" label={t.masters.hsnCgst} value={split.cgstRate} disabled />
              <NumberField id="sgstDisplay" label={t.masters.hsnSgst} value={split.sgstRate} disabled />
              <NumberField id="igstDisplay" label={t.masters.hsnIgst} value={split.igstRate} disabled />
              <Controller
                control={form.control}
                name="cessRate"
                render={({ field }) => (
                  <NumberField
                    id="cessRate"
                    label={t.masters.hsnCess}
                    value={field.value ?? 0}
                    onChange={(v) => field.onChange(v === '' ? 0 : v)}
                    error={errors.cessRate?.message}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="effectiveFrom"
                render={({ field }) => (
                  <DateField
                    id="effectiveFrom"
                    label={t.masters.hsnEffectiveFrom}
                    required
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.effectiveFrom?.message}
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
          </FormLayout>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={toggleTarget !== null}
        onOpenChange={(o) => !o && setToggleTarget(null)}
        intent="CANCEL"
        documentLabel={toggleTarget ? `${toggleTarget.code} — ${toggleTarget.description}` : undefined}
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

export default HsnScreen;
