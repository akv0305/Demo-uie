'use client';

import * as React from 'react';
import { Pencil, Plus, Power, Upload } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { terminology as t } from '@/config/terminology.config';
import {
  AmountField,
  CheckboxField,
  ConfirmDialog,
  DataTable,
  FormLayout,
  FormSection,
  NumberField,
  PageHeader,
  SearchableSelectField,
  SelectField,
  TextField,
  TextareaField,
  type Option,
  type RowAction,
} from '@/components/erp';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Item } from '@/lib/data/types';
import { groupLabel, itemColumns, typeLabel, valuationLabel } from './item-columns';
import {
  ITEM_GROUPS,
  ITEM_TYPES,
  SUB_GROUPS,
  VALUATION_METHODS,
  defaultsForType,
  emptyItem,
  itemSchema,
  type ItemFormValues,
} from './item-schema';

export interface ItemScreenProps {
  rows: Item[];
  isLoading: boolean;
  search: string;
  onSearchChange: (v: string) => void;
  groupFilter: string;
  onGroupFilterChange: (v: string) => void;
  typeFilter: string;
  onTypeFilterChange: (v: string) => void;
  activeFilter: string;
  onActiveFilterChange: (v: string) => void;
  uomOptions: Option[];
  hsnOptions: Option[];
  /** HSN code to GST rate, so the rate is never typed twice (D-034). */
  hsnRates: Record<string, number>;
  storeOptions: Option[];
  onCreate: (values: ItemFormValues) => Promise<void>;
  onUpdate: (id: string, values: ItemFormValues) => Promise<void>;
  onToggleActive: (row: Item) => Promise<void>;
}

