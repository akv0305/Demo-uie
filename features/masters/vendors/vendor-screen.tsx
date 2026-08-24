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
  NumberField,
  PageHeader,
  SelectField,
  TextField,
  TextareaField,
  type Option,
  type RowAction,
} from '@/components/erp';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Vendor } from '@/lib/data/types';
import { categoryLabel, vendorColumns } from './vendor-columns';
import {
  INDIAN_STATES,
  VENDOR_CATEGORIES,
  emptyVendor,
  vendorSchema,
  type VendorFormValues,
} from './vendor-schema';

export interface VendorScreenProps {
  rows: Vendor[];
  isLoading: boolean;
  search: string;
  onSearchChange: (v: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (v: string) => void;
  activeFilter: string;
  onActiveFilterChange: (v: string) => void;
  onCreate: (values: VendorFormValues) => Promise<void>;
  onUpdate: (id: string, values: VendorFormValues) => Promise<void>;
  onToggleActive: (row: Vendor) => Promise<void>;
}

export function VendorScreen({
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
}: VendorScreenProps) {
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Vendor | null>(null);
  const [toggleTarget, setToggleTarget] = React.useState<Vendor | null>(null);
  const [saving, setSaving] = React.useState(false);

  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: emptyVendor,
    mode: 'onBlur',
  });
  const { errors, isDirty } = form.formState;

  const categoryOptions: Option[] = VENDOR_CATEGORIES.map((c) => ({
    value: c,
    label: categoryLabel(c),
  }));
  const stateOptions: Option[] = INDIAN_STATES.map((s) => ({ value: s, label: s }));
  const categoryFilterOptions: Option[] = [{ value: 'ALL', label: t.common.all }, ...categoryOptions];
  const statusOptions: Option[] = [
    { value: 'ALL', label: t.common.all },
    { value: 'ACTIVE', label: t.admin.active },
    { value: 'INACTIVE', label: t.admin.inactive },
  ];

  const openNew = () => {
    setEditing(null);
    form.reset(emptyVendor);
    setFormOpen(true);
  };

  const openEdit = (row: Vendor) => {
    setEditing(row);
    form.reset({
      code: row.code,
      name: row.name,
      category: row.category,
      gstin: row.gstin,
      pan: row.pan,
      msmeNo: row.msmeNo ?? '',
      address: row.address,
      city: row.city,
      state: row.state,
      contactPerson: row.contactPerson,
      phone: row.phone,
      email: row.email ?? '',
      paymentTerms: row.paymentTerms,
      creditDays: row.creditDays,
      bankAccount: row.bankAccount ?? '',
      ifsc: row.ifsc ?? '',
      isActive: row.isActive,
    });
    setFormOpen(true);
  };

  const submit = form.handleSubmit(async (values) => {
    if (rows.some((r) => r.code.toUpperCase() === values.code.toUpperCase() && r.id !== editing?.id)) {
      form.setError('code', { message: t.masters.vendorDuplicateCode });
      return;
    }
    if (rows.some((r) => r.gstin.toUpperCase() === values.gstin.toUpperCase() && r.id !== editing?.id)) {
      form.setError('gstin', { message: t.masters.vendorDuplicateGstin });
      return;
    }
    setSaving(true);
    try {
      if (editing) await onUpdate(editing.id, values);
      else await onCreate(values);
      setFormOpen(false);
      form.reset(emptyVendor);
    } finally {
      setSaving(false);
    }
  });

  const rowActions: RowAction<Vendor>[] = [
    { label: t.common.edit, icon: <Pencil />, onSelect: openEdit },
    { label: t.masters.deactivate, icon: <Power />, onSelect: (row) => setToggleTarget(row) },
  ];

  return (
    <>
      <PageHeader
        title={t.masters.vendorFull}
        subtitle={t.masters.vendorSubtitle}
        breadcrumb={[{ label: t.nav.home, href: '/home' }, { label: t.nav.groupMasters }]}
        helpTopic="vendor"
        primaryAction={{ label: t.masters.vendorNew, icon: <Plus />, onClick: openNew }}
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
          id="vendor-category-filter"
          label={t.masters.vendorCategory}
          value={categoryFilter}
          onChange={onCategoryFilterChange}
          options={categoryFilterOptions}
          className="w-full sm:w-52"
        />
        <SelectField
          id="vendor-status-filter"
          label={t.common.status}
          value={activeFilter}
          onChange={onActiveFilterChange}
          options={statusOptions}
          className="w-full sm:w-36"
        />
      </section>

      <DataTable<Vendor>
        columns={vendorColumns}
        rows={rows}
        rowKey={(r) => r.id}
        isLoading={isLoading}
        rowActions={rowActions}
        onRowClick={openEdit}
        showExport
        showColumnToggle
        emptyHeadline={t.masters.vendorEmpty}
        emptyDescription={t.masters.vendorEmptyHint}
        cardTitle={(r) => `${r.code} · ${r.name}`}
        cardSubtitle={(r) => `${categoryLabel(r.category)} · ${r.city}`}
      />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editing ? t.masters.vendorEdit : t.masters.vendorNew}</DialogTitle>
          </DialogHeader>

          <div className="max-h-[70vh] overflow-y-auto pr-1">
            <FormLayout
              isDirty={isDirty}
              isSaving={saving}
              submitLabel={t.common.save}
              onSubmit={submit}
              onCancel={() => setFormOpen(false)}
            >
              <FormSection title={t.masters.secVendorIdentity} helpTopic="vendor" columns={2}>
                <TextField
                  id="vendor-code"
                  label={t.masters.vendorCode}
                  required
                  value={form.watch('code')}
                  onChange={(v) => form.setValue('code', v.toUpperCase(), { shouldDirty: true })}
                  error={errors.code?.message}
                  placeholder="UIE/V/0011"
                />
                <Controller
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <SelectField
                      id="vendor-category"
                      label={t.masters.vendorCategory}
                      required
                      value={field.value}
                      onChange={field.onChange}
                      options={categoryOptions}
                      error={errors.category?.message}
                    />
                  )}
                />
                <TextField
                  id="vendor-name"
                  label={t.masters.vendorName}
                  required
                  value={form.watch('name')}
                  onChange={(v) => form.setValue('name', v, { shouldDirty: true })}
                  error={errors.name?.message}
                  className="sm:col-span-2"
                />
              </FormSection>

              <FormSection title={t.masters.secVendorTax} helpTopic="vendorGstin" columns={2}>
                <TextField
                  id="vendor-gstin"
                  label={t.masters.vendorGstin}
                  required
                  value={form.watch('gstin')}
                  onChange={(v) => form.setValue('gstin', v.toUpperCase(), { shouldDirty: true })}
                  error={errors.gstin?.message}
                  maxLength={15}
                  placeholder="36AACFS4471P1Z8"
                  helpTopic="vendorGstin"
                />
                <TextField
                  id="vendor-pan"
                  label={t.masters.vendorPan}
                  required
                  value={form.watch('pan')}
                  onChange={(v) => form.setValue('pan', v.toUpperCase(), { shouldDirty: true })}
                  error={errors.pan?.message}
                  maxLength={10}
                  placeholder="AACFS4471P"
                />
                <TextField
                  id="vendor-msme"
                  label={t.masters.vendorMsme}
                  value={form.watch('msmeNo')}
                  onChange={(v) => form.setValue('msmeNo', v.toUpperCase(), { shouldDirty: true })}
                  error={errors.msmeNo?.message}
                  placeholder="UDYAM-TS-02-0018842"
                  helpTopic="vendorMsme"
                />
              </FormSection>

              <FormSection title={t.masters.secVendorContact} columns={2}>
                <TextareaField
                  id="vendor-address"
                  label={t.masters.vendorAddress}
                  required
                  value={form.watch('address')}
                  onChange={(v) => form.setValue('address', v, { shouldDirty: true })}
                  error={errors.address?.message}
                  rows={2}
                  className="sm:col-span-2"
                />
                <TextField
                  id="vendor-city"
                  label={t.masters.vendorCity}
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
                      id="vendor-state"
                      label={t.masters.vendorState}
                      required
                      value={field.value}
                      onChange={field.onChange}
                      options={stateOptions}
                      error={errors.state?.message}
                    />
                  )}
                />
                <TextField
                  id="vendor-contact-person"
                  label={t.masters.vendorContactPerson}
                  required
                  value={form.watch('contactPerson')}
                  onChange={(v) => form.setValue('contactPerson', v, { shouldDirty: true })}
                  error={errors.contactPerson?.message}
                />
                <TextField
                  id="vendor-phone"
                  label={t.masters.vendorPhone}
                  required
                  value={form.watch('phone')}
                  onChange={(v) => form.setValue('phone', v, { shouldDirty: true })}
                  error={errors.phone?.message}
                  placeholder="+91 98490 11223"
                />
                <TextField
                  id="vendor-email"
                  label={t.masters.vendorEmail}
                  value={form.watch('email')}
                  onChange={(v) => form.setValue('email', v, { shouldDirty: true })}
                  error={errors.email?.message}
                />
              </FormSection>

              <FormSection title={t.masters.secVendorCommercial} helpTopic="vendorCreditDays" columns={2}>
                <TextField
                  id="vendor-payment-terms"
                  label={t.masters.vendorPaymentTerms}
                  required
                  value={form.watch('paymentTerms')}
                  onChange={(v) => form.setValue('paymentTerms', v, { shouldDirty: true })}
                  error={errors.paymentTerms?.message}
                />
                <Controller
                  control={form.control}
                  name="creditDays"
                  render={({ field }) => (
                    <NumberField
                      id="vendor-credit-days"
                      label={t.masters.vendorCreditDays}
                      required
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.creditDays?.message}
                      helpTopic="vendorCreditDays"
                    />
                  )}
                />
              </FormSection>

              <FormSection title={t.masters.secVendorBank} columns={2}>
                <TextField
                  id="vendor-bank-account"
                  label={t.masters.vendorBankAccount}
                  value={form.watch('bankAccount')}
                  onChange={(v) => form.setValue('bankAccount', v, { shouldDirty: true })}
                  error={errors.bankAccount?.message}
                />
                <TextField
                  id="vendor-ifsc"
                  label={t.masters.vendorIfsc}
                  value={form.watch('ifsc')}
                  onChange={(v) => form.setValue('ifsc', v.toUpperCase(), { shouldDirty: true })}
                  error={errors.ifsc?.message}
                  maxLength={11}
                  placeholder="HDFC0001234"
                />
                <Controller
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <CheckboxField
                      id="vendor-active"
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
        documentLabel={toggleTarget ? `${toggleTarget.code} · ${toggleTarget.name}` : undefined}
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

export default VendorScreen;
