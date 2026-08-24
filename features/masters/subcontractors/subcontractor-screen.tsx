'use client';

import * as React from 'react';
import { Pencil, Plus, Power } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { terminology as t } from '@/config/terminology.config';
import {
  CheckboxField,
  ConfirmDialog,
  DataTable,
  FormLayout,
  FormSection,
  PageHeader,
  SelectField,
  TextField,
  type Option,
  type RowAction,
} from '@/components/erp';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Subcontractor } from '@/lib/data/types';
import { subcontractorColumns, tradeLabel } from './subcontractor-columns';
import {
  INDIAN_STATES,
  SUBCONTRACTOR_TRADES,
  emptySubcontractor,
  subcontractorSchema,
  type SubcontractorFormValues,
} from './subcontractor-schema';

/** LABOUR restricts the screen to labour contractors and locks the flag on. */
export type SubcontractorMode = 'ALL' | 'LABOUR';

export interface SubcontractorScreenProps {
  mode?: SubcontractorMode;
  rows: Subcontractor[];
  isLoading: boolean;
  search: string;
  onSearchChange: (v: string) => void;
  tradeFilter: string;
  onTradeFilterChange: (v: string) => void;
  activeFilter: string;
  onActiveFilterChange: (v: string) => void;
  onCreate: (values: SubcontractorFormValues) => Promise<void>;
  onUpdate: (id: string, values: SubcontractorFormValues) => Promise<void>;
  onToggleActive: (row: Subcontractor) => Promise<void>;
}

