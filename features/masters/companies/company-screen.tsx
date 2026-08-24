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
  TextareaField,
  type Option,
  type RowAction,
} from '@/components/erp';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Company } from '@/lib/data/types';
import { companyColumns, entityTypeLabel } from './company-columns';
import {
  COMPANY_TYPES,
  INDIAN_STATES,
  companySchema,
  emptyCompany,
  type CompanyFormValues,
} from './company-schema';

export interface CompanyScreenProps {
  rows: Company[];
  isLoading: boolean;
  search: string;
  onSearchChange: (v: string) => void;
  typeFilter: string;
  onTypeFilterChange: (v: string) => void;
  activeFilter: string;
  onActiveFilterChange: (v: string) => void;
  onCreate: (values: CompanyFormValues) => Promise<void>;
  onUpdate: (id: string, values: CompanyFormValues) => Promise<void>;
  onToggleActive: (row: Company) => Promise<void>;
}

export function CompanyScreen({
  rows,
  isLoading,
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  activeFilter,
  onActiveFilterChange,
  onCreate,
  onUpdate,
  onToggleActive,
}: CompanyScreenProps) {
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Company | null>(null);
  const [toggleTarget, setToggleTarget] = React.useState<Company | null>(null);
  const [saving, setSaving] = React.useState(false);

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: emptyCompany,
    mode: 'onBlur',
  });
  const { errors, isDirty } = form.formState;
  const entityType = form.watch('type');

  const typeOptions: Option[] = COMPANY_TYPES.map((ct) => ({ value: ct, label: entityTypeLabel(ct) }));
  const stateOptions: Option[] = INDIAN_STATES.map((s) => ({ value: s, label: s }));
  const typeFilterOptions: Option[] = [{ value: 'ALL', label: t.common.all }, ...typeOptions];
  const statusOptions: Option[] = [
    { value: 'ALL', label: t.common.all },
    { value: 'ACTIVE', label: t.admin.active },
    { value: 'INACTIVE', label: t.admin.inactive },
  ];

  const openNew = () => {
    setEditing(null);
    form.reset(emptyCompany);
    setFormOpen(true);
  };

  const openEdit = (row: Company) => {
    setEditing(row);
    form.reset({
      code: row.code,
      name: row.name,
      legalName: row.legalName,
      type: row.type,
      gstin: row.gstin,
      pan: row.pan,
      cin: row.cin ?? '',
      address: row.address,
      city: row.city,
      state: row.state,
      pincode: row.pincode,
      contactPerson: row.contactPerson,
      phone: row.phone,
      email: row.email,
      isActive: row.isActive !== false,
    });
    setFormOpen(true);
  };

  const submit = form.handleSubmit(async (values) => {
    if (rows.some((r) => r.code.toUpperCase() === values.code.toUpperCase() && r.id !== editing?.id)) {
      form.setError('code', { message: t.masters.cmpDuplicateCode });
      return;
    }
    if (rows.some((r) => r.gstin.toUpperCase() === values.gstin.toUpperCase() && r.id !== editing?.id)) {
      form.setError('gstin', { message: t.masters.cmpDuplicateGstin });
      return;
    }
    setSaving(true);
    try {
      if (editing) await onUpdate(editing.id, values);
      else await onCreate(values);
      setFormOpen(false);
      form.reset(emptyCompany);
    } finally {
      setSaving(false);
    }
  });

  const rowActions: RowAction<Company>[] = [
    { label: t.common.edit, icon: <Pencil />, onSelect: openEdit },
    { label: t.masters.deactivate, icon: <Power />, onSelect: (row) => setToggleTarget(row) },
  ];

  return (
    <>
      <PageHeader
        title={t.masters.cmpFull}
        subtitle={t.masters.cmpSubtitle}
        breadcrumb={[{ label: t.nav.home, href: '/home' }, { label: t.nav.groupMasters }]}
        helpTopic="company"
        primaryAction={{ label: t.masters.cmpNew, icon: <Plus />, onClick: openNew }}
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
          id="cmp-type-filter"
          label={t.masters.cmpType}
          value={typeFilter}
          onChange={onTypeFilterChange}
          options={typeFilterOptions}
          className="w-full sm:w-56"
        />
        <SelectField
          id="cmp-status-filter"
          label={t.common.status}
          value={activeFilter}
          onChange={onActiveFilterChange}
          options={statusOptions}
          className="w-full sm:w-36"
        />
      </section>

      <DataTable<Company>
        columns={companyColumns}
        rows={rows}
        rowKey={(r) => r.id}
        isLoading={isLoading}
        rowActions={rowActions}
        onRowClick={openEdit}
        showExport
        showColumnToggle
        emptyHeadline={t.masters.cmpEmpty}
        emptyDescription={t.masters.cmpEmptyHint}
        cardTitle={(r) => `${r.code} — ${r.name}`}
        cardSubtitle={(r) => `${entityTypeLabel(r.type)} — ${r.city}`}
      />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editing ? t.masters.cmpEdit : t.masters.cmpNew}</DialogTitle>
          </DialogHeader>

          <div className="max-h-[70vh] overflow-y-auto pr-1">
            <FormLayout
              isDirty={isDirty}
              isSaving={saving}
              submitLabel={t.common.save}
              onSubmit={submit}
              onCancel={() => setFormOpen(false)}
            >
              <FormSection title={t.masters.secCmpIdentity} helpTopic="company" columns={2}>
                <TextField
                  id="cmp-code"
                  label={t.masters.cmpCode}
                  required
                  value={form.watch('code')}
                  onChange={(v) => form.setValue('code', v.toUpperCase(), { shouldDirty: true })}
                  error={errors.code?.message}
                  maxLength={10}
                  placeholder="UIRPL"
                />
                <Controller
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <SelectField
                      id="cmp-type"
                      label={t.masters.cmpType}
                      required
                      value={field.value}
                      onChange={field.onChange}
                      options={typeOptions}
                      error={errors.type?.message}
                    />
                  )}
                />
                <TextField
                  id="cmp-name"
                  label={t.masters.cmpName}
                  required
                  value={form.watch('name')}
                  onChange={(v) => form.setValue('name', v, { shouldDirty: true })}
                  error={errors.name?.message}
                />
                <TextField
                  id="cmp-legal-name"
                  label={t.masters.cmpLegalName}
                  required
                  value={form.watch('legalName')}
                  onChange={(v) => form.setValue('legalName', v, { shouldDirty: true })}
                  error={errors.legalName?.message}
                />
              </FormSection>

              <FormSection title={t.masters.secCmpTax} helpTopic="companyCin" columns={2}>
                <TextField
                  id="cmp-gstin"
                  label={t.masters.gstin}
                  required
                  value={form.watch('gstin')}
                  onChange={(v) => form.setValue('gstin', v.toUpperCase(), { shouldDirty: true })}
                  error={errors.gstin?.message}
                  maxLength={15}
                  placeholder="36AABCU9603R1ZM"
                />
                <TextField
                  id="cmp-pan"
                  label={t.masters.pan}
                  required
                  value={form.watch('pan')}
                  onChange={(v) => form.setValue('pan', v.toUpperCase(), { shouldDirty: true })}
                  error={errors.pan?.message}
                  maxLength={10}
                  placeholder="AABCU9603R"
                />
                <TextField
                  id="cmp-cin"
                  label={t.masters.cmpCin}
                  // A JV is unincorporated, so it carries no CIN.
                  required={entityType !== 'JV'}
                  value={form.watch('cin')}
                  onChange={(v) => form.setValue('cin', v.toUpperCase(), { shouldDirty: true })}
                  error={errors.cin?.message}
                  maxLength={21}
                  placeholder="U45209TG2006PTC051428"
                  helpTopic="companyCin"
                />
              </FormSection>

              <FormSection title={t.masters.secCmpAddress} columns={2}>
                <TextareaField
                  id="cmp-address"
                  label={t.masters.address}
                  required
                  rows={2}
                  value={form.watch('address')}
                  onChange={(v) => form.setValue('address', v, { shouldDirty: true })}
                  error={errors.address?.message}
                  className="sm:col-span-2"
                />
                <TextField
                  id="cmp-city"
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
                      id="cmp-state"
                      label={t.masters.state}
                      required
                      value={field.value}
                      onChange={field.onChange}
                      options={stateOptions}
                      error={errors.state?.message}
                    />
                  )}
                />
                <TextField
                  id="cmp-pincode"
                  label={t.masters.cmpPincode}
                  required
                  value={form.watch('pincode')}
                  onChange={(v) => form.setValue('pincode', v.replace(/\D/g, ''), { shouldDirty: true })}
                  error={errors.pincode?.message}
                  maxLength={6}
                  placeholder="500034"
                />
              </FormSection>

              <FormSection title={t.masters.secCmpContact} columns={2}>
                <TextField
                  id="cmp-contact-person"
                  label={t.masters.contactPerson}
                  required
                  value={form.watch('contactPerson')}
                  onChange={(v) => form.setValue('contactPerson', v, { shouldDirty: true })}
                  error={errors.contactPerson?.message}
                />
                <TextField
                  id="cmp-phone"
                  label={t.masters.phone}
                  required
                  value={form.watch('phone')}
                  onChange={(v) => form.setValue('phone', v, { shouldDirty: true })}
                  error={errors.phone?.message}
                  placeholder="+91 40 2354 7810"
                />
                <TextField
                  id="cmp-email"
                  label={t.masters.email}
                  required
                  value={form.watch('email')}
                  onChange={(v) => form.setValue('email', v, { shouldDirty: true })}
                  error={errors.email?.message}
                  placeholder="info@udayinfra.co.in"
                />
                <Controller
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <CheckboxField
                      id="cmp-active"
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
        description={t.masters.cmpDeactivateWarning}
        onConfirm={() => {
          if (toggleTarget) void onToggleActive(toggleTarget);
          setToggleTarget(null);
        }}
      />
    </>
  );
}

export default CompanyScreen;