export function ItemScreen({
  rows,
  isLoading,
  search,
  onSearchChange,
  groupFilter,
  onGroupFilterChange,
  typeFilter,
  onTypeFilterChange,
  activeFilter,
  onActiveFilterChange,
  uomOptions,
  hsnOptions,
  hsnRates,
  storeOptions,
  onCreate,
  onUpdate,
  onToggleActive,
}: ItemScreenProps) {
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Item | null>(null);
  const [toggleTarget, setToggleTarget] = React.useState<Item | null>(null);
  const [saving, setSaving] = React.useState(false);

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: emptyItem,
    mode: 'onBlur',
  });
  const { errors, isDirty } = form.formState;

  const watchedGroup = form.watch('group');
  const watchedType = form.watch('itemType');

  const groupOptions: Option[] = ITEM_GROUPS.map((g) => ({ value: g, label: groupLabel(g) }));
  const typeOptions: Option[] = ITEM_TYPES.map((ty) => ({ value: ty, label: typeLabel(ty) }));
  const valuationOptions: Option[] = VALUATION_METHODS.map((v) => ({ value: v, label: valuationLabel(v) }));
  const subGroupOptions: Option[] = (SUB_GROUPS[watchedGroup] ?? []).map((s) => ({ value: s, label: s }));

  const groupFilterOptions: Option[] = [{ value: 'ALL', label: t.common.all }, ...groupOptions];
  const typeFilterOptions: Option[] = [{ value: 'ALL', label: t.common.all }, ...typeOptions];
  const statusOptions: Option[] = [
    { value: 'ALL', label: t.common.all },
    { value: 'ACTIVE', label: t.admin.active },
    { value: 'INACTIVE', label: t.admin.inactive },
  ];

  const isService = watchedType === 'SERVICE';

  const openNew = () => {
    setEditing(null);
    form.reset(emptyItem);
    setFormOpen(true);
  };

  const openEdit = (row: Item) => {
    setEditing(row);
    form.reset({
      code: row.code,
      name: row.name,
      shortName: row.shortName ?? '',
      specification: row.specification ?? '',
      oldCode: row.oldCode ?? '',
      brandPreference: row.brandPreference ?? '',
      makeOrGrade: row.makeOrGrade ?? '',
      group: row.group,
      subGroup: row.subGroup ?? '',
      itemType: row.itemType ?? 'MATERIAL',
      isReturnable: row.isReturnable ?? false,
      isProduced: row.isProduced ?? false,
      isBatchTracked: row.isBatchTracked ?? false,
      isSerialTracked: row.isSerialTracked ?? false,
      requiresQc: row.requiresQc ?? false,
      isHazardous: row.isHazardous ?? false,
      shelfLifeDays: row.shelfLifeDays ?? '',
      stockUomCode: row.stockUomCode,
      purchaseUomCode: row.purchaseUomCode ?? '',
      purchaseToStockFactor: row.purchaseToStockFactor ?? '',
      issueUomCode: row.issueUomCode ?? '',
      issueToStockFactor: row.issueToStockFactor ?? '',
      hsnCode: row.hsnCode,
      gstRate: row.gstRate,
      reorderLevel: row.reorderLevel ?? '',
      minStockLevel: row.minStockLevel ?? '',
      maxStockLevel: row.maxStockLevel ?? '',
      leadTimeDays: row.leadTimeDays ?? '',
      allowNegativeStock: row.allowNegativeStock ?? false,
      defaultStoreSiteId: row.defaultStoreSiteId ?? '',
      binLocation: row.binLocation ?? '',
      valuationMethod: row.valuationMethod ?? 'WEIGHTED_AVERAGE',
      standardRate: row.standardRate ?? '',
      lastPurchaseRate: row.lastPurchaseRate ?? '',
      budgetRateRef: row.budgetRateRef ?? '',
      isCapitalItem: row.isCapitalItem ?? false,
      isActive: row.isActive,
      remarks: row.remarks ?? '',
    });
    setFormOpen(true);
  };

  const duplicateCode = (code: string) =>
    rows.some((r) => r.code.toUpperCase() === code.toUpperCase() && r.id !== editing?.id);

  const submit = form.handleSubmit(async (values) => {
    if (duplicateCode(values.code)) {
      form.setError('code', { message: t.masters.itemDuplicateCode });
      return;
    }
    setSaving(true);
    try {
      if (editing) await onUpdate(editing.id, values);
      else await onCreate(values);
      setFormOpen(false);
      form.reset(emptyItem);
    } finally {
      setSaving(false);
    }
  });

  const rowActions: RowAction<Item>[] = [
    { label: t.common.edit, icon: <Pencil />, onSelect: openEdit },
    { label: t.masters.deactivate, icon: <Power />, onSelect: (row) => setToggleTarget(row) },
  ];

  return (
    <>
      <PageHeader
        title={t.masters.itemFull}
        subtitle={t.masters.itemSubtitle}
        breadcrumb={[{ label: t.nav.home, href: '/home' }, { label: t.nav.groupMasters }]}
        helpTopic="item"
        primaryAction={{ label: t.masters.itemNew, icon: <Plus />, onClick: openNew }}
        secondaryActions={[
          { label: t.masters.itemImport, icon: <Upload />, href: '/masters/items/import' },
        ]}
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
          id="item-group-filter"
          label={t.masters.itemGroup}
          value={groupFilter}
          onChange={onGroupFilterChange}
          options={groupFilterOptions}
          className="w-full sm:w-48"
        />
        <SelectField
          id="item-type-filter"
          label={t.masters.itemType}
          value={typeFilter}
          onChange={onTypeFilterChange}
          options={typeFilterOptions}
          className="w-full sm:w-44"
        />
        <SelectField
          id="item-status-filter"
          label={t.common.status}
          value={activeFilter}
          onChange={onActiveFilterChange}
          options={statusOptions}
          className="w-full sm:w-36"
        />
      </section>

      <DataTable<Item>
        columns={itemColumns}
        rows={rows}
        rowKey={(r) => r.id}
        isLoading={isLoading}
        rowActions={rowActions}
        onRowClick={openEdit}
        showExport
        showColumnToggle
        emptyHeadline={t.masters.itemEmpty}
        emptyDescription={t.masters.itemEmptyHint}
        cardTitle={(r) => `${r.code} · ${r.name}`}
        cardSubtitle={(r) => `${groupLabel(r.group)} · ${r.stockUomCode}`}
      />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{editing ? t.masters.itemEdit : t.masters.itemNew}</DialogTitle>
          </DialogHeader>

          <div className="max-h-[70vh] overflow-y-auto pr-1">
            <FormLayout
              isDirty={isDirty}
              isSaving={saving}
              submitLabel={t.common.save}
              onSubmit={submit}
              onCancel={() => setFormOpen(false)}
            >
              <FormSection title={t.masters.secIdentification} helpTopic="item" columns={2}>
                <TextField
                  id="item-code"
                  label={t.masters.itemCode}
                  required
                  value={form.watch('code')}
                  onChange={(v) => form.setValue('code', v.toUpperCase(), { shouldDirty: true })}
                  error={errors.code?.message}
                  maxLength={20}
                  placeholder="CEM-OPC53"
                />
                <TextField
                  id="item-name"
                  label={t.masters.itemName}
                  required
                  value={form.watch('name')}
                  onChange={(v) => form.setValue('name', v, { shouldDirty: true })}
                  error={errors.name?.message}
                  placeholder="OPC 53 Grade Cement"
                />
                <TextField
                  id="item-short-name"
                  label={t.masters.itemShortName}
                  value={form.watch('shortName')}
                  onChange={(v) => form.setValue('shortName', v, { shouldDirty: true })}
                  error={errors.shortName?.message}
                  maxLength={30}
                />
                <TextField
                  id="item-old-code"
                  label={t.masters.itemOldCode}
                  value={form.watch('oldCode')}
                  onChange={(v) => form.setValue('oldCode', v, { shouldDirty: true })}
                  error={errors.oldCode?.message}
                />
                <TextField
                  id="item-brand"
                  label={t.masters.itemBrand}
                  value={form.watch('brandPreference')}
                  onChange={(v) => form.setValue('brandPreference', v, { shouldDirty: true })}
                  error={errors.brandPreference?.message}
                />
                <TextField
                  id="item-make"
                  label={t.masters.itemMakeGrade}
                  value={form.watch('makeOrGrade')}
                  onChange={(v) => form.setValue('makeOrGrade', v, { shouldDirty: true })}
                  error={errors.makeOrGrade?.message}
                />
              </FormSection>

              <FormSection title={t.masters.specification} columns={1}>
                <TextareaField
                  id="item-specification"
                  label={t.masters.specification}
                  value={form.watch('specification')}
                  onChange={(v) => form.setValue('specification', v, { shouldDirty: true })}
                  error={errors.specification?.message}
                  rows={2}
                  placeholder="IS 12269, 53 grade, 50 kg bag"
                />
              </FormSection>

              <FormSection title={t.masters.secClassification} helpTopic="itemType" columns={2}>
                <Controller
                  control={form.control}
                  name="group"
                  render={({ field }) => (
                    <SelectField
                      id="item-group"
                      label={t.masters.itemGroup}
                      required
                      value={field.value}
                      onChange={(v) => {
                        field.onChange(v);
                        form.setValue('subGroup', '', { shouldDirty: true });
                      }}
                      options={groupOptions}
                      error={errors.group?.message}
                    />
                  )}
                />
                <Controller
                  control={form.control}
                  name="subGroup"
                  render={({ field }) =>
                    subGroupOptions.length > 0 ? (
                      <SelectField
                        id="item-sub-group"
                        label={t.masters.itemSubGroup}
                        value={field.value}
                        onChange={field.onChange}
                        options={subGroupOptions}
                        error={errors.subGroup?.message}
                      />
                    ) : (
                      <TextField
                        id="item-sub-group"
                        label={t.masters.itemSubGroup}
                        value={field.value}
                        onChange={field.onChange}
                        error={errors.subGroup?.message}
                      />
                    )
                  }
                />
                <Controller
                  control={form.control}
                  name="itemType"
                  render={({ field }) => (
                    <SelectField
                      id="item-type"
                      label={t.masters.itemType}
                      required
                      value={field.value}
                      onChange={(v) => {
                        field.onChange(v);
                        const next = defaultsForType(v as ItemFormValues['itemType']);
                        (Object.keys(next) as (keyof ItemFormValues)[]).forEach((k) =>
                          form.setValue(k, next[k] as never, { shouldDirty: true }),
                        );
                      }}
                      options={typeOptions}
                      error={errors.itemType?.message}
                      helpTopic="itemType"
                    />
                  )}
                />
                <Controller
                  control={form.control}
                  name="shelfLifeDays"
                  render={({ field }) => (
                    <NumberField
                      id="item-shelf-life"
                      label={t.masters.itemShelfLife}
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.shelfLifeDays?.message}
                      disabled={isService}
                    />
                  )}
                />
                <Controller
                  control={form.control}
                  name="isReturnable"
                  render={({ field }) => (
                    <CheckboxField id="item-returnable" label={t.masters.itemReturnable} checked={field.value} onChange={field.onChange} disabled={isService} />
                  )}
                />
                <Controller
                  control={form.control}
                  name="isProduced"
                  render={({ field }) => (
                    <CheckboxField id="item-produced" label={t.masters.itemProduced} checked={field.value} onChange={field.onChange} disabled={isService} />
                  )}
                />
                <Controller
                  control={form.control}
                  name="isBatchTracked"
                  render={({ field }) => (
                    <CheckboxField id="item-batch" label={t.masters.itemBatchTracked} checked={field.value} onChange={field.onChange} error={errors.isBatchTracked?.message} disabled={isService} />
                  )}
                />
                <Controller
                  control={form.control}
                  name="isSerialTracked"
                  render={({ field }) => (
                    <CheckboxField id="item-serial" label={t.masters.itemSerialTracked} checked={field.value} onChange={field.onChange} error={errors.isSerialTracked?.message} disabled={isService} />
                  )}
                />
                <Controller
                  control={form.control}
                  name="requiresQc"
                  render={({ field }) => (
                    <CheckboxField id="item-qc" label={t.masters.itemRequiresQc} checked={field.value} onChange={field.onChange} />
                  )}
                />
                <Controller
                  control={form.control}
                  name="isHazardous"
                  render={({ field }) => (
                    <CheckboxField id="item-hazardous" label={t.masters.itemHazardous} checked={field.value} onChange={field.onChange} />
                  )}
                />
              </FormSection>

              <FormSection title={t.masters.secUnits} helpTopic="itemUnits" columns={2}>
                <Controller
                  control={form.control}
                  name="stockUomCode"
                  render={({ field }) => (
                    <SearchableSelectField
                      id="item-stock-uom"
                      label={t.masters.stockUom}
                      required
                      value={field.value}
                      onChange={field.onChange}
                      options={uomOptions}
                      error={errors.stockUomCode?.message}
                    />
                  )}
                />
                <Controller
                  control={form.control}
                  name="purchaseUomCode"
                  render={({ field }) => (
                    <SearchableSelectField
                      id="item-purchase-uom"
                      label={t.masters.purchaseUom}
                      value={field.value}
                      onChange={field.onChange}
                      options={uomOptions}
                      error={errors.purchaseUomCode?.message}
                    />
                  )}
                />
                <Controller
                  control={form.control}
                  name="purchaseToStockFactor"
                  render={({ field }) => (
                    <NumberField
                      id="item-purchase-factor"
                      label={t.masters.purchaseFactor}
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.purchaseToStockFactor?.message}
                      helperText={t.masters.factorHint}
                    />
                  )}
                />
                <Controller
                  control={form.control}
                  name="issueUomCode"
                  render={({ field }) => (
                    <SearchableSelectField
                      id="item-issue-uom"
                      label={t.masters.issueUom}
                      value={field.value}
                      onChange={field.onChange}
                      options={uomOptions}
                      error={errors.issueUomCode?.message}
                    />
                  )}
                />
                <Controller
                  control={form.control}
                  name="issueToStockFactor"
                  render={({ field }) => (
                    <NumberField
                      id="item-issue-factor"
                      label={t.masters.issueFactor}
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.issueToStockFactor?.message}
                    />
                  )}
                />
                <Controller
                  control={form.control}
                  name="hsnCode"
                  render={({ field }) => (
                    <SearchableSelectField
                      id="item-hsn"
                      label={t.masters.hsnCode}
                      required
                      value={field.value}
                      onChange={(v) => {
                        field.onChange(v);
                        form.setValue('gstRate', hsnRates[v] ?? 0, { shouldDirty: true });
                      }}
                      options={hsnOptions}
                      error={errors.hsnCode?.message}
                      helpTopic="hsn"
                    />
                  )}
                />
                <NumberField
                  id="item-gst-rate"
                  label={t.masters.gstRate}
                  value={form.watch('gstRate')}
                  disabled
                  helperText={t.masters.hsnSplitNote}
                />
              </FormSection>

              <FormSection title={t.masters.secStock} helpTopic="itemStock" columns={2}>
                <Controller
                  control={form.control}
                  name="reorderLevel"
                  render={({ field }) => (
                    <NumberField id="item-reorder" label={t.masters.reorderLevel} value={field.value} onChange={field.onChange} error={errors.reorderLevel?.message} disabled={isService} />
                  )}
                />
                <Controller
                  control={form.control}
                  name="leadTimeDays"
                  render={({ field }) => (
                    <NumberField id="item-lead-time" label={t.masters.leadTime} value={field.value} onChange={field.onChange} error={errors.leadTimeDays?.message} />
                  )}
                />
                <Controller
                  control={form.control}
                  name="minStockLevel"
                  render={({ field }) => (
                    <NumberField id="item-min-stock" label={t.masters.minStock} value={field.value} onChange={field.onChange} error={errors.minStockLevel?.message} disabled={isService} />
                  )}
                />
                <Controller
                  control={form.control}
                  name="maxStockLevel"
                  render={({ field }) => (
                    <NumberField id="item-max-stock" label={t.masters.maxStock} value={field.value} onChange={field.onChange} error={errors.maxStockLevel?.message} disabled={isService} />
                  )}
                />
                <Controller
                  control={form.control}
                  name="defaultStoreSiteId"
                  render={({ field }) => (
                    <SelectField id="item-default-store" label={t.masters.defaultStore} value={field.value} onChange={field.onChange} options={storeOptions} error={errors.defaultStoreSiteId?.message} />
                  )}
                />
                <TextField
                  id="item-bin"
                  label={t.masters.binLocation}
                  value={form.watch('binLocation')}
                  onChange={(v) => form.setValue('binLocation', v, { shouldDirty: true })}
                  error={errors.binLocation?.message}
                />
                <Controller
                  control={form.control}
                  name="allowNegativeStock"
                  render={({ field }) => (
                    <CheckboxField id="item-allow-negative" label={t.masters.allowNegative} checked={field.value} onChange={field.onChange} />
                  )}
                />
                <Controller
                  control={form.control}
                  name="isCapitalItem"
                  render={({ field }) => (
                    <CheckboxField id="item-capital" label={t.masters.isCapitalItem} checked={field.value} onChange={field.onChange} />
                  )}
                />
              </FormSection>

              <FormSection title={t.masters.secCosting} helpTopic="itemValuation" columns={2}>
                <Controller
                  control={form.control}
                  name="valuationMethod"
                  render={({ field }) => (
                    <SelectField id="item-valuation" label={t.masters.valuationMethod} value={field.value} onChange={field.onChange} options={valuationOptions} error={errors.valuationMethod?.message} />
                  )}
                />
                <Controller
                  control={form.control}
                  name="standardRate"
                  render={({ field }) => (
                    <AmountField id="item-standard-rate" label={t.masters.standardRate} value={field.value} onChange={field.onChange} error={errors.standardRate?.message} />
                  )}
                />
                <Controller
                  control={form.control}
                  name="lastPurchaseRate"
                  render={({ field }) => (
                    <AmountField id="item-last-rate" label={t.masters.lastPurchaseRate} value={field.value} onChange={field.onChange} error={errors.lastPurchaseRate?.message} disabled />
                  )}
                />
                <Controller
                  control={form.control}
                  name="budgetRateRef"
                  render={({ field }) => (
                    <AmountField id="item-budget-rate" label={t.masters.budgetRate} value={field.value} onChange={field.onChange} error={errors.budgetRateRef?.message} />
                  )}
                />
                <Controller
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <CheckboxField id="item-active" label={t.admin.active} checked={field.value} onChange={field.onChange} />
                  )}
                />
              </FormSection>

              <FormSection title={t.common.remarks} columns={1}>
                <TextareaField
                  id="item-remarks"
                  label={t.common.remarks}
                  value={form.watch('remarks')}
                  onChange={(v) => form.setValue('remarks', v, { shouldDirty: true })}
                  error={errors.remarks?.message}
                  rows={2}
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

export default ItemScreen;