export function SubcontractorScreen({
  mode = 'ALL',
  rows,
  isLoading,
  search,
  onSearchChange,
  tradeFilter,
  onTradeFilterChange,
  activeFilter,
  onActiveFilterChange,
  onCreate,
  onUpdate,
  onToggleActive,
}: SubcontractorScreenProps) {
  const isLabourView = mode === 'LABOUR';
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Subcontractor | null>(null);
  const [toggleTarget, setToggleTarget] = React.useState<Subcontractor | null>(null);
  const [saving, setSaving] = React.useState(false);

  const blank: SubcontractorFormValues = React.useMemo(
    () => (isLabourView ? { ...emptySubcontractor, isLabourContractor: true } : emptySubcontractor),
    [isLabourView],
  );

  const form = useForm<SubcontractorFormValues>({
    resolver: zodResolver(subcontractorSchema),
    defaultValues: blank,
    mode: 'onBlur',
  });
  const { errors, isDirty } = form.formState;
  const isLabour = form.watch('isLabourContractor');

  const tradeOptions: Option[] = SUBCONTRACTOR_TRADES.map((tr) => ({ value: tr, label: tradeLabel(tr) }));
  const stateOptions: Option[] = INDIAN_STATES.map((s) => ({ value: s, label: s }));
  const tradeFilterOptions: Option[] = [{ value: 'ALL', label: t.common.all }, ...tradeOptions];
  const statusOptions: Option[] = [
    { value: 'ALL', label: t.common.all },
    { value: 'ACTIVE', label: t.admin.active },
    { value: 'INACTIVE', label: t.admin.inactive },
  ];

  const openNew = () => {
    setEditing(null);
    form.reset(blank);
    setFormOpen(true);
  };

  const openEdit = (row: Subcontractor) => {
    setEditing(row);
    form.reset({
      code: row.code,
      name: row.name,
      trade: row.trade,
      gstin: row.gstin,
      pan: row.pan,
      contactPerson: row.contactPerson,
      phone: row.phone,
      city: row.city,
      state: row.state,
      isLabourContractor: row.isLabourContractor,
      licenceNo: row.licenceNo ?? '',
      isActive: row.isActive,
    });
    setFormOpen(true);
  };

  const submit = form.handleSubmit(async (values) => {
    if (rows.some((r) => r.code.toUpperCase() === values.code.toUpperCase() && r.id !== editing?.id)) {
      form.setError('code', { message: t.masters.subDuplicateCode });
      return;
    }
    if (rows.some((r) => r.gstin.toUpperCase() === values.gstin.toUpperCase() && r.id !== editing?.id)) {
      form.setError('gstin', { message: t.masters.subDuplicateGstin });
      return;
    }
    setSaving(true);
    try {
      if (editing) await onUpdate(editing.id, values);
      else await onCreate(values);
      setFormOpen(false);
      form.reset(blank);
    } finally {
      setSaving(false);
    }
  });

  const rowActions: RowAction<Subcontractor>[] = [
    { label: t.common.edit, icon: <Pencil />, onSelect: openEdit },
    { label: t.masters.deactivate, icon: <Power />, onSelect: (row) => setToggleTarget(row) },
  ];

  return (
    <>
      <PageHeader
        title={isLabourView ? t.masters.labourFull : t.masters.subFull}
        subtitle={isLabourView ? t.masters.labourSubtitle : t.masters.subSubtitle}
        breadcrumb={[{ label: t.nav.home, href: '/home' }, { label: t.nav.groupMasters }]}
        helpTopic={isLabourView ? 'labourLicence' : 'subcontractor'}
        primaryAction={{
          label: isLabourView ? t.masters.labourNew : t.masters.subNew,
          icon: <Plus />,
          onClick: openNew,
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
          id="sub-trade-filter"
          label={t.masters.trade}
          value={tradeFilter}
          onChange={onTradeFilterChange}
          options={tradeFilterOptions}
          className="w-full sm:w-52"
        />
        <SelectField
          id="sub-status-filter"
          label={t.common.status}
          value={activeFilter}
          onChange={onActiveFilterChange}
          options={statusOptions}
          className="w-full sm:w-36"
        />
      </section>

      <DataTable<Subcontractor>
        columns={subcontractorColumns}
        rows={rows}
        rowKey={(r) => r.id}
        isLoading={isLoading}
        rowActions={rowActions}
        onRowClick={openEdit}
        showExport
        showColumnToggle
        emptyHeadline={isLabourView ? t.masters.labourEmpty : t.masters.subEmpty}
        emptyDescription={isLabourView ? t.masters.labourEmptyHint : t.masters.subEmptyHint}
        cardTitle={(r) => `${r.code} — ${r.name}`}
        cardSubtitle={(r) => `${tradeLabel(r.trade)} — ${r.city}`}
      />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? t.masters.subEdit : isLabourView ? t.masters.labourNew : t.masters.subNew}
            </DialogTitle>
          </DialogHeader>

          <div className="max-h-[70vh] overflow-y-auto pr-1">
            <FormLayout
              isDirty={isDirty}
              isSaving={saving}
              submitLabel={t.common.save}
              onSubmit={submit}
              onCancel={() => setFormOpen(false)}
            >
              <FormSection title={t.masters.secSubIdentity} helpTopic="subcontractor" columns={2}>
                <TextField
                  id="sub-code"
                  label={t.masters.subCode}
                  required
                  value={form.watch('code')}
                  onChange={(v) => form.setValue('code', v.toUpperCase(), { shouldDirty: true })}
                  error={errors.code?.message}
                  placeholder="UIE/S/0010"
                />
                <Controller
                  control={form.control}
                  name="trade"
                  render={({ field }) => (
                    <SelectField
                      id="sub-trade"
                      label={t.masters.trade}
                      required
                      value={field.value}
                      onChange={field.onChange}
                      options={tradeOptions}
                      error={errors.trade?.message}
                    />
                  )}
                />
                <TextField
                  id="sub-name"
                  label={t.masters.subName}
                  required
                  value={form.watch('name')}
                  onChange={(v) => form.setValue('name', v, { shouldDirty: true })}
                  error={errors.name?.message}
                  className="sm:col-span-2"
                />
              </FormSection>

              <FormSection title={t.masters.secSubTax} columns={2}>
                <TextField
                  id="sub-gstin"
                  label={t.masters.gstin}
                  required
                  value={form.watch('gstin')}
                  onChange={(v) => form.setValue('gstin', v.toUpperCase(), { shouldDirty: true })}
                  error={errors.gstin?.message}
                  maxLength={15}
                  placeholder="36AAHFM2201C1ZG"
                />
                <TextField
                  id="sub-pan"
                  label={t.masters.pan}
                  required
                  value={form.watch('pan')}
                  onChange={(v) => form.setValue('pan', v.toUpperCase(), { shouldDirty: true })}
                  error={errors.pan?.message}
                  maxLength={10}
                  placeholder="AAHFM2201C"
                />
              </FormSection>

              <FormSection title={t.masters.secSubContact} columns={2}>
                <TextField
                  id="sub-contact-person"
                  label={t.masters.contactPerson}
                  required
                  value={form.watch('contactPerson')}
                  onChange={(v) => form.setValue('contactPerson', v, { shouldDirty: true })}
                  error={errors.contactPerson?.message}
                />
                <TextField
                  id="sub-phone"
                  label={t.masters.phone}
                  required
                  value={form.watch('phone')}
                  onChange={(v) => form.setValue('phone', v, { shouldDirty: true })}
                  error={errors.phone?.message}
                  placeholder="+91 94903 11078"
                />
                <TextField
                  id="sub-city"
                  label={t.masters.city}
                  required
                  value={form.watch('city')}
                  onChange={(v) => form.setValue('city', v, { shouldDirty: true })}
                  error={errors.city?.message}
                />
                <Controller
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <SelectField
                      id="sub-state"
                      label={t.masters.state}
                      required
                      value={field.value}
                      onChange={field.onChange}
                      options={stateOptions}
                      error={errors.state?.message}
                    />
                  )}
                />
              </FormSection>

              <FormSection title={t.masters.secSubCompliance} helpTopic="labourLicence" columns={2}>
                <Controller
                  control={form.control}
                  name="isLabourContractor"
                  render={({ field }) => (
                    <CheckboxField
                      id="sub-is-labour"
                      label={t.masters.subIsLabour}
                      checked={field.value}
                      disabled={isLabourView}
                      onChange={(checked) => {
                        field.onChange(checked);
                        // Clearing the flag clears the licence, so the pair cannot contradict.
                        if (!checked) form.setValue('licenceNo', '', { shouldDirty: true });
                      }}
                      error={errors.isLabourContractor?.message}
                      helpTopic="labourLicence"
                    />
                  )}
                />
                <TextField
                  id="sub-licence-no"
                  label={t.masters.subLicenceNo}
                  required={isLabour}
                  disabled={!isLabour}
                  value={form.watch('licenceNo')}
                  onChange={(v) => form.setValue('licenceNo', v.toUpperCase(), { shouldDirty: true })}
                  error={errors.licenceNo?.message}
                  placeholder="ALC/TS/MDK/2024/0187"
                />
                <Controller
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <CheckboxField
                      id="sub-active"
                      label={t.admin.active}
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </FormSection>
            </FormLayout>
          </div>
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

export default SubcontractorScreen;
